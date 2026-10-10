export const metadata = {
  title: 'สวนตุลากาวา | สมุดประจำสวน',
  description: 'หน้าเมนหลักสวนตุลากาวา พร้อมเมนูปุ๋ยยา ปฏิทิน งานสวน ต้นทุน และคลังรูป',
};

const menu = [
  { href: '/garden/products', icon: '🌿', title: 'ปุ๋ยและยา', desc: 'ดูชื่อสินค้า ใช้ทำอะไร และกดดูรายละเอียด' },
  { href: '#mixing', icon: '🧪', title: 'สูตรผสม / วิธีใช้', desc: 'รวมอัตราผสม ลำดับการผสม และช่วงเวลาที่เหมาะ' },
  { href: '#pests', icon: '🐜', title: 'ปัญหาโรคและแมลง', desc: 'มด เพลี้ย เชื้อรา และบันทึกผลหลังจัดการ' },
  { href: '#calendar', icon: '📅', title: 'ปฏิทินดูแล 12 เดือน', desc: 'งานหลักรายเดือนสำหรับฝรั่ง' },
  { href: '#journal', icon: '📝', title: 'บันทึกงานวันนี้', desc: 'จดวันที่ งานที่ทำ ของที่ใช้ และค่าใช้จ่าย' },
  { href: '#cost', icon: '💰', title: 'ต้นทุนสวน', desc: 'รวมปุ๋ย ยา อุปกรณ์ ค่าแรง และรายได้' },
  { href: '#photos', icon: '📷', title: 'คลังรูป', desc: 'รูปสวน โรคแมลง ผลผลิต และก่อน-หลังทำงาน' },
  { href: '#weather', icon: '🌦️', title: 'พยากรณ์อากาศ', desc: 'ใช้ช่วยวางรอบน้ำ พ่นยา และทำงานสวน' },
];

const months = [
  ['ตุลาคม', 'ฟื้นต้นหลังตัดหนัก ตรวจยอดอ่อน มด เพลี้ย และเริ่มนับผลรุ่นใหม่'],
  ['พฤศจิกายน', 'ดูความชื้น วางรอบน้ำ ตรวจดอกและผล'],
  ['ธันวาคม', 'สรุปต้นทุน ตัดกิ่งแห้ง และวางแผนรอบใหม่'],
  ['มกราคม', 'เปิดทรงพุ่ม ตรวจระบบน้ำ และฟื้นต้น'],
  ['กุมภาพันธ์', 'คัดกิ่งไว้ผล ตรวจยอดอ่อนและแมลง'],
  ['มีนาคม', 'คลุมโคน ให้น้ำสม่ำเสมอ เตรียมห่อผล'],
  ['เมษายน', 'จัดรอบน้ำ ห่อผล ตรวจแดดไหม้ และค้ำกิ่ง'],
  ['พฤษภาคม', 'ระบายน้ำ ตัดหญ้า และเก็บผลเสีย'],
  ['มิถุนายน', 'ตัดแต่งกิ่งให้โปร่ง ตรวจโรคใบ'],
  ['กรกฎาคม', 'คัดผล ห่อผล และตรวจถุงห่อ'],
  ['สิงหาคม', 'ดูผลใกล้เก็บ ตรวจสี ขนาด และความสมบูรณ์'],
  ['กันยายน', 'หลังเก็บ ตัดแต่ง ฟื้นต้น และเคลียร์วัชพืช'],
];

export default function GardenHome() {
  return (
    <main style={{ minHeight: '100vh', background: '#f4f1e7', color: '#173b25', fontFamily: "system-ui,'Noto Sans Thai',sans-serif" }}>
      <header style={{ background: '#143f2a', color: '#fff', padding: '22px 16px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, opacity: .75 }}>สมุดประจำสวน • ทดลองจากของจริง</div>
            <h1 style={{ margin: '2px 0 0', fontSize: 'clamp(28px,5vw,44px)' }}>สวนตุลากาวา</h1>
          </div>
          <a href='/' style={{ color: '#fff', textDecoration: 'none', background: '#2d6d47', padding: '10px 14px', borderRadius: 999, fontWeight: 800 }}>← กลับหน้า Hub</a>
        </div>
      </header>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 14px 50px' }}>
        <section style={{ borderRadius: 26, padding: '28px 24px', background: 'linear-gradient(135deg,#dff1d8,#fff4b8)', boxShadow: '0 10px 28px rgba(27,62,38,.10)', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#4f764f' }}>TULA GUAVA FARM • วังกะพี้ อุตรดิตถ์</div>
          <h2 style={{ margin: '8px 0 10px', fontSize: 'clamp(30px,6vw,52px)', lineHeight: 1.05 }}>สวนเล็ก ๆ ที่ค่อย ๆ ทำให้เป็นระบบ</h2>
          <p style={{ margin: 0, maxWidth: 760, lineHeight: 1.7, color: '#4d6252', fontSize: 16 }}>พื้นที่ประมาณ 1 ไร่ 1 งาน ฝรั่งราว 130 ต้น ใช้หน้านี้เป็นสมุดรวมงานสวน ปุ๋ยยา ต้นทุน รูปถ่าย และสิ่งที่ทดลองจริงในสวน</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <a href='/garden/products' style={{ textDecoration: 'none', background: '#2f6b45', color: '#fff', padding: '11px 15px', borderRadius: 12, fontWeight: 900 }}>เปิดเมนูปุ๋ยและยา</a>
            <a href='#calendar' style={{ textDecoration: 'none', background: '#fff', color: '#2f6b45', padding: '11px 15px', borderRadius: 12, fontWeight: 900 }}>ดูปฏิทิน 12 เดือน</a>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 22 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 18, border: '1px solid #e4dfd2' }}><b style={{ fontSize: 28 }}>≈130</b><div style={{ color: '#667367' }}>ต้นฝรั่ง</div></div>
          <div style={{ background: '#fff', borderRadius: 18, padding: 18, border: '1px solid #e4dfd2' }}><b style={{ fontSize: 28 }}>1 ไร่ 1 งาน</b><div style={{ color: '#667367' }}>พื้นที่สวน</div></div>
          <div style={{ background: '#fff', borderRadius: 18, padding: 18, border: '1px solid #e4dfd2' }}><b style={{ fontSize: 28 }}>฿1,000</b><div style={{ color: '#667367' }}>เป้ารายได้/สัปดาห์</div></div>
          <div style={{ background: '#fff', borderRadius: 18, padding: 18, border: '1px solid #e4dfd2' }}><b style={{ fontSize: 28 }}>25 กก.</b><div style={{ color: '#667367' }}>เป้าขาย/สัปดาห์ที่ 40 บาท/กก.</div></div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, margin: '0 0 12px' }}>เมนูสวน</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
            {menu.map((m) => (
              <a key={m.title} href={m.href} style={{ textDecoration: 'none', color: '#173b25', background: '#fff', border: '1px solid #e4dfd2', borderRadius: 20, padding: 18, boxShadow: '0 6px 18px rgba(30,60,37,.05)' }}>
                <div style={{ fontSize: 34 }}>{m.icon}</div>
                <h3 style={{ margin: '8px 0 5px', fontSize: 20 }}>{m.title}</h3>
                <p style={{ margin: 0, lineHeight: 1.5, color: '#5b695e' }}>{m.desc}</p>
              </a>
            ))}
          </div>
        </section>

        <section id='weather' style={{ background: '#eaf1e4', border: '1px solid #cfddc6', borderRadius: 22, padding: 20, marginBottom: 22 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 23 }}>🌦️ พยากรณ์อากาศ 7 วัน</h2>
          <p style={{ margin: 0, color: '#5a6b5c', lineHeight: 1.6 }}>เมนูพยากรณ์ยังคงอยู่ในแผนหน้าเดิม ใช้ช่วยวางรอบน้ำและงานสวน ส่วนการเชื่อมข้อมูลสดจะย้ายมา Cloudflare โดยไม่พึ่ง AppDeploy</p>
        </section>

        <section id='calendar' style={{ background: '#fff', border: '1px solid #e4dfd2', borderRadius: 22, padding: 20, marginBottom: 22 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 23 }}>📅 ปฏิทินดูแลสวน 12 เดือน</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 11 }}>
            {months.map(([month, work]) => (
              <article key={month} style={{ background: '#f6f7f0', borderRadius: 15, padding: 14 }}>
                <b style={{ fontSize: 18 }}>{month}</b>
                <p style={{ margin: '6px 0 0', color: '#58665b', lineHeight: 1.55 }}>{work}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
          <article id='journal' style={{ background: '#fff', border: '1px solid #e4dfd2', borderRadius: 20, padding: 18 }}><h2 style={{ marginTop: 0 }}>📝 บันทึกงานวันนี้</h2><p style={{ color: '#5c6a60', lineHeight: 1.6 }}>วันที่ • งานที่ทำ • ปุ๋ย/ยาที่ใช้ • ปริมาณ • ค่าใช้จ่าย • รูปก่อน/หลัง</p><div style={{ fontWeight: 800, color: '#2f6b45' }}>ขั้นต่อไป: ทำฟอร์มบันทึกบน Cloudflare</div></article>
          <article id='pests' style={{ background: '#fff', border: '1px solid #e4dfd2', borderRadius: 20, padding: 18 }}><h2 style={{ marginTop: 0 }}>🐜 ปัญหาโรคและแมลง</h2><p style={{ color: '#5c6a60', lineHeight: 1.6 }}>มด • เพลี้ย • เชื้อรา • สถานีเหยื่อ • บันทึกผลหลังทดลอง</p><div style={{ fontWeight: 800, color: '#2f6b45' }}>เป้าหมาย: ตัดวงจรมดและลดเพลี้ย</div></article>
          <article id='mixing' style={{ background: '#fff', border: '1px solid #e4dfd2', borderRadius: 20, padding: 18 }}><h2 style={{ marginTop: 0 }}>🧪 สูตรผสม / วิธีใช้</h2><p style={{ color: '#5c6a60', lineHeight: 1.6 }}>เก็บอัตราผสมต่อถัง 20 ลิตร ช่วงเวลาพ่น ลำดับผสม และสิ่งที่ห้ามผสม</p><a href='/garden/products' style={{ color: '#2f6b45', fontWeight: 900 }}>เปิดคลังปุ๋ยและยา →</a></article>
          <article id='cost' style={{ background: '#fff', border: '1px solid #e4dfd2', borderRadius: 20, padding: 18 }}><h2 style={{ marginTop: 0 }}>💰 ต้นทุนสวน</h2><p style={{ color: '#5c6a60', lineHeight: 1.6 }}>ปุ๋ย • ยา • อุปกรณ์ • ค่าแรง • ค่าน้ำมัน • รายได้</p><div style={{ fontWeight: 800, color: '#2f6b45' }}>ขั้นต่อไป: ย้ายตารางต้นทุนมา Cloudflare</div></article>
          <article id='photos' style={{ background: '#fff', border: '1px solid #e4dfd2', borderRadius: 20, padding: 18 }}><h2 style={{ marginTop: 0 }}>📷 คลังรูป</h2><p style={{ color: '#5c6a60', lineHeight: 1.6 }}>สวน • โรคแมลง • ผลผลิต • ระบบน้ำ • ก่อนและหลังทำงาน</p><div style={{ fontWeight: 800, color: '#2f6b45' }}>ขั้นต่อไป: เชื่อมรูปจากโฟลเดอร์สวน</div></article>
        </section>
      </div>
    </main>
  );
}
