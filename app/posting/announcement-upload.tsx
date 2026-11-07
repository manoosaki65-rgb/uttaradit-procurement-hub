"use client";
import {useEffect,useState} from 'react';
import {KINDS,exactMatch,validateRanges} from '../../lib/posting-core.js';
import {readPdf,splitPdf,uploadData,type PostingRow,type Part} from '../../lib/posting-media';
import {mergePrevious} from '../../lib/posting-order.js';

type Draft=PostingRow & {pdfFile?:File;photoFiles?:File[];requestId?:string};
type PartPhoto={file:File;preview:string};
type Props={date:string;rows:PostingRow[];busy:boolean;connected:boolean;api:(body?:unknown)=>Promise<{rows:PostingRow[];row:PostingRow}>;run:(fn:()=>Promise<void>)=>Promise<void>;onRow:(row:PostingRow)=>void;onDone:()=>void;onClose:()=>void;setMessage:(text:string)=>void};
const card={background:'#fff',border:'1px solid #dbeafe',borderRadius:10,padding:12,marginBottom:12};
const fresh=(kind:string,date:string):Draft=>({id:crypto.randomUUID(),sequence:0,title:'',kind,postedDate:date,notes:'',revision:0,pdf:null,photos:[]});

export default function AnnouncementUpload({date:workDate,rows,busy,connected,api,run,onRow,onDone,onClose,setMessage}:Props){
 const [pdf,setPdf]=useState<File|null>(null);
 const [parts,setParts]=useState<Part[]>([]);
 const [total,setTotal]=useState(0);
 const [pdfPreview,setPdfPreview]=useState('');
 const [pdfBatch,setPdfBatch]=useState('');
 const [partPhotos,setPartPhotos]=useState<Record<string,PartPhoto>>({});
 const [saveError,setSaveError]=useState('');
 const activeKind=KINDS[0];

 useEffect(()=>{if(!pdf){setPdfPreview('');return;}const url=URL.createObjectURL(pdf);setPdfPreview(url);return()=>URL.revokeObjectURL(url);},[pdf]);
 useEffect(()=>()=>{Object.values(partPhotos).forEach(p=>URL.revokeObjectURL(p.preview));},[partPhotos]);
 useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(pdf||parts.length||Object.keys(partPhotos).length){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[pdf,parts,partPhotos]);

 const persist=async(d:Draft)=>{
  const requestId=d.requestId||crypto.randomUUID();
  const body={...d,action:'save',requestId,pdfFile:undefined,photoFiles:undefined,pdfUpload:d.pdfFile?await uploadData(d.pdfFile,requestId):undefined,photoUploads:await Promise.all((d.photoFiles||[]).map((f,i)=>uploadData(f,requestId+'-'+i)))};
  const result=await api(body);
  if(!result.row)throw Error('บันทึกไม่สำเร็จ');
  onRow(result.row);
  return result.row;
 };

 const clearPartPhotos=()=>{
  Object.values(partPhotos).forEach(p=>URL.revokeObjectURL(p.preview));
  setPartPhotos({});
 };

 const scanPdf=()=>run(async()=>{
  if(!pdf)throw Error('เลือก PDF ก่อน');
  const data=await readPdf(pdf,rows.filter(r=>r.postedDate===workDate),setMessage);
  clearPartPhotos();
  const recognized=Array.from(new Set(data.parts.map(p=>p.kind).filter(k=>KINDS.includes(k))));
  const commonKind=recognized.length===1?recognized[0]:'';
  setParts(data.parts.map(p=>({...p,kind:p.kind||commonKind,id:crypto.randomUUID(),requestId:crypto.randomUUID()})));
  setSaveError('');
  setTotal(data.total);
  setPdfBatch(crypto.randomUUID());
  setMessage('อ่านชื่อและช่วงหน้าแล้ว เลือกรูปประกอบในแต่ละแถว แล้วกดบันทึกทั้งหมด');
 });

 const choosePhoto=(key:string,file?:File)=>{
  if(!file)return;
  if(!/^image\//.test(file.type)&&!/\.(heic|heif)$/i.test(file.name)){setMessage('กรุณาเลือกไฟล์รูปภาพ');return;}
  setPartPhotos(prev=>{
   if(prev[key])URL.revokeObjectURL(prev[key].preview);
   return {...prev,[key]:{file,preview:URL.createObjectURL(file)}};
  });
 };

 const removePhoto=(key:string)=>setPartPhotos(prev=>{
  const next={...prev};
  if(next[key])URL.revokeObjectURL(next[key].preview);
  delete next[key];
  return next;
 });

 const saveParts=()=>run(async()=>{
  setSaveError('');
  try{
  if(!connected)throw Error('เชื่อมด้วยรหัสเจ้าหน้าที่ก่อนบันทึก');
  if(!pdf)throw Error('เลือก PDF ก่อน');
  validateRanges(parts,total);
  const invalidKind=parts.findIndex(p=>!KINDS.includes(p.kind));
  if(invalidKind!==-1){
   const missing=parts[invalidKind];
   const message=`ประกาศหน้า ${missing.start} ยังไม่ได้เลือกประเภท กรุณาเลือกก่อนบันทึก`;
   requestAnimationFrame(()=>document.querySelectorAll<HTMLSelectElement>('.new-announcement select[aria-label="ประเภทประกาศ"]')[invalidKind]?.focus());
   throw Error(message);
  }
  const missingTitle=parts.findIndex(p=>!p.title.trim());
  if(missingTitle!==-1){
   const missing=parts[missingTitle];
   const pageLabel=missing.start===missing.end?String(missing.start):missing.start+'-'+missing.end;
   requestAnimationFrame(()=>{
    const input=document.querySelectorAll<HTMLInputElement>('.new-announcement input[aria-label="ชื่อชุดประกาศ"]')[missingTitle];
    input?.scrollIntoView({behavior:'smooth',block:'center'});
    input?.focus({preventScroll:true});
   });
   throw Error('ประกาศหน้า '+pageLabel+' ยังไม่มีชื่อเรื่อง — กรุณาตรวจ PDF และกรอกชื่อรายการในช่องที่ไฮไลต์');
  }
  const missingPhoto=parts.find(p=>!p.saved&&!partPhotos[p.id||'']);
  if(missingPhoto)throw Error(`กรุณาเลือกรูปประกอบหน้า ${missingPhoto.start}${missingPhoto.end!==missingPhoto.start?`-${missingPhoto.end}`:''}`);
  const selected=parts.map(p=>p.target).filter(Boolean);
  if(new Set(selected).size!==selected.length)throw Error('เลือกจับคู่ PDF ได้หนึ่งชุดต่อรายการ');

  const latest=new Map(rows.map(r=>[r.id,r]));
  for(const p of parts){
   if(p.saved)continue;
   const existing=p.target?latest.get(p.target):exactMatch(p.title,p.kind,workDate,Array.from(latest.values()));
   if(p.target&&!existing)throw Error('ไม่พบรายการที่จับคู่ กรุณาโหลดข้อมูลใหม่');
   if(existing?.pdf&&!confirm(`รายการ ${existing.title} มี PDF แล้ว ต้องการเปลี่ยนไฟล์ที่จับคู่หรือไม่? ไฟล์เดิมยังเก็บใน Drive`))throw Error('ยังไม่เปลี่ยน PDF');
   const photo=partPhotos[p.id||''];
   const d:Draft={
    ...(existing||{...fresh(p.kind,workDate),id:p.id||crypto.randomUUID()}),
    requestId:p.requestId,
    title:p.title,
    kind:p.kind,
    pdfFile:await splitPdf(pdf,p.start,p.end,p.title+`__batch-${pdfBatch}__page-${String(p.start).padStart(4,'0')}-${String(p.end).padStart(4,'0')}__`),
    photoFiles:photo?[photo.file]:[]
   };
   const saved=await persist(d);
   latest.set(saved.id,saved);
   setParts(prev=>prev.map(x=>x.id===p.id?{...x,saved:true,target:saved.id}:x));
  }
  clearPartPhotos();
  setParts([]);
  setPdf(null);
  setMessage('บันทึก PDF และรูปประกอบครบทุกแถวลง Google Drive และ Master สำเร็จ');
  onDone();
  }catch(error){
   setSaveError(error instanceof Error?error.message:String(error));
   throw error;
  }
 });

 const changePart=(i:number,patch:Partial<Part>)=>setParts(prev=>prev.map((x,j)=>j===i&&!x.saved?{...x,...patch,requestId:crypto.randomUUID()}:x));

 return <section className="new-announcement" aria-label="เพิ่มประกาศของวันนี้">
  <div className="form-heading"><h3>อ่าน PDF / เลือกรูป วันที่ {workDate}</h3><button disabled={busy} onClick={onClose}>ปิด</button></div>

  <section style={{...card,background:'#f1f7ff'}}>
   <b>📄 1. เลือก PDF รวมชุดเดียว</b>
   <small>ระบบอ่านชื่อจาก PDF ต้นฉบับ แล้วให้เลือกรูปประกอบในแต่ละแถวก่อนบันทึก</small>
   <input aria-label="PDF รวมชุดเดิม" type="file" accept="application/pdf" disabled={busy} onChange={e=>{clearPartPhotos();setPdf(e.target.files?.[0]||null);setParts([]);setTotal(0);}}/>
   <button disabled={busy||!pdf} onClick={scanPdf}>🔎 อ่าน PDF</button>
  </section>

  {parts.length>0&&<section style={card}>
   <b>ตรวจชุดประกาศ — {total} หน้า</b> {pdfPreview&&<a href={pdfPreview} target="_blank" rel="noreferrer">เปิด PDF ต้นฉบับเพื่อตรวจช่วงหน้า</a>}
   <small>ตรวจชื่อ/ประเภท แล้วเลือกรูปของแต่ละหน้าในแถวเดียวกัน จากนั้นบันทึกทั้งหมดครั้งเดียว</small>
   {parts.map((p,i)=>{const key=p.id||String(i),photo=partPhotos[key];return <fieldset disabled={p.saved||busy} key={key} className="tools" style={{marginTop:8,alignItems:'center'}}>
    หน้า <input aria-label="หน้าเริ่ม" type="number" style={{width:60}} value={p.start} onChange={e=>changePart(i,{start:Number(e.target.value)})}/>
    ถึง <input aria-label="หน้าจบ" type="number" style={{width:60}} value={p.end} onChange={e=>changePart(i,{end:Number(e.target.value)})}/>
    <input aria-label="ชื่อชุดประกาศ" placeholder="ชื่อประกาศจาก PDF" style={{flex:'1 1 520px',minWidth:360,...(!p.title.trim()?{borderColor:'#dc2626',background:'#fff1f2'}:{})}} value={p.title} onChange={e=>{setSaveError('');changePart(i,{title:e.target.value});}}/>
    <select aria-label="ประเภทประกาศ" style={!KINDS.includes(p.kind)?{borderColor:'#dc2626',background:'#fff1f2'}:undefined} value={p.kind} onChange={e=>{setSaveError('');changePart(i,{kind:e.target.value});}}><option value="">ไม่มั่นใจ — เลือกประเภท</option>{KINDS.map(k=><option key={k}>{k}</option>)}</select>
    <select value={p.target} onChange={e=>changePart(i,{target:e.target.value,title:rows.find(r=>r.id===e.target.value)?.title||p.title,kind:rows.find(r=>r.id===e.target.value)?.kind||p.kind})}><option value="">สร้างรายการใหม่</option>{rows.map(r=><option key={r.id} value={r.id}>{r.postedDate} · {r.sequence} · {r.title}</option>)}</select>
    <label style={{display:'inline-flex',alignItems:'center',gap:6,border:'1px solid #bfdbfe',borderRadius:8,padding:'7px 10px',cursor:'pointer',background:'#f8fbff'}}>
     📷 {photo?'เปลี่ยนรูป':'เลือกรูป'}
     <input type="file" accept="image/*,.heic,.heif" style={{display:'none'}} onChange={e=>{choosePhoto(key,e.target.files?.[0]);e.target.value='';}}/>
    </label>
    {photo&&<><a href={photo.preview} target="_blank" rel="noreferrer">ดูรูป</a><span className="file-name">{photo.file.name}</span><button type="button" onClick={()=>removePhoto(key)}>นำรูปออก</button></>}
    {!p.saved&&!p.title.trim()&&<small style={{color:'#b91c1c'}}>หน้า {p.start}: ไม่พบชื่อเรื่องจาก PDF กรุณากรอกชื่อจากต้นฉบับ</small>}
    {!p.saved&&!KINDS.includes(p.kind)&&<small style={{color:'#b91c1c'}}>หน้า {p.start}: ต้องเลือกประเภทประกาศก่อนบันทึก</small>}
    {p.mergeReason&&<small>{p.mergeReason}</small>}
    {p.review&&<small>ยังไม่มั่นใจว่าเป็นหน้าต่อ — โปรดตรวจต้นฉบับ</small>}
    {i>0&&<button type="button" disabled={busy||p.saved||parts[i-1].saved} onClick={()=>{try{setParts(mergePrevious(parts,i));setMessage('รวมช่วงหน้าตามที่เลือกแล้ว กรุณาตรวจชื่อ ประเภท และเลือกรูปของช่วงที่รวมใหม่');}catch(e){setMessage(e instanceof Error?e.message:String(e));}}}>รวมกับหน้าก่อน</button>}
    <button type="button" onClick={()=>{removePhoto(key);setParts(prev=>prev.filter((_,j)=>j!==i));}}>ลบช่วง</button>
    {p.saved&&<b>บันทึกแล้ว</b>}
   </fieldset>})}
   <div className="tools" style={{marginTop:10}}>
    <button type="button" onClick={()=>setParts(prev=>[...prev,{start:1,end:1,title:'',target:'',kind:activeKind,id:crypto.randomUUID(),requestId:crypto.randomUUID()}])}>เพิ่มช่วงประกาศ</button>
    <button className="primary" disabled={busy||!connected} onClick={saveParts}>💾 บันทึก PDF + รูปทั้งหมด</button>
   </div>
   {saveError&&<p role="alert" style={{color:'#991b1b',background:'#fff1f2',border:'1px solid #fca5a5',padding:12,borderRadius:8,marginTop:8}}>บันทึกไม่สำเร็จ: {saveError}</p>}
   {!connected&&<small>เลือก PDF อ่านชื่อ และเลือกรูปได้ก่อน — เชื่อมรหัสเจ้าหน้าที่เฉพาะตอนบันทึก</small>}
  </section>}
 </section>;
}
