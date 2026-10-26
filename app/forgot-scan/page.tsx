"use client";

import { ArrowLeft, Camera, CheckCircle2, Clock3, FileVideo2, Plus, Save, Trash2, Upload, UserRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type Evidence = {
  id: string;
  employeeName: string;
  eventDate: string;
  eventTime: string;
  note: string;
  imageDataUrl: string;
  createdAt: string;
};

type ReviewRound = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  videoUrl: string;
  videoName: string;
  createdAt: string;
  evidences: Evidence[];
};

const STORAGE_KEY = "uttaradit-forgot-scan-cctv-v1";

export default function ForgotScanPage() {
  const [rounds, setRounds] = useState<ReviewRound[]>([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("16:30");
  const [endTime, setEndTime] = useState("17:30");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState("");
  const [localVideoName, setLocalVideoName] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [note, setNote] = useState("");
  const [capture, setCapture] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setRounds(JSON.parse(saved));
    } catch {
      setRounds([]);
    }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds)); } catch {}
  }, [rounds]);

  useEffect(() => () => { if (localVideoUrl) URL.revokeObjectURL(localVideoUrl); }, [localVideoUrl]);

  const activeRound = rounds.find((r) => r.id === activeId) || null;

  function createRound(e: FormEvent) {
    e.preventDefault();
    if (!date || !startTime || !endTime) return;
    const row: ReviewRound = {
      id: crypto.randomUUID(), date, startTime, endTime,
      title: title.trim() || `ตรวจกล้อง ${formatThaiDate(date)} ${startTime}–${endTime}`,
      videoUrl: videoUrl.trim(), videoName: localVideoName,
      createdAt: new Date().toISOString(), evidences: [],
    };
    setRounds((prev) => [row, ...prev]);
    setActiveId(row.id);
    setEventDate(date);
    setTitle(""); setVideoUrl("");
  }

  function chooseLocalVideo(file?: File) {
    if (!file) return;
    if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
    setLocalVideoUrl(URL.createObjectURL(file));
    setLocalVideoName(file.name);
  }

  function openRound(round: ReviewRound) {
    setActiveId(round.id);
    setEventDate(round.date);
    setCapture("");
    setEmployeeName("");
    setEventTime("");
    setNote("");
    setLocalVideoUrl("");
    setLocalVideoName(round.videoName || "");
  }

  function captureFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;
    const maxWidth = 960;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      setCapture(canvas.toDataURL("image/jpeg", 0.72));
      const seconds = Math.floor(video.currentTime || 0);
      if (!eventTime && activeRound) setEventTime(addSeconds(activeRound.startTime, seconds));
    } catch {
      alert("วิดีโอนี้ไม่อนุญาตให้จับภาพจากเบราว์เซอร์ กรุณาใช้ไฟล์วิดีโอที่แนบจากเครื่อง หรืออัปโหลดภาพที่แคปไว้แทน");
    }
  }

  function chooseScreenshot(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCapture(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function saveEvidence(e: FormEvent) {
    e.preventDefault();
    if (!activeRound || !employeeName.trim() || !eventDate || !eventTime || !capture) return;
    const evidence: Evidence = { id: crypto.randomUUID(), employeeName: employeeName.trim(), eventDate, eventTime, note: note.trim(), imageDataUrl: capture, createdAt: new Date().toISOString() };
    setRounds((prev) => prev.map((r) => r.id === activeRound.id ? { ...r, evidences: [...r.evidences, evidence] } : r));
    setEmployeeName(""); setEventTime(""); setNote(""); setCapture("");
  }

  function deleteRound(id: string) {
    if (!confirm("ลบรอบตรวจกล้องนี้ใช่หรือไม่")) return;
    setRounds((prev) => prev.filter((r) => r.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function deleteEvidence(roundId: string, evidenceId: string) {
    setRounds((prev) => prev.map((r) => r.id === roundId ? { ...r, evidences: r.evidences.filter((e) => e.id !== evidenceId) } : r));
  }

  const playbackSrc = localVideoUrl || activeRound?.videoUrl || "";

  return <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", padding: 20 }}>
    <div style={{ maxWidth: 1180, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", fontWeight: 800, color: "#475569", marginBottom: 16 }}><ArrowLeft size={20} /> กลับหน้าหลัก</Link>

      <section style={card}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}><span style={heroIcon}><Camera size={28} /></span><div><h1 style={{ margin: 0, fontSize: 28 }}>ตรวจกล้องกรณีลืมสแกนเวลาเข้า–ออก</h1><p style={{ margin: "5px 0 0", color: "#64748b" }}>หัวหน้าสร้างรอบตรวจและแนบวิดีโอ จากนั้นเจ้าหน้าที่ค้นหาช่วงเวลาของตนเอง แคปภาพ และบันทึกชื่อ–วันที่–เวลาเป็นหลักฐาน</p></div></div>
        <div style={warning}>เวอร์ชันทดลอง: ข้อมูลและไฟล์ที่แนบจากเครื่องยังเก็บเฉพาะเบราว์เซอร์เครื่องนี้ จนกว่าจะเชื่อมพื้นที่จัดเก็บกลางของระบบสำเร็จ</div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, .85fr) minmax(0, 1.55fr)", gap: 18, marginTop: 18 }} className="two-col">
        <div>
          <section style={card}>
            <h2 style={heading}><Plus size={20} /> สร้างรอบตรวจกล้อง</h2>
            <form onSubmit={createRound} style={{ display: "grid", gap: 12 }}>
              <label style={field}><span style={label}>วันที่ *</span><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} style={input} /></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}><label style={field}><span style={label}>ตั้งแต่ *</span><input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} style={input} /></label><label style={field}><span style={label}>ถึง *</span><input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} style={input} /></label></div>
              <label style={field}><span style={label}>หัวข้อ</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น ตรวจเวลาออกเวร" style={input} /></label>
              <label style={field}><span style={label}>ลิงก์วิดีโอ (ถ้ามี)</span><input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://.../video.mp4" style={input} /></label>
              <label style={{ ...field, border: "1px dashed #94a3b8", borderRadius: 12, padding: 12, cursor: "pointer", background: "#f8fafc" }}><span style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800 }}><Upload size={18} /> แนบวิดีโอจากเครื่อง</span><small style={{ color: "#64748b" }}>{localVideoName || "เลือกไฟล์ MP4 / MOV เพื่อทดลองเปิดและจับภาพ"}</small><input type="file" accept="video/*" onChange={(e) => chooseLocalVideo(e.target.files?.[0])} style={{ display: "none" }} /></label>
              <button style={primaryButton} type="submit"><Save size={18} /> สร้างรอบตรวจ</button>
            </form>
          </section>

          <section style={{ ...card, marginTop: 18 }}>
            <h2 style={heading}><Clock3 size={20} /> รอบตรวจทั้งหมด</h2>
            {rounds.length === 0 ? <p style={empty}>ยังไม่มีรอบตรวจกล้อง</p> : <div style={{ display: "grid", gap: 10 }}>{rounds.map((r) => <div key={r.id} style={{ border: activeId === r.id ? "2px solid #2563eb" : "1px solid #e2e8f0", borderRadius: 14, padding: 12, background: "white" }}><button onClick={() => openRound(r)} style={{ display: "block", width: "100%", textAlign: "left", border: 0, background: "transparent", cursor: "pointer", padding: 0 }}><strong style={{ display: "block", fontSize: 15 }}>{r.title}</strong><span style={{ color: "#64748b", fontSize: 13 }}>{formatThaiDate(r.date)} • {r.startTime}–{r.endTime} น.</span><span style={{ display: "block", marginTop: 7, fontSize: 12, fontWeight: 800, color: r.evidences.length ? "#15803d" : "#b45309" }}>{r.evidences.length ? `ส่งหลักฐานแล้ว ${r.evidences.length} รายการ` : "ยังไม่มีผู้ส่งหลักฐาน"}</span></button><button onClick={() => deleteRound(r.id)} style={deleteBtn}><Trash2 size={15} /> ลบ</button></div>)}</div>}
          </section>
        </div>

        <div>
          {!activeRound ? <section style={card}><div style={empty}>เลือกรอบตรวจกล้องด้านซ้าย หรือสร้างรอบใหม่ก่อนค่ะ</div></section> : <>
            <section style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "start" }}><div><h2 style={{ margin: 0 }}>{activeRound.title}</h2><p style={{ margin: "5px 0 0", color: "#64748b" }}>{formatThaiDate(activeRound.date)} • {activeRound.startTime}–{activeRound.endTime} น.</p></div><span style={{ padding: "6px 10px", borderRadius: 999, background: "#eff6ff", color: "#1d4ed8", fontWeight: 800, fontSize: 12 }}>{activeRound.evidences.length} หลักฐาน</span></div>

              <div style={{ marginTop: 16, background: "#020617", borderRadius: 14, overflow: "hidden", minHeight: 280, display: "grid", placeItems: "center" }}>
                {playbackSrc ? <video ref={videoRef} src={playbackSrc} controls style={{ width: "100%", maxHeight: 560, background: "black" }} crossOrigin="anonymous" /> : <div style={{ color: "#cbd5e1", padding: 30, textAlign: "center" }}><FileVideo2 size={42} style={{ marginBottom: 8 }} /><div>รอบนี้ยังไม่มีวิดีโอที่เปิดได้บนเครื่องนี้</div></div>}
              </div>
              <canvas ref={canvasRef} style={{ display: "none" }} />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}><button type="button" onClick={captureFrame} disabled={!playbackSrc} style={{ ...primaryButton, opacity: playbackSrc ? 1 : .45 }}><Camera size={18} /> จับภาพเฟรมนี้</button><label style={secondaryButton}><Upload size={17} /> อัปโหลดภาพที่แคปไว้<input type="file" accept="image/*" onChange={(e) => chooseScreenshot(e.target.files?.[0])} style={{ display: "none" }} /></label></div>

              <form onSubmit={saveEvidence} style={{ marginTop: 18, display: "grid", gap: 12 }}>
                <h3 style={{ margin: 0, display: "flex", gap: 8, alignItems: "center" }}><UserRound size={19} /> เจ้าหน้าที่บันทึกหลักฐานของตนเอง</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 10 }} className="evidence-grid"><label style={field}><span style={label}>ชื่อ–สกุล *</span><input required value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="ชื่อเจ้าหน้าที่" style={input} /></label><label style={field}><span style={label}>วันที่ *</span><input type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={input} /></label><label style={field}><span style={label}>เวลาที่พบ *</span><input type="time" step="1" required value={eventTime} onChange={(e) => setEventTime(e.target.value)} style={input} /></label></div>
                <label style={field}><span style={label}>หมายเหตุ</span><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="เช่น เดินออกประตูหน้าอาคารพัสดุ" style={input} /></label>
                {capture ? <div style={{ border: "1px solid #cbd5e1", borderRadius: 12, padding: 10, background: "#f8fafc" }}><div style={{ fontWeight: 800, marginBottom: 7 }}>ภาพหลักฐานที่จะบันทึก</div><img src={capture} alt="ภาพหลักฐานจากกล้องวงจรปิด" style={{ display: "block", maxWidth: "100%", maxHeight: 320, borderRadius: 8 }} /></div> : <div style={{ ...empty, padding: 16 }}>ยังไม่ได้จับภาพจากวิดีโอหรืออัปโหลดภาพหลักฐาน</div>}
                <button type="submit" disabled={!capture} style={{ ...primaryButton, opacity: capture ? 1 : .45 }}><CheckCircle2 size={18} /> ส่งหลักฐาน</button>
              </form>
            </section>

            <section style={{ ...card, marginTop: 18 }}><h2 style={heading}>หลักฐานที่ส่งแล้ว</h2>{activeRound.evidences.length === 0 ? <p style={empty}>ยังไม่มีเจ้าหน้าที่ส่งหลักฐานในรอบนี้</p> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>{activeRound.evidences.map((ev) => <article key={ev.id} style={{ border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", background: "white" }}><img src={ev.imageDataUrl} alt={`หลักฐาน ${ev.employeeName}`} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", background: "#e2e8f0" }} /><div style={{ padding: 12 }}><strong>{ev.employeeName}</strong><div style={{ color: "#475569", fontSize: 13 }}>{formatThaiDate(ev.eventDate)} • {ev.eventTime} น.</div>{ev.note && <div style={{ marginTop: 5, color: "#64748b", fontSize: 12 }}>{ev.note}</div>}<button onClick={() => deleteEvidence(activeRound.id, ev.id)} style={{ ...deleteBtn, marginTop: 8 }}><Trash2 size={14} /> ลบหลักฐาน</button></div></article>)}</div>}</section>
          </>}
        </div>
      </div>
    </div>
    <style jsx global>{`@media(max-width:850px){.two-col{grid-template-columns:1fr!important}.evidence-grid{grid-template-columns:1fr!important}}`}</style>
  </main>;
}

function formatThaiDate(value: string) { if (!value) return "—"; const [y,m,d]=value.split("-").map(Number); return new Intl.DateTimeFormat("th-TH",{day:"numeric",month:"short",year:"numeric"}).format(new Date(y,m-1,d)); }
function addSeconds(start: string, seconds: number) { const [h,m]=start.split(":").map(Number); const total=h*3600+m*60+seconds; const hh=Math.floor(total/3600)%24, mm=Math.floor((total%3600)/60), ss=total%60; return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`; }

const card={background:"white",border:"1px solid #e2e8f0",borderRadius:18,padding:20,boxShadow:"0 8px 25px rgba(15,23,42,.06)"};
const heroIcon={width:50,height:50,borderRadius:15,display:"grid",placeItems:"center",background:"#eff6ff",color:"#2563eb",flex:"0 0 auto"};
const warning={marginTop:16,padding:"10px 12px",borderRadius:12,background:"#fff7ed",color:"#9a3412",fontSize:13,fontWeight:700};
const heading={margin:"0 0 14px",display:"flex",alignItems:"center",gap:8,fontSize:19};
const field={display:"flex",flexDirection:"column" as const,gap:6};
const label={fontSize:13,fontWeight:800,color:"#334155"};
const input={width:"100%",boxSizing:"border-box" as const,border:"1px solid #cbd5e1",borderRadius:10,padding:"10px 11px",font:"inherit",background:"white",color:"#0f172a"};
const primaryButton={border:0,borderRadius:11,padding:"10px 14px",background:"#2563eb",color:"white",fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer"};
const secondaryButton={border:"1px solid #cbd5e1",borderRadius:11,padding:"9px 13px",background:"white",color:"#334155",fontWeight:800,display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer"};
const deleteBtn={border:0,background:"transparent",color:"#be123c",display:"inline-flex",alignItems:"center",gap:5,fontWeight:800,fontSize:12,cursor:"pointer",padding:"7px 0 0"};
const empty={color:"#94a3b8",textAlign:"center" as const,padding:"28px 12px",border:"1px dashed #cbd5e1",borderRadius:12};
