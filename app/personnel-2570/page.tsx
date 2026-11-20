"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Building2, CheckCircle2, Download, FileUp, Search,
  ShieldCheck, Trash2, UserRound, UsersRound, X
} from "lucide-react";
import styles from "./personnel.module.css";

type Staff = { name: string; position: string; workplace: string };
const STORAGE_KEY = "uttaradit_staff2570_private_local_v1";
const REQUIRED_COLUMNS = ["คำนำหน้า", "ชื่อ", "สกุล", "ตำแหน่ง", "หน่วยงาน (ปฏิบัติจริง)", "กลุ่มงาน"];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '"') {
      if (quoted && source[i + 1] === '"') { cell += '"'; i++; }
      else { quoted = !quoted; }
    } else if (!quoted && char === ",") {
      row.push(cell); cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && source[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
function safeField(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 190) : "";
}
function staffFromCsv(text: string): Staff[] {
  const rows = parseCsv(text);
  if (!rows.length) throw new Error("ไม่พบข้อมูลในไฟล์");
  const headers = rows[0].map((item) => safeField(item).replace(/^\uFEFF/, ""));
  for (const col of REQUIRED_COLUMNS) {
    if (!headers.includes(col)) throw new Error("ไฟล์นี้ไม่มีคอลัมน์ “" + col + "” กรุณาใช้ไฟล์บุคลากรปี 2570");
  }
  const indexes = REQUIRED_COLUMNS.map((col) => headers.indexOf(col));
  const records: Staff[] = [];
  for (const row of rows.slice(1)) {
    const [prefix, first, surname, position, actualUnit, group] =
      indexes.map((index) => safeField(row[index] ?? ""));
    if (!first || !surname || !position) continue;
    const name = [prefix + first, surname].filter(Boolean).join(" ");
    // Only these three fields leave the parser. No ID, DOB, employment number or dates are stored.
    records.push({ name, position, workplace: actualUnit || group || "ไม่ระบุหน่วยงาน" });
  }
  if (!records.length) throw new Error("ไฟล์ไม่มีรายชื่อที่อ่านได้");
  if (records.length > 10000) throw new Error("ไฟล์มีรายการมากกว่าขนาดที่รองรับ");
  return records;
}
function readSafeCache(value: unknown): Staff[] {
  if (!Array.isArray(value) || value.length > 10000) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") return null;
    const entry = item as Partial<Staff>;
    const name = safeField(entry.name);
    const position = safeField(entry.position);
    const workplace = safeField(entry.workplace);
    return name && position && workplace ? { name, position, workplace } : null;
  }).filter((item): item is Staff => item !== null);
}
function normalized(value: string): string {
  return value.toLocaleLowerCase("th").replace(/\s+/g, "").trim();
}
export default function Personnel2570() {
  const [records, setRecords] = useState<Staff[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [remember, setRemember] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const cache = window.localStorage.getItem(STORAGE_KEY);
      if (cache) {
        const data = readSafeCache(JSON.parse(cache));
        if (data.length) {
          setRecords(data);
          setRemember(true);
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch { /* Ignore inaccessible browser storage. */ }
    setLoaded(true);
  }, []);

  const workplaces = useMemo(() => Array.from(new Set(records.map((r) => r.workplace)))
    .sort((a,b) => a.localeCompare(b, "th")), [records]);
  const matching = useMemo(() => {
    const search = normalized(query);
    if (!search) return [];
    return records.filter((r) =>
      (!workplace || r.workplace === workplace) &&
      normalized(r.name + " " + r.position + " " + r.workplace).includes(search)
    ).sort((a,b) => a.name.localeCompare(b.name, "th")).slice(0, 200);
  }, [records, query, workplace]);
  const totalMatching = useMemo(() => {
    const search = normalized(query);
    if (!search) return 0;
    return records.reduce((total, r) =>
      total + Number((!workplace || r.workplace === workplace) &&
        normalized(r.name + " " + r.position + " " + r.workplace).includes(search)), 0);
  }, [records, query, workplace]);

  async function importCsv(file?: File) {
    if (!file) return;
    setError(""); setNotice("");
    if (file.size > 5 * 1024 * 1024) {
      setError("ไฟล์เกิน 5 MB กรุณาเลือกไฟล์ CSV ที่มีขนาดเล็กกว่า");
      return;
    }
    try {
      const bytes = await file.arrayBuffer();
      let raw: string;
      try { raw = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
      catch { raw = new TextDecoder("windows-874").decode(bytes); }
      const clean = staffFromCsv(raw);
      setRecords(clean);
      setQuery(""); setWorkplace("");
      if (remember) {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean)); }
        catch { setError("ไม่สามารถจดจำในเบราว์เซอร์ได้ แต่ค้นหาในหน้านี้ได้ตามปกติ"); }
      } else {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      }
      setNotice("นำเข้ารายชื่อ " + clean.length.toLocaleString("th-TH") + " คนแล้ว — เก็บเฉพาะชื่อ ตำแหน่ง และหน่วยงาน");
      searchInput.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "อ่านไฟล์ CSV ไม่สำเร็จ");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function toggleRemember(checked: boolean) {
    setRemember(checked);
    try {
      if (checked && records.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      if (!checked) window.localStorage.removeItem(STORAGE_KEY);
    } catch { setError("ไม่สามารถเปลี่ยนการจดจำบนเครื่องนี้ได้"); }
  }
  function clearData() {
    if (!window.confirm("ล้างข้อมูลรายชื่อที่เก็บไว้ในเบราว์เซอร์เครื่องนี้หรือไม่?")) return;
    setRecords([]);
    setQuery(""); setWorkplace(""); setError(""); setNotice("");
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  return <main className={styles.page}>
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <a href="/"><ArrowLeft size={16} /> กลับหน้ารวมงานพัสดุ</a>
        <a href="/telephone/">สมุดโทรศัพท์ภายใน</a>
      </nav>
      <header className={styles.hero}>
        <div className={styles.heroBody}>
          <span className={styles.eyebrow}><UsersRound size={17} /> PERSONNEL DIRECTORY 2570</span>
          <h1>รายชื่อบุคลากร <span>ปี 2570</span></h1>
          <p>โรงพยาบาลอุตรดิตถ์ · ค้นหาชื่อ–นามสกุล ตำแหน่ง และหน่วยงานที่ปฏิบัติงาน</p>
          <div className={styles.heroTags}><span><ShieldCheck size={15}/> ไม่แสดงเลขบัตรประชาชนหรือวันเกิด</span><span><Search size={15}/> ค้นหาอัตโนมัติขณะพิมพ์</span></div>
        </div>
        <div className={styles.heroIcon}><UsersRound size={86} strokeWidth={1.3}/></div>
      </header>

      <section className={styles.notice} aria-label="ความเป็นส่วนตัว">
        <ShieldCheck size={20} />
        <div><strong>รายชื่อยังไม่ถูกเผยแพร่บนเว็บไซต์สาธารณะ</strong><p>นำเข้า CSV จากคอมพิวเตอร์ของคุณเพื่อค้นหาเฉพาะในเบราว์เซอร์นี้ ข้อมูลไม่ได้ส่งขึ้นเซิร์ฟเวอร์ เลขบัตรประชาชน วันเกิด และคอลัมน์อื่นในไฟล์ต้นทางจะถูกละเว้นทั้งหมด</p></div>
      </section>

      <section className={styles.searchBox}>
        <label htmlFor="staff-query">ค้นหาบุคลากร</label>
        <div className={styles.searchRow}>
          <div className={styles.searchInput}>
            <Search size={21}/>
            <input id="staff-query" ref={searchInput} value={query}
              disabled={!records.length}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={records.length ? "พิมพ์ชื่อ–นามสกุล ตำแหน่ง หรือหน่วยงาน..." : "นำเข้าไฟล์ CSV ก่อนเริ่มค้นหา"}
              autoComplete="off" />
            {query && <button aria-label="ล้างคำค้นหา" onClick={() => setQuery("")}><X size={17}/></button>}
          </div>
          <select value={workplace} disabled={!records.length} aria-label="กรองหน่วยงาน"
            onChange={(event) => setWorkplace(event.target.value)}>
            <option value="">ทุกหน่วยงาน</option>
            {workplaces.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <p className={styles.hint}>พิมพ์แล้วแสดงผลทันที ไม่ต้องกด Enter · ไม่แสดงรายชื่อทั้งหมดก่อนค้นหา</p>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.counter}><span className={styles.counterIcon}><UserRound size={22}/></span><div><strong>{loaded ? records.length.toLocaleString("th-TH") : "…"} <small>คน</small></strong><span>บุคลากรที่พร้อมค้นหาในเครื่องนี้</span></div></div>
        <div className={styles.actions}>
          <label className={styles.remember}><input type="checkbox" checked={remember} onChange={(event) => toggleRemember(event.target.checked)}/><span>จดจำเฉพาะในเครื่องนี้</span></label>
          {records.length > 0 && <button type="button" className={styles.secondary} onClick={clearData}><Trash2 size={16}/> ล้างข้อมูล</button>}
          <input type="file" className={styles.hidden} ref={fileInput} accept=".csv,text/csv" onChange={(e) => void importCsv(e.target.files?.[0])}/>
          <button type="button" className={styles.primary} onClick={() => fileInput.current?.click()}><FileUp size={17}/> {records.length ? "เปลี่ยนไฟล์ CSV" : "นำเข้ารายชื่อ CSV"}</button>
        </div>
      </div>
      {error && <div className={styles.error} role="alert">{error}</div>}
      {notice && <div className={styles.success} role="status"><CheckCircle2 size={17}/>{notice}</div>}

      <section className={styles.results} aria-label="ผลการค้นหาบุคลากร">
        <div className={styles.tableTitle}><h2>รายชื่อบุคลากร</h2><span>{query ? "พบ " + totalMatching.toLocaleString("th-TH") + " รายการ" : "ค้นหาเพื่อแสดงผล"}</span></div>
        {!records.length ? <div className={styles.empty}><UsersRound size={40}/><h3>พร้อมใช้งานเมื่อเลือกไฟล์ข้อมูล</h3><p>ใช้ไฟล์ “ดึงข้อมูลบุคลากร (19).csv” ที่ได้รับมา ข้อมูลจะถูกอ่านบนเครื่องของคุณเท่านั้น</p><button type="button" className={styles.primary} onClick={() => fileInput.current?.click()}><FileUp size={17}/> เลือกไฟล์ CSV</button></div>
        : !query.trim() ? <div className={styles.empty}><Search size={41}/><h3>พิมพ์ชื่อเพื่อเริ่มค้นหา</h3><p>ระบบจะค้นหาทันทีและแสดงเฉพาะชื่อ ตำแหน่ง และหน่วยงาน</p></div>
        : totalMatching === 0 ? <div className={styles.empty}><Search size={39}/><h3>ไม่พบรายชื่อที่ค้นหา</h3><p>ลองค้นหาด้วยชื่อ นามสกุลบางส่วน หรือชื่อหน่วยงาน</p></div>
        : <div className={styles.tableScroll}><table><thead><tr><th>ชื่อ–นามสกุล</th><th>ตำแหน่ง</th><th>หน่วยงานที่ปฏิบัติงาน</th></tr></thead>
          <tbody>{matching.map((item, i) => <tr key={item.name + "|" + item.position + "|" + item.workplace + "-" + i}><td className={styles.name}><UserRound size={16}/>{item.name}</td><td>{item.position}</td><td className={styles.workplace}><Building2 size={15}/>{item.workplace}</td></tr>)}</tbody>
          </table>{totalMatching > 200 && <p className={styles.limit}>แสดง 200 รายการแรก กรุณาเพิ่มคำค้นหาเพื่อจำกัดผลลัพธ์</p>}</div>}
      </section>
      <footer>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์ · ทะเบียนบุคลากรปีงบประมาณ 2570</footer>
    </div>
  </main>;
}
