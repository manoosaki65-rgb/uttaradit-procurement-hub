const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});

export async function onRequest({request,env}){
  if(!env.MEETING_DB)return json({error:'Meeting database not configured'},503);
  if(request.method==='GET'){
    const u=new URL(request.url); const from=u.searchParams.get('from')||'0000-00-00'; const to=u.searchParams.get('to')||'9999-99-99';
    const q=await env.MEETING_DB.prepare(`SELECT id,date,start_time AS start,end_time AS end,room,title,unit,booked_by AS bookedBy,phone,created_at AS createdAt FROM room_bookings WHERE date BETWEEN ? AND ? ORDER BY date,start_time`).bind(from,to).all();
    return json({rows:q.results||[]});
  }
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  let body; try{body=await request.json();}catch{return json({error:'ข้อมูลไม่ถูกต้อง'},400)}
  const {date,start,end,room,title,unit='',bookedBy,phone=''}=body||{};
  if(!date||!start||!end||!room||!title||!bookedBy)return json({error:'กรอกข้อมูลให้ครบ'},400);
  if(!['ห้องประชุม e-GP','ห้องประชุม GF'].includes(room))return json({error:'ห้องประชุมไม่ถูกต้อง'},400);
  if(end<=start)return json({error:'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม'},400);
  const clash=await env.MEETING_DB.prepare(`SELECT id,title,start_time,end_time FROM room_bookings WHERE date=? AND room=? AND NOT (end_time<=? OR start_time>=?) LIMIT 1`).bind(date,room,start,end).first();
  if(clash)return json({error:`ช่วงเวลานี้มีการจองแล้ว ${clash.start_time}-${clash.end_time} น. (${clash.title})`,code:'CONFLICT'},409);
  const id=crypto.randomUUID(); const createdAt=new Date().toISOString();
  await env.MEETING_DB.prepare(`INSERT INTO room_bookings(id,date,start_time,end_time,room,title,unit,booked_by,phone,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(id,date,start,end,room,title,unit,bookedBy,phone,createdAt).run();
  return json({row:{id,date,start,end,room,title,unit,bookedBy,phone,createdAt}},201);
}
