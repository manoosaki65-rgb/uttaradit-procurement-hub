"use client";

import { CalendarDays, ChevronLeft, Clock3, Plus, UsersRound, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Room="ห้องประชุม e-GP"|"ห้องประชุม GF";
type Booking={id:string;date:string;room:Room;start:string;end:string;title:string;unit?:string;bookedBy:string;phone?:string;participants?:string[]};
type FormState={date:string;start:string;end:string;room:Room;title:string;unit:string;bookedBy:string;phone:string;participants:string};

const EGP_IMG="/meeting-egp.svg";
const GF_IMG="/meeting-gf-smooth.svg";
const pad=(n:number)=>String(n).padStart(2,"0");
const iso=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fromIso=(s:string)=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d,12)};
const plusDays=(d:Date,n:number)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const thaiDate=(s:string)=>new Intl.DateTimeFormat("th-TH",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(fromIso(s));
const shortDay=(d:Date)=>new Intl.DateTimeFormat("th-TH",{weekday:"short"}).format(d).replace(".","");
const shortMonth=(d:Date)=>new Intl.DateTimeFormat("th-TH",{month:"short"}).format(d).replace(".","");
const fieldStyle={width:"100%",height:46,border:"1px solid #cbd5e1",borderRadius:12,padding:"0 12px",fontSize:16,background:"white",boxSizing:"border-box"} as const;
const textAreaStyle={...fieldStyle,height:96,padding:"10px 12px",resize:"vertical" as const};

export default function MeetingRoomBookingPage(){
 const today=useMemo(()=>new Date(),[]);
 const todayIso=iso(today);
 const [selectedDate,setSelectedDate]=useState(todayIso);
 const [roomView,setRoomView]=useState<Room>("ห้องประชุม e-GP");
 const [bookings,setBookings]=useState<Booking[]>([]);
 const [open,setOpen]=useState(false);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const [notice,setNotice]=useState("");
 const [form,setForm]=useState<FormState>({date:todayIso,start:"09:00",end:"10:00",room:"ห้องประชุม e-GP",title:"",unit:"",bookedBy:"",phone:"",participants:""});

 const dateTabs=useMemo(()=>Array.from({length:7},(_,i)=>plusDays(today,i)),[today]);
 const loadRange=async(anchor:string)=>{
   const start=fromIso(anchor); const from=iso(start); const to=iso(plusDays(start,7));
   try{
     const r=await fetch(`/api/meeting-bookings?from=${from}&to=${to}`,{cache:"no-store"});
     const j=await r.json();
     const rows=(j.rows||[]) as Booking[];
     setBookings(prev=>{const keep=prev.filter(p=>!rows.some(r=>r.id===p.id));return [...keep,...rows]});
   }catch{}
 };
 useEffect(()=>{loadRange(todayIso)},[todayIso]);

 const selected=useMemo(()=>bookings.filter(b=>b.date===selectedDate&&b.room===roomView).sort((a,b)=>a.start.localeCompare(b.start)||a.end.localeCompare(b.end)),[bookings,selectedDate,roomView]);
 const groups=useMemo(()=>{
   const map=new Map<string,Booking[]>();
   for(const b of selected){const k=`${b.start}-${b.end}`;map.set(k,[...(map.get(k)||[]),b])}
   return [...map.entries()];
 },[selected]);

 const chooseDate=async(s:string)=>{setSelectedDate(s);await loadRange(s)};
 const openForm=(date=selectedDate,room=roomView)=>{setForm({date,start:"09:00",end:"10:00",room,title:"",unit:"",bookedBy:"",phone:"",participants:""});setMessage("");setOpen(true)};
 const submit=async(e:FormEvent)=>{
   e.preventDefault(); setSaving(true); setMessage(""); setNotice("");
   const payload={...form,participants:form.participants.split(/\n|,/).map(x=>x.trim()).filter(Boolean)};
   try{
     const r=await fetch('/api/meeting-bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
     const j=await r.json(); if(!r.ok)throw new Error(j.error||'บันทึกไม่สำเร็จ');
     setOpen(false); setSelectedDate(form.date); setRoomView(form.room); await loadRange(form.date);
     const names=(j.warnings?.participantConflicts||[]).flatMap((x:any)=>x.names||[]);
     setNotice(names.length?`บันทึกแล้ว • พบกรรมการที่มีประชุมซ้อน: ${[...new Set(names)].join(', ')}`:'บันทึกการประชุมแล้ว');
   }catch(err:any){setMessage(err.message||'บันทึกไม่สำเร็จ')}finally{setSaving(false)}
 };

 return <main style={{minHeight:"100vh",background:"linear-gradient(180deg,#edf8ff 0,#f8fbfd 34%,#f2f6f9 100%)",padding:"14px 10px 36px"}}>
  <div style={{maxWidth:820,margin:"0 auto"}}>
   <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12}}>
    <a href="/" style={{display:"inline-flex",alignItems:"center",gap:5,color:"#0f5f91",textDecoration:"none",fontWeight:800}}><ChevronLeft size={19}/>กลับหน้าหลัก</a>
    <button onClick={()=>openForm()} style={{display:"inline-flex",alignItems:"center",gap:6,border:0,borderRadius:12,padding:"10px 14px",background:"#0874b8",color:"white",fontWeight:900,fontSize:15}}><Plus size={18}/>จองประชุม</button>
   </div>

   <section style={{background:"white",borderRadius:22,boxShadow:"0 12px 32px rgba(30,64,88,.10)",overflow:"hidden"}}>
    <header style={{padding:"18px 16px 12px"}}>
     <div style={{display:"flex",alignItems:"center",gap:9,color:"#0b6ea8",fontWeight:900,fontSize:13}}><CalendarDays size={18}/>ตารางประชุมกลุ่มงานพัสดุ</div>
     <h1 style={{fontSize:"clamp(23px,6vw,34px)",margin:"5px 0 3px",color:"#0f2f46"}}>วันประชุม</h1>
     <p style={{margin:0,color:"#64748b",fontSize:14}}>ดูคิวใกล้ ๆ ก่อน • จองล่วงหน้าไกลแค่ไหนก็ได้</p>
    </header>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,padding:"0 14px 12px"}}>
     {(["ห้องประชุม e-GP","ห้องประชุม GF"] as Room[]).map(room=>{
       const active=roomView===room; const egp=room.includes('e-GP');
       return <button key={room} onClick={()=>setRoomView(room)} style={{display:"flex",alignItems:"center",gap:9,minWidth:0,border:active?"2px solid #1183c3":"1px solid #d9e4eb",borderRadius:14,padding:7,background:active?"#eef9ff":"#fff",textAlign:"left"}}>
        <img src={egp?EGP_IMG:GF_IMG} alt={room} style={{width:58,height:44,objectFit:"cover",borderRadius:9,flex:"0 0 auto",background:"#e9f0f4"}}/>
        <span style={{minWidth:0}}><strong style={{display:"block",fontSize:13,color:"#16374d",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{egp?'e-GP':'GF'}</strong><small style={{display:"block",color:egp?"#0874b8":"#7c6ca8",fontSize:11}}>{egp?'ห้องหลัก':'ห้องสำรอง'}</small></span>
       </button>
     })}
    </div>

    <div style={{borderTop:"1px solid #edf2f5",padding:"13px 12px 8px"}}>
     <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,scrollbarWidth:"none"}}>
      {dateTabs.map((d,i)=>{const s=iso(d),active=selectedDate===s;return <button key={s} onClick={()=>chooseDate(s)} style={{flex:"0 0 auto",minWidth:76,border:active?"2px solid #0d7dbb":"1px solid #dce6ed",borderRadius:15,padding:"8px 9px",background:active?"#eaf7ff":"white",color:active?"#075f92":"#334155"}}>
       <div style={{fontSize:11,fontWeight:800}}>{i===0?'วันนี้':shortDay(d)}</div><div style={{fontSize:21,fontWeight:950,lineHeight:1.05}}>{d.getDate()}</div><div style={{fontSize:11}}>{shortMonth(d)}</div>
      </button>})}
      <label style={{flex:"0 0 auto",minWidth:92,border:"1px dashed #9ab7c8",borderRadius:15,padding:"8px 9px",background:"#f8fbfd",color:"#486879",textAlign:"center",cursor:"pointer"}}>
       <div style={{fontSize:11,fontWeight:800}}>วันอื่น</div><CalendarDays size={20} style={{margin:"3px auto"}}/><div style={{fontSize:10}}>เลือกวันที่</div>
       <input type="date" value={selectedDate} onChange={e=>e.target.value&&chooseDate(e.target.value)} style={{position:"absolute",opacity:0,pointerEvents:"none"}}/>
      </label>
     </div>
    </div>

    <div style={{padding:"8px 14px 18px"}}>
     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:10}}>
      <div><div style={{fontWeight:950,color:"#14384f",fontSize:18}}>{thaiDate(selectedDate)}</div><div style={{color:"#64748b",fontSize:13}}>{roomView}</div></div>
      <button onClick={()=>openForm(selectedDate,roomView)} style={{border:0,borderRadius:10,padding:"9px 11px",background:"#0b78b6",color:"white",fontWeight:900,whiteSpace:"nowrap"}}>+ เพิ่มเรื่อง</button>
     </div>

     {notice&&<div style={{marginBottom:10,padding:"10px 12px",borderRadius:12,background:notice.includes('ซ้อน')?'#fff7ed':'#ecfdf5',color:notice.includes('ซ้อน')?'#9a3412':'#047857',fontSize:13,fontWeight:700}}>{notice}</div>}

     {groups.length===0?<div style={{padding:"30px 16px",borderRadius:16,background:"#f8fafc",textAlign:"center",color:"#64748b"}}><CalendarDays size={30} style={{margin:"0 auto 7px",opacity:.55}}/>วันนี้ยังไม่มีรายการประชุมใน {roomView.replace('ห้องประชุม ','')}</div>:
     <div style={{display:"grid",gap:14}}>{groups.map(([slot,items])=><section key={slot} style={{display:"grid",gridTemplateColumns:"72px 1fr",gap:10,alignItems:"start"}}>
      <div style={{position:"sticky",top:6,paddingTop:3,textAlign:"right"}}><div style={{fontSize:19,fontWeight:950,color:"#0b6ea8"}}>{items[0].start}</div><div style={{fontSize:11,color:"#78909f"}}>ถึง {items[0].end}</div></div>
      <div style={{display:"grid",gap:8,borderLeft:"3px solid #d7ebf7",paddingLeft:10}}>{items.map((b,idx)=><article key={b.id} style={{border:"1px solid #dfe8ee",borderRadius:14,padding:"12px 13px",background:idx%2===0?"#fff":"#fbfdff",boxShadow:"0 3px 12px rgba(30,64,88,.05)"}}>
       {items.length>1&&<div style={{display:"inline-block",marginBottom:5,padding:"3px 7px",borderRadius:999,background:"#fff4d6",color:"#8a5b00",fontSize:10,fontWeight:900}}>ประชุมซ้อน {items.length} เรื่อง</div>}
       <strong style={{display:"block",fontSize:16,color:"#18384e",lineHeight:1.4}}>{b.title}</strong>
       {b.participants&&b.participants.length>0&&<div style={{marginTop:8,padding:"8px 9px",borderRadius:10,background:"#f3f8fb"}}><div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:900,color:"#315a72"}}><UsersRound size={15}/>กรรมการ / ผู้เข้าร่วม</div><ol style={{margin:"5px 0 0 19px",padding:0,color:"#475569",fontSize:13}}>{b.participants.map((p,i)=><li key={`${p}-${i}`}>{p}</li>)}</ol></div>}
       <div style={{marginTop:7,color:"#64748b",fontSize:12}}>ผู้จอง: {b.bookedBy}{b.unit?` • ${b.unit}`:''}</div>
      </article>)}</div>
     </section>)}</div>}
    </div>
   </section>
  </div>

  {open&&<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.58)",display:"grid",placeItems:"center",padding:10,zIndex:50}}>
   <form onSubmit={submit} style={{width:"min(560px,100%)",maxHeight:"94vh",overflow:"auto",background:"white",borderRadius:20,padding:18,boxShadow:"0 24px 70px rgba(0,0,0,.28)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><div><h2 style={{margin:0,fontSize:23}}>จอง / เพิ่มเรื่องประชุม</h2><div style={{color:"#64748b",fontSize:12}}>ห้องเดียวกันเวลาเดียวกันเพิ่มหลายเรื่องได้</div></div><button type="button" onClick={()=>setOpen(false)} style={{border:0,background:"transparent",padding:6}}><X/></button></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:15}}>
     <label style={{fontSize:13,fontWeight:800}}>วันที่<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={fieldStyle}/></label>
     <label style={{fontSize:13,fontWeight:800}}>ห้อง<select value={form.room} onChange={e=>setForm({...form,room:e.target.value as Room})} style={fieldStyle}><option>ห้องประชุม e-GP</option><option>ห้องประชุม GF</option></select></label>
     <label style={{fontSize:13,fontWeight:800}}>เริ่ม<input type="time" required value={form.start} onChange={e=>setForm({...form,start:e.target.value})} style={fieldStyle}/></label>
     <label style={{fontSize:13,fontWeight:800}}>สิ้นสุด<input type="time" required value={form.end} onChange={e=>setForm({...form,end:e.target.value})} style={fieldStyle}/></label>
    </div>
    <label style={{display:"block",marginTop:10,fontSize:13,fontWeight:800}}>เรื่องประชุม<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="เช่น เปิดซองวัสดุวิทยาศาสตร์การแพทย์" style={fieldStyle}/></label>
    <label style={{display:"block",marginTop:10,fontSize:13,fontWeight:800}}>กรรมการ / ผู้เข้าร่วม<textarea value={form.participants} onChange={e=>setForm({...form,participants:e.target.value})} placeholder={'พิมพ์ชื่อคนละบรรทัด\n1. นายแพทย์...\n2. ...'} style={textAreaStyle}/></label>
    <label style={{display:"block",marginTop:10,fontSize:13,fontWeight:800}}>หน่วยงาน<input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} style={fieldStyle}/></label>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}><label style={{fontSize:13,fontWeight:800}}>ผู้จอง<input required value={form.bookedBy} onChange={e=>setForm({...form,bookedBy:e.target.value})} style={fieldStyle}/></label><label style={{fontSize:13,fontWeight:800}}>เบอร์โทร<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={fieldStyle}/></label></div>
    {message&&<div style={{marginTop:10,padding:10,borderRadius:10,background:'#fff1f2',color:'#be123c'}}>{message}</div>}
    <button disabled={saving} style={{width:"100%",height:48,marginTop:14,border:0,borderRadius:12,background:"#0874b8",color:"white",fontSize:16,fontWeight:950}}>{saving?'กำลังบันทึก...':'บันทึกการประชุม'}</button>
   </form>
  </div>}
 </main>
}
