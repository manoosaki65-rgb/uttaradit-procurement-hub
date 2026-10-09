import test from 'node:test';
import assert from 'node:assert/strict';
import {pageParts,orderedRows,photoTargets} from '../lib/posting-order.js';
test('owner eight-page layout splits 1 and 2, joins plan 7–8',()=>{
 const parts=pageParts(Array(8).fill(''), '2026-10-09');
 assert.deepEqual(parts.map(p=>[p.start,p.end]),[[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,8]]);
 assert.ok(parts.slice(0,6).every(p=>p.kind==='ประกาศประกวดราคา'));
 assert.equal(parts[6].kind,'ประกาศเผยแพร่แผน');
});
test('independent bidding pages stay separate even if OCR titles repeat',()=>{
 const t='ประกาศประกวดราคา\nเรื่อง ซื้อวัสดุการแพทย์';
 assert.deepEqual(pageParts([t,t,'ประกาศเผยแพร่แผน\nเรื่อง จ้างตรวจเครื่องมือ','ต่อจากหน้าก่อน'], '2026-10-10').map(p=>[p.start,p.end]),[[1,1],[2,2],[3,4]]);
});
test('page order survives descending display and refresh; excess files stay unassigned',()=>{
 const rows=Array.from({length:7},(_,i)=>({id:String(i+1),postedDate:'2026-10-09',sequence:i+1,kind:'ประกาศประกวดราคา',savedAt:String(i),pdf:{name:`x__batch-a__page-000${i+1}-000${i+1}__`}})).reverse();
 const ordered=orderedRows(rows,'2026-10-09');
 assert.deepEqual(photoTargets(9,ordered),['1','2','3','4','5','6','7','','']);
 assert.deepEqual(photoTargets(3,ordered,5),['6','7','']);
 assert.deepEqual(orderedRows(rows,'2026-10-09',['2','1']).map(r=>r.id),['2','1']);
});
