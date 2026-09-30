"use client";

import {
  Bell,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  CircleCheckBig,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FilePlus2,
  FileSearch2,
  FolderKanban,
  Headphones,
  Home,
  Landmark,
  Mail,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const inventoryUrl = "https://inventory-mwjjut.v2.appdeploy.ai/";
const budgetUrl = "https://2570-8iw897.v2.appdeploy.ai/#budget";
const ucUrl = "https://2570-8iw897.v2.appdeploy.ai/#uc";
const planUrl = "https://2570-8iw897.v2.appdeploy.ai/#plan";

type ModuleItem = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: string;
  href?: string;
  primary?: boolean;
  fund?: boolean;
  menuOnly?: boolean;
};

const modules: ModuleItem[] = [
  { title: "ทะเบียนรับ Inventory", subtitle: "รับเอกสาร / ลงทะเบียน", icon: FilePlus2, tone: "blue", href: inventoryUrl, primary: true },
  { title: "เงินงบประมาณ", subtitle: "ติดตามงบลงทุนและการจัดซื้อจัดจ้าง", icon: Landmark, tone: "indigo", href: budgetUrl, fund: true },
  { title: "งบค่าเสื่อม (UC)", subtitle: "ติดตามรายการจัดซื้อจากงบค่าเสื่อม", icon: WalletCards, tone: "green", href: ucUrl, fund: true },
  { title: "แผนเงินบำรุง", subtitle: "แผนจัดซื้อครุภัณฑ์แยกตามปีงบประมาณ", icon: ClipboardCheck, tone: "orange", href: planUrl, fund: true },
  { title: "ติดตามสัญญา", subtitle: "สัญญาและสถานะงาน", icon: FileCheck2, tone: "pink", href: "https://tula-contract-guarantee-2569.manoosaki65.chatgpt.site/" },
  { title: "ว804", subtitle: "ระบบทดสอบ — แยกจากทะเบียนจริง", href: "https://w804-test-7lro75.v2.appdeploy.ai/", icon: WalletCards, tone: "green" },
  { title: "หนังสือตรวจสอบ / Inspection", subtitle: "หนังสือขอความร่วมมือตรวจสอบ", href: "https://project-r3a4.hatchable.site/inspection/", icon: FileSearch2, tone: "orange" },
  { title: "คืนหลักประกัน", subtitle: "ค้นสัญญา / จัดทำหนังสือคืนหลักประกัน", icon: ShieldCheck, tone: "purple", href: "https://project-r3a4.hatchable.site/" },
  { title: "ขอ / เบิก OT", subtitle: "บันทึกงานล่วงเวลา", icon: Clock3, tone: "rose", href: "https://uttaradit-ot.netlify.app/" },
  { title: "งานเดินแฟ้ม", subtitle: "ติดตามเอกสารประจำวัน", icon: FolderKanban, tone: "cyan", href: "https://project-lh6o.hatchable.site/" },
  { title: "P4P / รายงานผลงาน", subtitle: "รายงานและระบบ P4P", icon: ChartNoAxesCombined, tone: "sky", href: "https://uttaradit-p4p-demo-ytznqm.v2.appdeploy.ai/" },
  { title: "ทะเบียนส่งจดหมาย / BMS", subtitle: "ทะเบียนจดหมาย / พิมพ์ซอง", href: "https://bms.hatchable.site/", icon: Mail, tone: "violet" },
  { title: "รายงานการประชุม", subtitle: "ปฏิทินประชุม / รายงานและไฟล์แนบ", icon: CalendarDays, tone: "blue", href: "https://meeting-report.hatchable.site/" },
  { title: "รายงานความเสี่ยง / HA", subtitle: "ทบทวนความเสี่ยงและเอกสารคุณภาพ", icon: ShieldCheck, tone: "orange", href: "https://project-5h2m.hatchable.site/" },
  { title: "ข่าวพัสดุและ AI", subtitle: "Smart Procurement News", icon: BookOpen, tone: "indigo", href: "https://smart-procurement.hatchable.site/" },
  { title: "รับสัญญา / ทำสันแฟ้ม", subtitle: "ระบบทดสอบ — ยังไม่อ่าน PDF จริง", icon: FilePlus2, tone: "pink", href: "https://app-ce706q.v2.appdeploy.ai/" },
  { title: "ทะเบียนเลขประกาศจังหวัด", subtitle: "เปิดทะเบียนเลขประกาศจังหวัด", icon: FileCheck2, tone: "sky", href: "https://app-m7e6r6.v2.appdeploy.ai/", menuOnly: true },
  { title: "ออกเลขที่สัญญาจังหวัด", subtitle: "เปิดทะเบียนออกเลขที่สัญญาจังหวัด", icon: FileCheck2, tone: "sky", href: "https://project-auu7.hatchable.site/", menuOnly: true },
];

const sidebarItems: Array<{ label: string; icon: LucideIcon; href?: string }> = [
  { label: "หน้าหลัก", icon: Home, href: "#home" },
  ...modules.map(({ title, icon, href }) => ({ label: title, icon, href })),
  { label: "ปฏิทินงาน", icon: CalendarDays, href: "#calendar" },
  { label: "คลังความรู้", icon: BookOpen },
];

const systemRows = modules.filter((item) => item.href && !item.menuOnly).map((item) => ({
  title: item.title,
  detail: item.subtitle,
  href: item.href!,
  badge: item.href!.includes("hatchable.site") && !item.href!.includes("project-lh6o") || item.href!.includes("chatgpt.site") ? "เข้าสู่ระบบ" : item.subtitle.includes("ระบบทดสอบ") ? "ทดสอบ" : "เปิดระบบ",
}));

type NewsItem = { id: string; category: "procurement" | "ai"; title: string; summary: string; publishedAt: string; sourceUrl: string };

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [query, setQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsError, setNewsError] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroSlide((current) => (current + 1) % 3), 3000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/news", { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("News unavailable"); return response.json(); })
      .then((data) => {
        const feed = data as { items?: NewsItem[] };
        if (!Array.isArray(feed.items)) throw new Error("Invalid news feed");
        setNews(feed.items.filter((item) => typeof item.sourceUrl === "string" && item.sourceUrl.startsWith("https://")));
      })
      .catch((error) => { if (error.name !== "AbortError") setNewsError(true); });
    return () => controller.abort();
  }, []);

  const today = useMemo(() => new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date()), []);

  const visibleModules = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("th");
    if (!keyword) return modules;
    return modules.filter((item) => `${item.title} ${item.subtitle}`.toLocaleLowerCase("th").includes(keyword));
  }, [query]);

  return (
    <div className="app-shell" id="home">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`} aria-label="เมนูหลัก">
        <a className="hospital-seal" href="#home" aria-label="หน้าหลัก ระบบงานพัสดุ" onClick={() => setMenuOpen(false)}>
          <span className="ministry-emblem" role="img" aria-label="ตรางูพันคบเพลิง กระทรวงสาธารณสุข ตามแบบที่ออกแบบไว้" />
        </a>
        <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="ปิดเมนู"><X size={22} /></button>
        <nav className="nav-list">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const inner = <><Icon size={20} /><span>{item.label}</span>{!item.href && <small>เร็ว ๆ นี้</small>}</>;
            return item.href ? (
              <a className={`nav-item ${index === 0 ? "active" : ""} ${index === 1 ? "inventory-nav" : ""}`} href={item.href} target={item.href.startsWith("https://") ? "_blank" : undefined} rel={item.href.startsWith("https://") ? "noopener noreferrer" : undefined} key={item.label} onClick={() => setMenuOpen(false)}>{inner}</a>
            ) : <span className="nav-item nav-disabled" key={item.label} aria-disabled="true">{inner}</span>;
          })}
        </nav>
        <div className="sidebar-signature">Manoosaki 69</div>
      </aside>

      {menuOpen && <button className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-label="ปิดเมนู" />}

      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="เปิดเมนู" aria-expanded={menuOpen}><Menu size={23} /></button>
          <span className="ministry-emblem mobile-seal" role="img" aria-label="ตรางูพันคบเพลิง กระทรวงสาธารณสุข" />
          <div className="hospital-title"><div>
            <h1>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์</h1>
            <p>Uttaradit Hospital Procurement System</p>
            <strong>“พัสดุคุ้มค่า • ราคามาตรฐาน • บริการด้วยใจ • ทันสมัยด้วยเทคโนโลยี”</strong>
          </div></div>
          <div className="topbar-right">
            <div className="date-box"><span>{today}</span><small>ศูนย์รวมระบบงานพัสดุ</small></div>
            <a className="top-icon" href="#quick-menu" aria-label="ค้นหาเมนู"><Search size={23} /></a>
            <a className="top-icon notification" href="#notice-title" aria-label="ประกาศและแจ้งเตือน"><Bell size={23} /></a>
            <div className="user-box"><span><UserRound size={24} /></span><div><strong>สวัสดีครับ</strong><small>กลุ่มงานพัสดุ</small></div></div>
          </div>
        </header>

        <section className="hero-banner" aria-label="ประกาศกลุ่มงานพัสดุ" aria-roledescription="สไลด์">
          <div className={`hero-slide hero-original ${heroSlide === 0 ? "is-active" : ""}`} aria-hidden={heroSlide !== 0}>
            <img src="https://uttaradit-procurement-hub.manoosaki65.chatgpt.site/procurement-home-design.jpg" alt="อาคารพัสดุ โรงพยาบาลอุตรดิตถ์" />
            <div className="mobile-hero-copy"><span>SMART PROCUREMENT</span><h2>อาคารพัสดุ โรงพยาบาลอุตรดิตถ์</h2></div>
          </div>
          <div className={`hero-slide hero-welcome ${heroSlide === 1 ? "is-active" : ""}`} aria-hidden={heroSlide !== 1}>
            <img src="https://uttaradit-procurement-hub.manoosaki65.chatgpt.site/welcome-director-latest.jpg" alt="แบนเนอร์ยินดีต้อนรับนายแพทย์วรเชษฐ เต๋ชะรัก ผู้อำนวยการโรงพยาบาลอุตรดิตถ์" />
          </div>
          <div className={`hero-slide hero-p4p ${heroSlide === 2 ? "is-active" : ""}`} aria-hidden={heroSlide !== 2}>
            <div className="hero-message">
              <span className="hero-eyebrow">แจ้ง OT เดือนกันยายน 2569</span>
              <h2>แจ้งลง OT เดือนกันยายนได้ตั้งแต่วันนี้</h2>
              <p>สามารถเข้าไปบันทึก OT เดือนกันยายนได้แล้ว</p>
              <a href="https://uttaradit-ot.netlify.app/" target="_blank" rel="noopener noreferrer" tabIndex={heroSlide === 2 ? 0 : -1}>เปิดระบบ OT <ChevronRight size={18} /></a>
            </div>
          </div>
          <div className="hero-dots" role="group" aria-label="เลือกสไลด์ประกาศ">
            {["อาคารพัสดุ", "ยินดีต้อนรับผู้อำนวยการ", "แจ้งลง OT"].map((label, index) => (
              <button key={label} type="button" className={heroSlide === index ? "is-active" : ""} onClick={() => setHeroSlide(index)} aria-label={`สไลด์ ${index + 1}: ${label}`} aria-current={heroSlide === index ? "true" : undefined} />
            ))}
          </div>
        </section>

        <div className="dashboard-body">
          <section className="overview-strip" aria-label="ภาพรวมระบบ">
            <div className="overview-card blue"><span><FilePlus2 size={26} /></span><p><small>เมนูหลัก</small><strong>Inventory</strong><em>พร้อมใช้งาน</em></p></div>
            <div className="overview-card green"><span><FileCheck2 size={26} /></span><p><small>ประวัติเดิม</small><strong>3,857</strong><em>รายการ Master</em></p></div>
            <div className="overview-card violet"><span><CalendarDays size={26} /></span><p><small>งานปัจจุบัน</small><strong>10 ก.ย. 69</strong><em>เป็นต้นไป</em></p></div>
            <div className="overview-card amber"><span><CircleCheckBig size={26} /></span><p><small>การทำงาน</small><strong>ครบขั้นตอน</strong><em>นำเข้า–พิมพ์</em></p></div>
            <div className="overview-card cyan"><span><Headphones size={26} /></span><p><small>ศูนย์รวม</small><strong>หน้าเดียว</strong><em>พร้อมเพิ่มเมนู</em></p></div>
          </section>

          <section className="quick-panel" id="quick-menu" aria-labelledby="quick-title">
            <div className="panel-heading">
              <div><span className="heading-icon"><FolderKanban size={18} /></span><h2 id="quick-title">เมนูลัด <b>(Quick Menu)</b></h2></div>
              <label className="menu-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาเมนู" aria-label="ค้นหาเมนู" /></label>
            </div>
            <p className="navigation-hint">แต่ละระบบเปิดในแท็บใหม่ — กลับมาเลือกงานอื่นได้ที่แท็บหน้าอาคารพัสดุ บางระบบต้องเข้าสู่ระบบด้วยบัญชีที่ได้รับสิทธิ์</p>
            <div className="quick-grid">
              {visibleModules.map((item) => {
                const Icon = item.icon;
                const content = <><span className={`quick-icon ${item.tone}`}><Icon size={26} /></span><strong>{item.title}</strong><small>{item.subtitle}</small>{!item.href && <em>เร็ว ๆ นี้</em>}</>;
                return item.href ? (
                  <a className={`quick-card ${item.primary ? "primary" : ""} ${item.fund ? "fund-card" : ""}`} href={item.href} target="_blank" rel="noopener noreferrer" key={item.title}>{content}</a>
                ) : <div className="quick-card disabled" key={item.title} aria-disabled="true">{content}</div>;
              })}
              {visibleModules.length === 0 && <p className="empty-search">ไม่พบเมนูที่ค้นหา</p>}
            </div>
          </section>

          <div className="content-grid">
            <section className="work-panel" aria-labelledby="work-title">
              <div className="panel-heading compact"><div><span className="heading-icon red"><Bell size={18} /></span><h2 id="work-title">ระบบงานพัสดุ</h2></div><a href={inventoryUrl} target="_blank" rel="noopener noreferrer">เปิด Inventory <ChevronRight size={16} /></a></div>
              <div className="system-table" role="table" aria-label="สถานะระบบงานพัสดุ">
                <div className="system-row table-head" role="row"><span>ระบบ</span><span>รายละเอียด</span><span>สถานะ</span></div>
                {systemRows.map((row) => (
                  <a className="system-row" href={row.href} target="_blank" rel="noopener noreferrer" key={row.title} role="row"><strong>{row.title}</strong><span>{row.detail}</span><em>{row.badge}</em></a>
                ))}
              </div>
            </section>

            <aside className="side-panels">
              <section className="calendar-panel" id="calendar" aria-labelledby="calendar-title">
                <div className="panel-heading compact"><div><span className="heading-icon teal"><CalendarDays size={18} /></span><h2 id="calendar-title">ปฏิทินงานสำคัญ</h2></div></div>
                <div className="calendar-empty"><CalendarDays size={28} /><div><strong>{today}</strong><span>พื้นที่สำหรับเชื่อมปฏิทินงานในขั้นถัดไป</span></div></div>
              </section>
              <section className="notice-panel" aria-labelledby="news-title">
                <div className="panel-heading compact"><div><span className="heading-icon"><BookOpen size={18} /></span><h2 id="news-title">ข่าวพัสดุและ AI</h2></div></div>
                {news.length ? <ul>{news.map((item) => <li key={item.id}><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.title}</a><p>{item.summary}</p></li>)}</ul> : <p className="navigation-hint">{newsError ? "โหลดข่าวไม่สำเร็จ กรุณาเปิดหน้าข่าวเดิม" : "ยังไม่มีสรุปข่าวรายวันเชื่อมเข้าหน้านี้"}</p>}
                <p className="navigation-hint"><a href="https://smart-procurement.hatchable.site/" target="_blank" rel="noopener noreferrer">เปิดหน้าข่าว Smart Procurement ↗</a></p>
              </section>
              <section className="notice-panel" aria-labelledby="notice-title">
                <div className="panel-heading compact"><div><span className="heading-icon orange"><Bell size={18} /></span><h2 id="notice-title">ประกาศ / แจ้งเตือน</h2></div></div>
                <ul>
                  <li className="ok">OT เปิดที่ระบบเดิมของกลุ่มงานพัสดุ</li>
                  <li className="wait">แผนเงินบำรุง: อยู่ระหว่างปรับการเลื่อนตารางและ Export</li>
                  <li className="ok">เชื่อม ว804 และรายงานการประชุมแล้ว</li>
                  <li className="ok">เชื่อมงานเดินแฟ้มและทะเบียนจดหมาย BMS แล้ว</li>
                </ul>
              </section>
            </aside>
          </div>
        </div>

        <footer><span>Uttaradit Hospital Procurement System</span><span>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์</span></footer>
      </main>
    </div>
  );
}
