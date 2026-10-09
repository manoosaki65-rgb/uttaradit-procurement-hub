import { classify, documentStarts, suggest } from './posting-core.js';
export type Asset={id:string;name:string;url:string};
export type PostingRow={id:string;sequence:number;title:string;kind:string;postedDate:string;notes:string;revision:number;pdf:Asset|null;photos:Asset[];savedAt?:string};
export type Part={start:number;end:number;title:string;target:string;kind:string;saved?:boolean;id?:string;requestId?:string};
let worker:Promise<import('tesseract.js').Worker>|undefined;
export function ocr(){return worker ||= (async()=>{let expired=false;let timer:ReturnType<typeof setTimeout>|undefined;const creation=import('tesseract.js').then(t=>t.createWorker('tha+eng',1,{workerPath:'/posting-assets/worker.min.js',corePath:'/posting-assets/core',workerBlobURL:false})).then(w=>{if(expired){void w.terminate();throw Error('OCR ใช้งานไม่ได้ กรุณาจับคู่เอง');}return w;});try{return await Promise.race([creation,new Promise<never>((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(Error('โหลด OCR ไม่สำเร็จ กรุณาจับคู่เอง'));},120000);})]);}finally{clearTimeout(timer);}})().catch(e=>{worker=undefined;throw e;});}
async function recognize(input:File|HTMLCanvasElement){const w=await ocr();let timer:ReturnType<typeof setTimeout>|undefined;try{return await Promise.race([w.recognize(input),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(Error('OCR อ่านไม่สำเร็จ กรุณาจับคู่เอง')),120000);})]);}catch(e){worker=undefined;void w.terminate();throw e;}finally{clearTimeout(timer);}}
export async function readImage(file:File){return (await recognize(file)).data.text;}
export async function readPdf(file:File,rows:PostingRow[],progress:(text:string)=>void){
 const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/posting-assets/pdf.worker.min.mjs';
 const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer())});const doc=await task.promise;const texts:string[]=[];let ocrAvailable=true;
 try {for(let i=1;i<=doc.numPages;i++){
  progress(`อ่าน PDF หน้า ${i}/${doc.numPages}`);const page=await doc.getPage(i);const content=await page.getTextContent();
  let text=content.items.map(item=>'str' in item?item.str+('hasEOL' in item&&item.hasEOL?'\n':' '):'').join('');
  if(text.trim().length<50&&ocrAvailable){const canvas=document.createElement('canvas');const viewport=page.getViewport({scale:2});canvas.width=viewport.width;canvas.height=viewport.height;try{await page.render({canvas,canvasContext:canvas.getContext('2d')!,viewport}).promise;text=(await recognize(canvas)).data.text;}catch{ocrAvailable=false;progress('OCR อ่านไม่ได้ กรุณาตรวจและเลือกช่วงหน้าด้วยตัวเอง');}finally{canvas.width=0;canvas.height=0;}}
  texts.push(text);page.cleanup();
 }}finally{await task.destroy();}
 const starts=documentStarts(texts).filter((x:{start:boolean})=>x.start);
 return {total:texts.length,parts:starts.map((p:{page:number;title:string;text:string},i:number)=>{const end=starts[i+1]?.page-1||texts.length;const text=texts.slice(p.page-1,end).join('\n');const detected=classify(p.text);const target=suggest(text,detected?rows.filter(r=>r.kind===detected):rows);const match=rows.find(r=>r.id===target);return {start:p.page,end,title:match?.title||p.title,target,kind:match?.kind||detected||''};}) as Part[]};
}
export async function splitPdf(file:File,start:number,end:number,name:string){const {PDFDocument}=await import('pdf-lib');const src=await PDFDocument.load(await file.arrayBuffer());const dst=await PDFDocument.create();const pages=await dst.copyPages(src,Array.from({length:end-start+1},(_,i)=>start-1+i));pages.forEach(p=>dst.addPage(p));return new File([new Uint8Array(await dst.save())],name+'.pdf',{type:'application/pdf'});}
export async function uploadData(file:File,key:string){if(file.size>20*1024*1024)throw Error('ไฟล์แต่ละไฟล์ต้องไม่เกิน 20 MB');return {key,name:file.name,type:file.type||(/\.hei[cf]$/i.test(file.name)?'image/heic':''),base64:await new Promise<string>((ok,no)=>{const reader=new FileReader();reader.onload=()=>ok(String(reader.result).split(',')[1]);reader.onerror=()=>no(Error('อ่านไฟล์ไม่สำเร็จ'));reader.readAsDataURL(file);})};}
