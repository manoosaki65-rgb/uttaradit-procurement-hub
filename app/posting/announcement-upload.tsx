"use client";
import {useEffect,useRef,useState} from 'react';
import {KINDS,exactMatch} from '../../lib/posting-core.js';
import {uploadData,type PostingRow} from '../../lib/posting-media';
import {preservePhotoPages} from '../../lib/posting-photo-pages.js';
import {validatePhoto,imageType} from '../../lib/posting-upload.js';

type ApiResult={rows:PostingRow[];row:PostingRow;error?:string};
type PendingPhoto={file:File;key:string;preview:string};
type Props={date:string;busy:boolean;connected:boolean;api:(body?:unknown)=>Promise<ApiResult>;run:(fn:()=>Promise<void>)=>Promise<void>;onRow:(row:PostingRow)=>void;onDone:()=>void;onClose:()=>void;setMessage:(message:string)=>void};

export default function AnnouncementUpload({date,busy,connected,api,run,onRow,onDone,onClose,setMessage}:Props){
 const [title,setTitle]=useState(''),[kind,setKind]=useState(''),[pdf,setPdf]=useState<File|null>(null),[count,setCount]=useState(0),[photos,setPhotos]=useState<Record<number,PendingPhoto>>({}),[reading,setReading]=useState(false),[saved,setSaved]=useState<PostingRow|null>(null),[preview,setPreview]=useState(''),[previewPdf,setPreviewPdf]=useState('');
 const identity=useRef({id:crypto.randomUUID(),pdfKey:crypto.randomUUID(),requestId:crypto.randomUUID()});
 const urls=useRef(new Set<string>());
 const disabled=busy||reading;
 const [closing,setClosing]=useState(false);
 useEffect(()=>()=>{for(const url of urls.current)URL.revokeObjectURL(url);},[]);
 function remember(file:File){const url=URL.createObjectURL(file);urls.current.add(url);return url;}
 async function choosePdf(file?:File){
  if(!file||disabled||saved)return;
  setReading(true);
  try{const {pdfPageCount}=await import('../../lib/posting-upload.js');const pages=await pdfPageCount(file);setPdf(file);setCount(pages);setPhotos({});for(const url of urls.current)URL.revokeObjectURL(url);urls.current.clear();setPreview('');identity.current={id:crypto.randomUUID(),pdfKey:crypto.randomUUID(),requestId:crypto.randomUUID()};setMessage(`อ่าน PDF จริงแล้ว ${pages} หน้า เลือกรูปจับคู่ตามหน้าได้`);}
  catch(e){setMessage(e instanceof Error?e.message:String(e));}finally{setReading(false);}
 }
 function choosePhoto(page:number,file?:File){
  if(!file||disabled)return;
  if(photos[page]&&saved?.photos.some(p=>(p as {key?:string}).key===photos[page].key)){setMessage('รูปหน้านี้บันทึกแล้ว เปลี่ยนรูปต่อได้จากตารางหลังปิดแบบฟอร์ม');return;}
  try{validatePhoto(file);const old=photos[page];if(old){URL.revokeObjectURL(old.preview);urls.current.delete(old.preview);}setPhotos(prev=>({...prev,[page]:{file,key:crypto.randomUUID(),preview:remember(file)}}));}
  catch(e){setMessage(e instanceof Error?e.message:String(e));}
 }
 async function viewPage(page:number){
  if(!pdf||disabled)return;setReading(true);
  try{
   const {singlePdfPage}=await import('../../lib/posting-upload.js');const file=await singlePdfPage(pdf,page);
   const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/posting-assets/pdf.worker.min.mjs';
   const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});
   try{const doc=await task.promise,p=await doc.getPage(1),viewport=p.getViewport({scale:1.5}),canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;
    await p.render({canvas,canvasContext:canvas.getContext('2d')!,viewport}).promise;
    const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('แสดง PDF ไม่สำเร็จ')),'image/png'));
    setPreview(remember(new File([blob],'preview.png',{type:'image/png'})));setPreviewPdf(remember(file));
   }finally{await task.destroy();}
  }
  catch(e){setMessage(e instanceof Error?e.message:String(e));}finally{setReading(false);}
 }
 async function save(){await run(async()=>{
  if(!connected)throw Error('เชื่อมด้วยรหัสเจ้าหน้าที่เดิมก่อนบันทึก');
  if(!title.trim()||!KINDS.includes(kind)||!pdf||!count)throw Error('กรุณาระบุชื่อ เลือกประเภท และอัปโหลด PDF ก่อน');
  const {id,pdfKey,requestId}=identity.current;
  const data=await api();if(!Array.isArray(data.rows))throw Error('โหลด Master ก่อนบันทึกไม่สำเร็จ');
  let row=data.rows.find(r=>r.id===id);
  if(!row){
   if(exactMatch(title,kind,date,data.rows))throw Error('มีประกาศชื่อเดียวกันในวันที่และประเภทนี้แล้ว กรุณาแนบรูปที่รายการเดิม');
   const original=new File([pdf],`__page-1-${count}__${pdf.name}`,{type:'application/pdf'});
   const result=await api({action:'save',id,revision:0,title:title.trim(),kind,postedDate:date,notes:preservePhotoPages({notes:'',photos:[]},count),requestId,pdfUpload:await uploadData(original,pdfKey)});
   row=result.row;
  }
  if(!row||row.postedDate!==date||(row.pdf as {key?:string}|null)?.key!==pdfKey)throw Error('ยังยืนยัน PDF ใน Master ไม่ได้ กดบันทึกต่อเพื่อตรวจข้อมูลเดิมอีกครั้ง');
  setSaved(row);onRow(row);
  // One image per request stays below the existing API limit. Stable keys allow
  // a retry to read the committed row and resume without duplicating attachments.
  for(const [pageText,item] of Object.entries(photos)){
   const page=Number(pageText);
   if(row.photos.some(p=>(p as {key?:string}).key===item.key))continue;
   setMessage(`กำลังบันทึกรูปหน้า ${page}/${count}`);
   const file=new File([item.file],`หน้า-${page}__${item.file.name}`,{type:imageType(item.file)});
   const result=await api({...row,action:'save',notes:preservePhotoPages(row,count),requestId:item.key,photoUploads:[await uploadData(file,item.key)]});
   if(!result.row?.photos?.some(p=>(p as {key?:string}).key===item.key))throw Error(`ยังยืนยันรูปหน้า ${page} ไม่ได้ กดบันทึกต่อเพื่อโหลดและบันทึกเฉพาะรูปที่เหลือ`);
   row=result.row;setSaved(row);onRow(row);
  }
  const verified=await api();const persisted=verified.rows?.find(r=>r.id===id);
  if(!persisted?.pdf||Object.values(photos).some(item=>!persisted.photos.some(p=>(p as {key?:string}).key===item.key)))throw Error('ตรวจอ่านกลับไม่ครบ กดบันทึกต่อเพื่อตรวจข้อมูลอีกครั้ง');
  onRow(persisted);setMessage(`บันทึก PDF ${count} หน้า และรูป ${Object.keys(photos).length} รูปลง Master/Drive เดิม ตรวจอ่านกลับแล้ว`);onDone();
 });}
 useEffect(()=>{const warn=(e:BeforeUnloadEvent)=>{if(pdf){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[pdf]);
 return <section className="new-announcement" aria-label="เพิ่มประกาศของวันนี้">
  <div className="form-heading"><h3>เพิ่มประกาศของวันที่ {date}</h3><button disabled={disabled} onClick={()=>pdf?setClosing(true):onClose()}>ปิด</button></div>
  {closing&&<div className="close-form-confirm"><p>{saved?'ข้อมูลที่บันทึกแล้วยังคงอยู่ แนบรูปต่อในตารางได้':'ไฟล์ที่เลือกยังไม่บันทึก ต้องการปิดแบบฟอร์มหรือไม่?'}</p><button disabled={disabled} onClick={onClose}>ยืนยันปิด</button><button onClick={()=>setClosing(false)}>กลับไปแบบฟอร์ม</button></div>}
  <div className="form-fields"><label>ชื่อรายการ / ชื่อโครงการ<input aria-label="ชื่อประกาศใหม่" value={title} disabled={disabled||!!saved} onChange={e=>setTitle(e.target.value)}/></label><label>ประเภท<select aria-label="ประเภทประกาศใหม่" value={kind} disabled={disabled||!!saved} onChange={e=>setKind(e.target.value)}><option value="">เลือกประเภท</option>{KINDS.map((k,i)=><option value={k} key={k}>{['ประกวดราคา','เผยแพร่แผน','ผู้ชนะ','ยกเลิก'][i]}</option>)}</select></label></div>
  <label className="pdf-dropzone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(e.dataTransfer.files.length!==1){setMessage('เลือก PDF หนึ่งไฟล์ต่อประกาศ');return;}void choosePdf(e.dataTransfer.files[0]);}}><b>{reading?'กำลังอ่าน PDF…':pdf?`${pdf.name} · ${count} หน้า`:'คลิกเลือก PDF หรือลากไฟล์มาวาง'}</b><input type="file" accept="application/pdf,.pdf" aria-label="PDF ประกาศใหม่" disabled={disabled||!!saved} onChange={e=>{void choosePdf(e.target.files?.[0]);e.target.value='';}}/><small>เก็บ PDF ต้นฉบับครบทุกหน้าใน Google Drive เดิม · ไม่เกิน 20 MB</small></label>
  {count>0&&<div className="new-pages">{Array.from({length:count},(_,i)=>{const page=i+1,item=photos[page],uploaded=!!item&&!!saved?.photos.some(p=>(p as {key?:string}).key===item.key);return <div className="new-page" key={page}><b>หน้า {page}</b><button disabled={disabled} onClick={()=>viewPage(page)}>ดู PDF หน้า {page}</button><label className="compact-dropzone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(e.dataTransfer.files.length!==1){setMessage('เลือกหนึ่งรูปต่อหน้า');return;}choosePhoto(page,e.dataTransfer.files[0]);}}><span>{item?'เปลี่ยนรูป':'เลือกรูป / ลากวาง'}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" aria-label={`รูปประกาศใหม่หน้า ${page}`} disabled={disabled||uploaded} onChange={e=>{choosePhoto(page,e.target.files?.[0]);e.target.value='';}}/></label><small>{uploaded?'อัปแล้ว':item?'เลือกรูปแล้ว รอบันทึก':'ยังไม่มีรูป'}</small>{item&&<><a href={item.preview} target="_blank" rel="noreferrer">ดูรูป</a><a href={item.preview} download={item.file.name}>ดาวน์โหลด</a><span className="file-name">{item.file.name}</span>{!uploaded&&<button disabled={disabled} onClick={()=>{setPhotos(prev=>{const next={...prev};delete next[page];return next;});URL.revokeObjectURL(item.preview);urls.current.delete(item.preview);}}>นำรูปออก</button>}</>}</div>;})}</div>}
  {!connected&&<p>เชื่อมด้วยรหัสเจ้าหน้าที่เดิมด้านบนเพื่อบันทึกลง Master/Drive</p>}
  <button className="primary" disabled={disabled||!connected||!pdf||!kind||!title.trim()} onClick={save}>{saved?'บันทึกต่อ / ตรวจอ่านกลับ':'บันทึกประกาศ PDF และรูป'}</button>
  {preview&&<div className="pdf-dialog" role="dialog" aria-modal="true" aria-label="ตัวอย่าง PDF แยกหน้า"><div><button onClick={()=>setPreview('')}>ปิดตัวอย่าง PDF</button><a href={previewPdf} download="หน้าเอกสาร.pdf">ดาวน์โหลดหน้านี้</a><div className="pdf-preview-page"><img alt="PDF หน้าที่เลือก" src={preview}/></div></div></div>}
 </section>;
}
