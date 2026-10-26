"use client";

import { ArrowLeft, CheckCircle2, Clock3, Eye, Save, UserRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type RequestItem = {
  id: string;
  employeeName: string;
  workDate: string;
  workTime: string;
  scanKind: "เข้า" | "ออก";
  note: string;
  status: "รอตรวจสอบ" | "กำลังตรวจสอบ" | "ตรวจสอบแล้ว";
  createdAt: string;
};

const STORAGE_KEY = "uttaradit-forgot-scan-requests-v2";

export default function ForgotScanPage() {
  const [employeeName, setEmployeeName] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [scanKind, setScanKind] = useState<"เข้า" | "ออก">("ออก");
  const [note, setNote] = useState("");
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setRequests(JSON.parse(saved));
    } catch {
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)); } catch {}
  }, [requests]);

  const pendingCount = useMemo(() => requests.filter((r) => r.status !== "ตรวจสอบแล้ว").length, [requests]);

  function submitRequest(e: FormEvent) {
    e.preventDefault();
    if (!employeeName.trim() || !workDate || !workTime) return;
    const item: RequestItem = {
      id: crypto.randomUUID(),
      employeeName: employeeName.trim(),
      workDate,
      workTime,
      scanKind,
      note: note.trim(),
      status: "รอตรวจสอบ",
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [item, ...prev]);
    setEmployeeName("");
    setWorkDate("");
    setWorkTime("");
    setScanKind("ออก");
    setNote("");
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 3500);
  }

  function markReviewing(id: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "กำลังตรวจสอบ" } : r));
  }

  function markDone(id: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "ตรวจสอบแล้ว" } : r));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", padding: 20 }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", fontWeight: 800, color: "#475569", marginBottom: 16 }}>
          <ArrowLeft size={20} /> กลับหน้าหลัก
        </Link>

        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={heroIcon}><Clock3 size={28} /></span>
            <div>
              <h1 style={{ margin: 0, fontSize: 28 }}>แจ้งลืมสแกนเวลาเข้า–ออก</h1>
              <p style={{ margin: "5px 0 0", color: "#64748b" }}>สำหรับเจ้าหน้าที่แจ้งชื่อ วันที่ และเวลาที่ต้องการให้ตรวจสอบจากกล้องวงจรปิด</p>
            </div>
          </div>
        </section>

        <section style={{ ...card, marginTop: 18 }}>
          <h2 style={heading}><UserRound size={21} /> แบบแจ้งของเจ้าหน้าที่</h2>
          <form onSubmit={submitRequest} style={{ display: "grid", gap: 14 }}>
            <label style={field}>
              <span style={label}>ชื่อ–สกุล *</span>
              <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required placeholder="กรอกชื่อเจ้าหน้าที่" style={input} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="two-fields">
              <label style={field}>
                <span style={label}>วันที่ *</span>
                <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required style={input} />
              </label>
              <label style={field}>
                <span style={label}>เวลาที่ต้องการตรวจสอบ *</span>
                <input type="time" value={workTime} onChange={(e) => setWorkTime(e.target.value)} required style={input} />
              </label>
            </div>

            <label style={field}>
              <span style={label}>ลืมสแกน</span>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(["เข้า", "ออก"] as const).map((kind) => (
                  <button key={kind} type="button" onClick={() => setScanKind(kind)} style={{ ...choiceButton, ...(scanKind === kind ? choiceButtonActive : {}) }}>
                    เวลา{kind}
                  </button>
                ))}
              </div>
            </label>

            <label style={field}>
              <span style={label}>หมายเหตุ (ถ้ามี)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="เช่น จำได้ว่าออกจากอาคารประมาณ 16:55 น." style={{ ...input, resize: "vertical" }} />
            </label>

            <button type="submit" style={primaryButton}><Save size={18} /> ส่งแจ้งตรวจสอบ</button>
          </form>

          {submitted && <div style={successBox}><CheckCircle2 size={20} /> ส่งข้อมูลแล้ว รายการอยู่ในสถานะ “รอตรวจสอบ”</div>}
        </section>

        <section style={{ ...card, marginTop: 18 }}>
          <button type="button" onClick={() => setReviewOpen((v) => !v)} style={reviewToggle}>
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}><Eye size={19} /> สำหรับผู้ตรวจสอบ</span>
            <span style={badge}>{pendingCount} รายการรอตรวจ</span>
          </button>

          {reviewOpen && (
            <div style={{ marginTop: 14 }}>
              {requests.length === 0 ? <div style={empty}>ยังไม่มีเจ้าหน้าที่ส่งรายการ</div> : (
                <div style={{ display: "grid", gap: 10 }}>
                  {requests.map((r) => (
                    <div key={r.id} style={requestRow}>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ display: "block", fontSize: 16 }}>{r.employeeName}</strong>
                        <span style={{ color: "#475569", fontSize: 14 }}>{formatThaiDate(r.workDate)} • {r.workTime} น. • ลืมสแกน{r.scanKind}</span>
                        {r.note && <div style={{ marginTop: 5, color: "#64748b", fontSize: 13 }}>{r.note}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <span style={statusStyle(r.status)}>{r.status}</span>
                        {r.status === "รอตรวจสอบ" && <button onClick={() => markReviewing(r.id)} style={secondaryButton}>เปิดตรวจ</button>}
                        {r.status === "กำลังตรวจสอบ" && <button onClick={() => markDone(r.id)} style={primarySmall}>ตรวจสอบแล้ว</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        @media (max-width: 680px) {
          .two-fields { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

function formatThaiDate(value: string) {
  if (!value) return "—";
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(y, m - 1, d));
}

function statusStyle(status: RequestItem["status"]) {
  if (status === "ตรวจสอบแล้ว") return { ...statusBase, background: "#ecfdf5", color: "#15803d" };
  if (status === "กำลังตรวจสอบ") return { ...statusBase, background: "#eff6ff", color: "#1d4ed8" };
  return { ...statusBase, background: "#fff7ed", color: "#c2410c" };
}

const card = { background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: 22, boxShadow: "0 10px 28px rgba(15,23,42,.06)" };
const heroIcon = { width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", background: "#fff1f2", color: "#e11d48", flex: "0 0 auto" };
const heading = { margin: "0 0 16px", fontSize: 20, display: "flex", alignItems: "center", gap: 8 };
const field = { display: "flex", flexDirection: "column" as const, gap: 7 };
const label = { fontSize: 14, fontWeight: 800, color: "#334155" };
const input = { width: "100%", boxSizing: "border-box" as const, border: "1px solid #cbd5e1", borderRadius: 12, padding: "11px 12px", font: "inherit", background: "white", color: "#0f172a" };
const primaryButton = { border: 0, borderRadius: 12, padding: "12px 16px", background: "#e11d48", color: "white", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 };
const primarySmall = { border: 0, borderRadius: 10, padding: "8px 10px", background: "#15803d", color: "white", fontWeight: 800, cursor: "pointer" };
const secondaryButton = { border: "1px solid #cbd5e1", borderRadius: 10, padding: "8px 10px", background: "white", color: "#334155", fontWeight: 800, cursor: "pointer" };
const choiceButton = { border: "1px solid #cbd5e1", borderRadius: 999, padding: "9px 14px", background: "white", color: "#475569", fontWeight: 800, cursor: "pointer" };
const choiceButtonActive = { background: "#fff1f2", borderColor: "#fb7185", color: "#be123c" };
const successBox = { marginTop: 14, borderRadius: 12, padding: 12, background: "#ecfdf5", color: "#15803d", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 };
const reviewToggle = { width: "100%", border: 0, background: "transparent", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer", font: "inherit", fontWeight: 900, color: "#0f172a", padding: 0 };
const badge = { borderRadius: 999, padding: "6px 10px", background: "#fff7ed", color: "#c2410c", fontSize: 12, fontWeight: 900 };
const empty = { padding: 24, textAlign: "center" as const, color: "#94a3b8", border: "1px dashed #cbd5e1", borderRadius: 14 };
const requestRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, border: "1px solid #e2e8f0", borderRadius: 14, padding: 14, flexWrap: "wrap" as const };
const statusBase = { borderRadius: 999, padding: "6px 9px", fontSize: 12, fontWeight: 900 };
