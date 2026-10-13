import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument} from 'pdf-lib';
import {pdfPageCount,singlePdfPage,validatePhoto} from '../lib/posting-upload.js';

test('reads actual PDF pages and splits the selected page without replacing the original',async()=>{
 const doc=await PDFDocument.create();doc.addPage([300,400]);doc.addPage([500,600]);
 const file=new File([await doc.save()],'notice.pdf',{type:'application/pdf'});
 assert.equal(await pdfPageCount(file),2);
 const second=await singlePdfPage(file,2),split=await PDFDocument.load(await second.arrayBuffer());
 assert.equal(split.getPageCount(),1);assert.equal(split.getPage(0).getWidth(),500);
 assert.equal(await pdfPageCount(file),2);
 await assert.rejects(singlePdfPage(file,3),/ไม่พบหน้า/);
 await assert.rejects(pdfPageCount(new File(['invalid'],'bad.pdf',{type:'application/pdf'})),/อ่าน PDF/);
 await assert.rejects(pdfPageCount(new File(['text'],'notice.txt')),/เลือกไฟล์ PDF/);
});
test('image validation enforces formats and file size, including HEIC without browser MIME',()=>{
 assert.doesNotThrow(()=>validatePhoto(new File(['photo'],'photo.heic')));
 assert.throws(()=>validatePhoto(new File(['script'],'photo.svg',{type:'image/svg+xml'})),/รองรับ/);
 assert.throws(()=>validatePhoto(new File([new Uint8Array(20*1024*1024+1)],'large.jpg',{type:'image/jpeg'})),/20 MB/);
});
