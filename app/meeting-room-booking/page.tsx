"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock3, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

type Booking = {
  date: string;
  room: "ห้องประชุม e-GP" | "ห้องประชุม GF";
  start: string;
  end: string;
  title: string;
  bookedBy: string;
};

const bookings: Booking[] = [];
const thaiMonths = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const weekdays = ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."];
const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;

export default function MeetingRoomBookingPage() {
  const today = new Date();
  const [monthCursor,setMonthCursor] = useState(new Date(today.getFullYear(),today.getMonth(),1));
  const [selectedDate,setSelectedDate] = useState(isoDate(today));

  const calendarDays = useMemo(() => {
    const y=monthCursor.getFullYear(), m=monthCursor.getMonth();
    const cells:(number|null)[] = Array(new Date(y,m,1).getDay()).fill(null);
    for(let d=1; d<=new Date(y,m+1,0).getDate(); d++) cells.push(d);
    while(cells.length%7) cells.push(null);
    return cells;
  },[monthCursor]);

  const selectedBookings = bookings.filter(b=>b.date===selectedDate);
  const selectedLabel = new Intl.DateTimeFormat("th-TH",{day:"numeric",month:"long",year:"numeric"}).format(new Date(`${selectedDate}T12:00:00`));
  const goMonth=(o:number)=>setMonthCursor(new Date(monthCursor.getFullYear(),monthCursor.getMonth()+o,1));
  const goToday=()=>{const n=new Date();setMonthCursor(new Date(n.getFullYear(),n.getMonth(),1));setSelectedDate(isoDate(n));};

  return <main style={{minHeight:"100vh",background:"linear-gradient(180deg,#eef7fc 0%,#f8fbfd 42%,#eef4f8 100%)",padding:"22px 14px 40px"}}>
    <div style={{maxWidth:1180,margin:"0 auto"}}>
      <a href="/" style={{display:"inline-flex",alignItems:"center",gap:7,color:"#0f5f91",textDecoration:"none",fontWeight:800,marginBottom:14}}><ChevronLeft size={20}/>กลับหน้าหลัก</a>

      <section style={{overflow:"hidden",borderRadius:26,background:"#fff",boxShadow:"0 18px 48px rgba(15,59,88,.12)"}}>
        <div style={{position:"relative",height:"clamp(260px,38vw,430px)",overflow:"hidden"}}>
          <img src="/room-egp.jpg" alt="ห้องประชุม e-GP" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(6,31,55,.82) 0%,rgba(6,31,55,.28) 55%,rgba(6,31,55,.08) 100%)"}}/>
          <div style={{position:"absolute",left:"clamp(20px,4vw,48px)",bottom:"clamp(24px,5vw,50px)",color:"white",maxWidth:620}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:999,background:"rgba(255,255,255,.16)",backdropFilter:"blur(8px)",fontWeight:800,fontSize:14}}><CalendarDays size={18}/>จองห้องประชุมออนไลน์</div>
            <h1 style={{margin:"13px 0 7px",fontSize:"clamp(30px,5vw,52px)",lineHeight:1.08}}>ห้องประชุม e-GP</h1>
            <p style={{margin:0,fontSize:"clamp(15px,2vw,19px)",opacity:.95}}>กลุ่มงานพัสดุ อาคารพัสดุ ชั้น 3 โรงพยาบาลอุตรดิตถ์</p>
          </div>
        </div>

        <div style={{padding:"22px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
            <div style={{borderRadius:20,overflow:"hidden",border:"2px solid #b9dff6",background:"#f4fbff"}}>
              <img src="/room-egp.jpg" alt="ภาพห้องประชุม e-GP" style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",display:"block"}}/>
              <div style={{padding:16}}><strong style={{fontSize:20,color:"#16324a"}}>ห้องประชุม e-GP</strong><div style={{marginTop:4,color:"#64748b"}}>ห้องหลัก • ใช้งานเป็นหลัก</div></div>
            </div>
            <div style={{borderRadius:20,overflow:"hidden",border:"2px solid #ddd6fe",background:"#fbf9ff"}}>
              <img src="/room-gf.jpg" alt="ภาพห้องประชุม GF" style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",display:"block"}}/>
              <div style={{padding:16}}><strong style={{fontSize:20,color:"#16324a"}}>ห้องประชุม GF</strong><div style={{marginTop:4,color:"#64748b"}}>ห้องสำรอง • เลือกใช้เมื่อจำเป็น</div></div>
            </div>
          </div>

          <div style={{marginTop:22,border:"1px solid #dbe7ef",borderRadius:20,overflow:"hidden",background:"white"}}>
            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:12,padding:"16px 18px",background:"#f8fbfd",borderBottom:"1px solid #dbe7ef"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={()=>goMonth(-1)} aria-label="เดือนก่อน" style={{width:38,height:38,borderRadius:10,border:"1px solid #cbd5e1",background:"white",display:"grid",placeItems:"center",cursor:"pointer"}}><ChevronLeft size={19}/></button>
                <button onClick={()=>goMonth(1)} aria-label="เดือนถัดไป" style={{width:38,height:38,borderRadius:10,border:"1px solid #cbd5e1",background:"white",display:"grid",placeItems:"center",cursor:"pointer"}}><ChevronRight size={19}/></button>
                <button onClick={goToday} style={{height:38,borderRadius:10,border:"1px solid #cbd5e1",background:"white",padding:"0 12px",fontWeight:800,cursor:"pointer"}}>วันนี้</button>
              </div>
              <h2 style={{margin:0,fontSize:22,color:"#16324a"}}>{thaiMonths[monthCursor.getMonth()]} {monthCursor.getFullYear()+543}</h2>
              <div style={{fontSize:13,color:"#64748b"}}>กดวันที่เพื่อดูคิวห้องประชุม</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",background:"#edf5f9",borderBottom:"1px solid #dbe7ef"}}>{weekdays.map(d=><div key={d} style={{padding:"10px 4px",textAlign:"center",fontWeight:800,color:"#476579",fontSize:13}}>{d}</div>)}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))"}}>{calendarDays.map((day,index)=>{
              if(!day) return <div key={`b-${index}`} style={{minHeight:92,background:"#fbfdfe",borderRight:"1px solid #edf2f5",borderBottom:"1px solid #edf2f5"}}/>;
              const date=`${monthCursor.getFullYear()}-${String(monthCursor.getMonth()+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const db=bookings.filter(b=>b.date===date), sel=selectedDate===date, isToday=isoDate(today)===date;
              return <button key={date} onClick={()=>setSelectedDate(date)} style={{minHeight:92,padding:8,textAlign:"left",background:sel?"#eaf6ff":"white",border:0,borderRight:"1px solid #edf2f5",borderBottom:"1px solid #edf2f5",cursor:"pointer"}}>
                <span style={{display:"inline-grid",placeItems:"center",width:28,height:28,borderRadius:999,background:isToday?"#0b6ea8":"transparent",color:isToday?"white":"#334155",fontWeight:800}}>{day}</span>
                <div style={{display:"grid",gap:4,marginTop:4}}>{db.slice(0,2).map((b,i)=><span key={i} style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",borderRadius:999,padding:"3px 6px",background:b.room.includes("e-GP")?"#dff3ff":"#eee7ff",fontSize:11,fontWeight:700}}>{b.start} {b.room.replace("ห้องประชุม ","")}</span>)}</div>
              </button>;
            })}</div>
          </div>

          <section style={{marginTop:20,border:"1px solid #dbe7ef",borderRadius:18,padding:18,background:"white"}}>
            <h3 style={{margin:0,color:"#16324a",fontSize:19}}>รายการจองวันที่ {selectedLabel}</h3>
            {selectedBookings.length===0 ? <div style={{marginTop:14,padding:20,borderRadius:14,background:"#f8fafc",color:"#64748b",textAlign:"center"}}>ยังไม่มีรายการจองในวันนี้</div> : <div style={{display:"grid",gap:10,marginTop:14}}>{selectedBookings.map((b,i)=><div key={i} style={{display:"grid",gap:6,padding:14,border:"1px solid #e2e8f0",borderRadius:14}}><strong>{b.title}</strong><span style={{display:"inline-flex",alignItems:"center",gap:6}}><Clock3 size={15}/>{b.start}–{b.end} น. · {b.room}</span><span style={{display:"inline-flex",alignItems:"center",gap:6}}><UsersRound size={15}/>ผู้จอง: {b.bookedBy}</span></div>)}</div>}
          </section>
        </div>
      </section>
    </div>
  </main>;
}
