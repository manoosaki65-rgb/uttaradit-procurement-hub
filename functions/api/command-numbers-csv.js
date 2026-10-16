const esc=(value)=>{const s=String(value??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};

export async function onRequest({request,env}){
  if(!env.MEETING_DB)return new Response('Database not configured',{status:503});
  const url=new URL(request.url);
  const year=Number(url.searchParams.get('year')||2569);
  if(!Number.isInteger(year))return new Response('Invalid year',{status:400});
  const q=await env.MEETING_DB.prepare(`SELECT number,year,issue_date AS issueDate,subject,status,assignee FROM command_numbers WHERE year=? ORDER BY number ASC`).bind(year).all();
  const lines=[['วันที่จอง','เลขที่คำสั่งจังหวัด','เรื่องตอนออกเลข','สถานะ','ชื่อเจ้าหน้าที่พัสดุ']];
  for(const r of q.results||[])lines.push([r.issueDate,`${r.number}/${r.year}`,r.subject||'',r.status||'ว่าง',r.assignee||'']);
  const csv='\uFEFF'+lines.map(row=>row.map(esc).join(',')).join('\r\n');
  return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Cache-Control':'no-store'}});
}
