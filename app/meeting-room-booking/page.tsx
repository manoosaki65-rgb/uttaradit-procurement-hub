"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

type Booking = {
  date: string;
  room: "ห้องประชุม e-GP" | "ห้องประชุม GF";
  start: string;
  end: string;
  title: string;
  bookedBy: string;
};

// เชื่อมข้อมูลจริงจาก Master ในขั้นถัดไป — ไม่ใส่ข้อมูลจำลองเพื่อป้องกันความสับสน
const bookings: Booking[] = [];

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];
const weekdays = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export default function MeetingRoomBookingPage() {
  const today = new Date();
  const [monthCursor, setMonthCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(isoDate(today));

  const calendarDays = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = Array(firstWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthCursor]);

  const selectedBookings = bookings.filter((b) => b.date === selectedDate);
  const selectedLabel = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${selectedDate}T12:00:00`));

  const goMonth = (offset: number) => {
    const next = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + offset, 1);
    setMonthCursor(next);
  };

  const goToday = () => {
    const now = new Date();
    setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(isoDate(now));
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f4f8fb", padding: "24px 16px", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#0f5f91", textDecoration: "none", fontWeight: 700, marginBottom: 18 }}>
          <ChevronLeft size={20} /> กลับหน้าหลัก
        </a>

        <section style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 12px 36px rgba(15, 59, 88, .10)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
            <span style={{ width: 52, height: 52, borderRadius: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#e7f5ff", color: "#0b6ea8" }}>
              <CalendarDays size={28} />
            </span>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, color: "#16324a" }}>จองห้องประชุมออนไลน์</h1>
              <p style={{ margin: "4px 0 0", color: "#64748b" }}>กลุ่มงานพัสดุ อาคารพัสดุ ชั้น 3 โรงพยาบาลอุตรดิตถ์</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 22 }}>
            <div style={{ border: "1px solid #b9dff6", background: "#f0f9ff", borderRadius: 16, padding: 16 }}>
              <MapPin size={22} color="#0b6ea8" />
              <strong style={{ display: "block", marginTop: 8, color: "#16324a" }}>ห้องประชุม e-GP</strong>
              <span style={{ color: "#64748b", fontSize: 14 }}>ห้องหลัก</span>
            </div>
            <div style={{ border: "1px solid #ddd6fe", background: "#faf5ff", borderRadius: 16, padding: 16 }}>
              <MapPin size={22} color="#7c3aed" />
              <strong style={{ display: "block", marginTop: 8, color: "#16324a" }}>ห้องประชุม GF</strong>
              <span style={{ color: "#64748b", fontSize: 14 }}>ห้องสำรอง</span>
            </div>
          </div>

          <div style={{ marginTop: 24, border: "1px solid #dbe7ef", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px", background: "#f8fbfd", borderBottom: "1px solid #dbe7ef" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button type="button" onClick={() => goMonth(-1)} aria-label="เดือนก่อน" style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #cbd5e1", background: "white", display: "grid", placeItems: "center", cursor: "pointer" }}><ChevronLeft size={19} /></button>
                <button type="button" onClick={() => goMonth(1)} aria-label="เดือนถัดไป" style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #cbd5e1", background: "white", display: "grid", placeItems: "center", cursor: "pointer" }}><ChevronRight size={19} /></button>
                <button type="button" onClick={goToday} style={{ height: 38, borderRadius: 10, border: "1px solid #cbd5e1", background: "white", padding: "0 12px", fontWeight: 700, cursor: "pointer" }}>วันนี้</button>
              </div>
              <h2 style={{ margin: 0, fontSize: 21, color: "#16324a" }}>{thaiMonths[monthCursor.getMonth()]} {monthCursor.getFullYear() + 543}</h2>
              <div style={{ fontSize: 13, color: "#64748b" }}>กดวันที่เพื่อดูรายละเอียดการจอง</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", background: "#eef5f9", borderBottom: "1px solid #dbe7ef" }}>
              {weekdays.map((day) => <div key={day} style={{ padding: "10px 4px", textAlign: "center", fontWeight: 800, color: "#476579", fontSize: 13 }}>{day}</div>)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
              {calendarDays.map((day, index) => {
                if (!day) return <div key={`blank-${index}`} style={{ minHeight: 88, background: "#fbfdfe", borderRight: "1px solid #edf2f5", borderBottom: "1px solid #edf2f5" }} />;
                const date = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayBookings = bookings.filter((b) => b.date === date);
                const isSelected = selectedDate === date;
                const isToday = isoDate(today) === date;
                return (
                  <button key={date} type="button" onClick={() => setSelectedDate(date)} style={{ minHeight: 88, padding: 8, textAlign: "left", background: isSelected ? "#eaf6ff" : "white", border: 0, borderRight: "1px solid #edf2f5", borderBottom: "1px solid #edf2f5", cursor: "pointer", position: "relative" }}>
                    <span style={{ display: "inline-grid", placeItems: "center", width: 28, height: 28, borderRadius: 999, background: isToday ? "#0b6ea8" : "transparent", color: isToday ? "white" : "#334155", fontWeight: 800 }}>{day}</span>
                    <div style={{ display: "grid", gap: 4, marginTop: 4 }}>
                      {dayBookings.slice(0, 2).map((b, i) => <span key={`${b.room}-${i}`} style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", borderRadius: 999, padding: "3px 6px", background: b.room === "ห้องประชุม e-GP" ? "#dff3ff" : "#eee7ff", color: "#334155", fontSize: 11, fontWeight: 700 }}>{b.start} {b.room.replace("ห้องประชุม ", "")}</span>)}
                      {dayBookings.length > 2 && <span style={{ fontSize: 11, color: "#64748b" }}>+{dayBookings.length - 2} รายการ</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <section style={{ marginTop: 20, border: "1px solid #dbe7ef", borderRadius: 18, padding: 18 }}>
            <h3 style={{ margin: 0, color: "#16324a", fontSize: 19 }}>รายการจองวันที่ {selectedLabel}</h3>
            {selectedBookings.length === 0 ? (
              <div style={{ marginTop: 14, padding: 18, borderRadius: 14, background: "#f8fafc", color: "#64748b", textAlign: "center" }}>ยังไม่มีรายการจองในวันนี้</div>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                {selectedBookings.map((b, index) => (
                  <div key={`${b.date}-${b.start}-${index}`} style={{ display: "grid", gap: 6, padding: 14, border: "1px solid #e2e8f0", borderRadius: 14 }}>
                    <strong style={{ color: "#16324a" }}>{b.title}</strong>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 14 }}><Clock3 size={15} /> {b.start}–{b.end} น. · {b.room}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 14 }}><UsersRound size={15} /> ผู้จอง: {b.bookedBy}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div style={{ marginTop: 18, padding: 14, borderRadius: 14, background: "#fff8e6", border: "1px solid #f6d88b", color: "#7a5510", fontSize: 14 }}>
            ตอนนี้ปฏิทินพร้อมแสดงคิวแล้ว ข้อมูลการจองจริงจะเชื่อมจาก Master เพื่อให้ทุกคนเห็นคิวเดียวกันและไม่เกิดการจองซ้ำ
          </div>
        </section>
      </div>
    </main>
  );
}
