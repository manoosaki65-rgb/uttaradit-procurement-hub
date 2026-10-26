"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Camera, FileText, Pause, Play, Printer, RotateCcw, Upload, X } from "lucide-react";

type Capture = {
  id: string;
  image: string;
  videoSeconds: number;
  videoTime: string;
};

type FormState = {
  fullName: string;
  date: string;
  time: string;
  scanType: "เข้า" | "ออก";
  note: string;
};

const initialForm: FormState = {
  fullName: "",
  date: "",
  time: "",
  scanType: "ออก",
  note: "",
};

function formatVideoTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "00:00:00";
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function ForgotScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [status, setStatus] = useState("รอกรอกข้อมูลและแนบคลิปตรวจสอบ");

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const progress = useMemo(() => duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0, [currentTime, duration]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const chooseVideo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setStatus("ไฟล์ที่เลือกไม่ใช่วิดีโอ");
      return;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoName(file.name);
    setCaptures([]);
    setCurrentTime(0);
    setDuration(0);
    setStatus("แนบคลิปแล้ว — กรอไปยังจังหวะที่พบตัวเอง แล้วกดจับภาพเฟรม");
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  };

  const seekBy = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setStatus("ยังจับภาพไม่ได้ กรุณาเปิดคลิปให้แสดงภาพก่อน");
      return;
    }
    if (captures.length >= 2) {
      setStatus("เก็บภาพได้สูงสุด 2 รูปต่อรายการ");
      return;
    }
    video.pause();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg", 0.92);
    const seconds = video.currentTime;
    setCaptures((prev) => [...prev, {
      id: crypto.randomUUID(),
      image,
      videoSeconds: seconds,
      videoTime: formatVideoTime(seconds),
    }]);
    setStatus(`จับภาพเวลาในคลิป ${formatVideoTime(seconds)} แล้ว`);
  };

  const removeCapture = (id: string) => {
    setCaptures((prev) => prev.filter((item) => item.id !== id));
  };

  const resetAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl("");
    setVideoName("");
    setCurrentTime(0);
    setDuration(0);
    setCaptures([]);
    setIsPlaying(false);
    setStatus("รอกรอกข้อมูลและแนบคลิปตรวจสอบ");
    setForm(initialForm);
  };

  const printReport = () => {
    if (!form.fullName || !form.date || !form.time) {
      setStatus("กรุณากรอกชื่อ วันที่ และเวลาที่ลืมสแกนให้ครบก่อนพิมพ์");
      return;
    }
    if (captures.length === 0) {
      setStatus("กรุณาจับภาพหลักฐานอย่างน้อย 1 รูปก่อนพิมพ์");
      return;
    }
    setStatus("พร้อมพิมพ์รายงาน — ในหน้าต่างพิมพ์สามารถเลือก Save as PDF ได้");
    window.setTimeout(() => window.print(), 80);
  };

  return (
    <main className="fs-page">
      <header className="fs-top no-print">
        <a href="/" className="fs-back"><ArrowLeft size={18} /> กลับหน้าหลัก</a>
        <div>
          <h1>แจ้งลืมสแกนเวลาเข้า–ออก</h1>
          <p>ตรวจสอบภาพจากกล้องวงจรปิดและจัดทำหลักฐาน</p>
        </div>
      </header>

      <section className="fs-form-card no-print">
        <div className="fs-section-title"><span>1</span><div><h2>ข้อมูลเจ้าหน้าที่</h2><p>กรอกข้อมูลตามวันที่และเวลาที่ลืมสแกน</p></div></div>
        <div className="fs-grid">
          <label className="fs-field fs-span-2"><span>ชื่อ–สกุล</span><input value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} placeholder="ชื่อเจ้าหน้าที่" /></label>
          <label className="fs-field"><span>วันที่ลืมสแกน</span><input type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} /></label>
          <label className="fs-field"><span>เวลาที่ลืมสแกน</span><input type="time" value={form.time} onChange={(e) => updateForm("time", e.target.value)} /></label>
          <label className="fs-field"><span>ประเภท</span><select value={form.scanType} onChange={(e) => updateForm("scanType", e.target.value as "เข้า" | "ออก")}><option value="เข้า">ลืมสแกนเข้า</option><option value="ออก">ลืมสแกนออก</option></select></label>
          <label className="fs-field fs-span-2"><span>หมายเหตุ</span><input value={form.note} onChange={(e) => updateForm("note", e.target.value)} placeholder="ถ้ามี" /></label>
        </div>
      </section>

      <section className="fs-form-card no-print">
        <div className="fs-section-title"><span>2</span><div><h2>แนบวิดีโอกล้องวงจรปิด</h2><p>คุณตุลอัปโหลดคลิปช่วงเวลาที่เกี่ยวข้อง แล้วเจ้าหน้าที่เปิดดูเพื่อหาตัวเอง</p></div></div>
        <label className="fs-upload">
          <Upload size={26} />
          <strong>{videoName || "เลือกไฟล์วิดีโอ"}</strong>
          <small>รองรับไฟล์วิดีโอที่เบราว์เซอร์เปิดได้ เช่น MP4</small>
          <input type="file" accept="video/*" onChange={(e) => chooseVideo(e.target.files?.[0])} />
        </label>

        {videoUrl && (
          <div className="fs-player">
            <video ref={videoRef} src={videoUrl} playsInline onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
            <div className="fs-clock"><b>{formatVideoTime(currentTime)}</b><span>/ {formatVideoTime(duration)}</span></div>
            <div className="fs-progress"><i style={{ width: `${progress}%` }} /></div>
            <div className="fs-controls">
              <button type="button" onClick={() => seekBy(-10)}>−10 วิ</button>
              <button type="button" className="main" onClick={togglePlay}>{isPlaying ? <Pause size={18} /> : <Play size={18} />}{isPlaying ? "พัก" : "เล่น"}</button>
              <button type="button" onClick={() => seekBy(10)}>+10 วิ</button>
              <button type="button" className="capture" onClick={captureFrame}><Camera size={18} /> จับภาพเฟรมนี้</button>
            </div>
          </div>
        )}
      </section>

      <section className="fs-form-card no-print">
        <div className="fs-section-title"><span>3</span><div><h2>ภาพหลักฐาน</h2><p>เลือกได้ 1–2 รูป โดยระบบบันทึกเวลาในคลิปของแต่ละภาพ</p></div></div>
        {captures.length === 0 ? <div className="fs-empty">ยังไม่มีภาพที่จับจากวิดีโอ</div> : (
          <div className="fs-captures">
            {captures.map((capture, index) => (
              <figure key={capture.id}>
                <img src={capture.image} alt={`ภาพหลักฐาน ${index + 1}`} />
                <figcaption><b>ภาพที่ {index + 1}</b><span>เวลาในคลิป {capture.videoTime}</span></figcaption>
                <button type="button" onClick={() => removeCapture(capture.id)} aria-label={`ลบภาพที่ ${index + 1}`}><X size={16} /></button>
              </figure>
            ))}
          </div>
        )}
        <div className="fs-actions">
          <button type="button" className="secondary" onClick={resetAll}><RotateCcw size={18} /> ล้างข้อมูล</button>
          <button type="button" className="primary" onClick={printReport}><Printer size={18} /> พิมพ์ / บันทึก PDF</button>
        </div>
        <p className="fs-status">{status}</p>
      </section>

      <section className="print-report">
        <div className="report-head">
          <FileText size={30} />
          <div><h1>แบบรายงานกรณีลืมสแกนเวลาเข้า–ออก</h1><p>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์</p></div>
        </div>
        <table>
          <tbody>
            <tr><th>ชื่อ–สกุล</th><td>{form.fullName || "-"}</td></tr>
            <tr><th>วันที่ลืมสแกน</th><td>{form.date || "-"}</td></tr>
            <tr><th>เวลาที่ลืมสแกน</th><td>{form.time || "-"}</td></tr>
            <tr><th>ประเภท</th><td>ลืมสแกน{form.scanType}</td></tr>
            <tr><th>หมายเหตุ</th><td>{form.note || "-"}</td></tr>
            <tr><th>ไฟล์กล้องที่ตรวจ</th><td>{videoName || "-"}</td></tr>
          </tbody>
        </table>
        <div className={`report-images count-${captures.length}`}>
          {captures.map((capture, index) => (
            <figure key={capture.id}><img src={capture.image} alt={`หลักฐาน ${index + 1}`} /><figcaption>ภาพที่ {index + 1} — เวลาในคลิป {capture.videoTime}</figcaption></figure>
          ))}
        </div>
        <div className="signatures">
          <div><p>ลงชื่อ ............................................................ ผู้แจ้ง</p><p>( {form.fullName || "............................................................"} )</p><p>วันที่ ........../........../..........</p></div>
          <div><p>ลงชื่อ ............................................................ ผู้ตรวจสอบ</p><p>( ............................................................ )</p><p>วันที่ ........../........../..........</p></div>
          <div><p>ลงชื่อ ............................................................ หัวหน้ากลุ่มงานพัสดุ</p><p>( ............................................................ )</p><p>วันที่ ........../........../..........</p></div>
        </div>
      </section>

      <style>{`
        *{box-sizing:border-box}.fs-page{min-height:100vh;background:#f4f7fb;color:#172033;font-family:Arial,"Noto Sans Thai",sans-serif;padding:24px}.fs-top,.fs-form-card{max-width:1050px;margin:0 auto}.fs-top{display:flex;gap:22px;align-items:center;margin-bottom:18px}.fs-top h1{margin:0;font-size:28px}.fs-top p{margin:5px 0 0;color:#67738a}.fs-back{display:flex;align-items:center;gap:7px;text-decoration:none;color:#2453a6;font-weight:700;background:white;border:1px solid #dae2ee;border-radius:12px;padding:10px 14px}.fs-form-card{background:white;border:1px solid #e1e7f0;border-radius:18px;padding:22px;margin-bottom:16px;box-shadow:0 5px 18px rgba(30,60,100,.05)}.fs-section-title{display:flex;gap:12px;align-items:flex-start;margin-bottom:18px}.fs-section-title>span{width:34px;height:34px;border-radius:50%;background:#2453a6;color:white;display:grid;place-items:center;font-weight:800}.fs-section-title h2{font-size:19px;margin:0}.fs-section-title p{margin:3px 0 0;color:#6a7487;font-size:14px}.fs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.fs-span-2{grid-column:span 2}.fs-field{display:flex;flex-direction:column;gap:7px}.fs-field span{font-size:13px;font-weight:700;color:#43506a}.fs-field input,.fs-field select{width:100%;border:1px solid #ccd5e2;border-radius:10px;padding:11px 12px;background:#fff;font:inherit}.fs-upload{min-height:130px;border:2px dashed #b9c7dc;border-radius:15px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:#49617f;cursor:pointer;background:#f9fbfe}.fs-upload input{display:none}.fs-upload strong{color:#1f3d67}.fs-upload small{color:#8290a4}.fs-player{margin-top:18px;background:#121722;border-radius:16px;overflow:hidden;padding-bottom:14px}.fs-player video{width:100%;max-height:600px;display:block;background:#000}.fs-clock{display:flex;align-items:baseline;gap:6px;color:white;padding:10px 16px 6px}.fs-clock b{font-size:22px;font-variant-numeric:tabular-nums}.fs-clock span{color:#9eabc0}.fs-progress{height:5px;background:#354052;margin:0 16px 12px;border-radius:10px;overflow:hidden}.fs-progress i{display:block;height:100%;background:#5da2ff}.fs-controls{display:flex;flex-wrap:wrap;gap:8px;padding:0 16px}.fs-controls button,.fs-actions button{border:0;border-radius:10px;padding:10px 14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}.fs-controls button{background:#2a3445;color:white}.fs-controls .main{background:#2453a6}.fs-controls .capture{margin-left:auto;background:#127a55}.fs-empty{padding:26px;text-align:center;background:#f7f9fc;border-radius:12px;color:#7b8798}.fs-captures{display:grid;grid-template-columns:1fr 1fr;gap:14px}.fs-captures figure{margin:0;position:relative;border:1px solid #dce4ee;border-radius:14px;overflow:hidden}.fs-captures img{width:100%;display:block}.fs-captures figcaption{display:flex;justify-content:space-between;gap:10px;padding:9px 11px;font-size:13px}.fs-captures figure>button{position:absolute;top:8px;right:8px;width:32px;height:32px;border:0;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.7);color:white;cursor:pointer}.fs-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.fs-actions .secondary{background:#eef2f7;color:#40506a}.fs-actions .primary{background:#1b6d50;color:white}.fs-status{margin:12px 0 0;text-align:right;color:#637089;font-size:13px}.print-report{display:none}.report-head{display:flex;gap:12px;align-items:center;border-bottom:2px solid #222;padding-bottom:12px}.report-head h1{font-size:22px;margin:0}.report-head p{margin:4px 0 0}.print-report table{width:100%;border-collapse:collapse;margin-top:18px}.print-report th,.print-report td{border:1px solid #555;padding:8px;text-align:left}.print-report th{width:180px}.report-images{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}.report-images.count-1{grid-template-columns:1fr}.report-images figure{margin:0}.report-images img{width:100%;max-height:350px;object-fit:contain;border:1px solid #777}.report-images figcaption{text-align:center;font-size:12px;margin-top:5px}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:32px 40px;margin-top:40px}.signatures>div:last-child{grid-column:1/-1;width:52%;justify-self:end}.signatures p{text-align:center;margin:9px 0}.signatures p:nth-child(2),.signatures p:nth-child(3){font-size:13px}@media(max-width:720px){.fs-page{padding:14px}.fs-top{align-items:flex-start;flex-direction:column}.fs-top h1{font-size:23px}.fs-grid{grid-template-columns:1fr}.fs-span-2{grid-column:auto}.fs-captures{grid-template-columns:1fr}.fs-controls .capture{margin-left:0;width:100%}.fs-actions{flex-direction:column}.fs-actions button{width:100%}}@media print{body{background:white!important}.no-print{display:none!important}.fs-page{padding:0;background:white}.print-report{display:block;color:#111;font-size:14px}.report-images{break-inside:avoid}.signatures{break-inside:avoid}@page{size:A4;margin:13mm}}
      `}</style>
    </main>
  );
}
