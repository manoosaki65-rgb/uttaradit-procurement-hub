"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Camera, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Eye, FileText, Pause, Play, Plus, Printer, Save, Upload, UserRound, X } from "lucide-react";

type Staff = { name: string; position: string };
type Capture = { id: string; image: string; clipTime: string; seconds: number };
type RequestItem = {
  id: string;
  employeeName: string;
  position: string;
  workDate: string;
  workTime: string;
  scanKind: "เข้า" | "ออก";
  note: string;
  driveUrl: string;
  videoName: string;
  status: "รอตรวจสอบ" | "กำลังตรวจสอบ" | "พร้อมจัดทำหลักฐาน" | "ตรวจสอบแล้ว";
  captures: Capture[];
  createdAt: string;
};

const STAFF: Staff[] = [
  { name: "นางวราพร จันทร์ศรีทอง", position: "นักวิชาการพัสดุชำนาญการพิเศษ" },
  { name: "นางกัลยารัตน์ สินรวม", position: "เจ้าพนักงานพัสดุปฏิบัติงาน" },
  { name: "น.ส.พิชญ์สุกานต์ ทองทา", position: "เจ้าพนักงานพัสดุปฏิบัติงาน" },
  { name: "น.ส.กรกนก จรรยานะ", position: "พนักงานพัสดุ ส4" },
  { name: "น.ส.พัทธรินทร์ สุขมี", position: "นักวิชาการพัสดุ" },
  { name: "น.ส.นิตยา ม่วงเมือง", position: "นักวิชาการพัสดุ" },
  { name: "น.ส.นัชชา อยู่เชื้อ", position: "นักวิชาการพัสดุ" },
  { name: "น.ส.สมฤทัย ครุฑอินทร์", position: "นักวิชาการพัสดุ" },
  { name: "นายสุรชาติ คงคุต", position: "นักวิชาการพัสดุ" },
  { name: "น.ส.พัชราพรรณ ร่มเย็น", position: "นักวิชาการพัสดุ" },
  { name: "นางจินตนา บุตรดา", position: "เจ้าพนักงานพัสดุ" },
  { name: "นายมนูศักดิ์ อยู่บาง", position: "เจ้าพนักงานพัสดุ" },
  { name: "น.ส.พิมพ์พรรณ คำพัน", position: "เจ้าพนักงานพัสดุ" },
  { name: "น.ส.รัชดาภรณ์ จันทร์กลัด", position: "เจ้าพนักงานพัสดุ" },
  { name: "น.ส.รัตนาภรณ์ ใจแก้ว", position: "เจ้าพนักงานพัสดุ" },
  { name: "นายพศกร นวนสีใส", position: "เจ้าพนักงานพัสดุ" },
  { name: "นายวรายุ เพิ่มธัญกรรม", position: "เจ้าพนักงานพัสดุ" },
  { name: "นายพงศธร เจริญธนะจินดา", position: "เจ้าพนักงานพัสดุ" },
  { name: "น.ส.เบญจมาศ ทวีกิจสมบูรณ์", position: "พนักงานพัสดุ" },
  { name: "นางวันวิศา ศรีวัฒนะ", position: "พนักงานพัสดุ" },
  { name: "น.ส.สุรีภรณ์ แหยมไทย", position: "พนักงานพัสดุ" },
  { name: "น.ส.หนึ่งฤทัย เอี่ยมงิ้วงาม", position: "พนักงานพัสดุ" },
  { name: "น.ส.สกุณา รีเมือง", position: "พนักงานพัสดุ" },
  { name: "นางสิตาพร สุวรรณรอด", position: "พนักงานบริการ" },
  { name: "นายประยูร บุญพา", position: "พนักงานซักฟอก" },
  { name: "นางจรัญ เขียวจันทร์แสง", position: "พนักงานซักฟอก" },
];

const STORAGE_KEY = "uttaradit-forgot-scan-v5";
const DEMO_REQUEST: RequestItem = {
  id: "demo-patcharapan-2026-10-20",
  employeeName: "น.ส.พัชราพรรณ ร่มเย็น",
  position: "นักวิชาการพัสดุ",
  workDate: "2026-10-20",
  workTime: "16:30",
  scanKind: "ออก",
  note: "ตัวอย่างรายการสำหรับจับคู่คลิปกล้องวงจรปิด",
  driveUrl: "",
  videoName: "",
  status: "รอตรวจสอบ",
  captures: [],
  createdAt: "2026-10-20T09:30:00.000Z",
};

function fmtTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

function thaiDate(value: string) {
  if (!value) return "—";
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date(y, m - 1, d));
}

function dateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function ForgotScanPage() {
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [employeeName, setEmployeeName] = useState("น.ส.พัชราพรรณ ร่มเย็น");
  const currentStaff = STAFF.find((s) => s.name === employeeName) || STAFF[0];
  const [workDate, setWorkDate] = useState("2026-10-20");
  const [workTime, setWorkTime] = useState("16:30");
  const [scanKind, setScanKind] = useState<"เข้า" | "ออก">("ออก");
  const [note, setNote] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [driveUrl, setDriveUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [localVideoUrl, setLocalVideoUrl] = useState("");
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLElement | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRequests(JSON.parse(saved));
      else setRequests([DEMO_REQUEST]);
    } catch { setRequests([DEMO_REQUEST]); }
  }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)); } catch {} }, [requests]);
  useEffect(() => () => { if (localVideoUrl) URL.revokeObjectURL(localVideoUrl); }, [localVideoUrl]);

  const active = requests.find((r) => r.id === activeId) || null;
  const pendingCount = useMemo(() => requests.filter((r) => r.status !== "ตรวจสอบแล้ว").length, [requests]);
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const monthLabel = new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric" }).format(new Date(calendarYear, calendarMonth, 1));

  const grouped = useMemo(() => {
    const map = new Map<string, RequestItem[]>();
    for (const item of requests) {
      const list = map.get(item.workDate) || [];
      list.push(item);
      map.set(item.workDate, list.sort((a, b) => a.workTime.localeCompare(b.workTime)));
    }
    return map;
  }, [requests]);

  function changeMonth(delta: number) {
    const d = new Date(calendarYear, calendarMonth + delta, 1);
    setCalendarYear(d.getFullYear());
    setCalendarMonth(d.getMonth());
  }

  function chooseDay(day: number) {
    setWorkDate(dateKey(calendarYear, calendarMonth, day));
    setFormOpen(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function submitRequest(e: FormEvent) {
    e.preventDefault();
    if (!employeeName || !workDate || !workTime) return;
    const item: RequestItem = {
      id: crypto.randomUUID(), employeeName, position: currentStaff.position, workDate, workTime, scanKind,
      note: note.trim(), driveUrl: "", videoName: "", status: "รอตรวจสอบ", captures: [], createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [item, ...prev]);
    setActiveId(item.id);
    const [y, m] = workDate.split("-").map(Number);
    setCalendarYear(y); setCalendarMonth(m - 1); setFormOpen(false); setMessage("ส่งรายการแล้ว อยู่ในสถานะรอตรวจสอบ");
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  function openRequest(item: RequestItem) {
    setActiveId(item.id); setDriveUrl(item.driveUrl || ""); setVideoName(item.videoName || "");
    setLocalVideoUrl(""); setCurrentSeconds(0); setDuration(0); setPlaying(false); setMessage("");
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function attachLocalVideo(file?: File) {
    if (!file || !active) return;
    if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
    const url = URL.createObjectURL(file); setLocalVideoUrl(url); setVideoName(file.name);
    setRequests((prev) => prev.map((r) => r.id === active.id ? { ...r, videoName: file.name, status: "กำลังตรวจสอบ" } : r));
  }

  function saveDriveLink() {
    if (!active) return;
    setRequests((prev) => prev.map((r) => r.id === active.id ? { ...r, driveUrl: driveUrl.trim(), status: "กำลังตรวจสอบ" } : r));
    setMessage("บันทึกลิงก์คลิป Google Drive ไว้กับรายการแล้ว");
  }

  function seek(delta: number) {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  }

  async function togglePlay() {
    const v = videoRef.current; if (!v) return;
    if (v.paused) await v.play(); else v.pause();
  }

  function captureFrame() {
    const v = videoRef.current; if (!v || !active || !v.videoWidth || !v.videoHeight) return;
    if (active.captures.length >= 2) { setMessage("รายการนี้เก็บภาพหลักฐานได้สูงสุด 2 รูป"); return; }
    v.pause();
    const canvas = document.createElement("canvas"); canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    try {
      const image = canvas.toDataURL("image/jpeg", .9);
      const cap: Capture = { id: crypto.randomUUID(), image, seconds: v.currentTime, clipTime: fmtTime(v.currentTime) };
      setRequests((prev) => prev.map((r) => r.id === active.id ? { ...r, captures: [...r.captures, cap], status: "พร้อมจัดทำหลักฐาน" } : r));
      setMessage(`จับภาพเวลาในคลิป ${cap.clipTime} แล้ว`);
    } catch { setMessage("คลิปจากแหล่งภายนอกไม่อนุญาตให้จับภาพโดยตรง กรุณาเลือกไฟล์วิดีโอจากเครื่องเพื่อแคปภาพ"); }
  }

  function removeCapture(id: string) {
    if (!active) return;
    setRequests((prev) => prev.map((r) => r.id === active.id ? { ...r, captures: r.captures.filter((c) => c.id !== id) } : r));
  }

  function markDone() {
    if (!active) return;
    setRequests((prev) => prev.map((r) => r.id === active.id ? { ...r, status: "ตรวจสอบแล้ว" } : r));
  }

  function printPdf() {
    if (!active) return;
    if (!active.captures.length) { setMessage("กรุณาแคปภาพหลักฐานอย่างน้อย 1 รูปก่อนพิมพ์"); return; }
    window.print();
  }

  return <main className="fs-page">
    <div className="fs-wrap no-print">
      <Link href="/" className="fs-back"><ArrowLeft size={18}/> กลับหน้าหลัก</Link>
      <header className="fs-hero"><div className="fs-icon"><Clock3 size={28}/></div><div><h1>แจ้งลืมสแกนเวลาเข้า–ออก</h1><p>เลือกวันที่จากรายการด้านล่าง แล้วแจ้งชื่อ/เวลา จากนั้นผู้ตรวจจับคู่คลิปให้เจ้าหน้าที่เปิดดูและแคปหลักฐาน</p></div></header>

      <section className="fs-card calendar-card">
        <div className="calendar-head">
          <button type="button" onClick={()=>changeMonth(-1)} aria-label="เดือนก่อน"><ChevronLeft size={20}/></button>
          <div><CalendarDays size={20}/><strong>{monthLabel}</strong><small>{pendingCount} รายการที่ยังไม่ปิดงาน</small></div>
          <button type="button" onClick={()=>changeMonth(1)} aria-label="เดือนถัดไป"><ChevronRight size={20}/></button>
        </div>
        <div className="day-list">
          {Array.from({length:daysInMonth},(_,i)=>i+1).map((day)=>{
            const key=dateKey(calendarYear,calendarMonth,day);
            const items=grouped.get(key)||[];
            return <div className={`day-row ${items.length?"has-items":""}`} key={key}>
              <button className="day-number" type="button" onClick={()=>chooseDay(day)}><b>{day}</b><span>{new Intl.DateTimeFormat("th-TH",{weekday:"short"}).format(new Date(calendarYear,calendarMonth,day))}</span></button>
              <div className="day-content">
                {items.length===0?<button type="button" className="empty-day" onClick={()=>chooseDay(day)}>ยังไม่มีรายการ <span>+ แจ้งลืมสแกน</span></button>:
                  <>{items.map((r)=><button type="button" key={r.id} className="day-request" onClick={()=>openRequest(r)}><div><strong>{r.employeeName}</strong><small>{r.workTime} น. • ลืมสแกน{r.scanKind}</small></div><em>{r.status}</em></button>)}<button type="button" className="add-inline" onClick={()=>chooseDay(day)}><Plus size={14}/> เพิ่มรายการวันนี้</button></>}
              </div>
            </div>;
          })}
        </div>
      </section>

      {formOpen && <section ref={formRef} className="fs-card form-card">
        <div className="section-title"><h2><UserRound size={20}/> แจ้งรายการวันที่ {thaiDate(workDate)}</h2><button type="button" onClick={()=>setFormOpen(false)}><X size={18}/></button></div>
        <form onSubmit={submitRequest} className="fs-form">
          <label><span>ชื่อ–สกุล *</span><select value={employeeName} onChange={(e)=>setEmployeeName(e.target.value)}>{STAFF.map((s)=><option key={s.name} value={s.name}>{s.name} — {s.position}</option>)}</select></label>
          <label><span>ตำแหน่ง</span><input value={currentStaff.position} readOnly /></label>
          <div className="two"><label><span>วันที่ *</span><input type="date" value={workDate} onChange={(e)=>setWorkDate(e.target.value)} required/></label><label><span>เวลาที่ลืมสแกน *</span><input type="time" value={workTime} onChange={(e)=>setWorkTime(e.target.value)} required/></label></div>
          <label><span>ลืมสแกน</span><div className="pills">{(["เข้า","ออก"] as const).map((k)=><button type="button" key={k} onClick={()=>setScanKind(k)} className={scanKind===k?"active":""}>เวลา{k}</button>)}</div></label>
          <label><span>หมายเหตุ</span><textarea rows={2} value={note} onChange={(e)=>setNote(e.target.value)} placeholder="ถ้ามี"/></label>
          <button className="primary" type="submit"><Save size={18}/> ส่งแจ้งตรวจสอบ</button>
        </form>
      </section>}

      {active && <section ref={detailRef} className="fs-card detail-card">
        <h2><Eye size={20}/> รายการที่เลือก</h2>
        <div className="active-head"><div><strong>{active.employeeName}</strong><small>{active.position}</small><span>{thaiDate(active.workDate)} • {active.workTime} น. • ลืมสแกน{active.scanKind}</span></div><span className="status">{active.status}</span></div>

        <h3><Camera size={18}/> คลิปกล้องวงจรปิดและภาพหลักฐาน</h3>
        <div className="attach-grid">
          <label className="upload"><Upload size={23}/><strong>{videoName || "เลือกไฟล์วิดีโอจากเครื่อง"}</strong><small>เล่น หยุด กรอ และแคปภาพได้โดยตรง</small><input type="file" accept="video/*" onChange={(e)=>attachLocalVideo(e.target.files?.[0])}/></label>
          <div className="drive-box"><strong>ลิงก์ไฟล์ Google Drive</strong><input value={driveUrl} onChange={(e)=>setDriveUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..."/><button onClick={saveDriveLink}>บันทึกลิงก์</button>{active.driveUrl&&<a href={active.driveUrl} target="_blank" rel="noopener noreferrer">เปิดคลิปใน Google Drive ↗</a>}</div>
        </div>

        {localVideoUrl ? <div className="player"><video ref={videoRef} src={localVideoUrl} playsInline onLoadedMetadata={(e)=>setDuration(e.currentTarget.duration)} onTimeUpdate={(e)=>setCurrentSeconds(e.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/><div className="timebar"><b>{fmtTime(currentSeconds)}</b><span>/ {fmtTime(duration)}</span></div><input className="range" type="range" min={0} max={duration||0} step="0.1" value={Math.min(currentSeconds,duration||0)} onChange={(e)=>{const v=videoRef.current;if(v)v.currentTime=Number(e.target.value)}}/><div className="controls"><button onClick={()=>seek(-10)}>−10 วิ</button><button className="play" onClick={togglePlay}>{playing?<Pause size={18}/>:<Play size={18}/>} {playing?"หยุด":"เล่น"}</button><button onClick={()=>seek(10)}>+10 วิ</button><button className="capture" onClick={captureFrame}><Camera size={18}/> แคปเจอร์ภาพ</button></div></div> : <div className="empty">เลือกไฟล์วิดีโอจากเครื่องเพื่อเปิดตัวเล่นและแคปภาพได้ทันที</div>}

        <div className="captures">{active.captures.map((c,i)=><figure key={c.id}><img src={c.image} alt={`หลักฐาน ${i+1}`}/><figcaption>ภาพที่ {i+1} • เวลาในคลิป {c.clipTime}</figcaption><button onClick={()=>removeCapture(c.id)}><X size={15}/></button></figure>)}</div>
        <div className="bottom-actions"><button onClick={markDone}>ตรวจสอบแล้ว</button><button className="print" onClick={printPdf}><Printer size={18}/> พิมพ์ / Save PDF</button></div>
        {message&&<div className="message"><CheckCircle2 size={18}/>{message}</div>}
      </section>}
    </div>

    {active && <section className="print-report">
      <div className="report-title"><FileText size={28}/><div><h1>แบบรายงานกรณีลืมสแกนเวลาเข้า–ออก</h1><p>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์</p></div></div>
      <table><tbody><tr><th>ชื่อ–สกุล</th><td>{active.employeeName}</td></tr><tr><th>ตำแหน่ง</th><td>{active.position}</td></tr><tr><th>วันที่ลืมสแกน</th><td>{thaiDate(active.workDate)}</td></tr><tr><th>เวลา</th><td>{active.workTime} น.</td></tr><tr><th>ประเภท</th><td>ลืมสแกน{active.scanKind}</td></tr><tr><th>หมายเหตุ</th><td>{active.note||"-"}</td></tr><tr><th>คลิปที่ตรวจ</th><td>{active.videoName||active.driveUrl||"-"}</td></tr></tbody></table>
      <div className={`report-images count-${active.captures.length}`}>{active.captures.map((c,i)=><figure key={c.id}><img src={c.image} alt={`หลักฐาน ${i+1}`}/><figcaption>ภาพหลักฐานที่ {i+1} — เวลาในคลิป {c.clipTime}</figcaption></figure>)}</div>
      <div className="sign"><div><p>ลงชื่อ ............................................................ ผู้แจ้ง</p><p>( {active.employeeName} )</p><p>วันที่ ........../........../..........</p></div><div><p>ลงชื่อ ............................................................ ผู้ตรวจสอบ</p><p>( ............................................................ )</p><p>วันที่ ........../........../..........</p></div><div><p>ลงชื่อ ............................................................ หัวหน้ากลุ่มงานพัสดุ</p><p>( นางวราพร จันทร์ศรีทอง )</p><p>วันที่ ........../........../..........</p></div></div>
    </section>}

    <style jsx global>{`
      *{box-sizing:border-box}.fs-page{min-height:100vh;background:#f5f7fb;color:#172033;font-family:Arial,"Noto Sans Thai",sans-serif;padding:20px}.fs-wrap{max-width:1050px;margin:auto}.fs-back{display:inline-flex;align-items:center;gap:7px;text-decoration:none;color:#475569;font-weight:800;margin-bottom:14px}.fs-hero,.fs-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:20px;box-shadow:0 8px 24px #0f172a0d}.fs-hero{display:flex;gap:14px;align-items:center;margin-bottom:16px}.fs-icon{width:52px;height:52px;border-radius:15px;background:#fff1f2;color:#e11d48;display:grid;place-items:center}.fs-hero h1{margin:0;font-size:27px}.fs-hero p{margin:5px 0 0;color:#64748b}.fs-card{margin-bottom:16px}.calendar-card{padding:0;overflow:hidden}.calendar-head{display:grid;grid-template-columns:44px 1fr 44px;gap:8px;align-items:center;padding:16px 18px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#f8fbff,#fff)}.calendar-head>button{width:40px;height:40px;border:1px solid #dbe3ef;border-radius:12px;background:white;display:grid;place-items:center;cursor:pointer;color:#334155}.calendar-head>div{text-align:center;display:grid;grid-template-columns:auto auto;justify-content:center;align-items:center;gap:6px 8px}.calendar-head strong{font-size:21px}.calendar-head small{grid-column:1/-1;color:#64748b}.day-list{display:grid}.day-row{display:grid;grid-template-columns:86px 1fr;min-height:72px;border-bottom:1px solid #edf1f6}.day-row:last-child{border-bottom:0}.day-row.has-items{background:#fffdf7}.day-number{border:0;border-right:1px solid #edf1f6;background:#f8fafc;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#334155}.day-number b{font-size:25px;line-height:1}.day-number span{font-size:12px;color:#94a3b8;margin-top:5px}.day-content{padding:9px 12px;display:grid;gap:6px;align-content:center}.empty-day{width:100%;border:0;background:transparent;text-align:left;color:#94a3b8;padding:8px 4px;cursor:pointer;font:inherit}.empty-day span{float:right;color:#2563eb;font-weight:800}.day-request{width:100%;border:1px solid #e5e7eb;border-radius:11px;background:white;padding:9px 11px;display:flex;justify-content:space-between;align-items:center;gap:12px;text-align:left;cursor:pointer}.day-request div{display:grid;gap:2px}.day-request strong{font-size:15px}.day-request small{color:#64748b}.day-request em{font-style:normal;font-size:11px;font-weight:900;border-radius:999px;padding:5px 8px;background:#eff6ff;color:#1d4ed8;white-space:nowrap}.add-inline{justify-self:start;border:0;background:transparent;color:#2563eb;font-weight:800;display:flex;align-items:center;gap:4px;cursor:pointer;padding:3px 0}.form-card,.detail-card{scroll-margin-top:12px}.section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.section-title h2,.fs-card h2{margin:0;display:flex;gap:8px;align-items:center;font-size:20px}.section-title>button{border:0;background:#f1f5f9;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;cursor:pointer}.fs-form{display:grid;gap:13px}.fs-form label,.drive-box{display:flex;flex-direction:column;gap:6px}.fs-form label>span,.drive-box strong{font-size:13px;font-weight:800;color:#475569}.fs-form input,.fs-form select,.fs-form textarea,.drive-box input{border:1px solid #cbd5e1;border-radius:11px;padding:10px 11px;font:inherit;background:#fff}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pills{display:flex;gap:8px}.pills button{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:8px 14px;font-weight:800;cursor:pointer}.pills .active{background:#fff1f2;border-color:#fb7185;color:#be123c}.primary,.bottom-actions button,.drive-box button{border:0;border-radius:11px;padding:11px 14px;font-weight:800;cursor:pointer}.primary{display:flex;justify-content:center;align-items:center;gap:7px;background:#e11d48;color:#fff}.active-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:14px 0 18px;padding:14px;border-radius:14px;background:#f8fafc}.active-head div{display:grid;gap:3px}.active-head small,.active-head span{color:#64748b}.status{background:#eff6ff;color:#1d4ed8!important;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900}.detail-card h3{display:flex;align-items:center;gap:7px;font-size:16px;margin:0 0 12px}.attach-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.upload{border:2px dashed #cbd5e1;border-radius:14px;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;background:#f8fafc;color:#475569}.upload input{display:none}.drive-box{border:1px solid #e2e8f0;border-radius:14px;padding:12px}.drive-box button{background:#334155;color:#fff}.drive-box a{font-size:13px;color:#2563eb;font-weight:800}.player{margin-top:14px;background:#0f172a;border-radius:15px;overflow:hidden;padding-bottom:12px}.player video{width:100%;max-height:560px;background:#000;display:block}.timebar{padding:8px 14px 4px;color:#fff;display:flex;gap:5px;align-items:baseline}.timebar b{font-size:22px}.timebar span{color:#94a3b8}.range{width:calc(100% - 28px);margin:0 14px 10px}.controls{display:flex;gap:8px;flex-wrap:wrap;padding:0 14px}.controls button{border:0;border-radius:10px;padding:9px 12px;background:#334155;color:#fff;font-weight:800;cursor:pointer}.controls .play{background:#2563eb;display:flex;gap:6px;align-items:center}.controls .capture{background:#15803d;margin-left:auto;display:flex;gap:6px;align-items:center}.captures{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.captures figure{margin:0;position:relative;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}.captures img{width:100%;display:block}.captures figcaption{padding:8px 10px;font-size:13px}.captures figure button{position:absolute;top:8px;right:8px;width:30px;height:30px;border:0;border-radius:50%;background:#000b;color:#fff;display:grid;place-items:center}.bottom-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:14px}.bottom-actions button{background:#e2e8f0;color:#334155}.bottom-actions .print{background:#166534;color:#fff;display:flex;gap:7px;align-items:center}.message{margin-top:12px;padding:10px 12px;border-radius:10px;background:#ecfdf5;color:#15803d;font-weight:800;display:flex;gap:7px;align-items:center}.empty{padding:22px;text-align:center;border:1px dashed #cbd5e1;border-radius:12px;color:#94a3b8}.print-report{display:none}.report-title{display:flex;gap:12px;align-items:center;border-bottom:2px solid #222;padding-bottom:10px}.report-title h1{margin:0;font-size:21px}.report-title p{margin:3px 0 0}.print-report table{width:100%;border-collapse:collapse;margin-top:14px}.print-report th,.print-report td{border:1px solid #555;padding:7px;text-align:left}.print-report th{width:170px}.report-images{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.report-images.count-1{grid-template-columns:1fr}.report-images figure{margin:0}.report-images img{width:100%;max-height:330px;object-fit:contain;border:1px solid #777}.report-images figcaption{text-align:center;font-size:12px;margin-top:4px}.sign{display:grid;grid-template-columns:1fr 1fr;gap:28px 36px;margin-top:34px}.sign>div:last-child{grid-column:1/-1;width:52%;justify-self:end}.sign p{text-align:center;margin:8px 0}@media(max-width:720px){.fs-page{padding:10px}.fs-hero{align-items:flex-start}.fs-hero h1{font-size:22px}.day-row{grid-template-columns:64px 1fr}.day-number b{font-size:22px}.day-request{align-items:flex-start;flex-direction:column;gap:5px}.day-request em{align-self:flex-start}.empty-day span{float:none;display:block;margin-top:4px}.two,.attach-grid,.captures{grid-template-columns:1fr}.controls .capture{margin-left:0;width:100%}.active-head{align-items:flex-start;flex-direction:column}.calendar-head strong{font-size:18px}}@media print{body{background:#fff!important}.no-print{display:none!important}.fs-page{padding:0;background:#fff}.print-report{display:block;color:#111;font-size:14px}.report-images,.sign{break-inside:avoid}@page{size:A4;margin:12mm}}
    `}</style>
  </main>;
}
