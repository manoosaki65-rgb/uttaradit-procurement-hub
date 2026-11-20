"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, BookUser, Building2, Check, ClipboardCopy, Download,
  ExternalLink, FileUp, MapPin, Phone, Plus, Search, ShieldCheck,
  Trash2, X,
} from "lucide-react";
import styles from "./telephone.module.css";

type Contact = {
  id: string;
  department: string;
  extension: string;
  location: string;
  note: string;
};

const STORE = "uttaradit_telephone_directory_local_v1";
const INTRANET_URL = "http://intranet/soinewintra/tel/tel.html";

const thaiDigits = "๐๑๒๓๔๕๖๗๘๙";
function normalizePhone(value: string): string {
  return value.replace(/[๐-๙]/g, (digit) => String(thaiDigits.indexOf(digit))).replace(/\s+/g, " ").trim();
}
function cleanCell(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}
function validContacts(input: unknown): Contact[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const contacts: Contact[] = [];
  for (const item of input.slice(0, 4000)) {
    if (!item || typeof item !== "object") continue;
    const data = item as Partial<Contact>;
    const department = cleanCell(String(data.department ?? ""));
    const extension = normalizePhone(String(data.extension ?? ""));
    if (!department || !extension || department.length > 200 || extension.length > 80) continue;
    const location = cleanCell(String(data.location ?? "")).slice(0, 120);
    const note = cleanCell(String(data.note ?? "")).slice(0, 220);
    const key = (department + "|" + extension).toLocaleLowerCase("th");
    if (seen.has(key)) continue;
    seen.add(key);
    contacts.push({ id: String(data.id ?? key), department, extension, location, note });
  }
  return contacts;
}
function isNumberLike(value: string): boolean {
  return /\d{2,}/.test(normalizePhone(value)) && !/[ก-๙A-Za-z]{4,}/.test(value);
}
function makeContacts(rows: string[][]): Contact[] {
  const cleaned = rows
    .map((row) => row.map(cleanCell).filter((value) => value.length > 0))
    .filter((row) => row.length >= 2);
  const headerIndex = cleaned.findIndex((row, i) =>
    i < 8 && row.some((value) => /เบอร์|โทร|หมายเลข|extension|ext\.?/i.test(value)) &&
    row.some((value) => /หน่วย|แผนก|ฝ่าย|งาน|ชื่อ|สถานที่|ห้อง|department/i.test(value))
  );
  const headers = headerIndex >= 0 ? cleaned[headerIndex] : [];
  const getIndex = (pattern: RegExp): number => headers.findIndex((heading) => pattern.test(heading));
  const departmentIndex = getIndex(/หน่วย|แผนก|ฝ่าย|งาน|ชื่อ|department/i);
  const phoneIndex = getIndex(/เบอร์|โทร|หมายเลข|extension|ext\.?/i);
  const locationIndex = getIndex(/อาคาร|ชั้น|สถานที่|ห้อง|ที่ตั้ง|location/i);
  const noteIndex = getIndex(/หมายเหตุ|เพิ่มเติม|note/i);
  const imported: Contact[] = [];
  for (const row of cleaned.slice(headerIndex >= 0 ? headerIndex + 1 : 0)) {
    const phoneCellIndex = phoneIndex >= 0 && phoneIndex < row.length
      ? phoneIndex : row.findIndex((cell) => isNumberLike(cell));
    if (phoneCellIndex < 0) continue;
    const extension = normalizePhone(row[phoneCellIndex]);
    if (!/\d{2,}/.test(extension)) continue;
    const deptIndex = departmentIndex >= 0 && departmentIndex < row.length
      ? departmentIndex : row.findIndex((cell, i) => i !== phoneCellIndex && !isNumberLike(cell));
    if (deptIndex < 0 || deptIndex === phoneCellIndex) continue;
    const department = row[deptIndex];
    if (/^(หมายเลข|เบอร์|โทรศัพท์|ลำดับ)$/i.test(department)) continue;
    const extra = row
      .map((value, index) => ({ value, index }))
      .filter(({ index }) => index !== phoneCellIndex && index !== deptIndex && !/^\d+$/.test(row[index]));
    const location = locationIndex >= 0 && row[locationIndex] && locationIndex !== deptIndex && locationIndex !== phoneCellIndex
      ? row[locationIndex] : extra[0]?.value ?? "";
    const note = noteIndex >= 0 && row[noteIndex] && noteIndex !== deptIndex && noteIndex !== phoneCellIndex
      ? row[noteIndex] : extra.filter(({ value }) => value !== location).map(({ value }) => value).join(" · ");
    imported.push({ id: "import-" + imported.length, department, extension, location, note });
  }
  return validContacts(imported);
}
function parseDelimited(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = firstLine.includes("\t") ? "\t" :
    (firstLine.split(";").length > firstLine.split(",").length ? ";" : ",");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && char === delimiter) {
      row.push(cell); cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); cell = ""; row = [];
    } else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  if (rows.every((cells) => cells.length < 2)) {
    return text.split(/\r?\n/).map((line) => line.trim().split(/\s{2,}|\t/));
  }
  return rows;
}
function parseDirectory(text: string): Contact[] {
  const raw = text.trim();
  if (!raw) return [];
  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(raw);
      const records = Array.isArray(parsed) ? parsed : (parsed as { contacts?: unknown }).contacts;
      const direct = validContacts(records);
      if (direct.length) return direct;
    } catch { /* It may be a plain text file. */ }
  }
  if (/<table[\s>]/i.test(raw) || /<tr[\s>]/i.test(raw)) {
    const doc = new DOMParser().parseFromString(raw, "text/html");
    const tableRows = Array.from(doc.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.querySelectorAll(":scope > th, :scope > td")).map((cell) => cell.textContent ?? "")
    );
    return makeContacts(tableRows);
  }
  return makeContacts(parseDelimited(raw));
}
function csvQuote(value: string): string { return '"' + value.replace(/"/g, '""') + '"'; }

export default function TelephonePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mode, setMode] = useState<"loading" | "empty" | "shared" | "local">("loading");
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [department, setDepartment] = useState("");
  const [extension, setExtension] = useState("");
  const [location, setLocation] = useState("");
  const [copied, setCopied] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    const saved = window.localStorage.getItem(STORE);
    if (saved !== null) {
      try {
        const local = validContacts(JSON.parse(saved));
        if (active) { setContacts(local); setMode(local.length ? "local" : "empty"); }
        return () => { active = false; };
      } catch { window.localStorage.removeItem(STORE); }
    }
    fetch("/telephone-directory.json", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : [])
      .then((result: unknown) => {
        if (!active) return;
        const data = validContacts(result);
        setContacts(data);
        setMode(data.length ? "shared" : "empty");
      })
      .catch(() => { if (active) setMode("empty"); });
    return () => { active = false; };
  }, []);

  const locations = useMemo(() =>
    Array.from(new Set(contacts.map((item) => item.location).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "th")), [contacts]
  );

  const filtered = useMemo(() => {
    const term = normalizePhone(query).toLocaleLowerCase("th");
    return contacts.filter((contact) =>
      (!locationFilter || contact.location === locationFilter) &&
      (!term || [contact.department, contact.extension, contact.location, contact.note]
        .some((field) => normalizePhone(field).toLocaleLowerCase("th").includes(term)))
    ).sort((a, b) => a.department.localeCompare(b.department, "th"));
  }, [contacts, query, locationFilter]);

  function saveLocal(next: Contact[], success: string) {
    const clean = validContacts(next);
    try {
      window.localStorage.setItem(STORE, JSON.stringify(clean));
      setContacts(clean);
      setMode(clean.length ? "local" : "empty");
      setError("");
      setNotice(success);
      setLocationFilter("");
    } catch {
      setError("พื้นที่บันทึกข้อมูลของเบราว์เซอร์ไม่เพียงพอ กรุณาส่งออกไฟล์ CSV เพื่อสำรอง");
    }
  }

  async function importFile(file: File) {
    setError("");
    setNotice("");
    if (file.size > 5 * 1024 * 1024) {
      setError("ไฟล์มีขนาดเกิน 5 MB กรุณาใช้ไฟล์ที่มีขนาดเล็กกว่า");
      return;
    }
    try {
      const bytes = await file.arrayBuffer();
      let content: string;
      try {
        content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch {
        content = new TextDecoder("windows-874").decode(bytes);
      }
      const parsed = parseDirectory(content);
      if (!parsed.length) {
        setError("ยังอ่านรายการเบอร์โทรจากไฟล์นี้ไม่ได้ ลองบันทึกหน้า Intranet เป็น HTML หรือส่งออกเป็น CSV");
        return;
      }
      saveLocal(parsed, "นำเข้า " + parsed.length.toLocaleString("th-TH") + " รายการแล้ว (เก็บไว้ในเบราว์เซอร์เครื่องนี้)");
      setQuery("");
    } catch {
      setError("เปิดไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function importPasted() {
    setError("");
    const parsed = parseDirectory(pastedText);
    if (!parsed.length) {
      setError("ยังไม่พบตารางเบอร์โทร กรุณาคัดลอกแถวข้อมูลจากหน้า Intranet แล้ววางอีกครั้ง");
      return;
    }
    saveLocal(parsed, "รับข้อมูลจากตาราง " + parsed.length.toLocaleString("th-TH") + " รายการแล้ว (เฉพาะเครื่องนี้)");
    setQuery("");
    setPastedText("");
    setShowPaste(false);
  }

  function addContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!department.trim() || !extension.trim()) return;
    saveLocal([...contacts, {
      id: "manual-" + Date.now(),
      department: department.trim(),
      extension: normalizePhone(extension),
      location: location.trim(),
      note: "",
    }], "เพิ่มหมายเลขในสมุดโทรศัพท์ของเครื่องนี้แล้ว");
    setDepartment(""); setExtension(""); setLocation(""); setShowAdd(false);
  }

  function exportCsv() {
    const rows = [
      ["หน่วยงาน", "เบอร์โทรภายใน", "อาคาร/สถานที่", "หมายเหตุ"],
      ...contacts.map(({ department, extension, location, note }) => [department, extension, location, note]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(csvQuote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "สมุดโทรศัพท์-โรงพยาบาลอุตรดิตถ์.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearLocal() {
    if (!window.confirm("ลบรายการเบอร์โทรที่บันทึกไว้บนเบราว์เซอร์เครื่องนี้หรือไม่?")) return;
    window.localStorage.removeItem(STORE);
    window.location.reload();
  }

  async function copyExtension(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(""), 1600);
    } catch { setNotice("เลือกและคัดลอกหมายเลขด้วยตนเองได้"); }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topbar}>
          <a className={styles.back} href="/" aria-label="กลับหน้ารวมระบบงานพัสดุ">
            <ArrowLeft size={18} /> กลับหน้ารวมระบบงานพัสดุ
          </a>
          <a href="/personnel-2570/" className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900 hover:bg-blue-100"><UsersRound size={16}/> ค้นรายชื่อบุคลากรปี 2570</a>
          <span className={styles.brand}><Phone size={17} /> UTTARADIT HOSPITAL</span>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><BookUser size={16} /> HOSPITAL PHONE DIRECTORY</span>
            <h1>สมุดโทรศัพท์ภายใน<br /><span>โรงพยาบาลอุตรดิตถ์</span></h1>
            <p>รวมเบอร์โทรศัพท์ภายในทุกหน่วยงาน ค้นหาชื่อแผนก เบอร์โทร หรืออาคารที่ตั้งได้ในหน้าเดียว</p>
            <div className={styles.heroTags}>
              <span><ShieldCheck size={15} /> ค้นหาได้รวดเร็ว</span>
              <span><Building2 size={15} /> จัดรายการตามหน่วยงาน</span>
            </div>
          </div>
          <div className={styles.heroSymbol} aria-hidden="true"><Phone size={84} strokeWidth={1.25} /></div>
        </section>

        <section className={styles.searchPanel} aria-label="ค้นหาเบอร์โทรศัพท์">
          <label htmlFor="telephone-search">ค้นหาเบอร์โทรศัพท์ภายใน</label>
          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <Search size={22} />
              <input id="telephone-search" ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)}
                placeholder="พิมพ์ชื่อหน่วยงาน แผนก หรือหมายเลขโทรศัพท์..." autoComplete="off" />
              {query && <button type="button" aria-label="ล้างคำค้นหา" onClick={() => { setQuery(""); searchInput.current?.focus(); }}><X size={18} /></button>}
            </div>
            <select aria-label="กรองสถานที่" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
              <option value="">ทุกอาคาร / สถานที่</option>
              {locations.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <p className={styles.searchHint}>ค้นหาทันทีขณะพิมพ์ ทั้งชื่อหน่วยงาน เบอร์ภายใน สถานที่ และหมายเหตุ</p>
        </section>

        <section className={styles.toolbar}>
          <div className={styles.summary}>
            <span className={styles.summaryIcon}><Phone size={21} /></span>
            <div><strong>{mode === "loading" ? "กำลังโหลด" : contacts.length.toLocaleString("th-TH")} <small>หมายเลข</small></strong>
              <span>พบ {filtered.length.toLocaleString("th-TH")} รายการจากการค้นหา</span>
            </div>
          </div>
          <div className={styles.actions}>
            <a href={INTRANET_URL} target="_blank" rel="noopener noreferrer" className={styles.outlineBtn}>
              <ExternalLink size={16} /> เปิดต้นฉบับ Intranet
            </a>
            <button className={styles.outlineBtn} type="button" onClick={() => setShowPaste((open) => !open)}>
              <ClipboardCopy size={16} /> วางตาราง
            </button>
            <input ref={fileInput} className={styles.hiddenInput} type="file" accept=".html,.htm,.csv,.txt,.json,text/html,text/csv"
              onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); }} />
            <button className={styles.primaryBtn} type="button" onClick={() => fileInput.current?.click()}>
              <FileUp size={17} /> นำเข้ารายชื่อ
            </button>
          </div>
        </section>

        {showPaste && <section className={styles.pastePanel} aria-label="วางตารางเบอร์โทร">
          <div className={styles.pasteTitle}><strong>วางตารางเบอร์โทรจาก Intranet</strong>
            <button type="button" onClick={() => setShowPaste(false)} aria-label="ปิด"><X size={18}/></button>
          </div>
          <p>เปิดหน้า Intranet เลือกตารางรายชื่อแล้วกด Ctrl+C กลับมาหน้านี้และกด Ctrl+V ระบบจะอ่านตาราง HTML หรือข้อความที่แบ่งคอลัมน์ให้อัตโนมัติ</p>
          <textarea value={pastedText} onChange={(event) => setPastedText(event.target.value)}
            onPaste={(event) => {
              const html = event.clipboardData.getData("text/html");
              if (/<table[\s>]/i.test(html)) { event.preventDefault(); setPastedText(html); }
            }}
            rows={5} placeholder="คลิกที่นี่ แล้วกด Ctrl+V เพื่อวางข้อมูลเบอร์โทรศัพท์" />
          <button className={styles.primaryBtn} type="button" onClick={importPasted} disabled={!pastedText.trim()}>
            <Check size={16}/> นำเข้าตารางที่วาง
          </button>
        </section>}
        {error && <div className={styles.error} role="alert">{error}</div>}
        {notice && <div className={styles.notice} role="status">{notice}<button type="button" onClick={() => setNotice("")} aria-label="ปิดข้อความ"><X size={15}/></button></div>}

        <section className={styles.directory} aria-label="รายชื่อหน่วยงานและเบอร์โทรศัพท์">
          <div className={styles.tableHeader}>
            <h2>รายชื่อหน่วยงาน <span>({filtered.length.toLocaleString("th-TH")})</span></h2>
            <button className={styles.addBtn} type="button" onClick={() => setShowAdd((old) => !old)}>
              {showAdd ? <X size={16} /> : <Plus size={16} />}{showAdd ? "ปิดแบบฟอร์ม" : "เพิ่มเบอร์โทร"}
            </button>
          </div>
          {showAdd && (
            <form className={styles.addForm} onSubmit={addContact}>
              <div><label htmlFor="tel-dept">ชื่อหน่วยงาน *</label><input id="tel-dept" required value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="เช่น กลุ่มงานพัสดุ" /></div>
              <div><label htmlFor="tel-number">เบอร์ภายใน *</label><input id="tel-number" required value={extension} onChange={(e) => setExtension(e.target.value)} placeholder="หมายเลขภายใน" /></div>
              <div><label htmlFor="tel-location">อาคาร / ชั้น (ถ้ามี)</label><input id="tel-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="สถานที่ตั้ง" /></div>
              <button className={styles.primaryBtn} type="submit"><Check size={16} /> บันทึกในเครื่องนี้</button>
            </form>
          )}
          {mode === "loading" ? (
            <div className={styles.empty}><Phone size={38} /><h3>กำลังโหลดสมุดโทรศัพท์</h3></div>
          ) : !contacts.length ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}><BookUser size={42} /></span>
              <h3>พร้อมรวบรวมเบอร์โทรศัพท์ภายใน</h3>
              <p>ยังไม่มีฐานข้อมูลหมายเลขในหน้านี้ นำเข้าไฟล์ HTML ที่บันทึกจากเว็บ Intranet หรือไฟล์ CSV เพื่อเริ่มค้นหาได้ทันที</p>
              <button type="button" className={styles.primaryBtn} onClick={() => fileInput.current?.click()}><FileUp size={17}/> เลือกไฟล์รายชื่อเบอร์โทร</button>
            </div>
          ) : !filtered.length ? (
            <div className={styles.empty}>
              <Search size={37} /><h3>ไม่พบหมายเลขที่ค้นหา</h3><p>ลองพิมพ์ชื่อแผนกหรือเลขหมายบางส่วน หรือเปลี่ยนตัวกรองสถานที่</p>
              <button type="button" className={styles.textBtn} onClick={() => { setQuery(""); setLocationFilter(""); }}>แสดงทุกรายการ</button>
            </div>
          ) : (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th>หน่วยงาน / แผนก</th><th>อาคาร / สถานที่</th><th>หมายเลขโทรศัพท์</th><th>หมายเหตุ</th><th>คัดลอก</th></tr></thead>
                <tbody>{filtered.map((contact) => (
                  <tr key={contact.id}>
                    <td><div className={styles.deptName}><span className={styles.deptIcon}><Building2 size={17}/></span>{contact.department}</div></td>
                    <td><span className={styles.location}><MapPin size={15}/>{contact.location || "—"}</span></td>
                    <td><strong className={styles.phoneNumber}>{contact.extension}</strong></td>
                    <td className={styles.noteCell}>{contact.note || "—"}</td>
                    <td><button type="button" title="คัดลอกเบอร์โทร" aria-label={"คัดลอก " + contact.extension} className={styles.copyBtn} onClick={() => void copyExtension(contact.extension)}>
                      {copied === contact.extension ? <Check size={18}/> : <ClipboardCopy size={18}/>}
                    </button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <div className={styles.footTools}>
          <div className={styles.privacy}><ShieldCheck size={18}/><p><strong>ข้อมูลภายใน:</strong> รายการเบอร์โทรหลักอ้างอิงจากเอกสารอัปเดต ต.ค. 2568 ซึ่งแสดงบนหน้าเว็บนี้ ส่วนข้อมูลที่คุณนำเข้าและเพิ่มเองจะบันทึกเฉพาะในเบราว์เซอร์ของเครื่องนี้ ไม่ส่งขึ้นฐานข้อมูลส่วนกลาง</p></div>
          {contacts.length > 0 && <div className={styles.dataActions}>
            <button type="button" onClick={exportCsv}><Download size={16}/> ส่งออก CSV</button>
            {mode === "local" && <button type="button" onClick={clearLocal}><Trash2 size={16}/> ล้างข้อมูลในเครื่อง</button>}
          </div>}
        </div>
        <footer className={styles.footer}>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์ <span>·</span> สมุดโทรศัพท์ภายในโรงพยาบาล</footer>
      </div>
    </main>
  );
}
