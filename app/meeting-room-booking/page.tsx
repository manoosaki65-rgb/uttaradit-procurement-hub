"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Plus, UsersRound, X, AlertTriangle, Building2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Room="ห้องประชุม e-GP"|"ห้องประชุม GF";
type Booking={id:string;date:string;room:Room;start:string;end:string;title:string;unit?:string;bookedBy:string;phone?:string;participants?:string[]};
const pad=(n:number)=>String(n).padStart(2,"0");
const iso=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const atNoon=(s:string)=>new Date(`${s}T12:00:00`);
const addDays=(d:Date,n:number)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const overlaps=(aStart:string,aEnd:string,bStart:string,bEnd:string)=>!(bEnd<=aStart||bStart>=aEnd);
const normalize=(s:string)=>s.replace(/\s+/g," ").trim().toLocaleLowerCase("th");
const inputStyle={width:"100%",minHeight:46,border:"1px solid #cbd5e1",borderRadius:12,padding:"0 12px",fontSize:16,background:"white",boxSizing:"border-box" as const};
const textAreaStyle={...inputStyle,minHeight:112,padding:"11px 12px",resize:"vertical" as const};

export default function MeetingRoomBookingPage(){
  const today=useMemo(()=>new Date(),[]);
  const [anchor,setAnchor]=useState(new Date(today.getFullYear(),today.getMonth(),today.getDate()));
  const [selectedDate,setSelectedDate]=useState(iso(today));
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [roomFilter,setRoomFilter]=useState<"all"|Room>("all");
  const [open,setOpen]=useState(false); const [saving,setSaving]=useState(false); const [message,setMessage]=useState(""); const [notice,setNotice]=useState("");
  const [form,setForm]=useState({date:iso(today),start:"09:00",end:"10:00",room:"ห้องประชุม e-GP" as Room,title:"",unit:"",bookedBy:"",phone:"",participantsText:""});

  const load=async(base=anchor)=>{
    const from=iso(addDays(base,-7)); const to=iso(addDays(base,62));
    try{const r=await fetch(`/api/meeting-bookings?from=${from}&to=${to}`,{cache:"no-store"});const j=await r.json();setBookings((j.rows||[]).map((b:Booking)=>({...b,participants:Array.isArray(b.participants)?b.participants:[]})))}catch{setBookings([])}
  };
  useEffect(()=>{load()},[anchor]);

  const stripDays=useMemo(()=>Array.from({length:7},(_,i)=>addDays(anchor,i)),[anchor]);
  const dayBookings=useMemo(()=>bookings.filter(b=>b.date===selectedDate&&(roomFilter==="all"||b.room===roomFilter)).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title)),[bookings,selectedDate,roomFilter]);
  const selectedLabel=new Intl.DateTimeFormat("th-TH",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(atNoon(selectedDate));
  const allToday=bookings.filter(b=>b.date===selectedDate);
  const totalPeople=new Set(allToday.flatMap(b=>b.participants||[]).map(normalize)).size;

  const formPeople=form.participantsText.split(/\n|,/).map(x=>x.trim()).filter(Boolean);
  const liveConflicts=bookings.filter(b=>b.date===form.date&&overlaps(form.start,form.end,b.start,b.end)).flatMap(b=>{
    const set=new Set((b.participants||[]).map(normalize)); const common=formPeople.filter(p=>set.has(normalize(p)));
    return common.length?[{title:b.title,room:b.room,start:b.start,end:b.end,names:common}]:[];
  });
  const roomOverlapCount=bookings.filter(b=>b.date===form.date&&b.room===form.room&&overlaps(form.start,form.end,b.start,b.end)).length;

  const openForm=(date=selectedDate,room:Room="ห้องประชุม e-GP")=>{setForm(f=>({...f,date,room}));setMessage("");setOpen(true)};
  const jumpTo=(date:string)=>{const d=atNoon(date);setAnchor(d);setSelectedDate(date)};
  const submit=async(e:FormEvent)=>{
    e.preventDefault();setSaving(true);setMessage("");setNotice("");
    try{
      const payload={...form,participants:formPeople};
      const r=await fetch('/api/meeting-bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok)throw new Error(j.error||'บันทึกไม่สำเร็จ');
      const p=(j.warnings?.participantConflicts||[]) as Array<{names:string[]}>; const ro=(j.warnings?.roomOverlaps||[]) as unknown[];
      setNotice(p.length?`บันทึกแล้ว • พบกรรมการซ้ำช่วงเวลาเดียวกัน: ${Array.from(new Set(p.flatMap(x=>x.names))).join(", ")}`:ro.length?`บันทึกแล้ว • ช่วงเวลานี้มี ${ro.length+1} วาระในห้องเดียวกัน ระบบอนุญาตให้ประชุมซ้อนได้`:"บันทึกการประชุมเรียบร้อยแล้ว");
      setOpen(false);jumpTo(form.date);await load(atNoon(form.date));
      setForm(f=>({...f,title:"",unit:"",participantsText:""}));
    }catch(err:any){setMessage(err.message||'บันทึกไม่สำเร็จ')}finally{setSaving(false)}
  };

  return <main style={{minHeight:"100vh",background:"#f4f7fb",color:"#172033",padding:"12px 10px 90px"}}>
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10}}>
        <a href="/" style={{display:"inline-flex",alignItems:"center",gap:4,color:"#64748b",textDecoration:"none",fontWeight:800,fontSize:14}}><ChevronLeft size={18}/>หน้าหลัก</a>
        <button onClick={()=>openForm()} style={{border:0,borderRadius:12,padding:"10px 14px",background:"#1664d9",color:"white",fontWeight:900,display:"inline-flex",gap:7,alignItems:"center"}}><Plus size={18}/>จองประชุม</button>
      </header>

      <section style={{background:"linear-gradient(135deg,#0967d8,#2f7de8)",borderRadius:22,padding:"18px 16px",color:"white",boxShadow:"0 12px 32px rgba(37,99,235,.22)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:48,height:48,borderRadius:15,display:"grid",placeItems:"center",background:"rgba(255,255,255,.18)"}}><CalendarDays size={27}/></div><div><h1 style={{margin:0,fontSize:24}}>ตารางประชุม</h1><div style={{opacity:.9,fontSize:14}}>กลุ่มงานพัสดุ • อาคารพัสดุ ชั้น 3</div></div></div>
      </section>

      <section style={{marginTop:12,background:"white",borderRadius:18,padding:"12px",boxShadow:"0 5px 18px rgba(15,23,42,.06)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:9}}><strong style={{fontSize:15}}>เลือกวันประชุม</strong><div style={{display:"flex",gap:6}}><button onClick={()=>setAnchor(addDays(anchor,-7))} aria-label="สัปดาห์ก่อน" style={{width:34,height:34,borderRadius:10,border:"1px solid #e2e8f0",background:"white"}}><ChevronLeft size={18}/></button><button onClick={()=>{const n=new Date();setAnchor(n);setSelectedDate(iso(n))}} style={{height:34,borderRadius:10,border:"1px solid #e2e8f0",background:"#f8fafc",padding:"0 10px",fontWeight:800}}>วันนี้</button><button onClick={()=>setAnchor(addDays(anchor,7))} aria-label="สัปดาห์ถัดไป" style={{width:34,height:34,borderRadius:10,border:"1px solid #e2e8f0",background:"white"}}><ChevronRight size={18}/></button></div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(58px,1fr))",gap:7,overflowX:"auto",paddingBottom:3}}>
          {stripDays.map(d=>{const date=iso(d);const active=date===selectedDate;const count=bookings.filter(b=>b.date===date).length;const isToday=date===iso(today);return <button key={date} onClick={()=>setSelectedDate(date)} style={{minWidth:58,border:active?"2px solid #1769e0":"1px solid #e2e8f0",borderRadius:14,padding:"8px 3px",background:active?"#eaf2ff":"#fff",color:active?"#1456b8":"#475569",fontWeight:800}}><div style={{fontSize:11}}>{isToday?"วันนี้":new Intl.DateTimeFormat("th-TH",{weekday:"short"}).format(d)}</div><div style={{fontSize:21,lineHeight:1.2,margin:"2px 0"}}>{d.getDate()}</div><div style={{fontSize:10,color:count?"#1664d9":"#94a3b8"}}>{count?`${count} วาระ`:"ว่าง"}</div></button>})}
        </div>
        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{fontSize:12,color:"#64748b"}}>ไปวันที่อื่น</span><input type="date" value={selectedDate} onChange={e=>jumpTo(e.target.value)} style={{height:36,border:"1px solid #dbe3ee",borderRadius:10,padding:"0 8px",fontSize:14}}/></div>
      </section>

      <section style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <button onClick={()=>setRoomFilter(roomFilter==="ห้องประชุม e-GP"?"all":"ห้องประชุม e-GP")} style={{border:roomFilter==="ห้องประชุม e-GP"?"2px solid #1670db":"1px solid #dbe5ef",borderRadius:15,background:"white",padding:"10px 9px",display:"flex",alignItems:"center",gap:9,textAlign:"left"}}><span style={{width:38,height:38,borderRadius:12,background:"#e7f3ff",display:"grid",placeItems:"center",color:"#1466bd"}}><Building2 size={21}/></span><span><strong style={{display:"block",fontSize:14}}>ห้อง e-GP</strong><small style={{color:"#64748b"}}>ห้องหลัก</small></span></button>
        <button onClick={()=>setRoomFilter(roomFilter==="ห้องประชุม GF"?"all":"ห้องประชุม GF")} style={{border:roomFilter==="ห้องประชุม GF"?"2px solid #7c4dcc":"1px solid #dbe5ef",borderRadius:15,background:"white",padding:"10px 9px",display:"flex",alignItems:"center",gap:9,textAlign:"left"}}><span style={{width:38,height:38,borderRadius:12,background:"#f1eafe",display:"grid",placeItems:"center",color:"#7041bc"}}><Building2 size={21}/></span><span><strong style={{display:"block",fontSize:14}}>ห้อง GF</strong><small style={{color:"#64748b"}}>ห้องสำรอง</small></span></button>
      </section>

      {notice&&<div style={{marginTop:12,padding:"12px 14px",borderRadius:14,background:notice.includes("กรรมการซ้ำ")?"#fff7ed":"#ecfdf5",color:notice.includes("กรรมการซ้ำ")?"#9a3412":"#166534",fontWeight:700,fontSize:14}}>{notice}</div>}

      <section style={{marginTop:12,background:"white",borderRadius:20,padding:"15px 13px",boxShadow:"0 5px 18px rgba(15,23,42,.06)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:12}}><div><div style={{fontWeight:900,fontSize:17}}>{selectedLabel}</div><div style={{fontSize:12,color:"#64748b",marginTop:2}}>{allToday.length} วาระ • กรรมการ/ผู้เข้าร่วม {totalPeople} คน</div></div><button onClick={()=>openForm(selectedDate)} style={{border:0,borderRadius:11,padding:"9px 11px",background:"#eaf2ff",color:"#1456b8",fontWeight:900}}>+ เพิ่มวาระ</button></div>
        {dayBookings.length===0?<div style={{padding:"34px 12px",textAlign:"center",border:"1px dashed #cbd5e1",borderRadius:16,color:"#64748b"}}><CalendarDays size={30} style={{margin:"0 auto 7px"}}/><strong style={{display:"block",color:"#334155"}}>วันนี้ยังไม่มีประชุม</strong><span style={{fontSize:13}}>กด “เพิ่มวาระ” เพื่อจองได้เลย</span></div>:<div style={{display:"grid",gap:10}}>{dayBookings.map(b=>{const same=dayBookings.filter(x=>x.start===b.start&&x.end===b.end).length>1;return <article key={b.id} style={{display:"grid",gridTemplateColumns:"66px minmax(0,1fr)",gap:10,alignItems:"stretch"}}><div style={{paddingTop:10,textAlign:"center"}}><strong style={{fontSize:16}}>{b.start}</strong><div style={{fontSize:11,color:"#94a3b8"}}>ถึง {b.end}</div></div><div style={{borderRadius:16,padding:"12px 13px",background:b.room==="ห้องประชุม e-GP"?"#f2f7ff":"#faf7ff",border:`1px solid ${b.room==="ห้องประชุม e-GP"?"#d6e6fb":"#e7dcfb"}`}}><div style={{display:"flex",gap:8,alignItems:"flex-start",justifyContent:"space-between"}}><strong style={{fontSize:15,lineHeight:1.35}}>{b.title}</strong><span style={{whiteSpace:"nowrap",fontSize:11,borderRadius:999,padding:"4px 7px",background:b.room==="ห้องประชุม e-GP"?"#dbeafe":"#ede9fe",color:b.room==="ห้องประชุม e-GP"?"#1d4ed8":"#6d28d9"}}>{b.room.replace("ห้องประชุม ","")}</span></div>{same&&<div style={{marginTop:6,fontSize:11,fontWeight:800,color:"#b45309"}}>มีหลายวาระในช่วงเวลาเดียวกัน</div>}{b.unit&&<div style={{fontSize:12,color:"#64748b",marginTop:5}}>{b.unit}</div>}{(b.participants||[]).length>0&&<div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8}}>{(b.participants||[]).map((p,n)=><span key={`${p}-${n}`} style={{fontSize:11,padding:"4px 7px",borderRadius:999,background:"white",border:"1px solid #d8e1eb"}}>{p}</span>)}</div>}<div style={{marginTop:8,fontSize:11,color:"#94a3b8"}}>ผู้จอง: {b.bookedBy}</div></div></article>})}</div>}
      </section>
    </div>

    <button onClick={()=>openForm(selectedDate)} aria-label="จองประชุม" style={{position:"fixed",right:18,bottom:18,width:58,height:58,borderRadius:18,border:0,background:"#1769e0",color:"white",display:"grid",placeItems:"center",boxShadow:"0 12px 28px rgba(23,105,224,.35)",zIndex:30}}><Plus size={29}/></button>

    {open&&<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.56)",display:"grid",placeItems:"end center",zIndex:50,padding:"12px"}}><form onSubmit={submit} style={{width:"min(620px,100%)",maxHeight:"94vh",overflow:"auto",background:"white",borderRadius:22,padding:"18px 16px",boxShadow:"0 24px 70px rgba(0,0,0,.28)"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><div><h2 style={{margin:0,fontSize:21}}>จองประชุม / เพิ่มวาระ</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>ห้องเดียว เวลาเดียวกัน บันทึกหลายเรื่องได้</div></div><button type="button" onClick={()=>setOpen(false)} style={{width:38,height:38,borderRadius:12,border:"1px solid #e2e8f0",background:"white"}}><X size={19}/></button></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:15}}><label style={{fontSize:13,fontWeight:800}}>วันที่<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inputStyle}/></label><label style={{fontSize:13,fontWeight:800}}>ห้อง<select value={form.room} onChange={e=>setForm({...form,room:e.target.value as Room})} style={inputStyle}><option>ห้องประชุม e-GP</option><option>ห้องประชุม GF</option></select></label><label style={{fontSize:13,fontWeight:800}}>เริ่ม<input type="time" required value={form.start} onChange={e=>setForm({...form,start:e.target.value})} style={inputStyle}/></label><label style={{fontSize:13,fontWeight:800}}>สิ้นสุด<input type="time" required value={form.end} onChange={e=>setForm({...form,end:e.target.value})} style={inputStyle}/></label></div>
      <label style={{display:"block",marginTop:10,fontSize:13,fontWeight:800}}>เรื่อง / ชื่อการประชุม<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="เช่น เปิดซองวัสดุทันตกรรม" style={inputStyle}/></label>
      <label style={{display:"block",marginTop:10,fontSize:13,fontWeight:800}}>หน่วยงาน<input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} placeholder="เช่น กลุ่มงานทันตกรรม" style={inputStyle}/></label>
      <label style={{display:"block",marginTop:10,fontSize:13,fontWeight:800}}>รายชื่อกรรมการ / ผู้เข้าร่วมประชุม<textarea value={form.participantsText} onChange={e=>setForm({...form,participantsText:e.target.value})} placeholder={'พิมพ์ 1 ชื่อต่อ 1 บรรทัด\nนพ. ...\nนาง ...\nนาย ...'} style={textAreaStyle}/></label>
      {roomOverlapCount>0&&<div style={{marginTop:10,padding:"10px 11px",borderRadius:12,background:"#fff7ed",color:"#9a3412",fontSize:13}}><AlertTriangle size={16} style={{verticalAlign:"middle",marginRight:5}}/>ช่วงนี้มีวาระใน {form.room.replace("ห้องประชุม ","")} อยู่แล้ว {roomOverlapCount} รายการ — บันทึกซ้อนได้ตามการใช้งานจริง</div>}
      {liveConflicts.length>0&&<div style={{marginTop:10,padding:"10px 11px",borderRadius:12,background:"#fef2f2",color:"#b91c1c",fontSize:13}}><strong>พบกรรมการชนเวลา:</strong> {Array.from(new Set(liveConflicts.flatMap(x=>x.names))).join(", ")}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}><label style={{fontSize:13,fontWeight:800}}>ผู้จอง<input required value={form.bookedBy} onChange={e=>setForm({...form,bookedBy:e.target.value})} style={inputStyle}/></label><label style={{fontSize:13,fontWeight:800}}>เบอร์โทร<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inputStyle}/></label></div>
      {message&&<div style={{marginTop:10,padding:10,borderRadius:11,background:"#fff1f2",color:"#be123c"}}>{message}</div>}
      <button disabled={saving} style={{width:"100%",height:50,marginTop:15,border:0,borderRadius:13,background:"#1769e0",color:"white",fontSize:17,fontWeight:900}}>{saving?"กำลังบันทึก...":"บันทึกการประชุม"}</button>
    </form></div>}
  </main>
}
