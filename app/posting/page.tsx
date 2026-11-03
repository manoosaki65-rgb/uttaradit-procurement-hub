"use client";
import {useEffect,useState} from 'react';
import DashboardView from './dashboard-view';

type PhotoPayload={mime?:string;base64?:string;error?:string};

function driveId(href:string){
 return href.match(/\/d\/([^/?]+)/)?.[1]||href.match(/[?&]id=([^&]+)/)?.[1]||'';
}
function extension(mime:string){
 if(mime==='image/png')return 'png';
 if(mime==='image/webp')return 'webp';
 if(mime==='image/gif')return 'gif';
 return 'jpg';
}
function blobFrom(payload:{mime:string;base64:string}){
 const raw=atob(payload.base64),bytes=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 return new Blob([bytes],{type:payload.mime});
}
async function fetchPhoto(id:string){
 const response=await fetch('/api/posting',{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'thumbnail',photoId:id})});
 const data=await response.json() as PhotoPayload;
 if(!response.ok||data.error||!data.mime||!data.base64||!/^image\/(jpeg|png|webp|gif)$/.test(data.mime))throw Error(data.error||'เปิดรูปไม่ได้');
 return {mime:data.mime,base64:data.base64};
}

export default function PostingPage(){
 const [viewer,setViewer]=useState<{src:string;name:string}|null>(null);
 const [loading,setLoading]=useState(false);
 const [notice,setNotice]=useState('');

 useEffect(()=>{
  const click=(event:MouseEvent)=>{
   const node=event.target instanceof Element?event.target:null;
   const anchor=node?.closest('a') as HTMLAnchorElement|null;
   if(!anchor)return;
   const href=anchor.href||'';
   if(!href.includes('drive.google.com'))return;
   const label=(anchor.textContent||'').trim();
   const isView=anchor.classList.contains('gallery-image')||label.includes('ดูรูป');
   const isDownload=anchor.hasAttribute('download')||label.includes('ดาวน์โหลด');
   if(!isView&&!isDownload)return;
   const id=driveId(href);
   if(!id)return;
   event.preventDefault();
   event.stopPropagation();
   const shownName=anchor.closest('figure')?.querySelector('.gallery-filename')?.textContent?.trim()||'รูปหลักฐาน';
   setNotice('');setLoading(true);
   void fetchPhoto(id).then(photo=>{
    if(isDownload){
     const url=URL.createObjectURL(blobFrom(photo));
     const a=document.createElement('a');a.href=url;a.download=shownName+'.'+extension(photo.mime);document.body.appendChild(a);a.click();a.remove();
     window.setTimeout(()=>URL.revokeObjectURL(url),30000);
    }else setViewer({src:'data:'+photo.mime+';base64,'+photo.base64,name:shownName});
   }).catch(error=>setNotice(error instanceof Error?error.message:'เปิดรูปไม่ได้ กรุณาลองใหม่')).finally(()=>setLoading(false));
  };
  document.addEventListener('click',click,true);
  return()=>document.removeEventListener('click',click,true);
 },[]);

 useEffect(()=>{
  if(!viewer)return;
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape')setViewer(null);};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[viewer]);

 return <>
  <DashboardView/>
  {(loading||notice)&&<div role="status" style={{position:'fixed',right:16,bottom:16,zIndex:10000,background:'#fff',border:'1px solid #d1d5db',borderRadius:10,padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,.18)',maxWidth:320}}>{loading?'กำลังเปิดรูป…':notice}</div>}
  {viewer&&<div role="dialog" aria-modal="true" aria-label={viewer.name} onClick={()=>setViewer(null)} style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,.82)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
   <button type="button" aria-label="ปิดรูป" onClick={()=>setViewer(null)} style={{position:'absolute',top:16,right:16,border:0,borderRadius:999,padding:'8px 12px',fontSize:20,cursor:'pointer'}}>×</button>
   <img src={viewer.src} alt={viewer.name} onClick={event=>event.stopPropagation()} style={{maxWidth:'96vw',maxHeight:'92vh',objectFit:'contain',background:'#fff',borderRadius:8}}/>
  </div>}
 </>;
}
