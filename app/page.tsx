"use client";

import {
  Bell, BookOpen, CalendarDays, ChartNoAxesCombined, ChevronRight, CircleCheckBig,
  ClipboardCheck, Clock3, FileCheck2, FilePlus2, FileSearch2, FolderKanban,
  Home, Landmark, Mail, Menu, Search, ShieldCheck, UserRound,
  WalletCards, X, type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const inventoryUrl = "https://inventory-mwjjut.v2.appdeploy.ai/";
const budgetUrl = "https://2570-8iw897.v2.appdeploy.ai/#budget";
const ucUrl = "https://2570-8iw897.v2.appdeploy.ai/#uc";
const planUrl = "https://2570-8iw897.v2.appdeploy.ai/#plan";
const hrUrl = "https://uttaradit-procurement-hr.manoosaki65.deno.net/";

type ModuleItem = { title: string; subtitle: string; icon: LucideIcon; tone: string; href?: string; primary?: boolean; fund?: boolean; menuOnly?: boolean };
const modules: ModuleItem[] = [
  { title: "ทะเบียนรับ Inventory", subtitle: "รับเอกสาร / ลงทะเบียน", icon: FilePlus2, tone: "blue", href: inventoryUrl, primary: true },
  { title: "เงินงบประมาณ", subtitle: "ติดตามงบลงทุนและการจัดซื้อจัดจ้าง", icon: Landmark, tone: "indigo", href: budgetUrl, fund: true },
  { title: "งบค่าเสื่อม (UC)", subtitle: "ติดตามรายการจัดซื้อจากงบค่าเสื่อม", icon: WalletCards, tone: "green", href: ucUrl, fund: true },
  { title: "แผนเงินบำรุง", subtitle: "แผนจัดซื้อครุภัณฑ์แยกตามปีงบประมาณ", icon: ClipboardCheck, tone: "orange", href: planUrl, fund: true },
  { title: "ติดตามสัญญา", subtitle: "สัญญาและสถานะงาน", icon: FileCheck2, tone: "pink", href: "https://tula-contract-guarantee-2569.manoosaki65.chatgpt.site/" },
  { title: "ว804", subtitle: "ระบบทดสอบ — แยกจากทะเบียนจริง", href: "https://uttaradit-w804-register.onrender.com/", icon: WalletCards, tone: "green" },
  { title: "หนังสือตรวจสอบ / Inspection", subtitle: "หนังสือขอความร่วมมือตรวจสอบ", href: "https://project-r3a4.hatchable.site/inspection/", icon: FileSearch2, tone: "orange" },
  { title: "คืนหลักประกัน", subtitle: "ค้นสัญญา / จัดทำหนังสือคืนหลักประกัน", icon: ShieldCheck, tone: "purple", href: "https://project-r3a4.hatchable.site/" },
  { title: "ขอ / เบิก OT", subtitle: "บันทึกงานล่วงเวลา", icon: Clock3, tone: "rose", href: "https://uttaradit-ot.pages.dev/" },
  { title: "งานเดินแฟ้ม", subtitle: "ติดตามเอกสารประจำวัน", icon: FolderKanban, tone: "cyan", href: "https://project-lh6o.hatchable.site/" },
  { title: "P4P / รายงานผลงาน", subtitle: "รายงานและระบบ P4P", icon: ChartNoAxesCombined, tone: "sky", href: "https://uttaradit-p4p.manoosaki65.deno.net/" },
  { title: "HR Master / บุคลากร", subtitle: "ทะเบียนบุคลากรและลายเซ็นเจ้าหน้าที่", icon: UserRound, tone: "indigo", href: hrUrl },
  { title: "ทะเบียนส่งจดหมาย / BMS", subtitle: "ทะเบียนจดหมาย / พิมพ์ซอง", href: "https://bms.hatchable.site/", icon: Mail, tone: "violet" },
  { title: "รายงานการประชุม", subtitle: "ปฏิทินประชุม / รายงานและไฟล์แนบ", icon: CalendarDays, tone: "blue", href: "https://uttaradit-meeting-report.manoosaki65.workers.dev/" },
  { title: "รายงานความเสี่ยง / HA", subtitle: "ทบทวนความเสี่ยงและเอกสารคุณภาพ", icon: ShieldCheck, tone: "orange", href: "https://uttaradit-risk-report.manoosaki65.workers.dev/" },
  { title: "ข่าวพัสดุและ AI", subtitle: "Smart Procurement News", icon: BookOpen, tone: "indigo", href: "https://smart-procurement.hatchable.site/" },
  { title: "รับสัญญา / ทำสันแฟ้ม", subtitle: "ระบบทดสอบ — ยังไม่อ่าน PDF จริง", icon: FilePlus2, tone: "pink", href: "https://app-ce706q.v2.appdeploy.ai/" },
  { title: "ทะเบียนเลขประกาศจังหวัด", subtitle: "เปิดทะเบียนเลขประกาศจังหวัด", icon: FileCheck2, tone: "sky", href: "https://uttaradit-announcement-register.onrender.com/", menuOnly: true },
  { title: "ออกเลขที่สัญญาจังหวัด", subtitle: "เปิดทะเบียนออกเลขที่สัญญาจังหวัด", icon: FileCheck2, tone: "sky", href: "https://uttaradit-contract-number.manoosaki65.workers.dev/", menuOnly: true },
  { title: "รูปติดประกาศหน้าอาคารพัสดุ", subtitle: "ค้นหาและดาวน์โหลดหลักฐานการติดประกาศ", icon: FileSearch2, tone: "violet", href: "/posting", menuOnly: true },
];

const sidebarItems: Array<{ label: string; icon: LucideIcon; href?: string }> = [
  { label: "หน้าหลัก", icon: Home, href: "#home" }, ...modules.map(({ title, icon, href }) => ({ label: title, icon, href })),
  { label: "ปฏิทินงาน", icon: CalendarDays, href: "#calendar" }, { label: "คลังความรู้", icon: BookOpen },
];
const systemRows = modules.filter((item) => item.href && !item.menuOnly).map((item) => ({
  title: item.title, detail: item.subtitle, href: item.href!,
  badge: item.href!.includes("hatchable.site") && !item.href!.includes("project-lh6o") || item.href!.includes("chatgpt.site") ? "เข้าสู่ระบบ" : item.subtitle.includes("ระบบทดสอบ") ? "ทดสอบ" : "เปิดระบบ",
}));

type NewsItem = { id: string; category: "procurement" | "ai"; title: string; summary: string; publishedAt: string; sourceUrl: string };
type PendingSystem = "announcement" | "contract";
type PendingStatus = { count: number | null; failed: boolean };
type Weather = { temperature: number; apparent: number; code: number; rain: number; precipitationProbability: number; todayMax: number; todayMin: number; nextHours: Array<{ time: string; temperature: number; precipitationProbability: number; code: number }> };
const pendingSystemFor = (href?: string): PendingSystem | null => href === "https://uttaradit-announcement-register.onrender.com/" ? "announcement" : href === "https://uttaradit-contract-number.manoosaki65.workers.dev/" ? "contract" : null;

function PendingBadge({ status }: { status: PendingStatus }) {
  if (status.count === null || status.count === 0) return null;
  return <span role="status" aria-label={`รอออกเลข ${status.count} รายการ`} style={{ position: "absolute", top: -7, right: -9, minWidth: 24, height: 24, padding: "0 6px", borderRadius: 999, background: "#dc2626", color: "white", fontSize: 13, fontWeight: 800, lineHeight: "20px", textAlign: "center", border: "2px solid white", boxShadow: "0 1px 4px #0002", zIndex: 1 }}>{status.count}</span>;
}

function weatherLabel(code: number) {
  if (code === 0) return { icon: "☀️", text: "ท้องฟ้าแจ่มใส" };
  if (code <= 2) return { icon: "🌤️", text: "มีเมฆบางส่วน" };
  if (code === 3) return { icon: "☁️", text: "เมฆมาก" };
  if (code === 45 || code === 48) return { icon: "🌫️", text: "มีหมอก" };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: "🌧️", text: "มีฝน" };
  if (code >= 95) return { icon: "⛈️", text: "ฝนฟ้าคะนอง" };
  return { icon: "🌦️", text: "สภาพอากาศแปรปรวน" };
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsError, setNewsError] = useState(false);
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [pending, setPending] = useState<Record<PendingSystem, PendingStatus>>({ announcement: { count: null, failed: false }, contract: { count: null, failed: false } });

  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    let disposed = false; const controllers = new Map<PendingSystem, AbortController>();
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      for (const system of ["announcement", "contract"] as const) {
        if (controllers.has(system)) continue; const controller = new AbortController(); controllers.set(system, controller);
        fetch(`/api/pending-count?system=${system}`, { cache: "no-store", signal: controller.signal })
          .then(async (response) => { if (!response.ok) throw new Error("Register unavailable"); const data = await response.json() as { system?: unknown; count?: unknown }; if (data.system !== system || typeof data.count !== "number" || !Number.isSafeInteger(data.count) || data.count < 0) throw new Error("Invalid count"); if (!disposed) setPending((p) => ({ ...p, [system]: { count: data.count as number, failed: false } })); })
          .catch((error) => { if (!disposed && error.name !== "AbortError") setPending((p) => ({ ...p, [system]: { ...p[system], failed: true } })); })
          .finally(() => controllers.delete(system));
      }
    };
    refresh(); const timer = window.setInterval(refresh, 15000); window.addEventListener("focus", refresh); document.addEventListener("visibilitychange", refresh);
    return () => { disposed = true; window.clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); controllers.forEach((c) => c.abort()); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/news", { signal: controller.signal }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }).then((data) => { const feed = data as { items?: NewsItem[] }; if (!Array.isArray(feed.items)) throw new Error(); setNews(feed.items.filter((i) => typeof i.sourceUrl === "string" && i.sourceUrl.startsWith("https://"))); }).catch((e) => { if (e.name !== "AbortError") setNewsError(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadWeather = () => {
      const url = "https://api.open-meteo.com/v1/forecast?latitude=17.6200&longitude=100.0993&current=temperature_2m,apparent_temperature,weather_code,rain,precipitation_probability&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FBangkok&forecast_days=2";
      fetch(url, { cache: "no-store", signal: controller.signal }).then((r) => { if (!r.ok) throw new Error(); return r.json(); }).then((data) => {
        const currentTime = new Date(data.current.time).getTime();
        const hourly = (data.hourly.time as string[]).map((time, index) => ({ time, temperature: data.hourly.temperature_2m[index], precipitationProbability: data.hourly.precipitation_probability[index], code: data.hourly.weather_code[index] })).filter((x) => new Date(x.time).getTime() >= currentTime).slice(0, 6);
        setWeather({ temperature: data.current.temperature_2m, apparent: data.current.apparent_temperature, code: data.current.weather_code, rain: data.current.rain, precipitationProbability: data.current.precipitation_probability, todayMax: data.daily.temperature_2m_max[0], todayMin: data.daily.temperature_2m_min[0], nextHours: hourly });
        setWeatherError(false);
      }).catch((e) => { if (e.name !== "AbortError") setWeatherError(true); });
    };
    loadWeather(); const timer = window.setInterval(loadWeather, 10 * 60 * 1000); return () => { window.clearInterval(timer); controller.abort(); };
  }, []);

  const today = useMemo(() => new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now), [now]);
  const timeNow = useMemo(() => new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now), [now]);
  const visibleModules = useMemo(() => { const keyword = query.trim().toLocaleLowerCase("th"); return keyword ? modules.filter((item) => `${item.title} ${item.subtitle}`.toLocaleLowerCase("th").includes(keyword)) : modules; }, [query]);
  const weatherNow = weather ? weatherLabel(weather.code) : null;

  return <div className="app-shell" id="home">
    <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`} aria-label="เมนูหลัก">
      <a className="hospital-seal" href="#home" aria-label="หน้าหลัก ระบบงานพัสดุ" onClick={() => setMenuOpen(false)}><span className="ministry-emblem" role="img" aria-label="ตรางูพันคบเพลิง กระทรวงสาธารณสุข ตามแบบที่ออกแบบไว้" /></a>
      <button className="sidebar-close" onClick={() => setMenuOpen(false)} aria-label="ปิดเมนู"><X size={22} /></button>
      <nav className="nav-list">{sidebarItems.map((item, index) => { const Icon = item.icon; const system = pendingSystemFor(item.href); const inner = <>{system ? <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}><Icon size={20} /><PendingBadge status={pending[system]} /></span> : <Icon size={20} />}<span>{item.label}</span>{!item.href && <small>เร็ว ๆ นี้</small>}</>; return item.href ? <a className={`nav-item ${index === 0 ? "active" : ""} ${index === 1 ? "inventory-nav" : ""}`} href={item.href} target={item.href.startsWith("https://") ? "_blank" : undefined} rel={item.href.startsWith("https://") ? "noopener noreferrer" : undefined} key={item.label} onClick={() => setMenuOpen(false)}>{inner}</a> : <span className="nav-item nav-disabled" key={item.label} aria-disabled="true">{inner}</span>; })}</nav>
      <div className="sidebar-signature">Manoosaki 69</div>
    </aside>
    {menuOpen && <button className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-label="ปิดเมนู" />}
    <main className="main-area">
      <header className="topbar">
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="เปิดเมนู" aria-expanded={menuOpen}><Menu size={23} /></button>
        <span className="ministry-emblem mobile-seal" role="img" aria-label="ตรางูพันคบเพลิง กระทรวงสาธารณสุข" />
        <div className="hospital-title"><div><h1>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์</h1><p>Uttaradit Hospital Procurement System</p><strong>“พัสดุคุ้มค่า • ราคามาตรฐาน • บริการด้วยใจ • ทันสมัยด้วยเทคโนโลยี”</strong></div></div>
        <div className="topbar-right"><div className="date-box"><span>{today}</span><small>{timeNow} น.</small></div><a className="top-icon" href="#quick-menu" aria-label="ค้นหาเมนู"><Search size={23} /></a><a className="top-icon notification" href="#notice-title" aria-label="ประกาศและแจ้งเตือน"><Bell size={23} /></a><div className="user-box"><span><UserRound size={24} /></span><div><strong>สวัสดีครับ</strong><small>กลุ่มงานพัสดุ</small></div></div></div>
      </header>

      <section className="hero-banner" aria-label="อาคารพัสดุและสภาพอากาศ" style={{ position: "relative" }}>
        <div className="hero-slide hero-original is-active" aria-hidden="false"><img src="https://uttaradit-procurement-hub.manoosaki65.chatgpt.site/procurement-home-design.jpg" alt="อาคารพัสดุ โรงพยาบาลอุตรดิตถ์" /><div className="mobile-hero-copy"><span>SMART PROCUREMENT</span><h2>อาคารพัสดุ โรงพยาบาลอุตรดิตถ์</h2></div></div>
        <div className="hero-weather-card" style={{ position: "absolute", zIndex: 5, right: 18, top: 18, width: "min(420px, calc(100% - 36px))", borderRadius: 20, padding: "14px 16px", background: "rgba(7,28,52,.78)", color: "white", backdropFilter: "blur(10px)", boxShadow: "0 8px 28px rgba(0,0,0,.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}><div><div style={{ fontSize: 13, opacity: .85 }}>อุตรดิตถ์ • อัปเดตอัตโนมัติ</div><div style={{ fontSize: 18, fontWeight: 800 }}>{today}</div><div style={{ fontSize: 26, fontWeight: 900 }}>{timeNow} น.</div></div>{weatherNow && <div style={{ textAlign: "right" }}><div style={{ fontSize: 38 }}>{weatherNow.icon}</div><div style={{ fontSize: 30, fontWeight: 900 }}>{Math.round(weather!.temperature)}°C</div><div style={{ fontSize: 13 }}>{weatherNow.text}</div></div>}</div>
          {weather ? <><div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 9, fontSize: 12, opacity: .95 }}><span>รู้สึก {Math.round(weather.apparent)}°</span><span>สูงสุด {Math.round(weather.todayMax)}° / ต่ำสุด {Math.round(weather.todayMin)}°</span><span>โอกาสฝน {weather.precipitationProbability}%</span></div><div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(weather.nextHours.length, 6)}, 1fr)`, gap: 5, marginTop: 10 }}>{weather.nextHours.map((h) => { const w = weatherLabel(h.code); return <div key={h.time} style={{ textAlign: "center", background: "rgba(255,255,255,.11)", borderRadius: 10, padding: "6px 2px", fontSize: 11 }}><div>{new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" }).format(new Date(h.time))}</div><div style={{ fontSize: 18 }}>{w.icon}</div><strong>{Math.round(h.temperature)}°</strong><div>ฝน {h.precipitationProbability}%</div></div>; })}</div></> : <div style={{ marginTop: 8, fontSize: 13 }}>{weatherError ? "โหลดข้อมูลอากาศไม่สำเร็จ — ระบบจะลองใหม่อัตโนมัติ" : "กำลังโหลดสภาพอากาศ..."}</div>}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1460px] grid-cols-1 gap-3 px-[14px] pt-[10px] sm:grid-cols-2" aria-label="งานออกเลขจังหวัด">
        <a href="https://uttaradit-announcement-register.onrender.com/" target="_blank" rel="noopener noreferrer" className="group flex min-h-[108px] items-center gap-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-blue-100 px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="grid h-24 w-44 shrink-0 place-items-center overflow-hidden rounded-xl transition group-hover:scale-105 sm:h-28 sm:w-52" style={{ position: "relative" }}><img src="/มอเตอร์ไซค์_ออกเลขที่ประกาศ.png" alt="" className="h-full w-full object-cover" /><PendingBadge status={pending.announcement} /></span><span className="grid gap-1"><strong className="text-xl font-extrabold text-sky-950">ออกเลขที่ประกาศ</strong><small className="text-sm text-sky-700">ทะเบียนเลขประกาศจังหวัด</small></span><ChevronRight className="ml-auto shrink-0 text-sky-600" size={26} /></a>
        <a href="https://uttaradit-contract-number.manoosaki65.workers.dev/" target="_blank" rel="noopener noreferrer" className="group flex min-h-[108px] items-center gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-white via-emerald-50 to-teal-100 px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="grid h-24 w-44 shrink-0 place-items-center overflow-hidden rounded-xl transition group-hover:scale-105 sm:h-28 sm:w-52" style={{ position: "relative" }}><img src="/มอเตอร์ไซค์_ออกเลขที่สัญญา.png" alt="" className="h-full w-full object-cover" /><PendingBadge status={pending.contract} /></span><span className="grid gap-1"><strong className="text-xl font-extrabold text-emerald-950">ออกเลขที่สัญญา</strong><small className="text-sm text-emerald-700">ทะเบียนออกเลขที่สัญญาจังหวัด</small></span><ChevronRight className="ml-auto shrink-0 text-emerald-600" size={26} /></a>
      </section>

      <div className="dashboard-body">
        
        <section className="quick-panel" id="quick-menu" aria-labelledby="quick-title"><div className="panel-heading"><div><span className="heading-icon"><FolderKanban size={18} /></span><h2 id="quick-title">เมนูลัด <b>(Quick Menu)</b></h2></div><label className="menu-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาเมนู" aria-label="ค้นหาเมนู" /></label></div><p className="navigation-hint">แต่ละระบบเปิดในแท็บใหม่ — กลับมาเลือกงานอื่นได้ที่แท็บหน้าอาคารพัสดุ บางระบบต้องเข้าสู่ระบบด้วยบัญชีที่ได้รับสิทธิ์</p><div className="quick-grid">{visibleModules.map((item) => { const Icon = item.icon; const system = pendingSystemFor(item.href); const content = <><span className={`quick-icon ${item.tone}`} style={system ? { position: "relative" } : undefined}><Icon size={26} />{system && <PendingBadge status={pending[system]} />}</span><strong>{item.title}</strong><small>{item.subtitle}</small>{!item.href && <em>เร็ว ๆ นี้</em>}</>; return item.href ? <a className={`quick-card ${item.primary ? "primary" : ""} ${item.fund ? "fund-card" : ""}`} href={item.href} target="_blank" rel="noopener noreferrer" key={item.title}>{content}</a> : <div className="quick-card disabled" key={item.title} aria-disabled="true">{content}</div>; })}{visibleModules.length === 0 && <p className="empty-search">ไม่พบเมนูที่ค้นหา</p>}</div></section>
        <div className="content-grid">
          <section className="work-panel" aria-labelledby="work-title"><div className="panel-heading compact"><div><span className="heading-icon red"><Bell size={18} /></span><h2 id="work-title">ระบบงานพัสดุ</h2></div><a href={inventoryUrl} target="_blank" rel="noopener noreferrer">เปิด Inventory <ChevronRight size={16} /></a></div><div className="system-table" role="table" aria-label="สถานะระบบงานพัสดุ"><div className="system-row table-head" role="row"><span>ระบบ</span><span>รายละเอียด</span><span>สถานะ</span></div>{systemRows.map((row) => <a className="system-row" href={row.href} target="_blank" rel="noopener noreferrer" key={row.title} role="row"><strong>{row.title}</strong><span>{row.detail}</span><em>{row.badge}</em></a>)}</div></section>
          <aside className="side-panels"><section className="calendar-panel" id="calendar" aria-labelledby="calendar-title"><div className="panel-heading compact"><div><span className="heading-icon teal"><CalendarDays size={18} /></span><h2 id="calendar-title">ปฏิทินงานสำคัญ</h2></div></div><div className="calendar-empty"><CalendarDays size={28} /><div><strong>{today}</strong><span>{timeNow} น. • อุตรดิตถ์</span></div></div></section><section className="notice-panel" aria-labelledby="news-title"><div className="panel-heading compact"><div><span className="heading-icon"><BookOpen size={18} /></span><h2 id="news-title">ข่าวพัสดุและ AI</h2></div></div>{news.length ? <ul>{news.map((item) => <li key={item.id}><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{item.title}</a><p>{item.summary}</p></li>)}</ul> : <p className="navigation-hint">{newsError ? "โหลดข่าวไม่สำเร็จ กรุณาเปิดหน้าข่าวเดิม" : "ยังไม่มีสรุปข่าวรายวันเชื่อมเข้าหน้านี้"}</p>}<p className="navigation-hint"><a href="https://smart-procurement.hatchable.site/" target="_blank" rel="noopener noreferrer">เปิดหน้าข่าว Smart Procurement ↗</a></p></section><section className="notice-panel" aria-labelledby="notice-title"><div className="panel-heading compact"><div><span className="heading-icon orange"><Bell size={18} /></span><h2 id="notice-title">ประกาศ / แจ้งเตือน</h2></div></div><ul><li className="ok">OT เปิดใช้งานผ่านระบบใหม่บน Cloudflare</li><li className="wait">แผนเงินบำรุง: อยู่ระหว่างปรับการเลื่อนตารางและ Export</li><li className="ok">เชื่อม ว804 และรายงานการประชุมแล้ว</li><li className="ok">เชื่อมงานเดินแฟ้มและทะเบียนจดหมาย BMS แล้ว</li></ul></section></aside>
        </div>
      </div>
      <footer><span>Uttaradit Hospital Procurement System</span><span>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์</span></footer>
    </main>
  </div>;
}
