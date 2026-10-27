import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import XLSX from 'xlsx';import {KINDS,HEADERS} from '../lib/posting-core.js';
import {preservePhotoPages,documentPageCount,photoPage,manualPhotoPages} from '../lib/posting-photo-pages.js';
test('Apps Script roundtrip updates the same XLSX, retains PDFs/photos, retries safely, and moves photos',()=>{
 const MASTER='12e7bfzCiv9M3NpPOQmdtd6r75QZj9g98',ROOT='1FVpx-2alioghme97E-sqGIe8vNdg63Fu';let wb=XLSX.utils.book_new();for(const k of KINDS)XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([HEADERS]),k);
 let bytes=XLSX.write(wb,{type:'buffer',bookType:'xlsx'}),creates=0,locked=false;const files=new Map();
 const parents=()=>{let next=true;return {hasNext:()=>next,next:()=>{next=false;return {getId:()=>ROOT};}};};
 const ctx={XLSX,Uint8Array,Date,console,PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'secret'})},LockService:{getScriptLock:()=>({tryLock:()=>{locked=true;return true;},hasLock:()=>locked,releaseLock:()=>{locked=false;}})},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},ScriptApp:{getOAuthToken:()=> 'test-token'},Utilities:{base64Decode:s=>Array.from(Buffer.from(s,'base64')),newBlob:(b,t,n)=>({b,t,n})},DriveApp:{getFileById:id=>{assert.equal(id,MASTER);return {getParents:parents,getBlob:()=>({getBytes:()=>Array.from(bytes)})};},getFolderById:id=>({getParents:parents,getFilesByName:name=>({hasNext:()=>files.has(id+name),next:()=>files.get(id+name)}),createFile:blob=>{creates++;const f={getId:()=> 'asset-'+creates,getUrl:()=> 'https://drive.test/asset-'+creates};files.set(id+blob.n,f);return f;}})},UrlFetchApp:{fetch:(url,options)=>{assert.ok(url.includes(MASTER));assert.equal(options.method,'patch');bytes=Buffer.from(options.payload);return {getResponseCode:()=>200};}}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('lib/posting-core.js','utf8').replace(/export /g,'')+'\n'+fs.readFileSync('google-apps-script/Service.js','utf8'),ctx);
 const request=x=>ctx.doPost({postData:{contents:JSON.stringify({...x,posting:true,secret:'secret'})}});
 const base={action:'save',id:'test-row-00001',kind:KINDS[0],title:'ทดสอบจ้างตรวจ MRI',postedDate:'2026-10-08',requestId:'request-one'};
 let result=request({...base,pdfUpload:{key:'asset-pdf-0000001',name:'test.pdf',type:'application/pdf',base64:'YWJj'},photoUploads:[{key:'asset-photo-00001',name:'one.png',type:'image/png',base64:'YWJj'},{key:'asset-photo-00002',name:'two.png',type:'image/png',base64:'YWJj'}]});assert.equal(result.error,undefined);assert.equal(result.row.photos.length,2);assert.equal(result.row.sequence,1);assert.equal(creates,3);
 assert.equal(request(base).row.revision,1);assert.equal(creates,3);assert.equal(request({action:'list'}).rows.length,1);
 const annotated=XLSX.read(bytes);annotated.Sheets[KINDS[0]].L1={t:'s',v:'ผู้ตรวจสอบ'};annotated.Sheets[KINDS[0]].L2={t:'s',v:'ข้อมูลเดิมห้ามทับ'};annotated.Sheets[KINDS[0]]['!ref']='A1:L2';bytes=XLSX.write(annotated,{type:'buffer',bookType:'xlsx'});
 // Same-title/same-day records are valid; duplicate-title behavior is covered by posting-core tests.
 const second=request({...base,id:'test-row-00002',title:'ทดสอบรายการที่สอง',requestId:'request-two'});assert.equal(second.row.sequence,2);
 assert.equal(XLSX.read(bytes).Sheets[KINDS[0]].L2.v,'ข้อมูลเดิมห้ามทับ');
 const appended=XLSX.utils.sheet_to_json(XLSX.read(bytes).Sheets[KINDS[0]]);assert.deepEqual(appended.map(r=>r['ลำดับ']),[1,2]);
 result=request({action:'movePhoto',id:base.id,revision:1,targetId:second.row.id,targetRevision:1,photoId:'asset-2',requestId:'move-one'});assert.equal(result.error,undefined);const rows=request({action:'list'}).rows;assert.equal(rows[0].photos.length,1);assert.equal(rows[1].photos.length,1);
 assert.equal(request({...base,revision:1,requestId:'stale'}).error.includes('เครื่องอื่น'),true);
 const update={...base,revision:2,requestId:'replace-existing',pdfUpload:{key:'asset-pdf-0000002',name:'replacement.pdf',type:'application/pdf',base64:'YWJj'},photoUploads:[{key:'asset-photo-00003',name:'three.png',type:'image/png',base64:'YWJj'}]};
 result=request(update);assert.equal(result.error,undefined);assert.equal(result.row.pdf.name,'replacement.pdf');assert.equal(result.row.photos.length,2);assert.equal(result.row.revision,3);
 assert.equal(request(update).row.revision,3);assert.equal(creates,5);
 result=request({...base,revision:3,requestId:'remove-photo',keepPhotoIds:['asset-5']});assert.equal(result.error,undefined);assert.equal(result.row.photos.length,1);assert.equal(result.row.photos[0].name,'three.png');
 const reread=XLSX.read(bytes);assert.deepEqual(reread.SheetNames,KINDS);const sheet=XLSX.utils.sheet_to_json(reread.Sheets[KINDS[0]]);assert.equal(sheet.length,2);assert.ok(sheet.some(r=>r['ลิงก์ PDF ใน Drive'].includes('asset-4')));assert.equal(locked,false);
 // New-day upload uses exactly the existing Master and folders. Attach images
 // in reverse order to verify explicit page choice survives rereading the XLSX.
 const newPdf={key:'new-pdf-key-000001',name:'__page-1-2__notice.pdf',type:'application/pdf',base64:'YWJj'};
 const newCmd={action:'save',id:'new-day-row-00001',revision:0,title:'ประกาศจริงของวันที่เลือก',kind:KINDS[1],postedDate:'2026-10-14',notes:preservePhotoPages({notes:'',photos:[]},2),requestId:'new-notice-request',pdfUpload:newPdf};
 let created=request(newCmd).row;assert.equal(documentPageCount(created),2);assert.equal(created.sequence,1);
 assert.equal(request(newCmd).row.revision,created.revision);
 created=request({...created,action:'save',requestId:'photo-page-two',notes:preservePhotoPages(created,2),photoUploads:[{key:'new-photo-key-00002',name:'หน้า-2__first.jpg',type:'image/jpeg',base64:'YWJj'}]}).row;
 created=request({...created,action:'save',requestId:'photo-page-one',notes:preservePhotoPages(created,2),photoUploads:[{key:'new-photo-key-00001',name:'หน้า-1__second.jpg',type:'image/jpeg',base64:'YWJj'}]}).row;
 const all=request({action:'list'}).rows,uploaded=all.find(r=>r.id===newCmd.id);
 assert.equal(all.length,3);assert.equal(uploaded.pdf.key,newPdf.key);assert.equal(uploaded.photos.length,2);
 assert.deepEqual(uploaded.photos.map((p,i)=>photoPage(p,i,uploaded.notes)),[2,1]);
 assert.equal(XLSX.read(bytes).Sheets[KINDS[0]].L2.v,'ข้อมูลเดิมห้ามทับ');
 assert.equal(all.find(r=>r.id===base.id).pdf.name,'replacement.pdf');
 assert.equal(all.find(r=>r.id===second.row.id).photos.length,1);
 const beforeFiles=files.size;
 const changed=request({...uploaded,action:'save',title:'ชื่อแก้ไขด้วยมือ',kind:KINDS[2],requestId:'manual-edit-meta',notes:manualPhotoPages(uploaded.notes,uploaded.photos.map((asset,i)=>({asset,page:i===0?1:3})),3)}).row;
 const readEdit=request({action:'list'}).rows.find(r=>r.id===uploaded.id);
 assert.equal(readEdit.title,'ชื่อแก้ไขด้วยมือ');assert.equal(readEdit.kind,KINDS[2]);assert.equal(documentPageCount(readEdit),3);
 assert.deepEqual(readEdit.photos.map((p,i)=>photoPage(p,i,readEdit.notes)),[1,3]);assert.equal(files.size,beforeFiles);
 const detached=request({...changed,action:'save',requestId:'manual-unlink',keepPhotoIds:[changed.photos[1].id],notes:preservePhotoPages(changed,3)}).row;
 assert.equal(detached.photos.length,1);assert.equal(photoPage(detached.photos[0],0,detached.notes),3);assert.equal(files.size,beforeFiles);
 assert.equal(request({action:'list'}).rows.length,3);
});

