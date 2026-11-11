import test from 'node:test';
import assert from 'node:assert/strict';
import {pageParts,orderedRows,photoTargets,splitNextPage} from '../lib/posting-order.js';
import {validateRanges} from '../lib/posting-core.js';
test('eight-page notices split 1 and 2, and join an evidenced plan table',()=>{
 const bidding='ประกาศจังหวัดอุตรดิตถ์\nเรื่อง ประกวดราคาซื้อวัสดุการแพทย์';
 const plan='ประกาศจังหวัดอุตรดิตถ์\nเรื่อง เผยแพร่แผนการจัดซื้อจัดจ้าง';
 const table='รายละเอียดแนบท้ายประกาศเผยแพร่แผน\nรหัสแผน ชื่อโครงการ งบประมาณ คาดว่าจะประกาศจัดซื้อจัดจ้าง';
 const parts=pageParts([...Array(6).fill(bidding),plan,table]);
 assert.deepEqual(parts.map(p=>[p.start,p.end]),[[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,8]]);
 assert.ok(parts.slice(0,6).every(p=>p.kind==='ประกาศประกวดราคา'));
 assert.equal(parts[6].kind,'ประกาศเผยแพร่แผน');
});
test('independent bidding pages stay separate even if OCR titles repeat',()=>{
 const t='ประกาศประกวดราคา\nเรื่อง ซื้อวัสดุการแพทย์';
 assert.deepEqual(pageParts([t,t,'ประกาศเผยแพร่แผน\nเรื่อง จ้างตรวจเครื่องมือ','ต่อจากหน้าก่อน']).map(p=>[p.start,p.end]),[[1,1],[2,2],[3,4]]);
});
test('page order survives descending display and refresh; excess files stay unassigned',()=>{
 const rows=Array.from({length:7},(_,i)=>({id:String(i+1),postedDate:'2026-10-09',sequence:i+1,kind:'ประกาศประกวดราคา',savedAt:String(i),pdf:{name:`x__batch-a__page-000${i+1}-000${i+1}__`}})).reverse();
 const ordered=orderedRows(rows,'2026-10-09');
 assert.deepEqual(photoTargets(9,ordered),['1','2','3','4','5','6','7','','']);
 assert.deepEqual(photoTargets(3,ordered,5),['6','7','']);
 assert.deepEqual(orderedRows(rows,'2026-10-09',['2','1']).map(r=>r.id),['2','1']);
});

test('manual split makes page 1 and page 2 independent rows without duplicating or losing pages',()=>{
 const grouped=[{start:1,end:2,title:'เรื่องแรก',kind:'ประกาศผลผู้ชนะ',target:'existing-id',id:'first',requestId:'old'}];
 const separated=splitNextPage(grouped,0);
 assert.deepEqual(separated.map(p=>[p.start,p.end]),[[1,1],[2,2]]);
 assert.equal(separated[0].title,'เรื่องแรก');
 assert.equal(separated[0].target,'existing-id');
 assert.equal(separated[1].title,'');
 assert.equal(separated[1].target,'');
 assert.equal(separated[1].kind,'');
 assert.equal(separated[0].requestId,undefined);
 assert.doesNotThrow(()=>validateRanges(separated,2));
 assert.deepEqual(grouped.map(p=>[p.start,p.end]),[[1,2]],'original draft stays intact');
 assert.throws(()=>splitNextPage(separated,0),/แยกได้เฉพาะ/);
});
test('long range can be split repeatedly; saved ranges are protected',()=>{
 const first=splitNextPage([{start:1,end:4,title:'เรื่องแรก',kind:'ประกาศประกวดราคา'}],0);
 const second=splitNextPage(first,1);
 assert.deepEqual(second.map(p=>[p.start,p.end]),[[1,1],[2,2],[3,4]]);
 assert.doesNotThrow(()=>validateRanges(second,4));
 assert.throws(()=>splitNextPage([{start:1,end:2,saved:true}],0),/แยกได้เฉพาะ/);
});
