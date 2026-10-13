import {classify, normalize, KINDS} from './posting-core.js';

function subject(text){return (text.match(/(?:^|\n)\s*(?:เรื่อง|เรือง)\s*([^\n]{5,250})/)||[])[1]||'';}
function project(text){return normalize((text.match(/(?:เลข(?:ที่)?โครงการ|รหัสโครงการ|โครงการเลขที่)\s*[:：]?\s*([0-9๐-๙]{6,})/)||[])[1]||'').replace(/[๐-๙]/g,c=>String(c.charCodeAt(0)-3664));}
function newHeading(text){
  const head=normalize(text.slice(0,900));
  const hasAnnouncement=/ประกาศ(?:จังหวัด|โรงพยาบาล|กรม|เทศบาล|องค์การ|สำนักงาน|มหาวิทยาลัย|ประกวดราคา|เผยแพร่แผน|ผลผู้ชนะ|ยกเลิก)/.test(head);
  const hasSubject=/(?:เรื่อง|เรือง).{5,}/.test(head);
  return hasAnnouncement&&hasSubject;
}
function planTable(text){const t=normalize(text);return ['ชื่อโครงการ','งบประมาณ','คาดว่าจะ','รหัสแผน'].filter(x=>t.includes(x)).length>=3;}

export function pageParts(texts) {
  const parts=[];
  texts.forEach((text,i)=>{
    const title=subject(text);
    const kind=classify(text);
    const previous=parts.at(-1);
    const before=previous?texts.slice(previous.start-1,previous.end).join('\n'):'';
    const p=project(text),oldProject=project(before),conflict=Boolean(p&&oldProject&&p!==oldProject);
    const definiteStart=i===0||newHeading(text)||Boolean(previous&&title&&normalize(title)!==normalize(previous.title)&&/ประกาศ/.test(normalize(text.slice(0,900))));
    const table=previous?.kind===KINDS[1]&&planTable(text);

    // หลักการหน้างาน: เริ่มเรื่องใหม่เฉพาะเมื่อมีหัวประกาศ/เรื่องใหม่ชัดเจน
    // หน้าที่ไม่มีหัวเรื่องใหม่ให้ถือเป็นหน้าต่อของเรื่องก่อนหน้า เพื่อคงลำดับสแกนจริง
    if(previous&&!definiteStart&&!conflict){
      previous.end=i+1;
      if(table)previous.mergeReason='ตารางรายละเอียดต่อจากประกาศเผยแพร่แผน';
      else previous.mergeReason='หน้าต่อของเรื่องเดิมตามลำดับสแกน';
      if(!previous.kind&&kind)previous.kind=kind;
      return;
    }

    parts.push({start:i+1,end:i+1,title,target:'',kind,review:i>0&&!definiteStart});
  });
  return parts;
}

export function mergePrevious(parts,index){
  if(index<=0||index>=parts.length)throw Error('ไม่มีหน้าก่อนให้รวม');
  const previous=parts[index-1],current=parts[index];
  if(previous.saved||current.saved||previous.end+1!==current.start)throw Error('รวมได้เฉพาะช่วงติดกันที่ยังไม่บันทึก');
  if(previous.target&&current.target&&previous.target!==current.target)throw Error('ช่วงหน้าจับคู่กับคนละรายการ กรุณาตรวจคู่ก่อนรวม');
  return parts.flatMap((p,i)=>i===index?[]:i===index-1?[{...p,end:current.end,review:false,mergeReason:'ผู้ใช้รวมกับหน้าก่อน',requestId:undefined}]:[p]);
}

function pageRange(row){
  const m=row?.pdf?.name?.match(/__page-(\d+)-(\d+)__/u);
  if(!m)return null;
  const start=Number(m[1]),end=Number(m[2]);
  return Number.isInteger(start)&&Number.isInteger(end)&&end>=start?{start,end}:null;
}

export function orderedRows(rows,date,ids=[]) {
  const selected=rows.filter(r=>r.postedDate===date);
  if(ids.length)return ids.map(id=>selected.find(r=>r.id===id)).filter(Boolean);
  const page=r=>pageRange(r)?.start||0;
  const marked=selected.filter(r=>page(r));
  if(marked.length){
    const latest=marked.slice().sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')))[0];
    const batch=latest.pdf.name.match(/__batch-([a-zA-Z0-9-]+)__/)?.[1];
    return marked.filter(r=>r.pdf.name.match(/__batch-([a-zA-Z0-9-]+)__/)?.[1]===batch).sort((a,b)=>page(a)-page(b));
  }
  return selected.slice().sort((a,b)=>KINDS.indexOf(a.kind)-KINDS.indexOf(b.kind)||a.sequence-b.sequence);
}

export function photoTargets(count,rows,offset=0){
  // รูปถ่ายเรียงตามหน้าที่สแกนจริง: ถ้า 10 เรื่องมี 12 หน้า/รูป
  // เรื่องที่กิน 2 หน้า จะได้รับ 2 รูปติดกันโดยอัตโนมัติ
  const expanded=[];
  for(const row of rows){
    const range=pageRange(row);
    const copies=range?Math.max(1,range.end-range.start+1):1;
    for(let i=0;i<copies;i++)expanded.push(row.id);
  }
  return Array.from({length:count},(_,i)=>expanded[offset+i]||'');
}
