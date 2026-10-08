import test from 'node:test';
import assert from 'node:assert/strict';
import {mutate,KINDS,suggest,documentStarts,validateRanges} from '../lib/posting-core.js';
import {onRequest} from '../functions/api/posting.js';
test('sequences stay stable, are scoped by day/type, and survive deletion/move',()=>{
 const rows=[];const add=(id,kind=KINDS[0],postedDate='2026-10-08')=>mutate(rows,{action:'save',id,title:'รายการทดสอบ',kind,postedDate},'now');
 const a=add('a'),b=add('b');assert.equal(a.sequence,1);assert.equal(b.sequence,2);assert.equal(add('c',KINDS[1]).sequence,1);assert.equal(add('d',KINDS[0],'2026-10-09').sequence,1);
 mutate(rows,{...a,action:'save',title:'แก้ไข'},'later');assert.equal(a.sequence,1);
 mutate(rows,{action:'delete',id:'b',revision:b.revision},'later');assert.equal(add('e').sequence,3);
 mutate(rows,{...a,action:'save',kind:KINDS[1]},'later');assert.equal(a.sequence,2);assert.equal(add('f').sequence,4);
 assert.throws(()=>mutate(rows,{...a,revision:1,action:'save'},'later'),/เครื่องอื่น/);
});
test('multi-page document boundaries and coverage',()=>{
 const pages=documentStarts(['ประกาศโรงพยาบาล\nเรื่อง จ้างตรวจ MRI ประจำปี','รายละเอียดต่อจากหน้าแรก','ประกาศโรงพยาบาล\nเรื่อง ซื้อวัสดุการแพทย์']);assert.deepEqual(pages.filter(p=>p.start).map(p=>p.page),[1,3]);
 validateRanges([{start:1,end:2},{start:3,end:3}],3);assert.throws(()=>validateRanges([{start:1,end:1},{start:3,end:3}],3));assert.throws(()=>validateRanges([{start:1,end:2},{start:2,end:3}],3));
});
test('ambiguous or short OCR never gets an automatic match',()=>{
 const rows=[{id:'1',title:'จ้างตรวจด้วยเครื่อง MRI ประจำปี'},{id:'2',title:'ซื้อวัสดุการแพทย์สำหรับห้องผ่าตัด'}];assert.equal(suggest('ประกาศ เรื่อง จ้างตรวจด้วยเครื่อง MRI ประจำปี',rows),'1');assert.equal(suggest('ไม่สามารถอ่านได้',rows),'');assert.equal(suggest(rows.map(r=>r.title).join(' '),rows),'');
});
test('backend refuses unconfigured Drive and incorrect staff code',async()=>{
 const req=new Request('https://example.test/api/posting');assert.equal((await onRequest({request:req,env:{}})).status,503);assert.equal((await onRequest({request:req,env:{POSTING_SCRIPT_URL:'x',POSTING_SCRIPT_SECRET:'s',POSTING_ACCESS_CODE:'c'}})).status,401);
});
