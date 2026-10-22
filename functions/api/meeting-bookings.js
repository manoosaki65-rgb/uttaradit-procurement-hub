const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const parsePeople=(value)=>{if(Array.isArray(value))return value.map(v=>String(v).trim()).filter(Boolean);if(!value)return[];try{const x=JSON.parse(value);if(Array.isArray(x))return x.map(v=>String(v).trim()).filter(Boolean)}catch{}return String(value).split(/[\n,]+/).map(v=>v.trim()).filter(Boolean)};
const key=(s)=>String(s||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('th');

async function validateAndWarn(env,{id='',date,start,end,room,title,participants}){
  if(!date||!start||!end||!room||!title)return {error:'กรอกข้อมูลให้ครบ'};
  if(!['ห้องประชุม e-GP','ห้องประชุม GF'].includes(room))return {error:'ห้องประชุมไม่ถูกต้อง'};
  if(end<=start)return {error:'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม'};
  const q=id
    ? `SELECT id,title,room,start_time AS start,end_time AS end,participants FROM room_bookings WHERE date=? AND id<>? AND NOT (end_time<=? OR start_time>=?) ORDER BY start_time`
    : `SELECT id,title,room,start_time AS start,end_time AS end,participants FROM room_bookings WHERE date=? AND NOT (end_time<=? OR start_time>=?) ORDER BY start_time`;
  const stmt=env.MEETING_DB.prepare(q);
  const overlaps=id?await stmt.bind(date,id,start,end).all():await stmt.bind(date,start,end).all();
  const rows=overlaps.results||[];
  const roomOverlaps=rows.filter(r=>r.room===room).map(r=>({id:r.id,title:r.title,start:r.start,end:r.end}));
  const wanted=new Map(participants.map(p=>[key(p),p])); const participantConflicts=[];
  for(const r of rows){
    if(r.room===room&&r.start===start&&r.end===end)continue;
    const common=parsePeople(r.participants).filter(p=>wanted.has(key(p)));
    if(common.length)participantConflicts.push({bookingId:r.id,title:r.title,room:r.room,start:r.start,end:r.end,names:common});
  }
  return {roomOverlaps,participantConflicts};
}

export async function onRequest({request,env}){
  if(!env.MEETING_DB)return json({error:'Meeting database not configured'},503);
  const u=new URL(request.url);
  if(request.method==='GET'){
    const from=u.searchParams.get('from')||'0000-00-00'; const to=u.searchParams.get('to')||'9999-99-99';
    const q=await env.MEETING_DB.prepare(`SELECT id,date,start_time AS start,end_time AS end,room,title,unit,booked_by AS bookedBy,phone,participants,created_at AS createdAt FROM room_bookings WHERE date BETWEEN ? AND ? ORDER BY date,start_time,created_at`).bind(from,to).all();
    const rows=(q.results||[]).map(r=>({...r,participants:parsePeople(r.participants)}));
    return json({rows});
  }
  if(!['POST','PATCH'].includes(request.method))return json({error:'Method not allowed'},405);
  let body; try{body=await request.json();}catch{return json({error:'ข้อมูลไม่ถูกต้อง'},400)}
  const {date,start,end,room,title,unit='',bookedBy,phone=''}=body||{}; const participants=parsePeople(body?.participants);
  if(!date||!start||!end||!room||!title||!bookedBy)return json({error:'กรอกข้อมูลให้ครบ'},400);

  if(request.method==='POST'){
    const warnings=await validateAndWarn(env,{date,start,end,room,title,participants});
    if(warnings.error)return json({error:warnings.error},400);
    const id=crypto.randomUUID(); const createdAt=new Date().toISOString();
    await env.MEETING_DB.prepare(`INSERT INTO room_bookings(id,date,start_time,end_time,room,title,unit,booked_by,phone,participants,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`).bind(id,date,start,end,room,title,unit,bookedBy,phone,JSON.stringify(participants),createdAt).run();
    return json({row:{id,date,start,end,room,title,unit,bookedBy,phone,participants,createdAt},warnings},201);
  }

  const id=u.searchParams.get('id')||body.id;
  if(!id)return json({error:'ไม่พบรหัสรายการที่ต้องการแก้ไข'},400);
  const existing=await env.MEETING_DB.prepare(`SELECT id FROM room_bookings WHERE id=?`).bind(id).first();
  if(!existing)return json({error:'ไม่พบรายการประชุม'},404);
  const warnings=await validateAndWarn(env,{id,date,start,end,room,title,participants});
  if(warnings.error)return json({error:warnings.error},400);
  await env.MEETING_DB.prepare(`UPDATE room_bookings SET date=?,start_time=?,end_time=?,room=?,title=?,unit=?,booked_by=?,phone=?,participants=? WHERE id=?`).bind(date,start,end,room,title,unit,bookedBy,phone,JSON.stringify(participants),id).run();
  return json({row:{id,date,start,end,room,title,unit,bookedBy,phone,participants},warnings});
}
