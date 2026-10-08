// Existing IDs: never create a replacement master or folders.
const MASTER='12e7bfzCiv9M3NpPOQmdtd6r75QZj9g98', ROOT='1FVpx-2alioghme97E-sqGIe8vNdg63Fu';
const PDF_FOLDER='1MHw3_RWhHaTSx2JlsWiSmqIrMnwvWaLQ', PHOTO_FOLDER='1OwCa4aOr3gCpwchCTZD_2FsLwP6scEIs';
function initializePosting(){
  // Run once as the Drive owner. Reads the existing master, never creates it.
  load_();
  [PDF_FOLDER,PHOTO_FOLDER].forEach(id=>checkParents_(DriveApp.getFolderById(id),ROOT));
  const props=PropertiesService.getScriptProperties();
  if(!props.getProperty('POSTING_SCRIPT_SECRET'))props.setProperty('POSTING_SCRIPT_SECRET',Utilities.getUuid()+Utilities.getUuid());
  if(!props.getProperty('POSTING_ACCESS_CODE'))props.setProperty('POSTING_ACCESS_CODE',Utilities.getUuid());
  console.log('ตรวจพบ Master และโฟลเดอร์เดิมแล้ว การอนุญาตเชื่อม Drive พร้อมใช้งาน');
}
function json_(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);}
function checkParents_(file,parent){const it=file.getParents();let found=false;while(it.hasNext())if(it.next().getId()===parent)found=true;if(!found)throw Error('โครงสร้าง Google Drive เปลี่ยน กรุณาตรวจสอบก่อนบันทึก');}
function load_(){
  const f=DriveApp.getFileById(MASTER);checkParents_(f,ROOT);
  const wb=XLSX.read(new Uint8Array(f.getBlob().getBytes().map(x=>x&255)),{type:'array',cellDates:false});
  if(wb.SheetNames.length!==4||KINDS.some(k=>!wb.Sheets[k]))throw Error('Master ต้องมี 4 Sheet ตามประเภทประกาศ');
  const rows=[];
  KINDS.forEach(kind=>XLSX.utils.sheet_to_json(wb.Sheets[kind],{defval:''}).forEach((v,index)=>{
    if(!v['ชื่อรายการ'])return;
    let meta={};try{meta=JSON.parse(v['ข้อมูลระบบ']||'{}');}catch{throw Error('ข้อมูลระบบใน Master ไม่ถูกต้อง');}
    const links=String(v['ลิงก์รูปใน Drive']||v['ลิงก์รูป']||'').split('\n').filter(Boolean),names=String(v['รูปภาพติดประกาศ']||'').split('\n');
    rows.push({...meta,id:meta.id||'legacy-'+kind+'-'+index,sequence:Number(v['ลำดับ']),kind,postedDate:String(v['วันที่ติดประกาศ']),title:v['ชื่อรายการ'],notes:v['หมายเหตุ'],savedAt:String(v['วันที่บันทึก']),revision:meta.revision||1,pdf:meta.pdf||((v['ลิงก์ PDF ใน Drive']||v['ลิงก์ PDF'])?{name:v['ไฟล์ PDF'],url:v['ลิงก์ PDF ใน Drive']||v['ลิงก์ PDF']}:null),photos:meta.photos||links.map((url,i)=>({url,name:names[i]||'รูป'}))});
  }));return {wb,rows};
}
function save_(wb,rows){
  KINDS.forEach(kind=>{
    const old=wb.Sheets[kind]; const all=rows.filter(r=>r.kind===kind).sort((a,b)=>b.postedDate.localeCompare(a.postedDate)||b.sequence-a.sequence);
    const cells=[HEADERS,...all.map(r=>[r.sequence,r.postedDate,r.title,r.kind,r.pdf?.name||'',r.photos.map(p=>p.name).join('\n'),r.pdf?.url||'',r.photos.map(p=>p.url).join('\n'),r.savedAt,r.notes,JSON.stringify(r)])];
    const sheet=XLSX.utils.aoa_to_sheet(cells);sheet['!cols']=old['!cols']||HEADERS.map((_,i)=>({wch:i===2?60:24}));sheet['!cols'][10]={hidden:true};wb.Sheets[kind]=sheet;
  });
  const data=XLSX.write(wb,{type:'base64',bookType:'xlsx'});
  const res=UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files/'+MASTER+'?uploadType=media',{method:'patch',contentType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',payload:Utilities.base64Decode(data),headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
  if(res.getResponseCode()!==200)throw Error('เขียน Master ไม่สำเร็จ');
}
function asset_(a,folder){
  if(!a||!/^[a-zA-Z0-9-]{16,80}$/.test(a.key)||!a.name||!a.base64)throw Error('ไฟล์ไม่ถูกต้อง');
  if(folder===PDF_FOLDER?a.type!=='application/pdf':!/^image\/(jpeg|png|webp|heic|heif)$/.test(a.type))throw Error('ชนิดไฟล์ไม่รองรับ');
  const dir=DriveApp.getFolderById(folder);checkParents_(dir,ROOT);
  const name=a.key+'_'+a.name.replace(/[\\/]/g,'_');const existing=dir.getFilesByName(name);
  const f=existing.hasNext()?existing.next():dir.createFile(Utilities.newBlob(Utilities.base64Decode(a.base64),a.type,name));
  return {id:f.getId(),name:a.name,url:f.getUrl(),key:a.key};
}
function doPostPosting(e){
  let lock;
  try{
    const cmd=JSON.parse(e.postData.contents);
    const props=PropertiesService.getScriptProperties();
    const secret=props.getProperty('POSTING_SCRIPT_SECRET')||props.getProperty('SYNC_TOKEN');
    if(!secret||cmd.secret!==secret)throw Error('Unauthorized');
    lock=LockService.getScriptLock();if(!lock.tryLock(25000))throw Error('มีการบันทึกจากเครื่องอื่น กรุณาลองใหม่');
    const {wb,rows}=load_();
    if(cmd.action==='list')return json_({rows:rows.filter(r=>!r.deleted),masterId:MASTER});
    if(!['save','delete','movePhoto'].includes(cmd.action)||!/^[a-zA-Z0-9_-]{8,100}$/.test(cmd.id))throw Error('คำสั่งไม่ถูกต้อง');
    const prior=rows.find(r=>r.id===cmd.id);
    if(cmd.requestId && prior?.lastRequestId===cmd.requestId)return json_({row:prior});
    if(cmd.action==='movePhoto'){
      const dest=rows.find(r=>r.id===cmd.targetId&&!r.deleted);
      if(!prior||prior.deleted||!dest||dest.id===prior.id)throw Error('เลือกปลายทางให้ถูกต้อง');
      if(prior.revision!==cmd.revision||dest.revision!==cmd.targetRevision)throw Error('รายการเปลี่ยนจากเครื่องอื่น กรุณาโหลดใหม่');
      const photo=prior.photos.find(p=>p.id===cmd.photoId);if(!photo)throw Error('ไม่พบรูป');
      prior.photos=prior.photos.filter(p=>p.id!==photo.id);if(!dest.photos.some(p=>p.id===photo.id))dest.photos.push(photo);
      [prior,dest].forEach(r=>{r.revision++;r.savedAt=new Date().toISOString();});prior.lastRequestId=cmd.requestId;save_(wb,rows);
      return json_({row:load_().rows.find(r=>r.id===prior.id)});
    }
    const row=mutate(rows,cmd,new Date().toISOString());
    if(cmd.action==='save'){
      if(cmd.pdfUpload)row.pdf=asset_(cmd.pdfUpload,PDF_FOLDER);
      if(cmd.keepPhotoIds){if(!Array.isArray(cmd.keepPhotoIds))throw Error('รูปไม่ถูกต้อง');row.photos=row.photos.filter(p=>cmd.keepPhotoIds.includes(p.id));}
      (cmd.photoUploads||[]).forEach(a=>{const p=asset_(a,PHOTO_FOLDER);if(!row.photos.some(x=>x.id===p.id))row.photos.push(p);});
    }
    row.lastRequestId=cmd.requestId;save_(wb,rows);
    const persisted=load_().rows.find(r=>r.id===row.id);
    if(!persisted||persisted.revision!==row.revision)throw Error('ตรวจสอบข้อมูลหลังบันทึกไม่สำเร็จ');
    return json_({row:persisted});
  }catch(err){return json_({error:String(err.message||err)});}finally{if(lock?.hasLock())lock.releaseLock();}
}
// When installed alongside the existing registry script, rename its original
// doPost to doPostLegacy. All non-posting requests retain their original handler.
function doPost(e){
  let cmd;try{cmd=JSON.parse(e.postData.contents);}catch{return json_({error:'Invalid JSON'});}
  return cmd.posting ? doPostPosting(e) : typeof doPostLegacy==='function' ? doPostLegacy(e) : json_({error:'Unsupported request'});
}
