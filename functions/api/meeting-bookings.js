const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const parsePeople=(value)=>{if(Array.isArray(value))return value.map(v=>String(v).trim()).filter(Boolean);if(!value)return[];try{const x=JSON.parse(value);if(Array.isArray(x))return x.map(v=>String(v).trim()).filter(Boolean)}catch{}return String(value).split(/[\n,]+/).map(v=>v.trim()).filter(Boolean)};
const key=(s)=>String(s||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('th');

export async function onRequest({request,env}){
  if(!env.MEETING_DB)return json({error:'Meeting database not configured'},503);
  if(request.method==='GET'){
    const u=new URL(request.url); const from=u.searchParams.get('from')||'0000-00-00'; const to=u.searchParams.get('to')||'9999-99-99';
    const q=await env.MEETING_DB.prepare(`SELECT id,date,start_time AS start,end_time AS end,room,title,unit,booked_by AS bookedBy,phone,participants,created_at AS createdAt FROM room_bookings WHERE date BETWEEN ? AND ? ORDER BY date,start_time,created_at`).bind(from,to).all();
    const rows=(q.results||[]).map(r=>({...r,participants:parsePeople(r.participants)}));
    return json({rows});
  }
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  let body; try{body=await request.json();}catch{return json({error:'ข้อมูลไม่ถูกต้อง'},400)}
  const {date,start,end,room,title,unit='',bookedBy,phone=''}=body||{}; const participants=parsePeople(body?.participants);
  if(!date||!start||!end||!room||!title||!bookedBy)return json({error:'กรอกข้อมูลให้ครบ'},400);
  if(!['ห้องประชุม e-GP','ห้องประชุม GF'].includes(room))return json({error:'ห้องประชุมไม่ถูกต้อง'},400);
  if(end<=start)return json({error:'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม'},400);

  // ห้องเดียวกันและเวลาเดียวกันสามารถมีหลายวาระและใช้กรรมการชุดเดียวกันได้
  const overlaps=await env.MEETING_DB.prepare(`SELECT id,title,room,start_time AS start,end_time AS end,participants FROM room_bookings WHERE date=? AND NOT (end_time<=? OR start_time>=?) ORDER BY start_time`).bind(date,start,end).all();
  const roomOverlaps=(overlaps.results||[]).filter(r=>r.room===room).map(r=>({id:r.id,title:r.title,start:r.start,end:r.end}));
  const wanted=new Map(participants.map(p=>[key(p),p])); const participantConflicts=[];
  for(const r of overlaps.results||[]){
    // เวลาเดียวกันเป๊ะในห้องเดียวกันถือเป็นชุดประชุมเดียวกัน จึงไม่เตือนกรรมการซ้ำ
    if(r.room===room&&r.start===start&&r.end===end)continue;
    const common=parsePeople(r.participants).filter(p=>wanted.has(key(p)));
    if(common.length)participantConflicts.push({bookingId:r.id,title:r.title,room:r.room,start:r.start,end:r.end,names:common});
  }

  const id=crypto.randomUUID(); const createdAt=new Date().toISOString();
  await env.MEETING_DB.prepare(`INSERT INTO room_bookings(id,date,start_time,end_time,room,title,unit,booked_by,phone,participants,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)`).bind(id,date,start,end,room,title,unit,bookedBy,phone,JSON.stringify(participants),createdAt).run();
  return json({row:{id,date,start,end,room,title,unit,bookedBy,phone,participants,createdAt},warnings:{roomOverlaps,participantConflicts}},201);
}
