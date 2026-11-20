"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bot, BookOpen, Building2, CheckCircle2, ClipboardList, ExternalLink, FileText, Phone, Printer, Save, Search, ShoppingBag, UserRound, UsersRound } from "lucide-react";

type Staff = { name: string; position: string; workplace: string };
type Draft = {
  requester: string; department: string; fund: string; planGroup: string; planNumber: string;
  item: string; budget: string; quantity: string; spec: string;
  specName: string; specPosition: string; specWorkplace: string;
  acceptName: string; acceptPosition: string; acceptWorkplace: string; phone: string; supplier: string;
};
const INITIAL: Draft = {
  requester: "", department: "", fund: "เงินบำรุง", planGroup: "", planNumber: "",
  item: "", budget: "", quantity: "1", spec: "", specName: "", specPosition: "", specWorkplace: "",
  acceptName: "", acceptPosition: "", acceptWorkplace: "", phone: "", supplier: "",
};
function norm(v: string) { return v.toLocaleLowerCase("th").replace(/\s+/g, ""); }
const input = "w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[15px] text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const label = "mb-1.5 block text-sm font-semibold text-slate-700";
const block = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
function Field({ title, children }: { title: string; children: React.ReactNode }) {
  return <label className="block min-w-0"><span className={label}>{title}</span>{children}</label>;
}
export default function RequirementsPage() {
  const [d, setD] = useState<Draft>(INITIAL);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffStatus, setStaffStatus] = useState("กำลังโหลดรายชื่อบุคลากร");
  const [staffQuery, setStaffQuery] = useState("");
  const [staffRole, setStaffRole] = useState<"spec" | "accept">("spec");
  const [notice, setNotice] = useState("");
  const [showHints, setShowHints] = useState(false);
  useEffect(() => {
    let active = true;
    try { const stored = localStorage.getItem("utt-req-test-v1"); if (stored) {
      const parsed = JSON.parse(stored) as Partial<Draft>;
      if (active) setD({ ...INITIAL, ...Object.fromEntries(Object.entries(parsed).filter(([key, value]) => key in INITIAL && typeof value === "string")) });
    }} catch { /* Ignore invalid local drafts. */ }
    fetch("/personnel-2570-directory.json").then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: unknown) => {
        if (!active) return;
        if (!Array.isArray(data)) throw new Error();
        const records = data.filter((v): v is Staff => !!v && typeof v.name === "string" && typeof v.position === "string" && typeof v.workplace === "string");
        setStaff(records); setStaffStatus("ค้นหารายชื่อบุคลากร " + records.length.toLocaleString("th-TH") + " คน");
      }).catch(() => { if (active) setStaffStatus("โหลดฐานบุคลากรไม่สำเร็จ ลองรีเฟรชหน้าเว็บ"); });
    return () => { active = false; };
  }, []);
  function setField(key: keyof Draft, value: string) { setD(old => ({ ...old, [key]: value })); setNotice(""); }
  const staffMatches = useMemo(() => {
    const q = norm(staffQuery.trim());
    return q ? staff.filter(s => norm(s.name + s.position + s.workplace).includes(q)).slice(0, 12) : [];
  }, [staff, staffQuery]);
  function selectStaff(s: Staff) {
    setD(old => staffRole === "spec"
      ? { ...old, specName: s.name, specPosition: s.position, specWorkplace: s.workplace }
      : { ...old, acceptName: s.name, acceptPosition: s.position, acceptWorkplace: s.workplace });
    setStaffQuery(""); setNotice("เลือกรายชื่อแล้ว กรุณาตรวจสอบตำแหน่งและหน่วยงานก่อนพิมพ์");
  }
  const inquiry = d.item.trim() || "ชื่อครุภัณฑ์";
  const shopUrl = "https://www.google.com/search?q=" + encodeURIComponent(inquiry + " จำหน่าย อุตรดิตถ์ เบอร์โทร ร้าน");
  const specUrl = "https://www.google.com/search?q=" + encodeURIComponent(inquiry + " คุณลักษณะเฉพาะ ราคามาตรฐาน สำนักงบประมาณ");
  function save() { try { localStorage.setItem("utt-req-test-v1", JSON.stringify(d)); setNotice("บันทึกฉบับร่างในเบราว์เซอร์เครื่องนี้แล้ว"); } catch { setNotice("ไม่สามารถบันทึกในเบราว์เซอร์นี้ได้"); } }
  const money = Number(d.budget.replace(/,/g, ""));
  return <div className="min-h-screen bg-[#edf5fb] text-slate-800">
    <style>{ "@media print{.req-no-print{display:none!important}.req-print{display:block!important}.req-page{box-shadow:none!important;border:0!important;margin:0!important;padding:15mm!important;max-width:none!important}body{background:white!important}}@page{size:A4;margin:0}.req-print{display:none}" }</style>
    <div className="req-no-print">
      <header className="bg-[#073d6c] text-white">
        <div className="mx-auto flex max-w-[1260px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"><ArrowLeft size={17} /> กลับหน้าแรกงานพัสดุ</a>
          <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">โหมดทดสอบส่วนตัว · ยังไม่ส่งข้อมูลเข้าทะเบียนจริง</span>
        </div>
      </header>
      <section className="bg-gradient-to-br from-[#073d6c] via-[#075e95] to-[#1a8baa] px-4 pb-9 pt-7 text-white">
        <div className="mx-auto max-w-[1260px]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><Bot size={16} /> SMART PROCUREMENT ASSISTANT · ทดลอง</span>
          <h1 className="mt-3 text-2xl font-bold sm:text-4xl">ความต้องการพัสดุ</h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-50 sm:text-base">บอกสิ่งที่ต้องการ ค้นแผนและเอกสารอ้างอิง เลือกผู้กำหนดสเปกและผู้ตรวจรับ แล้วตรวจร่างก่อนพิมพ์</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {["1 · แจ้งความต้องการ", "2 · สเปก / ราคามาตรฐาน", "3 · บุคลากร / กรรมการ", "4 · ผู้ค้า / พิมพ์"].map(s => <span key={s} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2">{s}</span>)}
          </div>
        </div>
      </section>
      <main className="mx-auto -mt-5 grid max-w-[1260px] items-start gap-4 px-4 pb-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
        <div className="grid gap-4">
          <section className={block}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#07558b]"><ClipboardList size={21}/> 1. แจ้งความต้องการของหน่วยงาน</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field title="ชื่อผู้แจ้ง"><input className={input} value={d.requester} onChange={e => setField("requester",e.target.value)} placeholder="พิมพ์ชื่อผู้แจ้ง"/></Field>
              <Field title="หน่วยงาน"><input className={input} value={d.department} onChange={e => setField("department",e.target.value)} placeholder="เช่น กลุ่มงานวิสัญญีวิทยา"/></Field>
              <Field title="แหล่งเงิน"><select className={input} value={d.fund} onChange={e=>setField("fund",e.target.value)}><option>เงินบำรุง</option><option>งบลงทุน</option><option>งบค่าเสื่อม (UC)</option><option>เงินบริจาค</option><option>อื่น ๆ</option></select></Field>
              <Field title="หมวด / ประเภทแผน"><input className={input} value={d.planGroup} onChange={e => setField("planGroup",e.target.value)} placeholder="เช่น ครุภัณฑ์ทั่วไปต่ำกว่าแสน"/></Field>
              <Field title="ลำดับรายการในแผน"><input className={input} value={d.planNumber} onChange={e=>setField("planNumber",e.target.value)} placeholder="เช่น 39"/></Field>
              <Field title="วงเงินที่ได้รับ (บาท)"><input type="number" min="0" className={input} value={d.budget} onChange={e=>setField("budget",e.target.value)} placeholder="10000"/></Field>
              <Field title="ชื่อพัสดุ / งานจ้าง"><input className={input} value={d.item} onChange={e=>setField("item",e.target.value)} placeholder="เช่น ตู้เย็น 2 ประตู"/></Field>
              <Field title="จำนวน"><input type="number" min="1" className={input} value={d.quantity} onChange={e=>setField("quantity",e.target.value)}/></Field>
            </div>
            <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">ช่วงทดสอบ: กรอกเลขรายการและชื่อพัสดุจากแผนเองก่อน ระบบยังไม่ได้จับคู่ Excel ทั้งเล่มอัตโนมัติ <a href="https://2570-8iw897.v2.appdeploy.ai/#plan" target="_blank" rel="noopener noreferrer" className="font-bold underline">เปิดดูแผนเงินบำรุงเดิม</a></p>
          </section>
          <section className={block}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#07558b]"><BookOpen size={21}/> 2. สเปก / TOR และแหล่งอ้างอิง</h2>
            <div className="mb-3 flex flex-wrap gap-2">
              <a href={specUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-200"><Search size={16}/> ค้นสเปก / ราคามาตรฐานในเว็บ <ExternalLink size={14}/></a>
              <a href="https://2570-8iw897.v2.appdeploy.ai/#plan" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold hover:bg-slate-200"><FileText size={16}/> เปิดแผนจัดซื้อ</a>
            </div>
            <Field title="รายละเอียดคุณลักษณะเฉพาะที่เลือก / ร่างสเปก">
              <textarea className={input + " min-h-[140px] resize-y"} value={d.spec} onChange={e=>setField("spec",e.target.value)} placeholder="ระบุสเปกที่ต้องการโดยอ้างอิงเอกสาร / ระบุช่วงคุณลักษณะที่ไม่ล็อกยี่ห้อ"/>
            </Field>
            <p className="mt-2 text-xs text-slate-500">ผลค้นเว็บเป็นแหล่งเริ่มต้น ต้องตรวจมาตรฐาน ราคาอ้างอิง และความเป็นกลางของสเปกก่อนใช้จริง</p>
          </section>
          <section className={block}>
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-[#07558b]"><UsersRound size={21}/> 3. ผู้กำหนดสเปกและผู้ตรวจรับ</h2>
            <p className="mb-3 text-xs text-slate-600">{staffStatus} · ฐานแสดงเฉพาะชื่อ ตำแหน่ง และหน่วยงาน</p>
            <div className="mb-3 flex flex-wrap gap-2">
              <button type="button" onClick={()=>setStaffRole("spec")} className={staffRole==="spec"?"rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white":"rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700"}>เลือกผู้กำหนดสเปก</button>
              <button type="button" onClick={()=>setStaffRole("accept")} className={staffRole==="accept"?"rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white":"rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700"}>เลือกผู้ตรวจรับ</button>
            </div>
            <div className="relative mb-4"><Search size={17} className="absolute left-3 top-3.5 text-slate-400"/><input className={input + " pl-9"} value={staffQuery} onChange={e=>setStaffQuery(e.target.value)} placeholder="ค้นชื่อ ตำแหน่ง หรือหน่วยงาน"/>{staffMatches.length>0 && <div className="absolute z-10 mt-1 max-h-[240px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">{staffMatches.map((s,i)=><button type="button" key={s.name+i} onClick={()=>selectStaff(s)} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-blue-50"><strong className="block text-sm">{s.name}</strong><small className="text-xs text-slate-600">{s.position} · {s.workplace}</small></button>)}</div>}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-blue-50 p-3"><strong className="text-sm text-blue-900">ผู้กำหนดสเปก</strong><p className="mt-1 text-sm">{d.specName||"ยังไม่เลือก"}</p><small className="text-slate-600">{d.specPosition} {d.specWorkplace}</small></div>
              <div className="rounded-xl bg-emerald-50 p-3"><strong className="text-sm text-emerald-900">ผู้ตรวจรับ</strong><p className="mt-1 text-sm">{d.acceptName||"ยังไม่เลือก"}</p><small className="text-slate-600">{d.acceptPosition} {d.acceptWorkplace}</small></div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field title="เบอร์โทรหน่วยงาน (กรอกหรือยืนยันก่อนพิมพ์)"><input className={input} value={d.phone} onChange={e=>setField("phone",e.target.value)} placeholder="เช่น 1171"/></Field>
              <div className="flex items-end"><a href="/telephone/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold hover:bg-slate-200"><Phone size={16}/> ค้นสมุดโทรศัพท์ภายใน</a></div>
            </div>
            {Number.isFinite(money)&&money>100000&&<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">วงเงินเกิน 100,000 บาท: โปรดตรวจแบบฟอร์มและจำนวนกรรมการตามประเภทงานและหลักเกณฑ์ที่ใช้จริง ขณะนี้เป็นเพียงหน้าเลือกชื่อเพื่อทดลอง</p>}
          </section>
          <section className={block}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#07558b]"><ShoppingBag size={21}/> 4. ผู้ค้า / ร้านในจังหวัดอุตรดิตถ์</h2>
            <div className="mb-3 flex flex-wrap gap-2"><a href={shopUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-200"><Search size={16}/> ค้นร้านค้าในอุตรดิตถ์ <ExternalLink size={14}/></a></div>
            <Field title="ร้านค้า / ผู้ติดต่อ / ช่องทางติดต่อ"><textarea className={input+" min-h-[85px]"} value={d.supplier} onChange={e=>setField("supplier",e.target.value)} placeholder="กรอกชื่อร้านค้าและเบอร์ติดต่อที่ตรวจสอบพบ หรือระบุว่าให้พัสดุช่วยติดต่อ"/></Field>
            <p className="mt-2 text-xs text-slate-500">ยังไม่ส่งข้อความหรือขอใบเสนอราคากับผู้ค้าจริง ระบบจะไม่ติดต่อบริษัทโดยอัตโนมัติ</p>
          </section>
          <section className={block}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#07558b]"><Printer size={21}/> 5. ตรวจสอบและพิมพ์ร่าง</h2>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-[#075e9f] px-4 py-3 text-sm font-bold text-white hover:bg-blue-800"><Save size={18}/> บันทึกร่างในเครื่อง</button><button type="button" onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"><Printer size={18}/> พิมพ์ / บันทึก PDF</button></div>
            {notice&&<p role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-900"><CheckCircle2 size={16} className="mr-2 inline"/>{notice}</p>}
          </section>
        </div>
        <aside className="sticky top-3 grid gap-4">
          <section className={block}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-[#07558b]"><Bot size={22}/> ผู้ช่วยงานพัสดุ</h2>
            <div className="rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
              <strong className="text-blue-900">กำลังช่วยเตรียมคำขอ</strong>
              <p className="mt-2">ต้องการ: {d.item||"ยังไม่ได้ระบุพัสดุ"}</p>
              <p>แผน: {d.fund} {d.planGroup} {d.planNumber&&"ลำดับ "+d.planNumber}</p>
              <p>วงเงิน: {d.budget?Number(d.budget).toLocaleString("th-TH")+" บาท":"ยังไม่ได้ระบุ"}</p>
              <p className="mt-2">ลองค้นสเปกมาตรฐานและผู้ค้า แล้วนำข้อมูลที่ตรวจสอบแล้วมาใส่ช่องทางซ้ายได้เลย</p>
            </div>
            <button type="button" onClick={()=>setShowHints(!showHints)} className="mt-3 w-full rounded-xl border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50">{showHints?"ซ่อน":"แสดง"}คำถามช่วยกำหนดสเปก</button>
            {showHints&&<ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-slate-700"><li>ใช้ในหน่วยงานใดและต้องการจำนวนเท่าไร?</li><li>มีข้อกำหนดด้านขนาด ความจุ หรือระบบไฟฟ้าอะไรบ้าง?</li><li>มีราคามาตรฐานที่ต้องอ้างอิงหรือไม่?</li><li>ต้องการให้พัสดุติดต่อผู้ค้าให้หรือมีรายชื่อแล้ว?</li></ul>}
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"><strong>หมายเหตุ:</strong> นี่คือแบบฟอร์มโต้ตอบขั้นต้น ไม่ใช่ AI Agent เชื่อมอินเทอร์เน็ตอัตโนมัติ การค้นเว็บเปิดผลภายนอกให้เจ้าหน้าที่ตรวจเองก่อน</p>
          </section>
          <section className={block}><h3 className="mb-2 flex items-center gap-2 font-bold text-blue-900"><Building2 size={19}/> การใช้งานและข้อมูล</h3><p className="text-sm leading-relaxed text-slate-600">ต้นแบบนี้ใช้ทดสอบส่วนตัวก่อน ข้อมูลที่กรอกจะไม่ส่งไปทะเบียน Inventory หรือเริ่มกระบวนการจัดซื้อใด ๆ และการบันทึกร่างเก็บเฉพาะในเบราว์เซอร์เครื่องที่ใช้</p></section>
        </aside>
      </main>
    </div>
    <section className="req-print req-page mx-auto max-w-[210mm] bg-white text-black">
      <h1 className="mb-4 text-center text-xl font-bold">แบบบันทึกความต้องการพัสดุ (ฉบับร่างทดลอง)</h1>
      <p>ผู้แจ้ง: {d.requester||"...................................."} หน่วยงาน: {d.department||"...................................."}</p>
      <p>แหล่งเงิน: {d.fund} หมวดแผน: {d.planGroup||"-"} ลำดับ: {d.planNumber||"-"}</p>
      <p>รายการ: {d.item||"...................................."} จำนวน: {d.quantity||"-"}</p>
      <p>วงเงิน: {d.budget?Number(d.budget).toLocaleString("th-TH")+" บาท":"-"}</p>
      <h2 className="mt-6 font-bold">รายละเอียดคุณลักษณะเฉพาะ</h2><p className="whitespace-pre-wrap">{d.spec||"ยังไม่ได้ระบุ"}</p>
      <h2 className="mt-6 font-bold">รายชื่อผู้เกี่ยวข้อง</h2>
      <p>ผู้กำหนดสเปก: {d.specName||"-"} ตำแหน่ง {d.specPosition||"-"} หน่วยงาน {d.specWorkplace||"-"}</p>
      <p>ผู้ตรวจรับ: {d.acceptName||"-"} ตำแหน่ง {d.acceptPosition||"-"} หน่วยงาน {d.acceptWorkplace||"-"}</p>
      <p>เบอร์โทรหน่วยงาน: {d.phone||"-"}</p>
      <h2 className="mt-6 font-bold">ข้อมูลผู้ค้า</h2><p className="whitespace-pre-wrap">{d.supplier||"ยังไม่ได้ระบุ / ให้พัสดุดำเนินการ"}</p>
      <p className="mt-12 text-center text-sm">เอกสารฉบับร่างเพื่อทดลองระบบ — กรุณาตรวจสอบก่อนนำไปใช้ในการจัดซื้อจัดจ้างจริง</p>
    </section>
  </div>;
}
