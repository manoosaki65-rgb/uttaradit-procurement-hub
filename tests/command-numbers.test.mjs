import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {onRequest} from '../functions/api/command-numbers.js';
import {importRows,dateBE} from '../lib/command-core.js';

async function fixture({auth=true}={}){
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec("CREATE TABLE command_numbers(id TEXT PRIMARY KEY,number INTEGER NOT NULL,year INTEGER NOT NULL,issue_date TEXT NOT NULL,subject TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'ว่าง',assignee TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,hidden INTEGER NOT NULL DEFAULT 0)");
  sqlite.exec(fs.readFileSync(new URL('../migrations/command-numbers-booking.sql',import.meta.url),'utf8'));
  const db={prepare(sql){let args=[];return {bind(...values){args=values;return this;},all(){return {results:sqlite.prepare(sql).all(...args)}},run(){const result=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(result.changes)}}}}},batch(statements){sqlite.exec('BEGIN');try{const results=statements.map(statement=>statement.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
  const users={issuer:{id:'issuer',name:'ธุรการ',roles:['issuer'],verified:true},alice:{id:'alice',name:'เจ้าหน้าที่หนึ่ง',roles:['procurement'],verified:true},bob:{id:'bob',name:'เจ้าหน้าที่สอง',roles:['procurement'],verified:true}};
  const env={MEETING_DB:db};
  const call=async(method,body,who='issuer',query='')=>{
    const response=await onRequest({env,data:auth&&users[who]?{hubUser:users[who]}:{},request:new Request('https://hub.test/api/command-numbers'+query,{method,headers:{'Content-Type':'application/json',Origin:'https://hub.test'},...body?{body:JSON.stringify(body)}:{}})});
    return {status:response.status,body:await response.json()};
  };
  return {sqlite,env,call};
}
const batch=(start=90000,end=90029)=>({start,end,year:2569,issueDate:'19/10/2569',subject:'แต่งตั้งคณะกรรมการ',expectedCount:end-start+1});
test('manual fallback imports exactly thirty without active booking state, survives fresh reads and detects duplicates',async()=>{
  const f=await fixture();const first=await f.call('POST',batch());assert.equal(first.status,200);assert.equal(first.body.added,30);assert.equal(first.body.databaseVerified,true);assert.equal(first.body.masterVerified,false);
  const again=await f.call('POST',batch());assert.equal(again.body.added,0);assert.equal(again.body.total,30);
  const read=await f.call('GET',null,'', '?q=900');assert.equal(read.body.rows.length,30);assert.equal(new Set(read.body.rows.map(row=>row.id)).size,30);
  assert.equal((await f.call('GET')).body.rows.length,30);
});
test('two procurement users race to reserve the same revision: exactly one succeeds',async()=>{
  const f=await fixture();await f.call('POST',batch());
  const request={action:'reserve',id:'2569-90000',revision:0,subject:'จัดซื้ออุปกรณ์'};
  const results=await Promise.all([f.call('PATCH',request,'alice'),f.call('PATCH',request,'bob')]);
  assert.deepEqual(results.map(x=>x.status).sort(),[200,409]);
  const row=(await f.call('GET')).body.rows.find(row=>row.id===request.id);assert.equal(row.status,'จองแล้ว');assert.ok(row.reservedAt);assert.equal(row.revision,1);
  const loser=row.reservedBy==='alice'?'bob':'alice';assert.equal((await f.call('PATCH',{...request,action:'use',revision:1},loser)).status,409);
  assert.equal((await f.call('PATCH',{...request,action:'use',revision:1},row.reservedBy)).status,200);
  assert.equal((await f.call('GET')).body.rows.find(x=>x.id===row.id).status,'ใช้แล้ว');
});
test('repeat import never resets an already reserved or used row',async()=>{
  const f=await fixture();await f.call('POST',batch());
  await f.call('PATCH',{action:'reserve',id:'2569-90000',revision:0,subject:'เรื่องจัดซื้อจริง'},'alice');
  await f.call('PATCH',{action:'use',id:'2569-90000',revision:1,subject:'เรื่องจัดซื้อจริง'},'alice');
  const old={...(await f.call('GET')).body.rows.find(x=>x.id==='2569-90000')};
  await f.call('POST',batch());const latest=(await f.call('GET')).body.rows.find(x=>x.id===old.id);
  for(const key of ['subject','status','assignee','reservedBy','reservedAt','usedAt','revision'])assert.equal(latest[key],old[key]);
});
test('identity and role checks reject anonymous booking, wrong role and another assignee',async()=>{
  const f=await fixture();await f.call('POST',batch());const b={action:'reserve',id:'2569-90000',revision:0,subject:'งานจริง'};
  assert.equal((await f.call('PATCH',b,'anonymous')).status,401);
  assert.equal((await f.call('PATCH',b,'issuer')).status,403);
  assert.equal((await f.call('POST',batch(),'alice')).status,403);
  assert.equal((await f.call('PATCH',{...b,assignee:'บุคคลอื่น'},'alice')).status,403);
  assert.equal((await f.call('POST',{action:'login',username:'alice',code:'wrong'},'anonymous')).status,400);
});
test('invalid date, count mismatch, duplicate explicit numbers and more than thirty are rejected',async()=>{
  assert.equal(dateBE('1/1/2569'),'01/01/2569');assert.throws(()=>dateBE('31/2/2569'));
  assert.throws(()=>importRows({...batch(),end:90030}));assert.throws(()=>importRows({...batch(),expectedCount:29}));
  const item={number:10,year:2569,issueDate:'19/10/2569',subject:'จริง'};assert.throws(()=>importRows({numbers:[item,item]}));
});
test('hidden rows, different dates and stale legacy PATCH cannot be overwritten',async()=>{
  const f=await fixture();await f.call('POST',batch());f.sqlite.exec("UPDATE command_numbers SET hidden=1 WHERE id='2569-90000'");
  assert.equal((await f.call('POST',batch())).status,409);
  assert.equal((await f.call('POST',{...batch(90001,90001),issueDate:'18/10/2569'})).status,409);
  assert.equal((await f.call('PATCH',{id:'2569-90001',subject:'overwrite',assignee:'bob'},'alice')).status,400);
});
test('failed Master connection never becomes a false Google Master success and retry never creates a new number',async()=>{
  const f=await fixture();await f.call('POST',batch());const synced=await f.call('POST',{action:'sync',ids:['2569-90000']});
  assert.equal(synced.body.databaseVerified,true);assert.equal(synced.body.masterVerified,false);assert.ok(synced.body.warning);
  assert.equal((await f.call('POST',{action:'sync',ids:['2569-does-not-exist']})).status,404);
  assert.equal((await f.call('GET')).body.rows.length,30);
});
test('gapped actual numbers do not create unissued numbers and all rows remain searchable after 500 records',async()=>{
  const f=await fixture();for(let i=0;i<18;i++)await f.call('POST',batch(90000+i*30,90029+i*30));
  const result=await f.call('GET',null,'issuer','?q=90000');assert.equal(result.body.rows.length,1);
  const numbers=[901,905,909].map(number=>({number,year:2569,issueDate:'19/10/2569',subject:'แต่งตั้งคณะกรรมการ'}));
  await f.call('POST',{numbers,expectedCount:3});const all=(await f.call('GET')).body.rows;
  assert.equal(all.length,543);assert.ok(!all.some(r=>r.number===902));
});

test('unverified users can search but cannot import, reserve or change data',async()=>{
  const f=await fixture({auth:false});assert.equal((await f.call('GET')).status,200);
  assert.equal((await f.call('POST',batch())).status,401);
  assert.equal((await f.call('PATCH',{action:'reserve'})).status,401);
  assert.equal((await f.call('POST',{action:'sync',ids:['2569-90000']})).status,401);
  assert.equal((await f.call('GET')).body.rows.length,0);
});

test('search supports command/year and a range of five verified backlog numbers',async()=>{
  const f=await fixture();await f.call('POST',{...batch(10913,10917),issueDate:'18/10/2569'});
  assert.equal((await f.call('GET',null,'issuer','?q=10913%2F2569')).body.rows.length,1);
  assert.equal((await f.call('GET',null,'issuer','?q=10913-10917%2F2569')).body.rows.length,5);
  const forged=await f.call('POST',{...batch(),hubUser:{id:'admin',verified:true,roles:['issuer']}},'anonymous');assert.equal(forged.status,401);
});
