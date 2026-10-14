"use client";
import {useEffect,useMemo,useRef,useState} from 'react';
import {KINDS} from '../../lib/posting-core.js';
import {uploadData,type PostingRow,type Asset} from '../../lib/posting-media';
import {photoThumbnail,photoDownload,isTestEvidence} from '../../lib/posting-daily.js';
import evidence from '../../lib/posting-web-evidence.json';
import './dashboard.css';
import {photoPage as pageOf,preservePhotoPages,documentPageCount} from '../../lib/posting-photo-pages.js';
import AnnouncementUpload from './announcement-upload';
import {validatePhoto,imageType} from '../../lib/posting-upload.js';
import EditAnnouncement from './edit-announcement';

const titles=['Compliance Balloon Catheter จำนวน 1,000 เส้น','Drug Eluting Stent ขนาดใหญ่ จำนวน 60 เส้น','ชุดเครื่องมือเจาะตัดกระดูกชนิดเปลี่ยนหัวได้ จำนวน 2 ชุด','เครื่องพร้อมน้ำยาตรวจ CD4 จำนวน 2,000 Test','วัสดุวิทยาศาสตร์การแพทย์ จำนวน 3 รายการ','เครื่องพร้อมน้ำยาตรวจชุดทดสอบความไวของสารต้านจุลชีพ จำนวน 6,000 Test','เผยแพร่แผนการจัดซื้อจัดจ้าง ประจำปีงบประมาณ 2570 · หน้านำเรื่อง','Tissue mitral valve 25–33 mm. (เนื้อเยื่อหมู ชนิดมีโครง)'];
type Row=PostingRow & {previewOnly?:boolean};
const seed:Row[]=titles.map((title,i)=>({id:'preview-oct9-'+i,sequence:i+1,title,kind:KINDS[i<6?0:1],postedDate:'2026-10-09',notes:'',revision:0,pdf:null,photos:evidence[1].photos[i]?[evidence[1].photos[i]]:[],previewOnly:true}));
const thai=(d:string)=>new Intl.DateTimeFormat('th-TH',{day:'numeric',month:'long',year:'numeric'}).format(new Date(d+'T12:00:00+07:00'));
function Photo({photo}:{photo:Asset}){const [failed,setFailed]=useState(false);return <a href={photo.url} target="_blank" rel="noreferrer">{failed?<small>เปิดรูปต้นฉบับใน Drive</small>:<img src={photoThumbnail(photo)} alt={photo.name} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>}<span>ดูรูป</span></a>;}

export default function DashboardView(){
 const [rows,setRows]=useState<Row[]>(seed),[date,setDate]=useState('2026-10-09'),[month,setMonth]=useState('2026-10'),[kind,setKind]=useState('ทั้งหมด'),[q,setQ]=useState(''),[code,setCode]=useState(''),[connected,setConnected]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('เชื่อมด้วยรหัสเจ้าหน้าที่เดิมเพื่อโหลดรายการ PDF และบันทึกรูปลง Master เดิม'),[counts,setCounts]=useState<Record<string,number>>({}),[showAll,setShowAll]=useState(false);
 const lock=useRef(false);
 const [newDate,setNewDate]=useState<string|null>(null);
 const [editing,setEditing]=useState<Row|null>(null);
 const [deleting,setDeleting]=useState<{row:Row;photo:Asset;page:number}|null>(null);
 async function api(body?:unknown,access=code){if(!access.trim())throw Error('กรุณาใส่รหัสเจ้าหน้าที่เดิม');const res=await fetch('/api/posting',{method:body?'POST':'GET',cache:'no-store',signal:AbortSignal.timeout(120000),headers:{'Content-Type':'application/json','X-Posting-Code':access.trim()},...(body?{body:JSON.stringify(body)}:{})});const data=await res.json() as {error?:string;rows:PostingRow[];row:PostingRow};if(res.status===401)setConnected(false);if(!res.ok||data.error)throw Error(data.error||'เชื่อมต่อไม่สำเร็จ');return data;}
 async function run(fn:()=>Promise<void>){if(lock.current)return;lock.current=true;setBusy(true);try{await fn();}catch(e){setMessage(e instanceof Error?e.message:String(e));}finally{lock.current=false;setBusy(false);}}
 async function connect(access=code){const data=await api(undefined,access);if(!Array.isArray(data.rows))throw Error('โหลด Master เดิมไม่สำเร็จ');setRows(data.rows);setConnected(true);setEditing(prev=>prev?data.rows.find((r:PostingRow)=>r.id===prev.id)||null:null);try{sessionStorage.setItem('posting-access',access.trim());}catch{}setMessage(`โหลด Master เดิมแล้ว ${data.rows.length} รายการ เลือกแก้ไขรายการในตารางได้`);}
 useEffect(()=>{try{const saved=sessionStorage.getItem('posting-access');if(saved){setCode(saved);void run(()=>connect(saved));}}catch{}},[]);
 const visible=useMemo(()=>rows.filter(r=>!isTestEvidence(r)&&r.postedDate===date&&(kind==='ทั้งหมด'||r.kind===kind)&&`${r.title} ${r.kind} ${r.notes}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a,b)=>a.sequence-b.sequence),[rows,date,kind,q]);
 const allPhotos=useMemo(()=>{const list=rows.filter(r=>!isTestEvidence(r)&&r.postedDate===date).flatMap(r=>r.photos||[]);if(!connected)for(const photo of evidence.find(d=>d.date===date)?.photos||[])if(!list.some(p=>p.url===photo.url||p.name===photo.name))list.push(photo);return list;},[rows,date,connected]);
 useEffect(()=>{let canceled=false;void (async()=>{for(const r of visible){if(canceled)break;if(!r.pdf||counts[r.id]||documentPageCount(r))continue;try{const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/posting-assets/pdf.worker.min.mjs';const task=pdfjs.getDocument({url:r.pdf.url});try{const doc=await task.promise;if(!canceled)setCounts(p=>({...p,[r.id]:doc.numPages}));}finally{await task.destroy();}}catch{/* Drive PDF may require opening in Drive; retain manual page count. */}}})();return()=>{canceled=true;};},[visible,counts]);
 async function changePhoto(r:Row,page:number,file?:File,remove?:Asset){await run(async()=>{
  if(editing)throw Error('กำลังแก้ไขรายการ กรุณาจัดรูปและบันทึกจากแบบฟอร์มแก้ไข');
  if(!connected||r.previewOnly)throw Error('เชื่อมและโหลดรายการจาก Master เดิมก่อนอัปโหลด');
  if(file)validatePhoto(file);
  const data=await api();const latest=data.rows?.find((x:PostingRow)=>x.id===r.id);if(!latest)throw Error('ไม่พบรายการเดิม กรุณาโหลดใหม่');if(latest.revision!==r.revision)throw Error('รายการเปลี่ยนจากเครื่องอื่น กรุณาโหลดข้อมูลใหม่ก่อน');
  const old=latest.photos.filter((p,i)=>pageOf(p,i,latest.notes)===page);const replacing=remove?[remove]:file?old:[];
  if(replacing.length&&latest.photos.some(p=>!p.id))throw Error('รูปเดิมไม่มีรหัสไฟล์ครบ กรุณาตรวจ Master ก่อนเปลี่ยนหรือลบรูป');
  const requestId=crypto.randomUUID();const photoUploads=file?[await uploadData(new File([file],`หน้า-${page}__${file.name}`,{type:imageType(file)}),requestId)]:[];
  const notes=preservePhotoPages(latest,counts[r.id]||Math.max(page,documentPageCount(latest)));
  setMessage('กำลังบันทึกรูป กรุณารอสักครู่');const result=await api({...latest,notes,action:'save',requestId,...(replacing.length?{keepPhotoIds:latest.photos.filter(p=>!replacing.some(x=>x.id===p.id)).map(p=>p.id)}:{}),photoUploads});
  if(!result.row||result.row.id!==r.id||result.row.revision<=latest.revision||photoUploads.some(u=>!result.row.photos?.some((p:Asset&{key?:string})=>p.key===u.key)))throw Error('ยังยืนยันผลบันทึกไม่ได้ กรุณาโหลดข้อมูลก่อนลองใหม่');
  setRows(prev=>prev.map(x=>x.id===r.id?result.row:x));setMessage('บันทึกและตรวจอ่านกลับจาก Master เดิมแล้ว');
 });}
 const [year,mo]=month.split('-').map(Number),days=new Date(year,mo,0).getDate(),offset=new Date(year,mo-1,1).getDay();
 const marked=new Set([...rows.map(r=>r.postedDate),...evidence.map(d=>d.date)]);
 function selectDay(d:string){setDate(d);setMonth(d.slice(0,7));setShowAll(false);}
 function moveMonth(step:number){const d=new Date(year,mo-1+step,1);setMonth(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);}

 function acceptRow(row:PostingRow){setRows(prev=>[...prev.filter(r=>r.id!==row.id),row]);setCounts(prev=>({...prev,[row.id]:documentPageCount(row)||prev[row.id]}));}
 function uploadSlots(r:Row,count:number){return <div className="page-slots">{Array.from({length:count},(_,i)=>{
  const page=i+1,hasPhoto=r.photos.some((p,j)=>pageOf(p,j,r.notes)===page);
  return <label key={page} className="compact-dropzone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(e.dataTransfer.files.length!==1){setMessage('เลือกหนึ่งรูปต่อหน้า');return;}void changePhoto(r,page,e.dataTransfer.files[0]);}}>
   <span>หน้า {page} · {hasPhoto?'เปลี่ยนรูป':'อัปโหลดรูป'}</span>
   <input type="file" aria-label={'รูปหน้า '+page+' '+r.title} accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" disabled={busy||!connected||r.previewOnly||!!editing} onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void changePhoto(r,page,f);}}/>
  </label>;
 })}</div>;}
 return <main className="posting-dashboard">
  <header><div><h1>ทะเบียนการติดประกาศ</h1><span>กลุ่มงานพัสดุ โรงพยาบาลอุตรดิตถ์</span><a href="/">← กลับหน้าหลัก</a></div></header>
  <div className="posting-wrap">
   <section className="connection">
    <input type="password" aria-label="รหัสเจ้าหน้าที่เดิม" placeholder="รหัสเจ้าหน้าที่เดิม" value={code} disabled={busy} onChange={e=>{setCode(e.target.value);setConnected(false);}} onKeyDown={e=>{if(e.key==='Enter'&&!busy)void run(()=>connect());}}/>
    <button disabled={busy} onClick={()=>run(()=>connect())}>เชื่อม / โหลดข้อมูลเดิม</button>
    <span role="status" aria-live="polite">{message}</span>
   </section>
   <div className="posting-layout">
    <aside>
     <section className="calendar">
      <div className="month"><button aria-label="เดือนก่อน" onClick={()=>moveMonth(-1)}>‹</button><b>{new Intl.DateTimeFormat('th-TH',{month:'long',year:'numeric'}).format(new Date(year,mo-1,1))}</b><button aria-label="เดือนถัดไป" onClick={()=>moveMonth(1)}>›</button></div>
      <div className="days">
       {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d=><span key={d}>{d}</span>)}
       {Array.from({length:offset},(_,i)=><span key={'blank'+i}/>)}
       {Array.from({length:days},(_,i)=>{const day=month+'-'+String(i+1).padStart(2,'0');return <button key={day} aria-label={thai(day)+(marked.has(day)?' มีประกาศหรือรูป':'')} aria-pressed={date===day} className={(date===day?'selected ':'')+(marked.has(day)?'marked':'')} onClick={()=>selectDay(day)}>{i+1}{marked.has(day)&&<small>●</small>}</button>;})}
      </div>
      <small>● วันที่มีประกาศหรือรูปหลักฐาน</small>
      <input type="date" aria-label="เลือกวันที่" value={date} onChange={e=>{if(e.target.value)selectDay(e.target.value);}}/>
     </section>
     <p className="hint">{connected?'แสดงข้อมูลจาก Master เดิม':'เชื่อมเพื่อดูทะเบียนครบทุกวันและบันทึกไฟล์'}</p>
    </aside>
    <section className="results">
     <div className="heading"><div><h2>{thai(date)}</h2><p>{visible.length} รายการ · รูปหลักฐาน {allPhotos.length} รูป</p></div><input aria-label="ค้นหารายการ" placeholder="ค้นหารายการ / ชื่อโครงการ / คำสำคัญ" value={q} onChange={e=>setQ(e.target.value)}/></div>
     <div className="filters">{['ทั้งหมด',...KINDS].map((k,i)=><button key={k} aria-pressed={kind===k} className={kind===k?'active':''} onClick={()=>setKind(k)}>{['ทั้งหมด','ประกวดราคา','เผยแพร่แผน','ผู้ชนะ','ยกเลิก'][i]}</button>)}<button className="add-announcement" disabled={busy||!!newDate||!!editing} onClick={()=>setNewDate(date)}>+ เพิ่มประกาศของวันนี้</button></div>
     {newDate&&<AnnouncementUpload key={newDate} date={newDate} busy={busy} connected={connected} api={api} run={run} onRow={acceptRow} setMessage={setMessage} onClose={()=>setNewDate(null)} onDone={()=>{selectDay(newDate);setNewDate(null);setKind('ทั้งหมด');setQ('');}}/>}
     {editing&&<EditAnnouncement key={editing.id} row={editing} initialCount={counts[editing.id]||documentPageCount(editing)||Math.max(1,...editing.photos.map((p,i)=>pageOf(p,i,editing.notes)))} busy={busy} connected={connected&&!editing.previewOnly} api={api} run={run} onRow={acceptRow} onClose={()=>{setEditing(null);setKind('ทั้งหมด');setQ('');}} setMessage={setMessage}/>}
     <div className="table-scroll"><table>
      <thead><tr>{['ลำดับ','ชื่อรายการ','ประเภท','จำนวนหน้า','PDF','รูปถ่าย','อัปโหลดรูป'].map(h=><th key={h}>{h}</th>)}</tr></thead>
      <tbody>{visible.map(r=>{
       const inferred=Math.max(1,...r.photos.map((p,i)=>pageOf(p,i,r.notes))),known=counts[r.id]||documentPageCount(r),count=known||inferred;
       return <tr key={r.id}>
        <td>{r.sequence}</td><td className="title">{r.title}<button className="edit-row-button" disabled={busy||!!editing||!!newDate} title="เปิดแบบฟอร์มแก้ไข" onClick={()=>{setEditing(r);requestAnimationFrame(()=>document.querySelector('.edit-announcement')?.scrollIntoView({behavior:'smooth',block:'start'}));}}>แก้ไข</button></td><td><span className={'kind-tag kind-'+KINDS.indexOf(r.kind)}>{r.kind.replace(/^ประกาศ/,'')}</span></td>
        <td>{known||!r.pdf?count:'รอตรวจ PDF'}{r.pdf&&!known&&<details className="page-count"><summary>ระบุจำนวนหน้า</summary><input type="number" min={inferred} max={500} aria-label={'จำนวนหน้า '+r.title} value={count} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=inferred&&n<=500)setCounts(p=>({...p,[r.id]:n}));}}/></details>}</td>
        <td>{r.pdf?<a href={r.pdf.url} target="_blank" rel="noreferrer">ดู PDF</a>:<small>—</small>}</td>
        <td>{r.photos.length?r.photos.map((p,i)=><div className="photo-actions" key={p.id||p.url}><small>หน้า {pageOf(p,i,r.notes)} · อัปแล้ว</small><div><a href={p.url} target="_blank" rel="noreferrer">ดูรูป</a><a href={photoDownload(p)} download target="_blank" rel="noreferrer">ดาวน์โหลด</a>{connected&&!r.previewOnly&&<button disabled={busy||!!editing} onClick={()=>setDeleting({row:r,photo:p,page:pageOf(p,i,r.notes)})}>ลบรูป</button>}</div></div>):<small className="muted">ยังไม่มีรูป</small>}</td>
        <td>{count===1?uploadSlots(r,count):<details className="upload-details"><summary>เลือกหน้า ({count})</summary>{uploadSlots(r,count)}</details>}</td>
       </tr>;
      })}</tbody>
     </table>{!visible.length&&<div className="empty"><p>{connected?'ยังไม่มีรายการตรงกับวันที่และเงื่อนไขที่เลือก':'ยังไม่มีรายการเผยแพร่ของวันนี้ เชื่อมเพื่อโหลดข้อมูลจาก Master เดิม'}</p><button disabled={busy||!!newDate||!!editing} onClick={()=>setNewDate(date)}>+ เพิ่มประกาศของวันนี้</button></div>}</div>
     <section className="gallery"><button className="gallery-toggle" aria-expanded={showAll} onClick={()=>setShowAll(!showAll)}>ดูรูปทั้งหมดของวันที่เลือก ({allPhotos.length}) {showAll?'▴':'▾'}</button>{showAll&&<div className="gallery-grid">{allPhotos.map(p=><figure key={p.id||p.url}><Photo photo={p}/><figcaption>{p.name}<a href={photoDownload(p)} download target="_blank" rel="noreferrer">ดาวน์โหลด</a></figcaption></figure>)}{!allPhotos.length&&<p>ยังไม่มีรูปของวันที่เลือก</p>}</div>}</section>
    </section>
   </div>
  </div>
  {deleting&&<div className="confirmation-dialog" role="dialog" aria-modal="true" aria-label="ยืนยันลบรูป"><section><h3>ลบรูปหน้า {deleting.page} ออกจากรายการ?</h3><p>ไฟล์ต้นฉบับยังคงเก็บอยู่ใน Google Drive</p><button onClick={()=>{const selected=deleting;setDeleting(null);void changePhoto(selected.row,selected.page,undefined,selected.photo);}}>ยืนยันลบรูป</button><button onClick={()=>setDeleting(null)}>ยกเลิก</button></section></div>}
 </main>;
}
