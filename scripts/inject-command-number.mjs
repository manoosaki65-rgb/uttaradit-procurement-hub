import fs from 'node:fs';

const path='app/page.tsx';
let s=fs.readFileSync(path,'utf8');
if(!s.includes('title: "จองเลขคำสั่งจังหวัด"')){
  const anchor='{ title: "ทะเบียนรับ Inventory", subtitle: "รับเอกสาร / ลงทะเบียน", icon: FilePlus2, tone: "blue", href: inventoryUrl, primary: true },';
  const insert=anchor+'\n  { title: "จองเลขคำสั่งจังหวัด", subtitle: "จองเป็นชุด / เก็บเลขให้จัดซื้อใช้", icon: FileCheck2, tone: "teal", href: "/command-number", primary: true },';
  if(!s.includes(anchor)) throw new Error('Inventory module anchor not found');
  s=s.replace(anchor,insert);
}
if(!s.includes('title: "จองห้องประชุมออนไลน์"')){
  const anchor='{ title: "รายงานการประชุม", subtitle: "ปฏิทินประชุม / รายงานและไฟล์แนบ", icon: CalendarDays, tone: "blue", href: "https://uttaradit-meeting-report.manoosaki65.workers.dev/" },';
  const insert='{ title: "จองห้องประชุมออนไลน์", subtitle: "จองห้อง e-GP / GF", icon: CalendarDays, tone: "sky", href: "/meeting-room-booking" },\n  '+anchor;
  if(!s.includes(anchor)) throw new Error('Meeting report module anchor not found');
  s=s.replace(anchor,insert);
}
if(!s.includes('aria-label="จองเลขคำสั่งจังหวัด"')){
  const posting='<a href="/posting" aria-label="ติดประกาศหน้าอาคารพัสดุ อัปโหลดและดูหลักฐานการติดประกาศรายวัน" className="group relative block overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><img src="/posting-daily-menu.png" alt="เจ้าหน้าที่ติดประกาศหน้าอาคารพัสดุ" className="block h-auto w-full" /><div style={{position:"absolute",bottom:0,left:0,right:0,padding:"24px 14px 12px",background:"linear-gradient(transparent,rgba(8,30,55,.88))",color:"white"}}><strong style={{fontSize:18}}>ติดประกาศหน้าอาคารพัสดุ</strong><small style={{display:"block",fontSize:13}}>อัปโหลดและดูหลักฐานการติดประกาศรายวัน</small></div></a>';
  const command=posting+'\n        <a href="/command-number" aria-label="จองเลขคำสั่งจังหวัด" className="group relative flex min-h-[150px] items-center overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{background:"linear-gradient(135deg,#0f766e,#0e7490)",color:"white",padding:"24px"}}><div style={{display:"flex",alignItems:"center",gap:18,width:"100%"}}><span style={{display:"grid",placeItems:"center",width:72,height:72,borderRadius:18,background:"rgba(255,255,255,.18)",fontSize:34,fontWeight:900}}>✓</span><div><strong style={{display:"block",fontSize:24,lineHeight:1.15}}>จองเลขคำสั่งจังหวัด</strong><small style={{display:"block",marginTop:8,fontSize:14,opacity:.92}}>จองเป็นชุด • เก็บเลขให้จัดซื้อใช้</small></div></div></a>';
  if(!s.includes(posting)) throw new Error('Posting card anchor not found');
  s=s.replace(posting,command);
}
fs.writeFileSync(path,s);
