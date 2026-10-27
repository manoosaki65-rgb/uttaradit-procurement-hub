"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CalendarDays, Camera, CheckCircle2, ChevronLeft, ChevronRight,
  Clock3, Eye, FileText, Pause, Play, Plus, Printer, Save, Upload, UserRound, X,
} from "lucide-react";

type Staff = { name: string; position: string };
type Capture = {
  id: string;
  image: string;
  seconds: number;
  clipTime?: string;
  cameraDate?: string;
  cameraTime?: string;
};
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

function compactThaiDate(value?: string) {
  if (!value) return "";
  const [y, m, d] = value.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y + 543}`;
}

function dateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseCameraStamp(text: string) {
  const cleaned = text.replace(/[Oo]/g, "0").replace(/\s+/g, " ").trim();
  const date = cleaned.match(/(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})/);
  const time = cleaned.match(/([01]?\d|2[0-3])\s*[:.]\s*(\d{2})\s*[:.]\s*(\d{2})/);
  let cameraDate = "";
  if (date) {
    const a = Number(date[1]), b = Number(date[2]), year = Number(date[3]);
    const month = a;
    const day = b;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      cameraDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  const cameraTime = time ? `${String(Number(time[1])).padStart(2, "0")}:${time[2]}:${time[3]}` : "";
  return { cameraDate, cameraTime };
}

async function readCameraStamp(video: HTMLVideoElement) {
  const crop = document.createElement("canvas");
  const cropW = Math.max(320, Math.round(video.videoWidth * 0.42));
  const cropH = Math.max(70, Math.round(video.videoHeight * 0.16));
  const scale = 3;
  crop.width = cropW * scale;
  crop.height = cropH * scale;
  const ctx = crop.getContext("2d");
  if (!ctx) return { cameraDate: "", cameraTime: "" };
  ctx.drawImage(video, 0, 0, cropW, cropH, 0, 0, crop.width, crop.height);

  const img = ctx.getImageData(0, 0, crop.width, crop.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const gray = Math.round(img.data[i] * 0.299 + img.data[i + 1] * 0.587 + img.data[i + 2] * 0.114);
    const value = gray > 145 ? 255 : 0;
    img.data[i] = value;
    img.data[i + 1] = value;
    img.data[i + 2] = value;
  }
  ctx.putImageData(img, 0, 0);

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    await worker.setParameters({
      tessedit_char_whitelist: "0123456789-/:. ",
      preserve_interword_spaces: "1",
    });
    const result = await worker.recognize(crop.toDataURL("image/png"));
    return parseCameraStamp(result.data.text || "");
  } finally {
    await worker.terminate();
  }
}

export default function ForgotScanPage() {
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [employeeName, setEmployeeName] = useState(STAFF[0].name);
  const currentStaff = STAFF.find((s) => s.name === employeeName) || STAFF[0];
  const [workDate, setWorkDate] = useState(dateKey(now.getFullYear(), now.getMonth(), now.getDate()));
  const [workTime, setWorkTime] = useState("");
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
  const [ocrBusy, setOcrBusy] = useState(false);
  const formRef = useRef<HTMLElement | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const storageReadyRef = useRef(false);
  useEffect(() => {
    try {
      let recovered: RequestItem[] | null = null;
      const preferredKeys = [STORAGE_KEY, `${STORAGE_KEY}-backup`, "uttaradit-forgot-scan-v6", "uttaradit-forgot-scan-v4"];
      const allKeys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter((k): k is string => !!k);
      for (const key of [...preferredKeys, ...allKeys.filter((k) => k.includes("uttaradit-forgot-scan"))]) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length && parsed.some((x) => x && typeof x === "object" && "workDate" in x)) { recovered = parsed as RequestItem[]; break; }
        } catch {}
      }
      if (!recovered) {
        recovered = [{
          id: "recovered-patcharapan-2026-10-20",
          employeeName: "น.ส.พัชราพรรณ ร่มเย็น",
          position: "นักวิชาการพัสดุ",
          workDate: "2026-10-20",
          workTime: "16:30",
          scanKind: "ออก",
          note: "กู้คืนรายการวันที่ 20 ต.ค. 2569",
          driveUrl: "", videoName: "", status: "รอตรวจสอบ", captures: [],
          createdAt: "2026-10-20T09:30:00.000Z",
        }];
      }
      setRequests(recovered);
    } catch {
      setRequests([{ id: "recovered-patcharapan-2026-10-20", employeeName: "น.ส.พัชราพรรณ ร่มเย็น", position: "นักวิชาการพัสดุ", workDate: "2026-10-20", workTime: "16:30", scanKind: "ออก", note: "กู้คืนรายการวันที่ 20 ต.ค. 2569", driveUrl: "", videoName: "", status: "รอตรวจสอบ", captures: [], createdAt: "2026-10-20T09:30:00.000Z" }]);
    } finally { storageReadyRef.current = true; }
  }, []);
  useEffect(() => {
    if (!storageReadyRef.current) return;
    try {
      const next = JSON.stringify(requests);
      const previous = localStorage.getItem(STORAGE_KEY);
      if (previous && previous !== "[]" && previous !== next) localStorage.setItem(`${STORAGE_KEY}-backup`, previous);
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, [requests]);
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

  async function captureFrame() {
    const v = videoRef.current;
    if (!v || !active || !v.videoWidth || !v.videoHeight || ocrBusy) return;
    if (active.captures.length >= 1) { setMessage("รายการนี้ใช้ภาพหลักฐาน 1 รูปต่อรายงาน"); return; }
    v.pause();
    setOcrBusy(true);
    setMessage("กำลังอ่านวันและเวลาจากมุมซ้ายบนของภาพกล้อง…");
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setOcrBusy(false); return; }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    try {
      const image = canvas.toDataURL("image/jpeg", .92);
      let cameraDate = "", cameraTime = "";
      try {
        const stamp = await readCameraStamp(v);
        cameraDate = stamp.cameraDate;
        cameraTime = stamp.cameraTime;
      } catch {}
      const cap: Capture = {
        id: crypto.randomUUID(), image, seconds: v.currentTime, clipTime: fmtTime(v.currentTime), cameraDate, cameraTime,
      };
      setRequests((prev) => prev.map((r) => r.id === active.id ? { ...r, captures: [...r.captures, cap], status: "พร้อมจัดทำหลักฐาน" } : r));
      if (cameraDate && cameraTime) {
        setMessage(`จับภาพแล้ว — อ่านเวลาจากกล้องได้ ${compactThaiDate(cameraDate)} ${cameraTime} น.`);
      } else {
        setMessage("จับภาพแล้ว ถ้าอ่านวัน/เวลาไม่ครบสามารถกรอกแก้ใต้ภาพได้ หรือพิมพ์ PDF ได้โดยดูวันเวลาจากตัวภาพกล้อง");
      }
    } catch {
      setMessage("ไม่สามารถจับภาพจากคลิปนี้ได้ กรุณาเลือกไฟล์วิดีโอจากเครื่อง");
    } finally {
      setOcrBusy(false);
    }
  }

  function updateCapture(id: string, patch: Partial<Capture>) {
    if (!active) return;
    setRequests((prev) => prev.map((r) => r.id === active.id ? {
      ...r,
      captures: r.captures.map((c) => c.id === id ? { ...c, ...patch } : c),
    } : r));
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
      <header className="fs-hero"><div className="fs-icon"><Clock3 size={28}/></div><div><h1>แจ้งลืมสแกนเวลาเข้า–ออก</h1><p>เลือกวันที่ → แจ้งชื่อ/เวลา → แนบคลิป → หยุดตรงภาพที่ต้องการ → แคปหลักฐานพร้อมอ่านวัน/เวลาจากภาพกล้อง</p></div></header>

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

        {localVideoUrl ? <div className="player"><video ref={videoRef} src={localVideoUrl} playsInline onLoadedMetadata={(e)=>setDuration(e.currentTarget.duration)} onTimeUpdate={(e)=>setCurrentSeconds(e.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/><div className="timebar"><b>{fmtTime(currentSeconds)}</b><span>/ {fmtTime(duration)}</span></div><input className="range" type="range" min={0} max={duration||0} step="0.1" value={Math.min(currentSeconds,duration||0)} onChange={(e)=>{const v=videoRef.current;if(v)v.currentTime=Number(e.target.value)}}/><div className="controls"><button onClick={()=>seek(-10)}>−10 วิ</button><button className="play" onClick={togglePlay}>{playing?<Pause size={18}/>:<Play size={18}/>} {playing?"หยุด":"เล่น"}</button><button onClick={()=>seek(10)}>+10 วิ</button><button className="capture" disabled={ocrBusy} onClick={captureFrame}><Camera size={18}/> {ocrBusy?"กำลังอ่านวันเวลา…":"แคปเจอร์ภาพ"}</button></div></div> : <div className="empty">เลือกไฟล์วิดีโอจากเครื่องเพื่อเปิดตัวเล่นและแคปภาพได้ทันที</div>}

        <div className="captures">{active.captures.map((c,i)=><figure key={c.id}><img src={c.image} alt={`หลักฐาน ${i+1}`}/><figcaption><strong>ภาพที่ {i+1}</strong><div className="stamp-fields"><label><span>วันที่จากกล้อง</span><input type="date" value={c.cameraDate||""} onChange={(e)=>updateCapture(c.id,{cameraDate:e.target.value})}/></label><label><span>เวลาจากกล้อง</span><input type="time" step="1" value={c.cameraTime||""} onChange={(e)=>updateCapture(c.id,{cameraTime:e.target.value})}/></label></div>{c.cameraDate&&c.cameraTime?<small>หลักฐาน: {compactThaiDate(c.cameraDate)} เวลา {c.cameraTime} น.</small>:<small>ถ้ายังอ่านไม่ครบ สามารถพิมพ์ PDF ได้โดยใช้วันเวลาที่เห็นบนตัวภาพกล้อง</small>}</figcaption><button onClick={()=>removeCapture(c.id)}><X size={15}/></button></figure>)}</div>
        <div className="bottom-actions"><button onClick={markDone}>ตรวจสอบแล้ว</button><button className="print" onClick={printPdf}><Printer size={18}/> พิมพ์ / Save PDF</button></div>
        {message&&<div className="message"><CheckCircle2 size={18}/>{message}</div>}
      </section>}
    </div>

    {active && <section className="print-report">
      <div className="report-title"><FileText size={28}/><div><h1>แบบรายงานกรณีลืมสแกนเวลาเข้า–ออก</h1><p>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์</p></div></div>
      <table><tbody><tr><th>ชื่อ–สกุล</th><td>{active.employeeName}</td></tr><tr><th>ตำแหน่ง</th><td>{active.position}</td></tr><tr><th>วันที่ลืมสแกน</th><td>{thaiDate(active.workDate)}</td></tr><tr><th>เวลา</th><td>{active.workTime} น.</td></tr><tr><th>ประเภท</th><td>ลืมสแกน{active.scanKind}</td></tr><tr><th>หมายเหตุ</th><td>{active.note||"-"}</td></tr><tr><th>คลิปที่ตรวจ</th><td>{active.videoName||active.driveUrl||"-"}</td></tr></tbody></table>
      <div className="report-images">{active.captures.slice(0,1).map((c)=><figure key={c.id}><img src={c.image} alt="ภาพหลักฐาน"/><figcaption>{c.cameraDate&&c.cameraTime?<>วันที่ {compactThaiDate(c.cameraDate)} &nbsp;&nbsp; เวลา {c.cameraTime} น.</>:<>วัน/เวลาให้ยึดตามที่ปรากฏในภาพกล้อง</>}</figcaption></figure>)}</div>
      <div className="sign"><div><p className="sign-line">ลงชื่อ ............................................................</p><p className="sign-role">ผู้แจ้ง</p><p>( {active.employeeName} )</p><p>วันที่ ........../........../..........</p></div><div><p className="sign-line">ลงชื่อ ............................................................</p><p className="sign-role">ผู้ตรวจสอบ</p><p>( ............................................................ )</p><p>วันที่ ........../........../..........</p></div><div><p className="sign-line">ลงชื่อ ............................................................</p><p className="sign-role">หัวหน้ากลุ่มงานพัสดุ</p><p>( นางวราพร จันทร์ศรีทอง )</p><p>วันที่ ........../........../..........</p></div></div>
    </section>}

    <style jsx global>{`
      *{box-sizing:border-box}.fs-page{min-height:100vh;background:#f5f7fb;color:#172033;font-family:Arial,"Noto Sans Thai",sans-serif;padding:14px}.fs-wrap{max-width:980px;margin:auto}.fs-back{display:inline-flex;align-items:center;gap:7px;text-decoration:none;color:#475569;font-weight:800;margin-bottom:10px}.fs-hero,.fs-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:16px;box-shadow:0 6px 20px #0f172a0d}.fs-hero{display:flex;gap:12px;align-items:center;margin-bottom:12px}.fs-icon{width:46px;height:46px;border-radius:14px;background:#fff1f2;color:#e11d48;display:grid;place-items:center;flex:0 0 auto}.fs-hero h1{margin:0;font-size:24px}.fs-hero p{margin:4px 0 0;color:#64748b;font-size:14px}.fs-card{margin-bottom:12px}.calendar-card{padding:0;overflow:hidden}.calendar-head{display:grid;grid-template-columns:42px 1fr 42px;gap:6px;align-items:center;padding:12px 10px;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#f8fbff,#fff)}.calendar-head>button{width:38px;height:38px;border:1px solid #dbe3ef;border-radius:11px;background:white;display:grid;place-items:center;cursor:pointer;color:#334155}.calendar-head>div{text-align:center;display:grid;grid-template-columns:auto auto;justify-content:center;align-items:center;gap:4px 7px}.calendar-head strong{font-size:19px}.calendar-head small{grid-column:1/-1;color:#64748b;font-size:12px}.day-list{display:grid}.day-row{display:grid;grid-template-columns:68px minmax(0,1fr);min-height:60px;border-bottom:1px solid #edf1f6}.day-row:last-child{border-bottom:0}.day-row.has-items{background:#fffdf7}.day-number{border:0;border-right:1px solid #edf1f6;background:#f8fafc;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#334155;padding:6px}.day-number b{font-size:22px;line-height:1}.day-number span{font-size:11px;color:#94a3b8;margin-top:3px}.day-content{min-width:0;padding:7px 8px;display:grid;gap:5px;align-content:center}.empty-day{width:100%;min-height:44px;border:0;background:transparent;text-align:left;color:#94a3b8;padding:6px 4px;cursor:pointer;font:inherit;display:flex;align-items:center;justify-content:space-between;gap:8px}.empty-day span{color:#2563eb;font-weight:800;white-space:nowrap}.day-request{width:100%;border:1px solid #e5e7eb;border-radius:10px;background:white;padding:8px 9px;display:flex;justify-content:space-between;align-items:center;gap:8px;text-align:left;cursor:pointer;min-width:0}.day-request div{display:grid;gap:2px;min-width:0}.day-request strong{font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.day-request small{color:#64748b;font-size:12px}.day-request em{font-style:normal;font-size:10px;font-weight:900;border-radius:999px;padding:4px 7px;background:#eff6ff;color:#1d4ed8;white-space:nowrap}.add-inline{justify-self:start;border:0;background:transparent;color:#2563eb;font-weight:800;display:flex;align-items:center;gap:4px;cursor:pointer;padding:2px 0;font-size:12px}.form-card,.detail-card{scroll-margin-top:8px}.section-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.section-title h2,.fs-card h2{margin:0;display:flex;gap:8px;align-items:center;font-size:19px}.section-title>button{border:0;background:#f1f5f9;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;cursor:pointer}.fs-form{display:grid;gap:12px}.fs-form label,.drive-box{display:flex;flex-direction:column;gap:6px}.fs-form label>span,.drive-box strong{font-size:13px;font-weight:800;color:#475569}.fs-form input,.fs-form select,.fs-form textarea,.drive-box input,.stamp-fields input{border:1px solid #cbd5e1;border-radius:10px;padding:10px;font:inherit;background:#fff;min-width:0}.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pills{display:flex;gap:8px}.pills button{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:9px 14px;font-weight:800;cursor:pointer}.pills .active{background:#fff1f2;border-color:#fb7185;color:#be123c}.primary,.bottom-actions button,.drive-box button{border:0;border-radius:11px;padding:11px 14px;font-weight:800;cursor:pointer}.primary{display:flex;justify-content:center;align-items:center;gap:7px;background:#e11d48;color:#fff}.active-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:12px 0 16px;padding:12px;border-radius:13px;background:#f8fafc}.active-head div{display:grid;gap:3px}.active-head small,.active-head span{color:#64748b}.status{background:#eff6ff;color:#1d4ed8!important;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:900}.detail-card h3{display:flex;align-items:center;gap:7px;font-size:16px;margin:0 0 10px}.attach-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.upload{border:2px dashed #cbd5e1;border-radius:13px;min-height:112px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;background:#f8fafc;color:#475569;text-align:center;padding:12px}.upload input{display:none}.drive-box{border:1px solid #e2e8f0;border-radius:13px;padding:11px}.drive-box button{background:#334155;color:#fff}.drive-box a{font-size:13px;color:#2563eb;font-weight:800}.player{margin-top:12px;background:#0f172a;border-radius:14px;overflow:hidden;padding-bottom:11px}.player video{width:100%;max-height:560px;background:#000;display:block}.timebar{padding:8px 12px 4px;color:#fff;display:flex;gap:5px;align-items:baseline}.timebar b{font-size:21px}.timebar span{color:#94a3b8}.range{width:calc(100% - 24px);margin:0 12px 9px}.controls{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;padding:0 12px}.controls button{border:0;border-radius:10px;padding:10px 8px;background:#334155;color:#fff;font-weight:800;cursor:pointer;min-height:44px}.controls .play{background:#2563eb;display:flex;gap:6px;align-items:center;justify-content:center}.controls .capture{grid-column:1/-1;background:#15803d;display:flex;gap:6px;align-items:center;justify-content:center}.controls .capture:disabled{opacity:.65}.captures{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.captures figure{margin:0;position:relative;border:1px solid #e2e8f0;border-radius:11px;overflow:hidden;background:#fff}.captures img{width:100%;display:block}.captures figcaption{padding:9px}.captures figcaption>strong{display:block;margin-bottom:7px}.captures figcaption>small{display:block;margin-top:7px;color:#166534;font-weight:800}.stamp-fields{display:grid;grid-template-columns:1fr 1fr;gap:7px}.stamp-fields label{display:grid;gap:4px}.stamp-fields span{font-size:11px;color:#64748b;font-weight:800}.stamp-fields input{padding:8px;font-size:13px}.captures figure>button{position:absolute;top:7px;right:7px;width:30px;height:30px;border:0;border-radius:50%;background:#000b;color:#fff;display:grid;place-items:center}.bottom-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.bottom-actions button{background:#e2e8f0;color:#334155}.bottom-actions .print{background:#166534;color:#fff;display:flex;gap:7px;align-items:center}.message{margin-top:10px;padding:10px 11px;border-radius:10px;background:#ecfdf5;color:#15803d;font-weight:800;display:flex;gap:7px;align-items:flex-start}.empty{padding:20px;text-align:center;border:1px dashed #cbd5e1;border-radius:11px;color:#94a3b8}.print-report{display:none}.report-title{display:flex;gap:12px;align-items:center;border-bottom:2px solid #222;padding-bottom:10px}.report-title h1{margin:0;font-size:21px}.report-title p{margin:3px 0 0}.print-report table{width:100%;border-collapse:collapse;margin-top:14px}.print-report th,.print-report td{border:1px solid #555;padding:7px;text-align:left}.print-report th{width:170px}.report-images{display:block;margin-top:12px;break-inside:avoid}.report-images figure{margin:0}.report-images img{display:block;width:100%;height:112mm;object-fit:contain;border:1px solid #555;background:#fff}.report-images figcaption{text-align:center;font-size:16px;line-height:1.4;margin-top:6px;font-weight:800}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px;break-inside:avoid}.sign p{text-align:center;margin:4px 0;font-size:11px;line-height:1.35}.sign-line{white-space:nowrap}.sign-role{font-weight:800;min-height:15px}
      @media(max-width:720px){.fs-page{padding:7px}.fs-wrap{width:100%}.fs-back{margin:5px 5px 9px}.fs-hero,.fs-card{border-radius:12px}.fs-hero{padding:12px;margin-bottom:8px}.fs-icon{width:40px;height:40px;border-radius:11px}.fs-hero h1{font-size:19px;line-height:1.25}.fs-hero p{font-size:12px;line-height:1.45}.calendar-head{padding:9px 6px;grid-template-columns:38px 1fr 38px}.calendar-head>button{width:36px;height:36px}.calendar-head strong{font-size:17px}.calendar-head small{font-size:11px}.day-row{grid-template-columns:54px minmax(0,1fr);min-height:54px}.day-number{padding:4px}.day-number b{font-size:20px}.day-number span{font-size:10px}.day-content{padding:5px 6px}.empty-day{min-height:42px;padding:4px 2px;font-size:12px}.empty-day span{font-size:12px}.day-request{padding:7px}.day-request strong{font-size:13px}.day-request small{font-size:11px}.day-request em{font-size:9px;padding:4px 6px}.fs-card{padding:12px;margin-bottom:8px}.section-title h2,.fs-card h2{font-size:17px}.two,.attach-grid,.captures,.stamp-fields{grid-template-columns:1fr}.active-head{align-items:flex-start;flex-direction:column}.controls{grid-template-columns:1fr 1.2fr 1fr;padding:0 8px}.controls button{padding:10px 5px;font-size:13px}.bottom-actions{display:grid;grid-template-columns:1fr 1fr}.bottom-actions button{justify-content:center}.sign{grid-template-columns:1fr;gap:20px}.sign p:first-child{white-space:normal}}
      @media print{body{background:#fff!important}.no-print{display:none!important}.fs-page{padding:0;background:#fff}.print-report{display:block;color:#111;font-size:13px}.report-title{padding-bottom:6px}.report-title h1{font-size:18px}.print-report table{margin-top:8px}.print-report th,.print-report td{padding:4px 6px}.report-images,.sign{break-inside:avoid}@page{size:A4;margin:10mm}}
    `}</style>
  </main>;
}
