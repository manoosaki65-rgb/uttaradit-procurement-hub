import test from 'node:test';
import assert from 'node:assert/strict';
import {pageParts,mergePrevious} from '../lib/posting-order.js';
const bidding='ประกาศจังหวัดอุตรดิตถ์\nเรื่อง ประกวดราคาซื้อวัสดุวิทยาศาสตร์';
const plan='ประกาศจังหวัดอุตรดิตถ์\nเรื่อง เผยแพร่แผนการจัดซื้อจัดจ้าง';
const table='รายละเอียดแนบท้ายประกาศเผยแพร่แผน\nลำดับ รหัสแผนจัดซื้อจัดจ้าง ชื่อโครงการ งบประมาณโครงการ คาดว่าจะประกาศจัดซื้อจัดจ้าง';
test('same type, title, empty OCR or page number alone never merge',()=>{
 for(const texts of [[bidding,bidding],[plan,plan],[plan,''],[plan,'หน้าที่ 2 ข้อความคล้ายกัน']])assert.equal(pageParts(texts).length,2);
 assert.equal(pageParts(Array(8).fill('')).length,8);
});
test('new heading or new subject wins over table and continuation marker',()=>{
 assert.equal(pageParts([plan,'ประกาศจังหวัดอุตรดิตถ์\nเรื่อง เผยแพร่แผนอีกเรื่อง\n'+table]).length,2);
 assert.equal(pageParts([bidding,'ต่อจากหน้าก่อน\nเรื่อง ประกวดราคาซื้อเครื่องมือใหม่']).length,2);
 assert.equal(pageParts([bidding,bidding+'\n(ต่อ)']).length,2);
});
test('all types can continue; conflicting projects stay split',()=>{
 assert.deepEqual(pageParts([bidding,'ข้อความต่อจากหน้าก่อน รายละเอียดเพิ่มเติม']).map(p=>[p.start,p.end]),[[1,2]]);
 assert.equal(pageParts([bidding+'\nเลขโครงการ 123456789','เลขโครงการ 123456789 รายละเอียดเพิ่มเติม']).length,1);
 assert.equal(pageParts([bidding+'\nเลขโครงการ 123456789','ต่อจากหน้าก่อน เลขโครงการ 987654321']).length,2);
 assert.equal(pageParts([bidding,table]).length,2);
});
test('manual merge preserves previous title and type, and rejects saved/nonadjacent parts',()=>{
 const parts=pageParts([bidding,'']);assert.equal(parts[1].review,true);
 const merged=mergePrevious(parts,1);assert.equal(merged.length,1);assert.equal(merged[0].end,2);assert.equal(merged[0].title,parts[0].title);
 assert.throws(()=>mergePrevious([{...parts[0],saved:true},parts[1]],1));
 assert.throws(()=>mergePrevious([parts[0],{...parts[1],start:3}],1));
});
