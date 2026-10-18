export const MAX_COUNT=30;
export const MASTER_ID='1iAHRf2Wj2T6r03325nZyfuqg6gFqzOxG';
export const FIELDS='id,number,year,issue_date AS issueDate,subject,status,assignee,hidden,created_at AS createdAt,reserved_by AS reservedBy,reserved_at AS reservedAt,used_at AS usedAt,revision,master_synced_revision AS masterSyncedRevision,master_sync_error AS masterSyncError';
export function dateBE(value){
  const match=String(value||'').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(!match)throw Error('วันที่ต้องเป็น วัน/เดือน/ปี พ.ศ.');
  const [,d,m,y]=match.map(Number),ad=y-543,dt=new Date(Date.UTC(ad,m-1,d));
  if(y<2400||y>2800||dt.getUTCFullYear()!==ad||dt.getUTCMonth()!==m-1||dt.getUTCDate()!==d)throw Error('วันที่ไม่ถูกต้อง');
  return `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
}
export function importRows(body){
  let values=body.numbers;
  if(!values){const {start,end,year}=body;if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<1||end<start||end-start+1>MAX_COUNT)throw Error('ช่วงเลขต้องมี 1–30 เลข');values=Array.from({length:end-start+1},(_,i)=>({number:start+i,year,issueDate:body.issueDate,subject:body.subject}));}
  if(!Array.isArray(values)||!values.length||values.length>MAX_COUNT||body.expectedCount!==undefined&&body.expectedCount!==values.length)throw Error('จำนวนเลขจริงไม่ครบตามที่ระบุ (สูงสุด 30)');
  const result=values.map(row=>{const number=Number(row.number),year=Number(row.year),subject=String(row.subject||'').trim();if(!Number.isSafeInteger(number)||number<1||!Number.isInteger(year)||year<2400||year>2800||!subject||subject.length>2000)throw Error('ตรวจเลข ปี และเรื่องให้ครบ');const issueDate=dateBE(row.issueDate);if(!issueDate.endsWith('/'+year))throw Error('ปีของเลขและวันที่ไม่ตรงกัน');return {id:`${year}-${number}`,number,year,issueDate,subject};});
  if(new Set(result.map(row=>row.id)).size!==result.length)throw Error('ชุดนี้มีเลขซ้ำ');return result;
}
export function publicRow(row){return {...row,masterSynced:row.masterSyncedRevision===row.revision};}
export async function rowsByIds(db,ids){if(!ids.length)return [];return (await db.prepare(`SELECT ${FIELDS} FROM command_numbers WHERE id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all()).results||[];}
export async function syncMaster(db,env,rows,request=globalThis.fetch){
  const pending=rows.filter(row=>row.masterSyncedRevision!==row.revision);if(!pending.length)return {ok:true,pending:[],rows:rows.map(publicRow)};
  let error='ยังไม่ได้เชื่อมการเขียน Master เดิม จึงบันทึกฐานข้อมูลแล้วแต่ยังไม่ยืนยัน Master';
  try{
    if(!env.COMMAND_MASTER_URL||!env.COMMAND_MASTER_SECRET)throw Error(error);
    const target=new URL(env.COMMAND_MASTER_URL);if(target.protocol!=='https:'||!['script.google.com','script.googleusercontent.com'].includes(target.hostname))throw Error('URL เชื่อม Master ไม่ถูกต้อง');
    const response=await request(target.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({commandNumbers:true,action:'reconcile',masterId:MASTER_ID,secret:env.COMMAND_MASTER_SECRET,rows:pending}),signal:AbortSignal.timeout(25000)});
    if(!response.ok)throw Error('Master ตอบกลับ HTTP '+response.status);
    const result=await response.json();
    if(result.masterId!==MASTER_ID||!Array.isArray(result.rows))throw Error('Master ไม่ส่งหลักฐานอ่านกลับของไฟล์เดิม');
    for(const row of pending){const found=result.rows.filter(x=>String(x.id)===row.id);if(found.length!==1||['number','year','issueDate','subject','status','assignee','revision'].some(key=>String(found[0][key]??'')!==String(row[key]??'')))throw Error('Master ยังยืนยันข้อมูลไม่ตรง: '+row.id);}
    await db.batch(pending.map(row=>db.prepare('UPDATE command_numbers SET master_synced_revision=?,master_sync_error=? WHERE id=? AND revision=?').bind(row.revision,'',row.id,row.revision)));
  }catch(err){error=String(err.message||err);await db.batch(pending.map(row=>db.prepare('UPDATE command_numbers SET master_sync_error=? WHERE id=? AND revision=?').bind(error,row.id,row.revision)));}
  const latest=await rowsByIds(db,rows.map(row=>row.id));const missing=latest.filter(row=>row.masterSyncedRevision!==row.revision);
  return {ok:missing.length===0,rows:latest.map(publicRow),pending:missing.map(row=>({id:row.id,error:row.masterSyncError||error}))};
}
