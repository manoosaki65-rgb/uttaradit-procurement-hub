"use client";

import { CalendarDays, ChevronLeft, Clock3, MapPin } from "lucide-react";

export default function MeetingRoomBookingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f8fb", padding: "24px 16px", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
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
              <p style={{ margin: "4px 0 0", color: "#64748b" }}>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์</p>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 18, borderRadius: 16, background: "#fff8e6", border: "1px solid #f6d88b", color: "#7a5510" }}>
            เมนูพร้อมใช้งานบนหน้าเว็บแล้ว ส่วนระบบบันทึกการจองและตารางห้องประชุมจะเชื่อมต่อในขั้นถัดไป โดยยังไม่สร้างฐานข้อมูลหรือเปลี่ยนระบบเดิมโดยพลการ
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 24 }}>
            <div style={{ border: "1px solid #dbe7ef", borderRadius: 16, padding: 18 }}><CalendarDays size={24} /><strong style={{ display: "block", marginTop: 10 }}>เลือกวันที่</strong><span style={{ color: "#64748b", fontSize: 14 }}>ตรวจวันว่างก่อนจอง</span></div>
            <div style={{ border: "1px solid #dbe7ef", borderRadius: 16, padding: 18 }}><Clock3 size={24} /><strong style={{ display: "block", marginTop: 10 }}>เลือกเวลา</strong><span style={{ color: "#64748b", fontSize: 14 }}>กำหนดเวลาเริ่มและสิ้นสุด</span></div>
            <div style={{ border: "1px solid #dbe7ef", borderRadius: 16, padding: 18 }}><MapPin size={24} /><strong style={{ display: "block", marginTop: 10 }}>เลือกห้องประชุม</strong><span style={{ color: "#64748b", fontSize: 14 }}>รองรับหลายห้องในระบบเดียว</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
