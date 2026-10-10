type Item = {
  name: string;
  use: string;
  category: string;
  image?: string;
  details: string[];
};

const items: Item[] = [
  { name: 'ปุ๋ยกระต่าย 16-16-16', use: 'บำรุงต้นและการเจริญเติบโตทั่วไป', category: 'ปุ๋ย', details: ['เหมาะช่วงฟื้นต้นและทำใบ', 'ใช้ตามอัตราบนฉลาก', 'ให้น้ำหลังใส่ปุ๋ย'] },
  { name: 'หัวคนป่า 11-5-33', use: 'บำรุงผลและเพิ่มคุณภาพผลผลิต', category: 'ปุ๋ย', details: ['โพแทสเซียมสูง เหมาะช่วงพัฒนาผล', 'ใช้ตามอัตราบนฉลาก', 'ให้น้ำหลังใส่ปุ๋ย'] },
  { name: 'บิวเวอเรีย + เมธาไรเซียม', use: 'ชีวภัณฑ์ช่วยควบคุมแมลงศัตรูพืช', category: 'ชีวภัณฑ์', details: ['พ่นช่วงเย็นหรือแดดอ่อน', 'หลีกเลี่ยงการผสมกับสารฆ่าเชื้อราที่อาจทำลายเชื้อชีวภัณฑ์', 'ยึดอัตราตามฉลาก'] },
  { name: 'เกอมาร์ พลัส', use: 'ส่งเสริมดอก ติดผล และฟื้นต้น', category: 'ธาตุอาหารเสริม', image: 'https://www.sotus.co.th/site/wp-content/uploads/2017/09/Slide72.jpg', details: ['ไม้ผลใช้อัตรา 20–30 ซีซี ต่อน้ำ 20 ลิตร', 'พ่นทุก 7–14 วัน', 'พ่นช่วงเช้าหรือเย็น หลีกเลี่ยงแดดจัด'] },
  { name: 'ไวท์ออยล์ 67% W/V EC', use: 'ช่วยควบคุมเพลี้ย ไร และแมลงปากดูด', category: 'สารป้องกันแมลง', details: ['พ่นให้โดนตัวแมลงและใต้ใบ', 'หลีกเลี่ยงอากาศร้อนจัด', 'ตรวจฉลากก่อนผสมร่วมกับสารอื่น'] },
  { name: 'น้ำหมักปลาทะเล 100%', use: 'บำรุงต้น ราก และความสมบูรณ์ของพืช', category: 'บำรุงพืช', details: ['เจือจางตามฉลาก', 'ใช้ราดดินหรือพ่นทางใบตามคำแนะนำผู้ผลิต', 'ไม่ใช้เข้มข้นเกินอัตรา'] },
  { name: 'Stamikal', use: 'สารเสริมเพื่อช่วยบำรุงพืช', category: 'สารเสริม', details: ['ตรวจสูตรและอัตราจากฉลากก่อนใช้', 'พ่นช่วงอากาศไม่ร้อนจัด', 'ทดสอบการผสมก่อนใช้ร่วมกับสารอื่น'] },
  { name: 'Add 3', use: 'สารเสริมประสิทธิภาพสำหรับการดูแลพืช', category: 'สารเสริม', details: ['ใช้ตามฉลาก', 'ตรวจความเข้ากันได้ก่อนผสมร่วม', 'หลีกเลี่ยงแดดจัด'] },
  { name: 'วิกตอล', use: 'สารจับใบ ช่วยให้สารพ่นเกาะใบดีขึ้น', category: 'สารจับใบ', details: ['ใช้ตามฉลาก', 'เติมหลังสารหลัก', 'ไม่ใช้เกินอัตรา'] },
  { name: 'Runway', use: 'สารจับใบ ช่วยแผ่กระจายสารบนใบ', category: 'สารจับใบ', details: ['ใช้ตามฉลาก', 'เติมหลังผสมสารหลัก', 'ทดสอบความเข้ากันได้ก่อนใช้ร่วมหลายชนิด'] },
  { name: 'HI-Force', use: 'สารเพิ่มประสิทธิภาพการฉีดพ่นทางใบ', category: 'สารเสริม', details: ['ใช้ตามอัตราฉลาก', 'พ่นเช้าหรือเย็น', 'หลีกเลี่ยงฝนหลังพ่นทันที'] },
  { name: 'ไทอะมีทอกแซม 25% WG', use: 'กำจัดเพลี้ยและแมลงปากดูด', category: 'สารกำจัดแมลง', details: ['ใช้เฉพาะตามพืชและศัตรูพืชที่ระบุในฉลากทะเบียน', 'สวมอุปกรณ์ป้องกัน', 'เว้นระยะเก็บเกี่ยวตามฉลาก'] },
  { name: 'Nutac Super-K', use: 'ปุ๋ยทางใบ 6-12-26 ช่วยออกดอก ติดผล และคุณภาพผล', category: 'ปุ๋ยทางใบ', image: 'https://www.sotus.co.th/site/wp-content/uploads/2020/06/%E0%B8%99%E0%B8%B9%E0%B9%81%E0%B8%97%E0%B8%84-%E0%B8%8B%E0%B8%B8%E0%B8%9B%E0%B9%80%E0%B8%9B%E0%B8%AD%E0%B8%A3%E0%B9%8C-%E0%B9%80%E0%B8%84-2024.png', details: ['ฝรั่งใช้อัตรา 30–40 กรัม ต่อน้ำ 20 ลิตร', 'ระยะใบแก่/ก่อนออกดอก พ่น 2–3 ครั้ง ห่าง 7–10 วัน', 'ระยะติดผล พ่น 1 ครั้ง'] },
  { name: 'Nutac N', use: 'ปุ๋ยทางใบ บำรุงใบและความสมบูรณ์ของต้น', category: 'ปุ๋ยทางใบ', details: ['ใช้ตามอัตราฉลาก', 'พ่นช่วงอากาศเย็น', 'พ่นให้เปียกทั่วใบพอดี'] },
  { name: 'EM-PO', use: 'หัวเชื้อจุลินทรีย์ ปรับสภาพดินและบำรุงพืช', category: 'จุลินทรีย์', details: ['ใช้ตามวิธีขยายหรือเจือจางบนฉลาก', 'หลีกเลี่ยงสารฆ่าเชื้อรุนแรง', 'เก็บในที่ร่ม'] },
  { name: 'Amigo', use: 'ป้องกันและกำจัดโรคพืชจากเชื้อรา', category: 'สารป้องกันโรค', details: ['ตรวจพืชและโรคที่ขึ้นทะเบียนบนฉลาก', 'สวมอุปกรณ์ป้องกัน', 'เว้นระยะเก็บเกี่ยวตามฉลาก'] },
  { name: 'Megasol-K 0-0-50', use: 'โพแทสเซียมสูง ช่วยคุณภาพ สี และน้ำหนักผล', category: 'ปุ๋ยทางใบ', details: ['ใช้ตามอัตราฉลาก', 'เหมาะช่วงพัฒนาคุณภาพผล', 'พ่นเช้าหรือเย็น'] },
  { name: 'อะซีทามิพริด 20% SP', use: 'กำจัดเพลี้ยและแมลงปากดูด', category: 'สารกำจัดแมลง', details: ['ใช้เฉพาะตามฉลากทะเบียน', 'ไม่เพิ่มอัตราเอง', 'สวมอุปกรณ์ป้องกันและเว้นระยะเก็บเกี่ยว'] },
  { name: 'TOLOS', use: 'สารกำจัดแมลงสำหรับแมลงดูดกิน', category: 'สารกำจัดแมลง', details: ['ตรวจสารสำคัญและอัตราจากฉลากจริงก่อนใช้', 'พ่นเช้าหรือเย็น', 'ไม่ผสมหลายชนิดโดยไม่ตรวจความเข้ากันได้'] },
  { name: 'พาราดอน', use: 'ใช้ควบคุมมดและแมลงรบกวน', category: 'กำจัดมด', details: ['ใช้เฉพาะตามฉลากผลิตภัณฑ์', 'เก็บให้พ้นเด็กและสัตว์เลี้ยง', 'ห้ามปะปนกับอาหารหรือภาชนะอาหาร'] },
];

export const metadata = {
  title: 'ปุ๋ยและยา | สวนตุลากาวา',
  description: 'คลังปุ๋ย ยา และสารดูแลฝรั่ง กดดูรายละเอียดได้',
};

export default function ProductsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#f4f1e7', color: '#173b25', fontFamily: "system-ui,'Noto Sans Thai',sans-serif", padding: '20px 14px 48px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <header style={{ background: '#173f2a', color: '#fff', borderRadius: 24, padding: '22px 20px', marginBottom: 18 }}>
          <div style={{ fontSize: 13, opacity: .8 }}>สวนตุลากาวา</div>
          <h1 style={{ margin: '5px 0 6px', fontSize: 'clamp(28px,5vw,44px)' }}>ปุ๋ยและยา</h1>
          <p style={{ margin: 0, opacity: .85 }}>หน้าการ์ดมีแค่ชื่อ + ใช้ทำอะไร • แตะการ์ดเพื่อดูรายละเอียด</p>
          <a href='/garden' style={{ display: 'inline-block', marginTop: 14, background: '#2f6b45', color: '#fff', textDecoration: 'none', padding: '9px 13px', borderRadius: 999, fontWeight: 700 }}>← กลับหน้าสวน</a>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 14 }}>
          {items.map((item) => (
            <details key={item.name} style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 24px rgba(28,62,39,.08)', border: '1px solid #e3dfd2' }}>
              <summary style={{ listStyle: 'none', cursor: 'pointer' }}>
                {item.image ? (
                  <div style={{ height: 180, background: '#eef4ed', overflow: 'hidden' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ height: 180, background: 'linear-gradient(135deg,#e6f3dc,#fff5c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, textAlign: 'center', fontWeight: 900, color: '#35633f', fontSize: 22 }}>
                    {item.name}
                  </div>
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#6f8b70' }}>{item.category}</div>
                  <h2 style={{ margin: '4px 0 7px', fontSize: 20, lineHeight: 1.25 }}>{item.name}</h2>
                  <p style={{ margin: 0, lineHeight: 1.5, color: '#55645a' }}>{item.use}</p>
                  <div style={{ marginTop: 10, color: '#2f6b45', fontWeight: 800 }}>กดดูรายละเอียด ▾</div>
                </div>
              </summary>
              <div style={{ padding: '0 16px 17px', borderTop: '1px solid #eee8db' }}>
                <h3 style={{ fontSize: 15, margin: '13px 0 8px' }}>วิธีใช้ / ข้อควรระวัง</h3>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7, color: '#46574b' }}>{item.details.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
            </details>
          ))}
        </section>

        <div style={{ marginTop: 20, padding: 14, borderRadius: 15, background: '#fff6d8', border: '1px solid #ead899', lineHeight: 1.6, color: '#6a5921' }}>
          ข้อมูลสารกำจัดศัตรูพืชให้ยึดฉลากทะเบียนของผลิตภัณฑ์จริงเป็นหลัก โดยเฉพาะอัตราใช้ พืชเป้าหมาย ศัตรูพืช และระยะเว้นเก็บเกี่ยว
        </div>
      </div>
    </main>
  );
}
