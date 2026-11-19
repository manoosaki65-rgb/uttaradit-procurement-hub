import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyGroups,dailyId,appendNotes,uploadBatches,photoView,photoThumbnail,photoDownload} from '../lib/posting-daily.js';
test('multiple uploads and existing records group by date, retain old photos and hide test evidence',()=>{
 const p={id:'original-photo',url:'https://drive.google.com/file/d/original-photo/view',name:'original.jpg'};
 const rows=[{postedDate:'2026-10-08',title:'หลักฐานวันที่ 8',photos:[p]},{postedDate:'2026-10-09',title:'หลักฐานวันที่ 9',photos:[{id:'new-photo',url:'new'}]},{postedDate:'2026-10-08',title:'หลักฐานเพิ่มเติม',photos:[p,{id:'later',url:'later'}]},{postedDate:'2026-10-09',title:'TEST_ONLY old',photos:[{url:'test'}]},{postedDate:'2026-10-09',title:'ทดสอบระบบ จ้างตรวจ MRI',photos:[{url:'legacy-test'}]}];
 const groups=dailyGroups(rows);assert.deepEqual(groups.map(g=>g.date),['2026-10-09','2026-10-08']);assert.equal(groups[0].photos.length,1);assert.deepEqual(groups[1].photos.map(p=>p.id),['original-photo','later']);assert.equal(rows[0].photos.length,1);
});
test('date identity is stable and optional notes never erase old notes',()=>{assert.equal(dailyId('2026-10-09'),'daily-evidence-2026-10-09');assert.equal(appendNotes('เก่า',''),'เก่า');assert.equal(appendNotes('เก่า','ใหม่'),'เก่า\nใหม่');assert.equal(appendNotes('เก่า\nใหม่','ใหม่'),'เก่า\nใหม่');});
test('large selections split below request limit and each upload retains retry identity',()=>{const items=[{key:'a',file:{size:12*1024*1024}},{key:'b',file:{size:12*1024*1024}}];assert.deepEqual(uploadBatches(items).map(b=>b[0].key),['a','b']);assert.throws(()=>uploadBatches([{file:{size:21*1024*1024}}]));});
test('view and download links stay on the site for Drive-backed photos',()=>{
 const p={id:'stored-image',url:'https://drive.google.com/file/d/stored-image/view',name:'หลักฐาน.jpg'};
 assert.equal(photoView(p),'/api/posting?photoId=stored-image');
 assert.equal(photoThumbnail(p),photoView(p));
 assert.ok(photoDownload(p).startsWith('/api/posting?photoId=stored-image&download=1&name='));
 assert.ok(!photoDownload(p).includes('drive.google.com'));
 const local={url:'/posting-evidence/2026-10-09/IMG.jpg'};
 assert.equal(photoView(local),local.url);
 assert.equal(photoDownload(local),local.url);
});
