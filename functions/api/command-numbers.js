const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});

export async function onRequest({request,env}){
  if(!env.MEETING_DB)return json({error:'Database not configured'},503);
  const db=env.MEETING_DB;
  if(request.method==='GET'){
    const q=await db.prepare(`SELECT id,number,year,issue_date AS issueDate,subject,status,assignee,created_at AS createdAt FROM command_numbers WHERE COALESCE(hidden,0)=0 ORDER BY year DESC,number DESC LIMIT 500`).all();
    return json({rows:q.results||[]});
  }
  if(request.method==='POST'){
    let body; try{body=await request.json();}catch{return json({error:'ข้อมูลไม่ถูกต้อง'},400)}
    const start=Number(body?.start), end=Number(body?.end), year=Number(body?.year||2569);
    const issueDate=String(body?.issueDate||'').trim();
    const subject=String(body?.subject||'แต่งตั้งคณะกรรมการ').trim();
    if(!Number.isInteger(start)||!Number.isInteger(end)||end<start||end-start>99||!issueDate)return json({error:'ตรวจช่วงเลขและวันที่'},400);
    let added=0;
    for(let n=start;n<=end;n++){
      const id=`${year}-${n}`;
      const r=await db.prepare(`INSERT INTO command_numbers(id,number,year,issue_date,subject,status,assignee,hidden) VALUES(?,?,?,?,?,'ว่าง','',0) ON CONFLICT(id) DO UPDATE SET number=excluded.number,year=excluded.year,issue_date=excluded.issue_date,subject=excluded.subject,status='ว่าง',assignee='',hidden=0`).bind(id,n,year,issueDate,subject).run();
      if((r.meta?.changes||0)>0)added++;
    }
    return json({added,total:end-start+1});
  }
  if(request.method==='PATCH'){
    let body; try{body=await request.json();}catch{return json({error:'ข้อมูลไม่ถูกต้อง'},400)}
    const id=String(body?.id||'').trim();
    const assignee=String(body?.assignee||'').trim();
    const subject=String(body?.subject||'').trim();
    if(!id)return json({error:'ไม่พบเลขที่ต้องแก้'},400);
    if(!subject)return json({error:'กรุณาใส่ชื่อรายการ/เรื่องคำสั่ง'},400);
    const status=assignee?'ใช้แล้ว':'ว่าง';
    const r=await db.prepare(`UPDATE command_numbers SET subject=?,assignee=?,status=? WHERE id=? AND COALESCE(hidden,0)=0`).bind(subject,assignee,status,id).run();
    if(!(r.meta?.changes||0))return json({error:'ไม่พบรายการ'},404);
    return json({ok:true,subject,status,assignee});
  }
  return json({error:'Method not allowed'},405);
}
