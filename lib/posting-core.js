export const KINDS = ['ประกาศประกวดราคา','ประกาศเผยแพร่แผน','ประกาศผลผู้ชนะ','ประกาศยกเลิก'];
export const HEADERS = ['ลำดับ','วันที่ติดประกาศ','ชื่อรายการ','ประเภทประกาศ','ไฟล์ PDF','รูปภาพติดประกาศ','ลิงก์ PDF ใน Drive','ลิงก์รูปใน Drive','วันที่บันทึก','หมายเหตุ','ข้อมูลระบบ'];
export function normalize(s) { return String(s || '').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,''); }
export function suggest(text, rows) {
  const source=normalize(text);
  const ranked=rows.map(r=>{ const t=normalize(r.title); const grams=Array.from({length:Math.max(0,t.length-2)},(_,i)=>t.slice(i,i+3));
    return {id:r.id,score:t.length<8?0:source.includes(t)?1:grams.filter(g=>source.includes(g)).length/grams.length}; }).sort((a,b)=>b.score-a.score);
  return ranked[0]?.score>=0.85 && ranked[0].score-(ranked[1]?.score||0)>=0.2 ? ranked[0].id : '';
}
export function documentStarts(texts) {
  return texts.map((t,i)=>({page:i+1,text:t,title:(t.match(/เรื่อง\s*([^\n]{5,250})/)||[])[1]||'',start:i===0 || (/ประกาศ/.test(t.slice(0,500)) && /เรื่อง/.test(t.slice(0,800)) && !/ต่อจาก|\(ต่อ\)|หน้าที่\s*[2-9]/.test(t.slice(0,150)))}));
}
export function validateRanges(parts,total) {
  let next=1;
  for(const p of parts){ if(!Number.isInteger(p.start)||!Number.isInteger(p.end)||p.start!==next||p.end<p.start||p.end>total) throw Error('ช่วงหน้าต้องครอบคลุมทุกหน้า ไม่ซ้ำและไม่ข้ามหน้า'); next=p.end+1; }
  if(next!==total+1) throw Error('ยังมีหน้าที่ไม่ได้จัดชุดประกาศ');
}
export function mutate(rows,cmd,now) {
  const current=rows.find(r=>r.id===cmd.id);
  if(cmd.action==='delete') {
    if(!current || current.deleted) throw Error('ไม่พบรายการ');
    if(cmd.revision!==current.revision) throw Error('รายการเปลี่ยนจากเครื่องอื่น กรุณาโหลดข้อมูลใหม่');
    current.deleted=true;current.revision++;current.savedAt=now;return current;
  }
  if(!KINDS.includes(cmd.kind)||!String(cmd.title||'').trim()||!/^\d{4}-\d{2}-\d{2}$/.test(cmd.postedDate)||isNaN(Date.parse(cmd.postedDate))) throw Error('กรุณาระบุชื่อ ประเภท และวันที่ให้ถูกต้อง');
  if(current?.deleted) throw Error('รายการถูกลบแล้ว');
  if(current && cmd.revision!==current.revision) throw Error('รายการเปลี่ยนจากเครื่องอื่น กรุณาโหลดข้อมูลใหม่');
  const changed=!current || current.kind!==cmd.kind || current.postedDate!==cmd.postedDate;
  const reservations=current?.reservations?.slice()||[];
  const sequence=changed?1+Math.max(0,...rows.flatMap(r=>[...(r.reservations||[]),{kind:r.kind,date:r.postedDate,sequence:r.sequence}]).filter(x=>x.kind===cmd.kind&&x.date===cmd.postedDate).map(x=>x.sequence)):current.sequence;
  if(changed) reservations.push({kind:cmd.kind,date:cmd.postedDate,sequence});
  const result={...current,id:cmd.id,sequence,kind:cmd.kind,title:String(cmd.title).trim(),postedDate:cmd.postedDate,notes:String(cmd.notes||''),pdf:current?.pdf||null,photos:current?.photos||[],revision:(current?.revision||0)+1,createdAt:current?.createdAt||now,savedAt:now,reservations,deleted:false};
  if(current) { Object.assign(current,result);return current; }
  rows.push(result);return result;
}

