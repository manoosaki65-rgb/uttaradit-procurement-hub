import test from 'node:test';
import assert from 'node:assert/strict';
import {mutate,KINDS,classify,exactMatch,suggest,documentStarts,validateRanges} from '../lib/posting-core.js';
import {onRequest} from '../functions/api/posting.js';
test('sequences stay stable, are scoped by day/type, and survive deletion/move',()=>{
 const rows=[];const add=(id,kind=KINDS[0],postedDate='2026-10-08')=>mutate(rows,{action:'save',id,title:'รายการทดสอบ '+id,kind,postedDate},'now');
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
test('classification recognizes all four types and leaves unknown text undecided',()=>{
 assert.equal(classify('ประกาศประกวดราคา ซื้อวัสดุ'),KINDS[0]);
 assert.equal(classify('เผยแพร่แผนการจัดซื้อจัดจ้าง'),KINDS[1]);
 assert.equal(classify('ประกาศผู้ชนะการเสนอราคา'),KINDS[2]);
 assert.equal(classify('ยกเลิกประกาศประกวดราคา'),KINDS[3]);
 assert.equal(classify('ประกาศประกวดราคา ซื้อวัสดุ สงวนสิทธิ์ยกเลิก'),KINDS[0]);
 assert.equal(classify('อ่านไม่ชัด'), '');
});
test('attachment matching requires a unique exact title in the same day and type',()=>{
 const row={id:'existing',title:'ซื้อ วัสดุการแพทย์',kind:KINDS[0],postedDate:'2026-10-09'};
 assert.equal(exactMatch('ซื้อวัสดุการแพทย์',row.kind,row.postedDate,[row]),row);
 assert.equal(exactMatch(row.title,KINDS[1],row.postedDate,[row]),undefined);
 assert.equal(exactMatch(row.title,row.kind,'2026-10-08',[row]),undefined);
 assert.equal(exactMatch(row.title,row.kind,row.postedDate,[row,{...row,id:'duplicate'}]),undefined);
});
test('central mutation rejects duplicate records and impossible calendar dates',()=>{
 const rows=[];const cmd={action:'save',id:'first',title:'ซื้อวัสดุการแพทย์',kind:KINDS[0],postedDate:'2026-10-09'};mutate(rows,cmd,'now');
 assert.throws(()=>mutate(rows,{...cmd,id:'duplicate',title:'ซื้อ วัสดุการแพทย์'},'now'),/รายการเดิม/);
 assert.throws(()=>mutate(rows,{...cmd,id:'invalid',postedDate:'2026-02-31'},'now'),/วันที่/);
 assert.equal(rows.length,1);
});
test('proxy rejects an integration that responds with unrelated JSON',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({ok:true});
 try{const r=await onRequest({request:new Request('https://example.test/api/posting',{headers:{'X-Posting-Code':'c'}}),env:{POSTING_SCRIPT_URL:'https://script.test',POSTING_SCRIPT_SECRET:'s',POSTING_ACCESS_CODE:'c'}});assert.equal(r.status,502);assert.equal((await r.json()).code,'INVALID_INTEGRATION');}finally{globalThis.fetch=original;}
});
