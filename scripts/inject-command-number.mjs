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
fs.writeFileSync(path,s);
