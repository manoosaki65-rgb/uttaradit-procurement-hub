"use client";
import {useEffect,useRef,useState} from 'react';
import {KINDS} from '../../lib/posting-core.js';
import {uploadData,type Asset,type PostingRow} from '../../lib/posting-media';
import {photoPage,documentPageCount,manualPhotoPages} from '../../lib/posting-photo-pages.js';
import {validatePhoto,imageType,pdfPageCount} from '../../lib/posting-upload.js';

type Linked={asset:Asset;page:number;removed:boolean};
type Pending={file:File;key:string;preview:string;restore:string[]};
type Props={row:PostingRow;initialCount:number;busy:boolean;connected:boolean;api:(body?:unknown)=>Promise<{rows:PostingRow[];row:PostingRow}>;run:(fn:()=>Promise<void>)=>Promise<void>;onRow:(r:PostingRow)=>void;onClose:()=>void;setMessage:(s:string)=>void};
export default function EditAnnouncement({row,initialCount,busy,connected,api,run,onRow,onClose,setMessage}:Props){
 const [title,setTitle]=useState(row.title),[kind,setKind]=useState(row.kind),[count,setCount]=useState(initialCount),[pdf,setPdf]=useState<File|null>(null),[reading,setReading]=useState(false),[links,setLinks]=useState<Linked[]>(()=>row.photos.map((asset,i)=>({asset,page:photoPage(asset,i,row.notes),removed:false}))),[pending,setPending]=useState<Record<number,Pending>>({}),[started,setStarted]=useState(false);
 const progress=useRef({revision:row.revision,requestId:crypto.randomUUID(),pdfKey:crypto.randomUUID(),metadataSaved:false});
 const urls=useRef(new Set<string>());
 useEffect(()=>()=>{for(const url of urls.current)URL.revokeObjectURL(url);},[]);
 const disabled=busy||reading||started||!connected;
 const changes:string[]=[];
 if(title.trim()!==row.title)changes.push('ชื่อรายการ: '+row.title+' → '+title.trim());
 if(kind!==row.kind)changes.push('ประเภท: '+row.kind+' → '+kind);
 if(count!==initialCount)changes.push('จำนวนหน้า: '+initialCount+' → '+count);
 if(pdf)changes.push('เปลี่ยน PDF: '+pdf.name+' ('+count+' หน้า)');
 for(const link of links){const before=photoPage(link.asset,row.photos.indexOf(link.asset),row.notes);if(link.removed)changes.push('ลบการผูก '+link.asset.name+' จากหน้า '+before);else if(link.page!==before)changes.push('ย้าย '+link.asset.name+': หน้า '+before+' → หน้า '+link.page);}
 for(const [page,item] of Object.entries(pending))changes.push('รูปหน้า '+page+': '+item.file.name);
 function choose(page:number,file?:File){if(!file||disabled)return;try{validatePhoto(file);const old=pending[page];const restore=old?.restore||links.filter(p=>p.page===page&&!p.removed).map(p=>p.asset.id||p.asset.url);if(old){URL.revokeObjectURL(old.preview);urls.current.delete(old.preview);}const preview=URL.createObjectURL(file);urls.current.add(preview);setPending(prev=>({...prev,[page]:{file,key:crypto.randomUUID(),preview,restore}}));setLinks(prev=>prev.map(p=>p.page===page?{...p,removed:true}:p));}catch(e){setMessage(e instanceof Error?e.message:String(e));}}
 async function choosePdf(file?:File){if(!file||disabled)return;setReading(true);try{const n=await pdfPageCount(file);setPdf(file);setCount(n);setMessage('PDF ใหม่มี '+n+' หน้า โปรดตรวจการจับคู่รูปก่อนบันทึก');}catch(e){setMessage(e instanceof Error?e.message:String(e));}finally{setReading(false);}}
 async function save(){await run(async()=>{
  if(!connected)throw Error('เชื่อมด้วยรหัสเจ้าหน้าที่เดิมก่อนบันทึก');
  if(!title.trim()||!KINDS.includes(kind)||!Number.isInteger(count)||count<1||count>500)throw Error('ตรวจชื่อ ประเภท และจำนวนหน้าให้ถูกต้อง');
  if(links.some(p=>!p.removed&&p.page>count)||Object.keys(pending).some(p=>Number(p)>count))throw Error('มีรูปเกินจำนวนหน้าใหม่ กรุณาย้ายหรือลบการผูกให้ครบก่อน');
  const data=await api();let latest=data.rows?.find(r=>r.id===row.id);if(!latest)throw Error('ไม่พบรายการใน Master เดิม');
  const state=progress.current;
  // A lost response may have already committed. Only our exact last request
  // can be resumed; a different revision requires the user to reload and review.
  if(latest.revision!==state.revision&&(latest as PostingRow&{lastRequestId?:string}).lastRequestId!==state.requestId)throw Error('รายการเปลี่ยนจากเครื่องอื่น กรุณายกเลิกและโหลดข้อมูลใหม่ก่อนแก้');
  if(!state.metadataSaved){
   const kept=links.filter(p=>!p.removed),removed=links.some(p=>p.removed);
   if(removed&&row.photos.some(p=>!p.id))throw Error('รูปเดิมมีไฟล์ที่ไม่มีรหัส Drive ครบ จึงยังลบการผูกอย่างปลอดภัยไม่ได้');
   if((latest as PostingRow&{lastRequestId?:string}).lastRequestId!==state.requestId){
    setMessage('กำลังบันทึกการแก้ไขลง Master เดิม');setStarted(true);
    const body={...latest,action:'save',title:title.trim(),kind,notes:manualPhotoPages(latest.notes,kept,count),requestId:state.requestId,...(removed?{keepPhotoIds:kept.map(p=>p.asset.id)}:{}),...(pdf?{pdfUpload:await uploadData(new File([pdf],'__page-1-'+count+'__'+pdf.name,{type:'application/pdf'}),state.pdfKey)}:{})};
    const result=await api(body);if(!result.row||result.row.id!==row.id)throw Error('ยังยืนยันการบันทึกไม่ได้ กดบันทึกต่อเพื่อตรวจอ่านกลับ');latest=result.row;
   }
   state.metadataSaved=true;state.revision=latest.revision;onRow(latest);
  }
  for(const [pageText,item] of Object.entries(pending)){
   if(latest.photos.some(p=>(p as Asset&{key?:string}).key===item.key))continue;
   state.requestId=item.key;setMessage('กำลังบันทึกรูปหน้า '+pageText);
   const file=new File([item.file],'หน้า-'+pageText+'__'+item.file.name,{type:imageType(item.file)});
   const result=await api({...latest,action:'save',requestId:item.key,notes:manualPhotoPages(latest.notes,latest.photos.map((asset,i)=>({asset,page:photoPage(asset,i,latest!.notes)})),count),photoUploads:[await uploadData(file,item.key)]});
   if(!result.row?.photos.some(p=>(p as Asset&{key?:string}).key===item.key))throw Error('ยังยืนยันรูปหน้า '+pageText+' ไม่ได้ กดบันทึกต่อ');
   latest=result.row;state.revision=latest.revision;onRow(latest);
  }
  const verified=(await api()).rows?.find(r=>r.id===row.id);
  const kept=links.filter(p=>!p.removed);
  if(!verified||verified.title!==title.trim()||verified.kind!==kind||documentPageCount(verified)!==count||kept.some(p=>{const i=verified.photos.findIndex(x=>(x.id||x.url)===(p.asset.id||p.asset.url));return i<0||photoPage(verified.photos[i],i,verified.notes)!==p.page;})||links.filter(p=>p.removed).some(p=>verified.photos.some(x=>(x.id||x.url)===(p.asset.id||p.asset.url)))||Object.values(pending).some(item=>!verified.photos.some(p=>(p as Asset&{key?:string}).key===item.key))||(pdf&&(verified.pdf as Asset&{key?:string}|null)?.key!==state.pdfKey))throw Error('ตรวจอ่านกลับยังไม่ครบ กรุณากดบันทึกต่ออีกครั้ง');
  onRow(verified);setMessage('บันทึกการแก้ไขและตรวจอ่านกลับจาก Master เดิมสำเร็จ');onClose();
 });}
 return <section className="new-announcement edit-announcement" aria-label="แก้ไขประกาศ">
  <div className="form-heading"><h3>แก้ไข: {row.title}</h3><span>วันที่ {row.postedDate}</span></div>
  {!connected&&<div className="close-form-confirm" role="status"><b>เปิดแบบฟอร์มแล้ว — ต้องเชื่อมข้อมูลเดิมก่อนแก้ไขและบันทึก</b><p>ใส่รหัสเจ้าหน้าที่เดิม แล้วกด “เชื่อม / โหลดข้อมูลเดิม” ด้านบน จากนั้นเลือกแก้ไขรายการที่โหลดจาก Master</p><button onClick={()=>{document.querySelector<HTMLInputElement>('input[aria-label="รหัสเจ้าหน้าที่เดิม"]')?.focus();document.querySelector('.connection')?.scrollIntoView({behavior:'smooth',block:'start'});}}>ไปช่องรหัสเจ้าหน้าที่</button></div>}
  <div className="form-fields"><label>ชื่อรายการ<input aria-label="แก้ชื่อรายการ" value={title} disabled={disabled} onChange={e=>setTitle(e.target.value)}/></label><label>ประเภท<select aria-label="แก้ประเภทประกาศ" value={kind} disabled={disabled} onChange={e=>setKind(e.target.value)}>{KINDS.map(k=><option key={k}>{k}</option>)}</select></label></div>
  <label>จำนวนหน้า <input aria-label="แก้จำนวนหน้า" type="number" min={1} max={500} value={count} disabled={disabled} onChange={e=>setCount(Number(e.target.value))}/></label>
  <label className="pdf-dropzone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(e.dataTransfer.files.length===1)void choosePdf(e.dataTransfer.files[0]);else setMessage('เลือก PDF หนึ่งไฟล์');}}>เปลี่ยน PDF — คลิกเลือกหรือลากวาง<input aria-label="เปลี่ยน PDF" type="file" accept="application/pdf,.pdf" disabled={disabled} onChange={e=>{void choosePdf(e.target.files?.[0]);e.target.value='';}}/>{row.pdf&&<a href={row.pdf.url} target="_blank" rel="noreferrer">ดู PDF เดิม</a>}{pdf&&<small>รอบันทึก: {pdf.name}</small>}</label>
  <h4>จัดรูปตามหน้าด้วยมือ</h4>
  <div className="manual-links">{links.map((link,i)=><div className="new-page" key={link.asset.id||link.asset.url}><span>{link.asset.name}</span><a href={link.asset.url} target="_blank" rel="noreferrer">ดูรูป</a><label>ผูกกับหน้า <select aria-label={'หน้าของรูป '+link.asset.name} disabled={disabled||link.removed} value={link.page} onChange={e=>setLinks(prev=>prev.map((p,j)=>i===j?{...p,page:Number(e.target.value)}:p))}>{Array.from({length:Math.max(count,link.page)},(_,j)=><option value={j+1} key={j+1}>{j+1}</option>)}</select></label><button disabled={disabled} onClick={()=>setLinks(prev=>prev.map((p,j)=>i===j?{...p,removed:!p.removed}:p))}>{link.removed?'คืนการผูก':'ลบการผูก'}</button>{link.removed&&<small>จะลบการผูกเมื่อบันทึก · ไฟล์ต้นฉบับยังอยู่</small>}</div>)}</div>
  <div className="new-pages">{Array.from({length:Number.isInteger(count)&&count>0&&count<=500?count:0},(_,i)=>{const page=i+1,hasPhoto=links.some(p=>!p.removed&&p.page===page),item=pending[page];return <div className="new-page" key={page}><b>หน้า {page} — {item?'เลือกรูปใหม่แล้ว':hasPhoto?'มีรูปแล้ว':'ยังไม่มีรูป'}</b>{links.filter(p=>!p.removed&&p.page===page).map(link=><span key={link.asset.id||link.asset.url}><a href={link.asset.url} target="_blank" rel="noreferrer">ดูรูป</a> <button disabled={disabled} onClick={()=>setLinks(prev=>prev.map(p=>(p.asset.id||p.asset.url)===(link.asset.id||link.asset.url)?{...p,removed:true}:p))}>ลบการผูก</button></span>)}<label className="compact-dropzone" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(e.dataTransfer.files.length===1)choose(page,e.dataTransfer.files[0]);else setMessage('เลือกหนึ่งรูปต่อหน้า');}}><span>{hasPhoto||item?'เปลี่ยนรูป':'อัปโหลดรูป'}</span><input aria-label={'แก้รูปหน้า '+page} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" disabled={disabled} onChange={e=>{choose(page,e.target.files?.[0]);e.target.value='';}}/></label>{item&&<><a href={item.preview} target="_blank" rel="noreferrer">ดูรูปใหม่</a><span>{item.file.name}</span><button disabled={disabled} onClick={()=>{setPending(prev=>{const next={...prev};delete next[page];return next;});setLinks(prev=>prev.map(p=>item.restore.includes(p.asset.id||p.asset.url)?{...p,removed:false}:p));}}>ยกเลิกรูปใหม่</button></>}</div>;})}</div>
  <section className="edit-summary" aria-label="สรุปการแก้ไข"><h4>สรุปก่อนบันทึก</h4>{changes.length?<ul>{changes.map((s,i)=><li key={i}>{s}</li>)}</ul>:<p>ยังไม่มีการเปลี่ยนแปลง</p>}<small>การจับคู่รูปด้วยมือจะคงอยู่หลังโหลดใหม่ และไม่ลบไฟล์ต้นฉบับใน Drive</small></section>
  {started&&<p>ข้อมูลบางส่วนอาจบันทึกแล้ว หากเกิดข้อผิดพลาดให้กดบันทึกต่อเพื่ออ่านกลับและบันทึกเฉพาะส่วนที่เหลือ</p>}
  <button className="primary" disabled={busy||reading||!connected||!changes.length} onClick={save}>{started?'บันทึกต่อ / ตรวจอ่านกลับ':'บันทึกการแก้ไข'}</button> <button disabled={busy||reading} onClick={onClose}>ยกเลิก</button>
 </section>;
}
