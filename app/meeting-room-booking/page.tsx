"use client";

import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Share2, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Room="ห้องประชุม e-GP"|"ห้องประชุม GF";
type Booking={id:string;date:string;room:Room;start:string;end:string;title:string;unit?:string;bookedBy:string;phone?:string;participants?:string[]};
type FormState={date:string;start:string;end:string;room:Room;title:string;unit:string;bookedBy:string;phone:string;participants:string[]};

const pad=(n:number)=>String(n).padStart(2,"0");
const iso=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const atNoon=(s:string)=>new Date(`${s}T12:00:00`);
const addDays=(d:Date,n:number)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const overlaps=(aStart:string,aEnd:string,bStart:string,bEnd:string)=>!(bEnd<=aStart||bStart>=aEnd);
const normalize=(s:string)=>s.replace(/\s+/g," ").trim().toLocaleLowerCase("th");
const inputStyle={width:"100%",minHeight:46,border:"1px solid #cbd5e1",borderRadius:12,padding:"0 12px",fontSize:16,background:"white",boxSizing:"border-box" as const};

function fitText(ctx:CanvasRenderingContext2D,text:string,maxWidth:number){
  if(ctx.measureText(text).width<=maxWidth)return text;
  let out=text;
  while(out.length>1&&ctx.measureText(`${out}…`).width>maxWidth)out=out.slice(0,-1);
  return `${out}…`;
}

function wrapText(ctx:CanvasRenderingContext2D,text:string,maxWidth:number,maxLines=2){
  const lines:string[]=[]; let line="";
  for(const ch of Array.from(text||"")){
    const test=line+ch;
    if(line&&ctx.measureText(test).width>maxWidth){lines.push(line);line=ch;if(lines.length===maxLines)break}else line=test;
  }
  if(lines.length<maxLines&&line)lines.push(line);
  if(lines.length===maxLines){
    const consumed=lines.join("").length;
    if(consumed<(text||"").length)lines[maxLines-1]=fitText(ctx,lines[maxLines-1]+(text||"").slice(consumed),maxWidth);
  }
  return lines;
}

export default function MeetingRoomBookingPage(){
  const initialToday=useMemo(()=>new Date(),[]);
  const [todayIso,setTodayIso]=useState(()=>iso(initialToday));
  const [anchor,setAnchor]=useState(new Date(initialToday.getFullYear(),initialToday.getMonth(),initialToday.getDate()));
  const [selectedDate,setSelectedDate]=useState(()=>iso(initialToday));
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [open,setOpen]=useState(false);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [saving,setSaving]=useState(false);
  const [sharing,setSharing]=useState(false);
  const [message,setMessage]=useState("");
  const [notice,setNotice]=useState("");
  const [form,setForm]=useState<FormState>({date:iso(initialToday),start:"09:00",end:"10:00",room:"ห้องประชุม e-GP",title:"",unit:"",bookedBy:"",phone:"",participants:[""]});

  useEffect(()=>{
    const tick=()=>setTodayIso(iso(new Date()));
    const timer=setInterval(tick,60000);
    return()=>clearInterval(timer);
  },[]);

  const load=async(base=anchor)=>{
    const from=iso(addDays(base,-7)); const to=iso(addDays(base,62));
    try{
      const r=await fetch(`/api/meeting-bookings?from=${from}&to=${to}`,{cache:"no-store"});
      const j=await r.json();
      setBookings((j.rows||[]).map((b:Booking)=>({...b,participants:Array.isArray(b.participants)?b.participants:[]})));
    }catch{setBookings([])}
  };
  useEffect(()=>{load()},[anchor]);

  const stripDays=useMemo(()=>Array.from({length:7},(_,i)=>addDays(anchor,i)),[anchor]);
  const dayBookings=useMemo(()=>bookings.filter(b=>b.date===selectedDate).sort((a,b)=>a.start.localeCompare(b.start)||a.title.localeCompare(b.title)),[bookings,selectedDate]);
  const selectedLabel=new Intl.DateTimeFormat("th-TH",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(atNoon(selectedDate));
  const allToday=bookings.filter(b=>b.date===selectedDate);
  const totalPeople=new Set(allToday.flatMap(b=>b.participants||[]).map(normalize)).size;
  const formPeople=form.participants.map(x=>x.trim()).filter(Boolean);

  const liveConflicts=bookings.filter(b=>b.id!==editingId&&b.date===form.date&&overlaps(form.start,form.end,b.start,b.end)&&!(b.room===form.room&&b.start===form.start&&b.end===form.end)).flatMap(b=>{
    const set=new Set((b.participants||[]).map(normalize));
    const common=formPeople.filter(p=>set.has(normalize(p)));
    return common.length?[{title:b.title,room:b.room,start:b.start,end:b.end,names:common}]:[];
  });
  const roomOverlapCount=bookings.filter(b=>b.id!==editingId&&b.date===form.date&&b.room===form.room&&overlaps(form.start,form.end,b.start,b.end)).length;

  const blankForm=(date=selectedDate):FormState=>({date,start:"09:00",end:"10:00",room:"ห้องประชุม e-GP",title:"",unit:"",bookedBy:"",phone:"",participants:[""]});
  const openNew=(date=selectedDate)=>{setEditingId(null);setForm(blankForm(date));setMessage("");setOpen(true)};
  const openEdit=(b:Booking)=>{
    setEditingId(b.id);
    setForm({date:b.date,start:b.start,end:b.end,room:b.room,title:b.title,unit:b.unit||"",bookedBy:b.bookedBy,phone:b.phone||"",participants:(b.participants&&b.participants.length?b.participants:[""])});
    setMessage(""); setOpen(true);
  };
  const jumpTo=(date:string)=>{const d=atNoon(date);setAnchor(d);setSelectedDate(date)};
  const moveOneDay=(amount:number)=>{const d=addDays(atNoon(selectedDate),amount);setAnchor(d);setSelectedDate(iso(d))};
  const goToday=()=>{const d=new Date();const date=iso(d);setTodayIso(date);setAnchor(new Date(d.getFullYear(),d.getMonth(),d.getDate()));setSelectedDate(date)};
  const updateParticipant=(index:number,value:string)=>setForm(f=>({...f,participants:f.participants.map((p,i)=>i===index?value:p)}));
  const addParticipant=()=>setForm(f=>({...f,participants:[...f.participants,""]}));
  const removeParticipant=(index:number)=>setForm(f=>({...f,participants:f.participants.length===1?[""]:f.participants.filter((_,i)=>i!==index)}));

  const sharePublicRelations=async()=>{
    if(dayBookings.length===0){setNotice("วันที่เลือกยังไม่มีรายการประชุมสำหรับส่งประชาสัมพันธ์");return}
    setSharing(true); setNotice("");
    try{
      if(document.fonts?.ready)await document.fonts.ready;
      const width=1080;
      const itemHeights=dayBookings.map(b=>190+(b.unit?36:0)+Math.min((b.participants||[]).length,8)*38);
      const height=Math.max(720,250+itemHeights.reduce((a,b)=>a+b,0)+90);
      const canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext("2d");if(!ctx)throw new Error("สร้างภาพไม่สำเร็จ");
      ctx.fillStyle="#f4f8fc";ctx.fillRect(0,0,width,height);
      ctx.fillStyle="#1267d8";ctx.fillRect(0,0,width,190);
      ctx.fillStyle="#ffffff";ctx.font="700 50px sans-serif";ctx.fillText("ตารางใช้ห้องประชุม",58,76);
      ctx.font="500 30px sans-serif";ctx.fillText("กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์",58,124);
      ctx.font="600 31px sans-serif";ctx.fillText(selectedLabel,58,168);
      let y=230;
      dayBookings.forEach((b,index)=>{
        const participants=b.participants||[];
        const boxH=itemHeights[index]-20;
        ctx.fillStyle="#ffffff";ctx.fillRect(42,y,width-84,boxH);
        ctx.fillStyle="#1267d8";ctx.fillRect(42,y,12,boxH);
        ctx.fillStyle="#17324d";ctx.font="700 34px sans-serif";ctx.fillText(`${b.start} - ${b.end}`,78,y+52);
        ctx.font="600 31px sans-serif";
        const titleLines=wrapText(ctx,b.title,820,2);titleLines.forEach((line,i)=>ctx.fillText(line,78,y+100+i*40));
        let cy=y+100+titleLines.length*40+12;
        ctx.fillStyle="#526577";ctx.font="500 25px sans-serif";ctx.fillText(`ห้อง: ${b.room.replace("ห้องประชุม ","")}${b.unit?`   •   ${b.unit}`:""}`,78,cy);cy+=40;
        if(participants.length){
          ctx.fillStyle="#334155";ctx.font="700 25px sans-serif";ctx.fillText("กรรมการ / ผู้เข้าร่วม",78,cy);cy+=34;
          ctx.font="500 24px sans-serif";
          participants.slice(0,8).forEach((p,i)=>{ctx.fillText(`${i+1}. ${fitText(ctx,p,850)}`,92,cy);cy+=36});
          if(participants.length>8){ctx.fillStyle="#64748b";ctx.fillText(`และอีก ${participants.length-8} คน`,92,cy);cy+=36}
        }
        y+=boxH+22;
      });
      ctx.fillStyle="#64748b";ctx.font="500 22px sans-serif";ctx.fillText("ข้อมูลจากระบบจองห้องประชุม กลุ่มงานพัสดุ",58,height-40);
      const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("สร้างไฟล์ภาพไม่สำเร็จ")),"image/jpeg",0.92));
      const file=new File([blob],`ตารางประชุม-${selectedDate}.jpg`,{type:"image/jpeg"});
      const nav=navigator as Navigator&{canShare?:(data:ShareData)=>boolean};
      if(nav.share&&(!nav.canShare||nav.canShare({files:[file]}))){
        await nav.share({title:`ตารางประชุม ${selectedLabel}`,text:`ตารางประชุม ${selectedLabel}`,files:[file]});
      }else{
        const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
        setNotice("สร้างภาพ JPG แล้ว สามารถส่งต่อให้ประชาสัมพันธ์ได้");
      }
    }catch(err:any){if(err?.name!=="AbortError")setNotice(err?.message||"สร้างภาพสำหรับประชาสัมพันธ์ไม่สำเร็จ")}
    finally{setSharing(false)}
  };

  const submit=async(e:FormEvent)=>{
    e.preventDefault(); setSaving(true); setMessage(""); setNotice("");
    try{
      const payload={...form,participants:formPeople};
      const url=editingId?`/api/meeting-bookings?id=${encodeURIComponent(editingId)}`:'/api/meeting-bookings';
      const r=await fetch(url,{method:editingId?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const j=await r.json(); if(!r.ok)throw new Error(j.error||'บันทึกไม่สำเร็จ');
      const p=(j.warnings?.participantConflicts||[]) as Array<{names:string[]}>;
      const ro=(j.warnings?.roomOverlaps||[]) as unknown[];
      const prefix=editingId?'แก้ไขรายการแล้ว':'บันทึกแล้ว';
      setNotice(p.length?`${prefix} • พบกรรมการซ้ำช่วงเวลาเดียวกัน: ${Array.from(new Set(p.flatMap(x=>x.names))).join(", ")}`:ro.length?`${prefix} • ช่วงเวลานี้มีหลายวาระในห้องเดียวกัน ระบบอนุญาตให้ประชุมซ้อนได้`:`${prefix}เรียบร้อย`);
      const savedDate=form.date;
      setOpen(false); setEditingId(null); jumpTo(savedDate); await load(atNoon(savedDate));
    }catch(err:any){setMessage(err.message||'บันทึกไม่สำเร็จ')}finally{setSaving(false)}
  };

  return <main style={{minHeight:"100vh",background:"#f4f7fb",color:"#172033",padding:"12px 10px 90px"}}>
    <div style={{maxWidth:900,margin:"0 auto"}}>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10}}>
        <a href="/" style={{display:"inline-flex",alignItems:"center",gap:4,color:"#64748b",textDecoration:"none",fontWeight:800,fontSize:14}}><ChevronLeft size={18}/>หน้าหลัก</a>
        <button onClick={()=>openNew()} style={{border:0,borderRadius:12,padding:"10px 14px",background:"#1664d9",color:"white",fontWeight:900,display:"inline-flex",gap:7,alignItems:"center"}}><Plus size={18}/>จองประชุม</button>
      </header>

      <section style={{background:"linear-gradient(135deg,#0967d8,#2f7de8)",borderRadius:22,padding:"18px 16px",color:"white",boxShadow:"0 12px 32px rgba(37,99,235,.22)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:48,height:48,borderRadius:15,display:"grid",placeItems:"center",background:"rgba(255,255,255,.18)"}}><CalendarDays size={27}/></div><div><h1 style={{margin:0,fontSize:24}}>ตารางประชุม</h1><div style={{opacity:.9,fontSize:14}}>กลุ่มงานพัสดุ • e-GP ห้องหลัก • GF ห้องสำรอง</div></div></div>
      </section>

      <section style={{marginTop:12,background:"white",borderRadius:18,padding:"12px",boxShadow:"0 5px 18px rgba(15,23,42,.06)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:9}}><strong style={{fontSize:15}}>เลือกวันประชุม</strong><div style={{display:"flex",gap:6}}><button onClick={()=>moveOneDay(-1)} aria-label="วันก่อน" style={{width:34,height:34,borderRadius:10,border:"1px solid #e2e8f0",background:"white"}}><ChevronLeft size={18}/></button><button onClick={goToday} style={{height:34,borderRadius:10,border:"1px solid #e2e8f0",background:"#f8fafc",padding:"0 10px",fontWeight:800}}>วันนี้</button><button onClick={()=>moveOneDay(1)} aria-label="วันถัดไป" style={{width:34,height:34,borderRadius:10,border:"1px solid #e2e8f0",background:"white"}}><ChevronRight size={18}/></button></div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(58px,1fr))",gap:7,overflowX:"auto",paddingBottom:3}}>
          {stripDays.map(d=>{const date=iso(d);const active=date===selectedDate;const count=bookings.filter(b=>b.date===date).length;const isToday=date===todayIso;return <button key={date} onClick={()=>setSelectedDate(date)} style={{minWidth:58,border:active?"2px solid #1769e0":"1px solid #e2e8f0",borderRadius:14,padding:"8px 3px",background:active?"#eaf2ff":"#fff",color:active?"#1456b8":"#475569",fontWeight:800}}><div style={{fontSize:11}}>{isToday?"วันนี้":new Intl.DateTimeFormat("th-TH",{weekday:"short"}).format(d)}</div><div style={{fontSize:21,lineHeight:1.2,margin:"2px 0"}}>{d.getDate()}</div><div style={{fontSize:10,color:count?"#1664d9":"#94a3b8"}}>{count?`${count} วาระ`:"ว่าง"}</div></button>})}
        </div>
        <div style={{marginTop:10,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{fontSize:12,color:"#64748b"}}>ไปวันที่อื่น</span><input type="date" value={selectedDate} onChange={e=>jumpTo(e.target.value)} style={{height:36,border:"1px solid #dbe3ee",borderRadius:10,padding:"0 8px",fontSize:14}}/></div>
      </section>

      {notice&&<div style={{marginTop:12,padding:"12px 14px",borderRadius:14,background:notice.includes("กรรมการซ้ำ")?"#fff7ed":"#ecfdf5",color:notice.includes("กรรมการซ้ำ")?"#9a3412":"#166534",fontWeight:700,fontSize:14}}>{notice}</div>}

      <section style={{marginTop:12,background:"white",borderRadius:20,padding:"15px 13px",boxShadow:"0 5px 18px rgba(15,23,42,.06)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:12,flexWrap:"wrap"}}><div style={{minWidth:180,flex:"1 1 auto"}}><div style={{fontWeight:900,fontSize:17}}>{selectedLabel}</div><div style={{fontSize:12,color:"#64748b",marginTop:2}}>{allToday.length} วาระ • กรรมการ/ผู้เข้าร่วม {totalPeople} คน</div></div><div style={{display:"flex",gap:7,flexWrap:"wrap"}}><button onClick={sharePublicRelations} disabled={sharing||dayBookings.length===0} style={{border:"1px solid #b9d8c3",borderRadius:11,padding:"9px 10px",background:"#f0fdf4",color:"#16733a",fontWeight:900,display:"inline-flex",alignItems:"center",gap:5,opacity:dayBookings.length===0?.55:1}}><Share2 size={15}/>{sharing?'กำลังสร้างภาพ...':'แชร์ประชาสัมพันธ์'}</button><button onClick={()=>openNew(selectedDate)} style={{border:0,borderRadius:11,padding:"9px 11px",background:"#eaf2ff",color:"#1456b8",fontWeight:900}}>+ เพิ่มวาระ</button></div></div>

        {dayBookings.length===0?<div style={{padding:"34px 12px",textAlign:"center",border:"1px dashed #cbd5e1",borderRadius:16,color:"#64748b"}}><CalendarDays size={30} style={{margin:"0 auto 7px"}}/><strong style={{display:"block",color:"#334155"}}>วันนี้ยังไม่มีประชุม</strong><span style={{fontSize:13}}>กด “เพิ่มวาระ” เพื่อจองได้เลย</span></div>:
        <div style={{display:"grid",gap:10}}>{dayBookings.map(b=>{const same=dayBookings.filter(x=>x.start===b.start&&x.end===b.end).length>1;return <article key={b.id} style={{display:"grid",gridTemplateColumns:"66px minmax(0,1fr)",gap:10,alignItems:"stretch"}}>
          <div style={{paddingTop:10,textAlign:"center"}}><strong style={{fontSize:16}}>{b.start}</strong><div style={{fontSize:11,color:"#94a3b8"}}>ถึง {b.end}</div></div>
          <div style={{borderRadius:16,padding:"12px 13px",background:b.room==="ห้องประชุม e-GP"?"#f2f7ff":"#faf7ff",border:`1px solid ${b.room==="ห้องประชุม e-GP"?"#d6e6fb":"#e7dcfb"}`}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-start",justifyContent:"space-between"}}><strong style={{fontSize:15,lineHeight:1.35}}>{b.title}</strong><span style={{whiteSpace:"nowrap",fontSize:11,borderRadius:999,padding:"4px 7px",background:b.room==="ห้องประชุม e-GP"?"#dbeafe":"#ede9fe",color:b.room==="ห้องประชุม e-GP"?"#1d4ed8":"#6d28d9"}}>{b.room.replace("ห้องประชุม ","")}</span></div>
            {same&&<div style={{marginTop:6,fontSize:11,fontWeight:800,color:"#b45309"}}>มีหลายวาระในช่วงเวลาเดียวกัน</div>}
            {b.unit&&<div style={{fontSize:12,color:"#64748b",marginTop:5}}>{b.unit}</div>}
            {(b.participants||[]).length>0&&<div style={{marginTop:9,padding:"8px 8px",borderRadius:11,background:"rgba(255,255,255,.82)",minWidth:0}}><div style={{fontSize:11,fontWeight:900,color:"#475569",marginBottom:4,textAlign:"left"}}>กรรมการ / ผู้เข้าร่วม</div><div style={{display:"grid",gap:3,minWidth:0}}>{(b.participants||[]).map((p,n)=><div key={`${p}-${n}`} style={{display:"grid",gridTemplateColumns:"22px minmax(0,1fr)",gap:2,alignItems:"center",minWidth:0,color:"#334155",fontSize:13,lineHeight:1.45,textAlign:"left"}}><span style={{fontWeight:800,textAlign:"right"}}>{n+1}.</span><span title={p} style={{display:"block",minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p}</span></div>)}</div></div>}
            <div style={{marginTop:9,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}><span style={{fontSize:11,color:"#94a3b8"}}>ผู้จอง: {b.bookedBy}</span><button onClick={()=>openEdit(b)} style={{border:"1px solid #bfd6f2",borderRadius:9,padding:"6px 9px",background:"white",color:"#1456b8",fontWeight:900,fontSize:12,display:"inline-flex",alignItems:"center",gap:5}}><Pencil size={13}/>แก้ไข</button></div>
          </div>
        </article>})}</div>}
      </section>
    </div>

    <button onClick={()=>openNew(selectedDate)} aria-label="จองประชุม" style={{position:"fixed",right:18,bottom:18,width:58,height:58,borderRadius:18,border:0,background:"#1769e0",color:"white",display:"grid",placeItems:"center",boxShadow:"0 12px 28px rgba(23,105,224,.35)",zIndex:30}}><Plus size={29}/></button>

    {open&&<div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.56)",display:"grid",placeItems:"end center",zIndex:50,padding:"12px"}}>
      <form onSubmit={submit} style={{width:"min(620px,100%)",maxHeight:"94vh",overflow:"auto",background:"white",borderRadius:22,padding:"18px 16px",boxShadow:"0 24px 70px rgba(0,0,0,.28)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><div><h2 style={{margin:0,fontSize:21}}>{editingId?'แก้ไขรายการประชุม':'จองประชุม / เพิ่มวาระ'}</h2><div style={{fontSize:12,color:"#64748b",marginTop:2}}>ห้องเดียว เวลาเดียวกัน บันทึกหลายเรื่องได้</div></div><button type="button" onClick={()=>{setOpen(false);setEditingId(null)}} style={{width:38,height:38,borderRadius:12,border:"1px solid #e2e8f0",background:"white"}}><X size={19}/></button></div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:15}}>
          <label style={{fontSize:13,fontWeight:800}}>วันที่<input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inputStyle}/></label>
          <label style={{fontSize:13,fontWeight:800}}>ห้อง<select value={form.room} onChange={e=>setForm({...form,room:e.target.value as Room})} style={inputStyle}><option>ห้องประชุม e-GP</option><option>ห้องประชุม GF</option></select></label>
          <label style={{fontSize:13,fontWeight:800}}>เริ่ม<input type="time" required value={form.start} onChange={e=>setForm({...form,start:e.target.value})} style={inputStyle}/></label>
          <label style={{fontSize:13,fontWeight:800}}>สิ้นสุด<input type="time" required value={form.end} onChange={e=>setForm({...form,end:e.target.value})} style={inputStyle}/></label>
        </div>
        <label style={{display:"block",marginTop:10,fontSize:13,fontWeight:800}}>เรื่อง / ชื่อการประชุม<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="เช่น เปิดซองวัสดุทันตกรรม" style={inputStyle}/></label>
        <label style={{display:"block",marginTop:10,fontSize:13,fontWeight:800}}>หน่วยงาน<input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} placeholder="เช่น กลุ่มงานทันตกรรม" style={inputStyle}/></label>

        <div style={{marginTop:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:7}}><strong style={{fontSize:13}}>รายชื่อกรรมการ / ผู้เข้าร่วมประชุม</strong><button type="button" onClick={addParticipant} style={{border:"1px solid #bfd6f2",borderRadius:10,padding:"7px 9px",background:"#f4f9ff",color:"#1456b8",fontWeight:900,fontSize:12}}>+ เพิ่มชื่อ</button></div>
          <div style={{display:"grid",gap:8}}>{form.participants.map((p,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"28px minmax(0,1fr) 36px",gap:7,alignItems:"center"}}><span style={{width:28,height:28,borderRadius:9,display:"grid",placeItems:"center",background:"#eaf2ff",color:"#1456b8",fontWeight:950,fontSize:13}}>{i+1}</span><input value={p} onChange={e=>updateParticipant(i,e.target.value)} placeholder={`ชื่อกรรมการคนที่ ${i+1}`} style={inputStyle}/><button type="button" onClick={()=>removeParticipant(i)} aria-label={`ลบชื่อคนที่ ${i+1}`} style={{width:36,height:36,borderRadius:10,border:"1px solid #fee2e2",background:"#fff7f7",color:"#b91c1c",display:"grid",placeItems:"center"}}><Trash2 size={15}/></button></div>)}</div>
        </div>

        {roomOverlapCount>0&&<div style={{marginTop:10,padding:"10px 11px",borderRadius:12,background:"#fff7ed",color:"#9a3412",fontSize:13}}><AlertTriangle size={16} style={{verticalAlign:"middle",marginRight:5}}/>ช่วงนี้มีวาระใน {form.room.replace("ห้องประชุม ","")} อยู่แล้ว {roomOverlapCount} รายการ — บันทึกซ้อนได้ตามการใช้งานจริง</div>}
        {liveConflicts.length>0&&<div style={{marginTop:10,padding:"10px 11px",borderRadius:12,background:"#fef2f2",color:"#b91c1c",fontSize:13}}><strong>พบกรรมการชนเวลา:</strong> {Array.from(new Set(liveConflicts.flatMap(x=>x.names))).join(", ")}</div>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}><label style={{fontSize:13,fontWeight:800}}>ผู้จอง<input required value={form.bookedBy} onChange={e=>setForm({...form,bookedBy:e.target.value})} style={inputStyle}/></label><label style={{fontSize:13,fontWeight:800}}>เบอร์โทร<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inputStyle}/></label></div>
        {message&&<div style={{marginTop:10,padding:10,borderRadius:11,background:"#fff1f2",color:"#be123c"}}>{message}</div>}
        <button disabled={saving} style={{width:"100%",height:50,marginTop:15,border:0,borderRadius:13,background:"#1769e0",color:"white",fontSize:17,fontWeight:900}}>{saving?'กำลังบันทึก...':editingId?'บันทึกการแก้ไข':'บันทึกการประชุม'}</button>
      </form>
    </div>}
  </main>
}
