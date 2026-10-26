"use client";

import { ArrowLeft, Clock3, Printer, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ScanType = "ลืมสแกนเข้า" | "ลืมสแกนออก" | "ลืมทั้งเข้าและออก";
type RecordItem = {
  id: string;
  employeeName: string;
  workDate: string;
  scanType: ScanType;
  inTime: string;
  outTime: string;
  reason: string;
  note: string;
  status: "รอดำเนินการ";
  createdAt: string;
};

const STORAGE_KEY = "uttaradit-forgot-scan-records-v1";

export default function ForgotScanPage() {
  const [employeeName, setEmployeeName] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [scanType, setScanType] = useState<ScanType>("ลืมสแกนเข้า");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setRecords(JSON.parse(saved));
    } catch {
      setRecords([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const needsIn = scanType !== "ลืมสแกนออก";
  const needsOut = scanType !== "ลืมสแกนเข้า";

  const todayText = useMemo(
    () => new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(new Date()),
    [],
  );

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!employeeName.trim() || !workDate || !reason.trim()) return;

    const item: RecordItem = {
      id: crypto.randomUUID(),
      employeeName: employeeName.trim(),
      workDate,
      scanType,
      inTime: needsIn ? inTime : "",
      outTime: needsOut ? outTime : "",
      reason: reason.trim(),
      note: note.trim(),
      status: "รอดำเนินการ",
      createdAt: new Date().toISOString(),
    };

    setRecords((prev) => [item, ...prev]);
    setWorkDate("");
    setInTime("");
    setOutTime("");
    setReason("");
    setNote("");
  }

  function removeRecord(id: string) {
    setRecords((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", padding: "24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#475569", textDecoration: "none", fontWeight: 700 }}>
            <ArrowLeft size={20} /> กลับหน้าหลัก
          </Link>
          <button onClick={() => window.print()} style={buttonSecondary}>
            <Printer size={18} /> พิมพ์รายการ
          </button>
        </div>

        <section style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 10px 30px rgba(15,23,42,.07)", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center", background: "#fff1f2", color: "#e11d48" }}>
              <Clock3 size={27} />
            </div>
            <div>
              <h1 style={{ fontSize: 28, lineHeight: 1.2, margin: 0 }}>ลืมสแกนเวลาเข้า–ออก</h1>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>บันทึกรายการกรณีลืมสแกนเวลาเข้าปฏิบัติงานหรือเวลาออก</p>
            </div>
          </div>
          <div style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>วันที่เปิดรายการ: {todayText}</div>

          <form onSubmit={submit} className="no-print" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
            <label style={fieldStyle}>
              <span style={labelStyle}>ชื่อ–สกุล *</span>
              <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} required placeholder="กรอกชื่อเจ้าหน้าที่" style={inputStyle} />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>วันที่ปฏิบัติงาน *</span>
              <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required style={inputStyle} />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>ประเภท *</span>
              <select value={scanType} onChange={(e) => setScanType(e.target.value as ScanType)} style={inputStyle}>
                <option>ลืมสแกนเข้า</option>
                <option>ลืมสแกนออก</option>
                <option>ลืมทั้งเข้าและออก</option>
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={fieldStyle}>
                <span style={labelStyle}>เวลาเข้า</span>
                <input type="time" value={inTime} onChange={(e) => setInTime(e.target.value)} disabled={!needsIn} style={{ ...inputStyle, opacity: needsIn ? 1 : .45 }} />
              </label>
              <label style={fieldStyle}>
                <span style={labelStyle}>เวลาออก</span>
                <input type="time" value={outTime} onChange={(e) => setOutTime(e.target.value)} disabled={!needsOut} style={{ ...inputStyle, opacity: needsOut ? 1 : .45 }} />
              </label>
            </div>

            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span style={labelStyle}>เหตุผล *</span>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} placeholder="เช่น ปฏิบัติงานเร่งด่วน / ลืมสแกน / เครื่องสแกนขัดข้อง" style={{ ...inputStyle, resize: "vertical" }} />
            </label>

            <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
              <span style={labelStyle}>หมายเหตุ / หลักฐานประกอบ</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)" style={{ ...inputStyle, resize: "vertical" }} />
            </label>

            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" style={buttonPrimary}><Save size={18} /> บันทึกรายการ</button>
            </div>
          </form>
        </section>

        <section style={{ marginTop: 22, background: "white", borderRadius: 20, padding: 24, boxShadow: "0 10px 30px rgba(15,23,42,.06)", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 21 }}>รายการที่บันทึก</h2>
            <span style={{ color: "#64748b", fontSize: 14 }}>{records.length} รายการ</span>
          </div>

          {records.length === 0 ? (
            <div style={{ padding: "34px 16px", textAlign: "center", color: "#94a3b8", border: "1px dashed #cbd5e1", borderRadius: 14 }}>ยังไม่มีรายการลืมสแกนเวลา</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 850 }}>
                <thead>
                  <tr>
                    {['วันที่', 'ชื่อ–สกุล', 'ประเภท', 'เวลาเข้า', 'เวลาออก', 'เหตุผล', 'สถานะ', ''].map((h) => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {records.map((item) => (
                    <tr key={item.id}>
                      <td style={tdStyle}>{formatThaiDate(item.workDate)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{item.employeeName}</td>
                      <td style={tdStyle}>{item.scanType}</td>
                      <td style={tdStyle}>{item.inTime || '—'}</td>
                      <td style={tdStyle}>{item.outTime || '—'}</td>
                      <td style={tdStyle}><div>{item.reason}</div>{item.note && <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{item.note}</div>}</td>
                      <td style={tdStyle}><span style={{ padding: '5px 9px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontSize: 12, fontWeight: 800 }}>{item.status}</span></td>
                      <td style={tdStyle} className="no-print"><button aria-label="ลบรายการ" onClick={() => removeRecord(item.id)} style={iconButton}><Trash2 size={17} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="no-print" style={{ margin: "14px 0 0", fontSize: 12, color: "#94a3b8" }}>ข้อมูลหน้านี้เก็บไว้ในเบราว์เซอร์ของเครื่องที่ใช้งาน เพื่อไม่กระทบฐานข้อมูลระบบเดิม</p>
        </section>
      </div>

      <style jsx global>{`
        @media (max-width: 760px) {
          form { grid-template-columns: 1fr !important; }
          form > * { grid-column: 1 !important; }
        }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; background: white !important; }
        }
      `}</style>
    </main>
  );
}

function formatThaiDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(year, month - 1, day));
}

const fieldStyle = { display: "flex", flexDirection: "column" as const, gap: 7 };
const labelStyle = { fontSize: 14, fontWeight: 800, color: "#334155" };
const inputStyle = { width: "100%", boxSizing: "border-box" as const, border: "1px solid #cbd5e1", borderRadius: 11, padding: "11px 12px", font: "inherit", color: "#0f172a", background: "white", outline: "none" };
const buttonPrimary = { border: 0, borderRadius: 11, padding: "11px 16px", background: "#e11d48", color: "white", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" };
const buttonSecondary = { border: "1px solid #cbd5e1", borderRadius: 11, padding: "9px 13px", background: "white", color: "#334155", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" };
const iconButton = { border: 0, background: "transparent", color: "#e11d48", cursor: "pointer", padding: 6 };
const thStyle = { padding: "10px 9px", textAlign: "left" as const, borderBottom: "1px solid #cbd5e1", color: "#475569", fontSize: 13, whiteSpace: "nowrap" as const };
const tdStyle = { padding: "11px 9px", borderBottom: "1px solid #e2e8f0", verticalAlign: "top" as const, fontSize: 14 };
