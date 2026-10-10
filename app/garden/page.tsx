export const metadata = {
  title: "คู่มือปุ๋ยและสารดูแลฝรั่ง | สวนตุลากาวา",
  description: "คลังข้อมูลปุ๋ย ยา และสารดูแลฝรั่ง แบบกดดูรายละเอียดได้",
};

type Item = {
  name: string;
  use: string;
  category: string;
  details: string[];
};

const items: Item[] = [
  { name: "ปุ๋ยกระต่าย 16-16-16", use: "บำรุงต้นและการเจริญเติบโตทั่วไป", category: "ปุ๋ย", details: ["ใช้ในช่วงฟื้นต้นและทำใบ", "หว่านตามอายุและขนาดทรงพุ่ม แล้วให้น้ำ", "หลีกเลี่ยงการใส่ชิดโคนต้นโดยตรง"] },
  { name: "หัวคนป่า 11-5-33", use: "บำรุงผลและเพิ่มคุณภาพผลผลิต", category: "ปุ๋ย", details: ["โพแทสเซียมสูง เหมาะช่วงพัฒนาผล", "ใช้ตามอัตราบนฉลากของผลิตภัณฑ์", "ให้น้ำหลังใส่ปุ๋ย"] },
  { name: "บิวเวอเรีย + เมธาไรเซียม", use: "ชีวภัณฑ์ช่วยควบคุมแมลงศัตรูพืช", category: "ชีวภัณฑ์", details: ["เหมาะกับการพ่นช่วงเย็นหรือแดดอ่อน", "หลีกเลี่ยงการผสมกับสารฆ่าเชื้อราที่อาจทำลายเชื้อชีวภัณฑ์", "ใช้ตามอัตราบนฉลาก"] },
  { name: "เกอมาร์ พลัส", use: "ธาตุอาหารเสริม บำรุงต้น ใบ และผล", category: "ธาตุอาหาร", details: ["อัตราที่เคยตรวจสอบได้: 20–30 ซีซี ต่อน้ำ 20 ลิตร", "พ่นช่วงเช้าหรือเย็น หลีกเลี่ยงแดดจัด", "เว้นช่วงประมาณ 7–14 วัน หรือตามฉลาก"] },
  { name: "ไวท์ออยล์", use: "ช่วยควบคุมเพลี้ย ไร และแมลงปากดูด", category: "ป้องกันแมลง", details: ["พ่นให้ถูกตัวแมลงและใต้ใบ", "หลีกเลี่ยงอากาศร้อนจัด", "ไม่ควรผสมกับสารบางชนิดโดยไม่ตรวจฉลากก่อน"] },
  { name: "น้ำหมักปลาทะเล", use: "บำรุงต้น ราก และความสมบูรณ์ของพืช", category: "บำรุงพืช", details: ["เจือจางตามฉลากก่อนใช้", "ใช้ราดดินหรือพ่นทางใบตามคำแนะนำผู้ผลิต", "หลีกเลี่ยงการใช้เข้มข้นเกินไป"] },
  { name: "Stamikal", use: "สารเสริมเพื่อช่วยบำรุงพืช", category: "สารเสริม", details: ["ตรวจสูตรและอัตราจากฉลากก่อนใช้", "พ่นช่วงอากาศไม่ร้อนจัด", "ทดสอบผสมในปริมาณน้อยก่อนเมื่อใช้ร่วมกับสารอื่น"] },
  { name: "Add 3", use: "สารเสริมประสิทธิภาพสำหรับการดูแลพืช", category: "สารเสริม", details: ["ใช้ตามฉลากผลิตภัณฑ์", "ตรวจความเข้ากันได้ก่อนผสมร่วม", "หลีกเลี่ยงการพ่นกลางแดดจัด"] },
  { name: "วิกตอล", use: "สารจับใบ ช่วยให้สารพ่นเกาะใบดีขึ้น", category: "สารจับใบ", details: ["เติมเป็นลำดับท้ายของถังตามคำแนะนำฉลาก", "ไม่ควรใช้เกินอัตรา", "คนสารให้เข้ากันก่อนพ่น"] },
  { name: "Runway", use: "สารจับใบ ช่วยแผ่กระจายสารบนใบ", category: "สารจับใบ", details: ["ใช้ตามอัตราฉลาก", "เติมหลังผสมสารหลักแล้ว", "ทดสอบความเข้ากันได้ก่อนใช้ร่วมหลายชนิด"] },
  { name: "HI-Force", use: "สารเพิ่มประสิทธิภาพการฉีดพ่นทางใบ", category: "สารเสริม", details: ["ใช้ตามอัตราฉลาก", "เหมาะกับการพ่นเช้าหรือเย็น", "หลีกเลี่ยงฝนหลังพ่นทันที"] },
  { name: "ไทอะมีทอกแซม 25", use: "กำจัดเพลี้ยและแมลงปากดูด", category: "กำจัดแมลง", details: ["ใช้เฉพาะตามพืช ศัตรูพืช และอัตราที่ระบุบนฉลากทะเบียน", "สวมอุปกรณ์ป้องกันขณะผสมและพ่น", "เว้นระยะเก็บเกี่ยวตามฉลาก"] },
  { name: "Nutac Super-K", use: "ปุ๋ยทางใบโพแทสเซียมสูง ช่วยบำรุงผล", category: "ปุ๋ยทางใบ", details: ["อัตราที่เคยตรวจสอบสำหรับฝรั่ง: 30–40 กรัม ต่อน้ำ 20 ลิตร", "พ่นเช้าหรือเย็น", "หลีกเลี่ยงแดดจัดและฝนใกล้ตก"] },
  { name: "Nutac N", use: "ปุ๋ยทางใบ บำรุงใบและความสมบูรณ์ของต้น", category: "ปุ๋ยทางใบ", details: ["ใช้ตามอัตราฉลาก", "พ่นให้เปียกทั่วใบแต่ไม่ไหลหยดมาก", "ควรพ่นช่วงอากาศเย็น"] },
  { name: "EM-PO", use: "หัวเชื้อจุลินทรีย์ ปรับสภาพดินและบำรุงพืช", category: "จุลินทรีย์", details: ["ใช้ตามวิธีขยายหรือเจือจางบนฉลาก", "หลีกเลี่ยงการผสมกับสารฆ่าเชื้อที่รุนแรง", "เก็บในที่ร่มและไม่ร้อนจัด"] },
  { name: "Amigo", use: "ป้องกันและกำจัดโรคพืชจากเชื้อรา", category: "ป้องกันโรค", details: ["สูตรที่พบก่อนหน้าเป็น fosetyl-aluminium 80% WG", "ใช้ตามพืชและโรคที่ขึ้นทะเบียนบนฉลาก", "สวมอุปกรณ์ป้องกันและเว้นระยะเก็บเกี่ยวตามฉลาก"] },
  { name: "Megasol-K 0-0-50", use: "โพแทสเซียมสูง ช่วยคุณภาพ สี และน้ำหนักผล", category: "ปุ๋ยทางใบ", details: ["ใช้ตามอัตราฉลาก", "เหมาะช่วงพัฒนาคุณภาพผล", "พ่นเช้าหรือเย็น หลีกเลี่ยงแดดจัด"] },
  { name: "อะซีทามิพริด", use: "กำจัดเพลี้ยและแมลงปากดูด", category: "กำจัดแมลง", details: ["ใช้เฉพาะตามพืชและอัตราที่ระบุบนฉลากทะเบียน", "ไม่เพิ่มอัตราเอง", "สวมอุปกรณ์ป้องกันและเว้นระยะเก็บเกี่ยว"] },
  { name: "TOLOS", use: "สารกำจัดแมลงสำหรับแมลงดูดกิน", category: "กำจัดแมลง", details: ["ตรวจสารสำคัญและอัตราจากฉลากจริงก่อนใช้", "พ่นเช้าหรือเย็น", "หลีกเลี่ยงการผสมหลายชนิดโดยไม่ตรวจความเข้ากันได้"] },
  { name: "พาราดอน", use: "ใช้ควบคุมมดและแมลงรบกวน", category: "กำจัดมด", details: ["ใช้เฉพาะตามฉลากผลิตภัณฑ์", "วางหรือใช้ในตำแหน่งที่เด็กและสัตว์เลี้ยงเข้าถึงไม่ได้", "ห้ามใช้ปะปนกับอาหารหรือภาชนะอาหาร"] },
];

export default function GardenPage() {
  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(180deg,#f4fff5 0%,#fffdf5 100%)',padding:'28px 16px 48px',fontFamily:'system-ui,-apple-system,Segoe UI,Tahoma,sans-serif',color:'#17351f'}}>
      <div style={{maxWidth:1180,margin:'0 auto'}}>
        <header style={{background:'#ffffff',borderRadius:24,padding:'24px 22px',boxShadow:'0 10px 30px rgba(23,53,31,.08)',marginBottom:22}}>
          <div style={{fontSize:14,fontWeight:800,color:'#45834f',letterSpacing:.3}}>สวนตุลากาวา</div>
          <h1 style={{margin:'6px 0 8px',fontSize:'clamp(28px,5vw,46px)',lineHeight:1.1}}>คู่มือปุ๋ยและสารดูแลฝรั่ง</h1>
          <p style={{margin:0,color:'#57705d',fontSize:16}}>แตะที่การ์ดเพื่อดูข้อมูลเพิ่มเติม • หน้าการ์ดแสดงสั้น ๆ ว่า “คืออะไร / ใช้ทำอะไร”</p>
          <a href="/" style={{display:'inline-block',marginTop:14,textDecoration:'none',background:'#eaf7ec',color:'#245a2e',padding:'10px 14px',borderRadius:999,fontWeight:800}}>← กลับหน้าหลัก</a>
        </header>

        <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
          {items.map((item, index) => (
            <details key={item.name} style={{background:'#fff',borderRadius:20,overflow:'hidden',boxShadow:'0 8px 24px rgba(23,53,31,.08)',border:'1px solid #e6f1e7'}}>
              <summary style={{listStyle:'none',cursor:'pointer',padding:0}}>
                <div style={{height:170,background:index%3===0?'linear-gradient(135deg,#dff6d7,#fff1a8)':index%3===1?'linear-gradient(135deg,#d7f4f6,#e9defa)':'linear-gradient(135deg,#ffe0c2,#f6f0d7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:58}}>
                  {item.category.includes('ปุ๋ย')?'🌿':item.category.includes('แมลง')||item.category.includes('มด')?'🛡️':'🍃'}
                </div>
                <div style={{padding:'16px 16px 18px'}}>
                  <div style={{fontSize:12,fontWeight:900,color:'#5e8a64',textTransform:'uppercase'}}>{item.category}</div>
                  <h2 style={{fontSize:20,margin:'5px 0 7px',lineHeight:1.25}}>{item.name}</h2>
                  <p style={{margin:0,color:'#536a58',lineHeight:1.5}}>{item.use}</p>
                  <div style={{marginTop:12,fontWeight:800,color:'#2e7139'}}>กดดูรายละเอียด ▾</div>
                </div>
              </summary>
              <div style={{borderTop:'1px solid #edf3ee',padding:'0 16px 18px'}}>
                <h3 style={{fontSize:15,margin:'14px 0 8px'}}>วิธีใช้ / ข้อควรระวัง</h3>
                <ul style={{paddingLeft:20,margin:0,color:'#405647',lineHeight:1.6}}>
                  {item.details.map(d => <li key={d}>{d}</li>)}
                </ul>
              </div>
            </details>
          ))}
        </section>

        <footer style={{marginTop:24,background:'#fff7dd',border:'1px solid #f2e1a3',borderRadius:18,padding:'14px 16px',color:'#705d22',lineHeight:1.5}}>
          ข้อมูลหน้านี้ใช้เป็นคู่มือช่วยจำเบื้องต้น การใช้สารกำจัดศัตรูพืชให้ยึดฉลากทะเบียนของผลิตภัณฑ์จริงเป็นหลัก โดยเฉพาะอัตราใช้ พืชเป้าหมาย ศัตรูพืช และระยะเว้นเก็บเกี่ยว
        </footer>
      </div>
    </main>
  );
}
