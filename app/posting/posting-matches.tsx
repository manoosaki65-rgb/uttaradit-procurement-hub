"use client";
import {useEffect} from 'react';

const items=[
 {title:'ประกวดราคา Compliance Balloon Catheter จำนวน 1,000 เส้น',photo:'IMG20261009132855.jpg'},
 {title:'ประกวดราคา Drug Eluting Stent ขนาดใหญ่ จำนวน 60 เส้น',photo:'IMG20261009132900.jpg'},
 {title:'ประกวดราคาชุดเครื่องมือเจาะตัดกระดูกชนิดเปิดเยื่อหุ้มได้ จำนวน 2 ชุด',photo:'IMG20261009132907.jpg'},
 {title:'ประกวดราคาเช่าเครื่องพร้อมน้ำยาตรวจ CD4 จำนวน 2,000 Test',photo:'IMG20261009132912.jpg'},
 {title:'ประกวดราคาซื้อวัสดุวิทยาศาสตร์การแพทย์ จำนวน 3 รายการ',photo:'IMG20261009132915.jpg'},
 {title:'ประกวดราคาเช่าเครื่องพร้อมน้ำยาตรวจชุดทดสอบความไวของสารต้านจุลชีพ จำนวน 6,000 Test',photo:'IMG20261009132922.jpg'},
 {title:'ประกาศเผยแพร่แผนการจัดซื้อจัดจ้าง ประจำปีงบประมาณ พ.ศ. 2570',photo:'IMG20261009132925.jpg'}
];

export default function PostingMatches(){
 useEffect(()=>{
  const insert=()=>{
   const buttons=Array.from(document.querySelectorAll('button'));
   const head=buttons.find(b=>b.textContent?.includes('ติดประกาศวันที่ 9 ตุลาคม 2569'));
   const section=head?.closest('section');
   if(!section||section.querySelector('[data-posting-match="2026-10-09"]'))return Boolean(section);
   const box=document.createElement('div');
   box.setAttribute('data-posting-match','2026-10-09');
   box.style.margin='10px 0 12px';box.style.border='1px solid #bfdbfe';box.style.borderRadius='10px';box.style.overflow='hidden';box.style.background='#fff';
   box.innerHTML=`<div style="padding:9px 12px;background:#eff6ff;font-weight:700;color:#164e8a">รายการที่จับคู่แล้ว 7 เรื่อง</div>`+
     items.map((it,i)=>`<div style="display:grid;grid-template-columns:42px 1fr auto;gap:10px;align-items:center;padding:10px 12px;border-top:1px solid #e5eef8"><b>${i+1}</b><div>${it.title}<small style="display:block;color:#64748b;margin-top:2px">รูปที่ ${i+1} · ${it.photo}</small></div><a href="/posting-evidence/2026-10-09/${it.photo}" target="_blank" rel="noreferrer" style="white-space:nowrap;color:#1769c2">ดูรูป</a></div>`).join('');
   const count=Array.from(section.children).find(el=>el.textContent?.trim()==='รูปทั้งหมด 7 รูป');
   if(count)count.insertAdjacentElement('afterend',box);else head?.insertAdjacentElement('afterend',box);
   return true;
  };
  if(insert())return;
  const observer=new MutationObserver(()=>{if(insert())observer.disconnect();});
  observer.observe(document.body,{childList:true,subtree:true});
  const timer=setTimeout(()=>observer.disconnect(),10000);
  return()=>{observer.disconnect();clearTimeout(timer);};
 },[]);
 return null;
}
