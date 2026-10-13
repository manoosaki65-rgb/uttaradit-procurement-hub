"use client";
import {useMemo,useState} from 'react';

const rows=[
 {kind:'ประกาศประกวดราคา',title:'Compliance Balloon Catheter จำนวน 1,000 เส้น',photo:'IMG20261009132855.jpg',page:1},
 {kind:'ประกาศประกวดราคา',title:'Drug Eluting Stent ขนาดใหญ่ จำนวน 60 เส้น',photo:'IMG20261009132900.jpg',page:2},
 {kind:'ประกาศประกวดราคา',title:'ชุดเครื่องมือเจาะตัดกระดูกชนิดเปลี่ยนหัวได้ จำนวน 2 ชุด',photo:'IMG20261009132907.jpg',page:3},
 {kind:'ประกาศประกวดราคา',title:'เครื่องพร้อมน้ำยาตรวจ CD4 จำนวน 2,000 Test',photo:'IMG20261009132912.jpg',page:4},
 {kind:'ประกาศประกวดราคา',title:'วัสดุวิทยาศาสตร์การแพทย์ จำนวน 3 รายการ',photo:'IMG20261009132915.jpg',page:5},
 {kind:'ประกาศประกวดราคา',title:'เครื่องพร้อมน้ำยาตรวจชุดทดสอบความไวของสารต้านจุลชีพ จำนวน 6,000 Test',photo:'IMG20261009132922.jpg',page:6},
 {kind:'ประกาศเผยแพร่แผน',title:'เผยแพร่แผนการจัดซื้อจัดจ้าง ประจำปีงบประมาณ 2570 · หน้า 1',photo:'IMG20261009132925.jpg',page:7},
 {kind:'ประกาศเผยแพร่แผน',title:'เผยแพร่แผนการจัดซื้อจัดจ้าง ประจำปีงบประมาณ 2570 · หน้า 2',photo:'IMG20261009132925.jpg',page:8},
];
const kinds=['ทั้งหมด','ประกาศประกวดราคา','ประกาศเผยแพร่แผน','ประกาศผลผู้ชนะ','ประกาศยกเลิก'];
export default function DashboardView(){
 const [date,setDate]=useState('2026-10-09'),[kind,setKind]=useState('ทั้งหมด'),[q,setQ]=useState('');
 const filtered=useMemo(()=>rows.filter(r=>(kind==='ทั้งหมด'||r.kind===kind)&&(!q||(`${r.title} ${r.kind}`).toLowerCase().includes(q.toLowerCase()))),[kind,q]);
 const photoUrl=(p:string)=>`/posting-evidence/2026-10-09/${p}`;
 return <main style={{minHeight:'100vh',background:'#f3f8fd',color:'#17324d',fontFamily:'system-ui,sans-serif'}}>
 <div style={{maxWidth:1180,margin:'auto',padding:18}}>
  <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:16}}>
   <aside style={{background:'#fff',border:'1px solid #dbeafe',borderRadius:16,padding:16,height:'fit-content'}}><h3 style={{marginTop:0}}>เลือกวันที่</h3><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%',padding:10,border:'1px solid #bfd3ea',borderRadius:8}}/><div style={{display:'grid',gap:8,marginTop:14}}>{kinds.map(k=><button key={k} onClick={()=>setKind(k)} style={{padding:10,borderRadius:9,border:'1px solid #cfe0f3',textAlign:'left',background:kind===k?'#1769c2':'#f8fbff',color:kind===k?'#fff':'#17324d',fontWeight:700}}>{k}</button>)}</div><a href="/" style={{display:'block',marginTop:16}}>🏠 กลับหน้าหลัก</a></aside>
   <section><div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}><div><h1 style={{margin:'0 0 4px'}}>เอกสารวันที่ 9 ตุลาคม 2569</h1><small>ทั้งหมด 8 หน้า</small></div><input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔎 ค้นหารายการ / ชื่อโครงการ / คำสำคัญ..." style={{marginLeft:'auto',minWidth:320,padding:12,border:'1px solid #bfd3ea',borderRadius:10}}/></div>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'14px 0'}}>{kinds.map(k=><button key={k} onClick={()=>setKind(k)} style={{padding:'9px 12px',borderRadius:9,border:'1px solid #cfe0f3',background:kind===k?'#1769c2':'#fff',color:kind===k?'#fff':'#17324d'}}>{k}</button>)}</div>
   <div style={{background:'#fff',border:'1px solid #dbeafe',borderRadius:14,overflow:'hidden'}}>{filtered.map((r,i)=><div key={`${r.page}-${r.title}`} style={{display:'grid',gridTemplateColumns:'54px 1fr 180px',gap:12,padding:14,borderTop:i?'1px solid #e5edf6':'none',alignItems:'center'}}><b>{r.page}</b><div><div style={{fontWeight:800}}>{r.title}</div><small>{r.kind}</small></div><div style={{display:'flex',gap:8,justifyContent:'end'}}><button disabled title="จะเชื่อม PDF เดิมในขั้นถัดไป" style={{padding:'8px 10px'}}>📄 ดู PDF</button><a href={photoUrl(r.photo)} target="_blank" rel="noreferrer" style={{padding:'8px 10px',border:'1px solid #b7dfc4',borderRadius:8,textDecoration:'none'}}>🖼️ ดูรูป</a></div></div>)}</div>
   <div style={{marginTop:18,background:'#fff',border:'1px solid #f6c3cf',borderRadius:14,padding:14}}><h2 style={{marginTop:0}}>ดูรวมรูปทั้งหมดของวันที่ 9 ต.ค. 2569</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10}}>{rows.map(r=><a key={r.page} href={photoUrl(r.photo)} target="_blank" rel="noreferrer" style={{textDecoration:'none',color:'inherit'}}><img src={photoUrl(r.photo)} alt={`รูปที่ ${r.page}`} style={{width:'100%',aspectRatio:'3/4',objectFit:'cover',borderRadius:8,border:'1px solid #dbeafe'}}/><div style={{textAlign:'center',fontWeight:700}}>รูปที่ {r.page}<br/><small>หน้า {r.page}</small></div></a>)}</div></div>
   </section>
  </div>
 </div></main>
}