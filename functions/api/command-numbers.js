import {identity,requireRole} from '../../lib/command-auth.js';
import {FIELDS,importRows,publicRow,rowsByIds,syncMaster} from '../../lib/command-core.js';
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
export async function onRequest(context){
  const {request,env}=context;
  try{
    if(!env.MEETING_DB)return json({error:'ฐานข้อมูลเดิมยังไม่พร้อม'},503);
    const db=env.MEETING_DB,url=new URL(request.url),user=identity(context);
    if(request.method!=='GET'&&request.headers.has('Origin')&&request.headers.get('Origin')!==url.origin)return json({error:'ไม่อนุญาตคำขอจากเว็บไซต์อื่น'},403);
    if(request.method==='GET'&&url.searchParams.get('action')==='session')return json({user,configured:Boolean(user),source:"existing-hub-middleware",readOnly:!user});
    if(request.method==='GET'){
      const q=(url.searchParams.get('q')||'').trim();const year=Number(url.searchParams.get('year')||0);
      const clauses=['COALESCE(hidden,0)=0'],args=[];
      if(year){clauses.push('year=?');args.push(year);}
      const numberQuery=q.match(/^(\d+)\s*(?:-\s*(\d+))?\s*(?:\/\s*(\d{4}))?$/);
      if(numberQuery&&(numberQuery[2]||numberQuery[3])){clauses.push('number BETWEEN ? AND ?');args.push(Number(numberQuery[1]),Number(numberQuery[2]||numberQuery[1]));if(numberQuery[3]){clauses.push('year=?');args.push(Number(numberQuery[3]));}}
      else if(q){clauses.push("(CAST(number AS TEXT) LIKE ? OR subject LIKE ? OR assignee LIKE ?)");const escaped=q.replace(/[\\%_]/g,'\\$&');clauses[clauses.length-1]="(CAST(number AS TEXT) LIKE ? ESCAPE '\\' OR subject LIKE ? ESCAPE '\\' OR assignee LIKE ? ESCAPE '\\')";args.push(...Array(3).fill('%'+escaped+'%'));}
      const result=await db.prepare(`SELECT ${FIELDS} FROM command_numbers WHERE ${clauses.join(' AND ')} ORDER BY year DESC,number DESC`).bind(...args).all();
      return json({rows:(result.results||[]).map(publicRow),storage:'cloudflare-d1',masterConfigured:Boolean(env.COMMAND_MASTER_URL&&env.COMMAND_MASTER_SECRET)});
    }
    if(request.method!=='POST'&&request.method!=='PATCH')return json({error:'Method not allowed'},405);
    if(Number(request.headers.get('Content-Length')||0)>64000)return json({error:'ข้อมูลมากเกินกำหนด'},413);
    let body;try{const raw=await request.text();if(raw.length>64000)throw Error();body=JSON.parse(raw);}catch{return json({error:'ข้อมูลไม่ใช่ JSON ที่ถูกต้อง'},400);}
    if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'ข้อมูลไม่ถูกต้อง'},400);
    if(['login','logout'].includes(body.action))return json({error:'ใช้บัญชี Hub เดิมเท่านั้น ไม่ได้สร้างระบบล็อกอินใหม่'},400);
    if(body.action==='sync'){
      requireRole(user,['issuer','procurement']);const ids=body.ids;
      if(!Array.isArray(ids)||!ids.length||ids.length>30||new Set(ids).size!==ids.length)return json({error:'ต้องระบุเลขเดิม 1–30 เลข'},400);
      const rows=await rowsByIds(db,ids);if(rows.length!==ids.length)return json({error:'ยังไม่พบเลขเดิมครบ จึงไม่สร้างเลขใหม่'},404);
      if(!user.roles.includes('issuer')&&rows.some(row=>row.reservedBy!==user.id))return json({error:'ส่งซ้ำได้เฉพาะรายการของตนเอง'},403);
      const result=await syncMaster(db,env,rows);return json({...result,ok:true,databaseVerified:true,masterVerified:result.ok,warning:result.ok?'':'D1 ยืนยันข้อมูลแล้ว แต่ยังไม่ยืนยัน Google Master'},200);
    }
    if(request.method==='POST'){
      requireRole(user,['issuer']);let values;try{values=importRows(body);}catch(error){return json({error:error.message},400);}
      const prior=await rowsByIds(db,values.map(row=>row.id));
      if(prior.some(row=>row.hidden||values.find(value=>value.id===row.id)?.issueDate!==row.issueDate))return json({error:'เลขเดิมถูกซ่อนหรือวันที่ต่างกัน จึงไม่เขียนทับ'},409);
      const mutations=await db.batch(values.map(row=>db.prepare("INSERT INTO command_numbers(id,number,year,issue_date,subject,status,assignee,hidden) VALUES(?,?,?,?,?,'ว่าง','',0) ON CONFLICT DO NOTHING").bind(row.id,row.number,row.year,row.issueDate,row.subject)));
      const rows=await rowsByIds(db,values.map(row=>row.id));if(rows.length!==values.length)return json({error:'ฐานข้อมูลยังยืนยันจำนวนไม่ครบ',rows:rows.map(publicRow)},500);
      // Manual import ends at verified D1 persistence; no external Master write.
      return json({ok:true,rows:rows.map(publicRow),storage:'cloudflare-d1',added:mutations.reduce((n,r)=>n+(r.meta?.changes||0),0),total:values.length,databaseVerified:true},200);
    }
    if(body.action==='use')requireRole(user,['procurement']);
    if(!['reserve','use'].includes(body.action))return json({error:'ใช้ปุ่มจองเลขหรือใช้เลข ไม่อนุญาตเขียนทับข้อมูลเดิม'},400);
    if(!Number.isInteger(body.revision)||body.revision<0)return json({error:'กรุณาโหลดรายการล่าสุดก่อนจอง'},400);
    const subject=String(body.subject||'').trim();if(!subject||subject.length>2000)return json({error:'กรุณาระบุเรื่อง'},400);
    const bookingName=String(body.assignee||user?.name||'').trim();
    if(body.action==='reserve'&&(!bookingName||bookingName.length>100))return json({error:'กรุณาระบุชื่อผู้จอง (ไม่เกิน 100 ตัวอักษร)'},400);
    if(user&&body.assignee&&body.assignee!==user.name)return json({error:'ไม่อนุญาตจองในชื่อบุคคลอื่น'},403);
    const now=new Date().toISOString();let mutation;
    if(body.action==='reserve')mutation=await db.prepare("UPDATE command_numbers SET subject=?,status='จองแล้ว',assignee=?,reserved_by=?,reserved_at=?,revision=revision+1,master_sync_error='' WHERE id=? AND status='ว่าง' AND COALESCE(hidden,0)=0 AND revision=?").bind(subject,bookingName,user?.id||('guest:'+bookingName),now,body.id,body.revision).run();
    else mutation=await db.prepare("UPDATE command_numbers SET subject=?,status='ใช้แล้ว',used_at=?,revision=revision+1,master_sync_error='' WHERE id=? AND status='จองแล้ว' AND reserved_by=? AND COALESCE(hidden,0)=0 AND revision=?").bind(subject,now,body.id,user.id,body.revision).run();
    if(mutation.meta?.changes!==1)return json({error:'เลขนี้ถูกจอง/ใช้แล้ว หรือข้อมูลเปลี่ยนจากอีกเครื่อง กรุณาโหลดใหม่'},409);
    const rows=await rowsByIds(db,[body.id]);const result=await syncMaster(db,env,rows);return json({...result,ok:true,masterVerified:result.ok,warning:result.ok?'':'บันทึกการจองใน D1 แล้ว — ยังไม่ยืนยัน Google Master',databaseVerified:true,reservationPersisted:true},200);
  }catch(error){return json({ok:false,error:error.message||'บันทึกไม่สำเร็จ',code:error.status===401?'LOGIN_REQUIRED':undefined},error.status||500);}
}
