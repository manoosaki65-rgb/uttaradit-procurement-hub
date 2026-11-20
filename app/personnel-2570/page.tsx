"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, Search, ShieldCheck, UserRound, UsersRound, X } from "lucide-react";
import styles from "./personnel.module.css";

type Staff = { name: string; position: string; workplace: string };
const DIRECTORY = "/personnel-2570-directory.json";
function clean(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 190) : "";
}
function parseStaff(input: unknown): Staff[] {
  if (!Array.isArray(input) || input.length > 10000) throw new Error("รูปแบบข้อมูลไม่ถูกต้อง");
  return input.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("รายการบุคลากรไม่ถูกต้อง");
    const row = entry as Record<string, unknown>;
    const name = clean(row.name), position = clean(row.position), workplace = clean(row.workplace);
    if (!name || !position || !workplace || Object.keys(row).some(k => !["name", "position", "workplace"].includes(k))) {
      throw new Error("รายการบุคลากรมีข้อมูลผิดรูปแบบ");
    }
    return { name, position, workplace };
  });
}
function key(value: string): string {
  return value.toLocaleLowerCase("th").replace(/\s+/g, "").trim();
}

export default function Personnel2570() {
  const [records, setRecords] = useState<Staff[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [workplace, setWorkplace] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(DIRECTORY, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Directory unavailable");
        return response.json();
      })
      .then(data => {
        if (controller.signal.aborted) return;
        const staff = parseStaff(data);
        if (!staff.length) throw new Error("Directory is empty");
        setRecords(staff);
        setStatus("ready");
      })
      .catch(error => {
        if (!controller.signal.aborted && error?.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
  }, []);
  const workplaces = useMemo(() => Array.from(new Set(records.map(r => r.workplace))).sort((a,b) => a.localeCompare(b,"th")), [records]);
  const matches = useMemo(() => {
    const q = key(query);
    if (!q) return [];
    return records.filter(r => (!workplace || r.workplace === workplace) &&
      key(r.name + " " + r.position + " " + r.workplace).includes(q)).sort((a,b) => a.name.localeCompare(b.name,"th"));
  }, [records, query, workplace]);
  const shown = matches.slice(0, 150);
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
          <div className={styles.heroTags}>
            <span><Search size={15} /> ค้นหาอัตโนมัติ ไม่ต้องกด Enter</span>
            <span><ShieldCheck size={15} /> แสดงเฉพาะ 3 ข้อมูลที่กำหนด</span>
          </div>
        </div>
        <div className={styles.heroIcon}><UsersRound size={86} strokeWidth={1.3} /></div>
      </header>

      <section className={styles.notice}>
        <ShieldCheck size={20} />
        <div><strong>สมุดรายชื่อบุคลากรสำหรับค้นหา</strong>
          <p>ทุกคนสามารถค้นหาได้โดยไม่ต้องเข้าสู่ระบบ แสดงเฉพาะชื่อ–นามสกุล ตำแหน่ง และหน่วยงาน · ไม่เผยแพร่เลขบัตรประชาชน วันเกิด และข้อมูลอื่นจากไฟล์ต้นฉบับ</p>
        </div>
      </section>

      <section className={styles.searchBox}>
        <label htmlFor="staff-query">ค้นหาบุคลากร</label>
        <div className={styles.searchRow}>
          <div className={styles.searchInput}>
            <Search size={21} />
            <input id="staff-query" value={query} onChange={e => setQuery(e.target.value)}
              disabled={status !== "ready"}
              placeholder={status === "loading" ? "กำลังโหลดรายชื่อ…" : "พิมพ์ชื่อ–นามสกุล ตำแหน่ง หรือหน่วยงาน"}
              autoComplete="off" />
            {query && <button aria-label="ล้างคำค้นหา" onClick={() => setQuery("")}><X size={17} /></button>}
          </div>
          <select value={workplace} onChange={e => setWorkplace(e.target.value)} disabled={status !== "ready"} aria-label="เลือกหน่วยงาน">
            <option value="">ทุกหน่วยงาน</option>
            {workplaces.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <p className={styles.hint}>เริ่มพิมพ์ชื่อเพื่อแสดงผลทันที · เปิดได้จากทุกเครื่องโดยไม่ต้องนำเข้าไฟล์</p>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.counter}><span className={styles.counterIcon}><UserRound size={22} /></span>
          <div><strong>{status === "ready" ? records.length.toLocaleString("th-TH") : "…"} <small>คน</small></strong>
            <span>{status === "ready" ? "บุคลากรพร้อมค้นหา" : "กำลังตรวจสอบข้อมูลบุคลากร"}</span></div>
        </div>
      </div>

      <section className={styles.results} aria-label="ผลการค้นหาบุคลากร">
        <div className={styles.tableTitle}><h2>รายชื่อบุคลากร</h2>
          <span>{query.trim() ? "พบ " + matches.length.toLocaleString("th-TH") + " รายการ" : "ค้นหาเพื่อแสดงผล"}</span>
        </div>
        {status === "loading" ? <div className={styles.empty}><UsersRound size={40} /><h3>กำลังโหลดรายชื่อบุคลากร…</h3></div>
        : status === "error" ? <div className={styles.empty}><UsersRound size={40} /><h3>ไม่สามารถโหลดรายชื่อได้</h3><p>กรุณาลองรีเฟรชหน้าเว็บอีกครั้ง</p></div>
        : !query.trim() ? <div className={styles.empty}><Search size={41} /><h3>พิมพ์ชื่อเพื่อเริ่มค้นหา</h3><p>ระบบจะแสดงเฉพาะชื่อ–นามสกุล ตำแหน่ง และหน่วยงาน</p></div>
        : !matches.length ? <div className={styles.empty}><Search size={39} /><h3>ไม่พบรายชื่อที่ค้นหา</h3><p>ลองค้นหาชื่อ นามสกุลบางส่วน หรือตำแหน่งงาน</p></div>
        : <div className={styles.tableScroll}><table>
            <thead><tr><th>ชื่อ–นามสกุล</th><th>ตำแหน่ง</th><th>หน่วยงานที่ปฏิบัติงาน</th></tr></thead>
            <tbody>{shown.map((item, i) => <tr key={item.name + "|" + item.position + "|" + i}>
              <td className={styles.name}><UserRound size={16} />{item.name}</td>
              <td>{item.position}</td>
              <td className={styles.workplace}><Building2 size={15} />{item.workplace}</td>
            </tr>)}</tbody>
          </table>{matches.length > shown.length && <p className={styles.limit}>แสดง 150 รายการแรก กรุณาระบุคำค้นหาให้ละเอียดขึ้น</p>}</div>}
      </section>
      <footer>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์ · ทะเบียนบุคลากร ปี 2570</footer>
    </div>
  </main>;
}