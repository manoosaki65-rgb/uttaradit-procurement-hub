import {classify, normalize, KINDS} from './posting-core.js';

function subject(text){return (text.match(/(?:^|\n)\s*(?:เรื่อง|เรือง)\s*([^\n]{5,250})/)||[])[1]||'';}
function project(text){return normalize((text.match(/(?:เลข(?:ที่)?โครงการ|รหัสโครงการ|โครงการเลขที่)\s*[:：]?\s*([0-9๐-๙]{6,})/)||[])[1]||'').replace(/[๐-๙]/g,c=>String(c.charCodeAt(0)-3664));}
function newHeading(text){return text.slice(0,650).split('\n').some(line=>/^ประกาศ(?:จังหวัด|โรงพยาบาล|กรม|เทศบาล|องค์การ|สำนักงาน|มหาวิทยาลัย|ประกวดราคา|เผยแพร่แผน|ผลผู้ชนะ|ยกเลิก)/.test(normalize(line)));}
function planTable(text){const t=normalize(text);return ['ชื่อโครงการ','งบประมาณ','คาดว่าจะ','รหัสแผน'].filter(x=>t.includes(x)).length>=3;}

export function pageParts(texts) {
  const parts=[];
  texts.forEach((text,i)=>{
    const title=subject(text);
    const kind=classify(text), previous=parts.at(-1);
    const before=previous?texts.slice(previous.start-1,previous.end).join('\n'):'';
    const sameTitle=title&&previous&&normalize(title)===normalize(previous.title);
    const p=project(text),oldProject=project(before),conflict=Boolean(p&&oldProject&&p!==oldProject);
    const freshHeading=newHeading(text)||Boolean(title&&!sameTitle);
    const marker=/ต่อจากหน้า|ข้อความต่อจาก|หน้าต่อเนื่อง/.test(normalize(text.slice(0,400)))||/\(\s*ต่อ\s*\)/.test(text.slice(0,400));
    const table=previous?.kind===KINDS[1]&&planTable(text);
    const differentKind=previous&&kind&&previous.kind&&kind!==previous.kind;
    const continuation=previous&&!freshHeading&&!conflict&&!differentKind&&(table||(p&&p===oldProject)||marker);
    if(continuation){previous.end=i+1;previous.mergeReason=table?'ตารางรายละเอียดต่อจากประกาศเผยแพร่แผน':'พบหลักฐานหน้าต่อของเรื่องเดิม';return;}
    parts.push({start:i+1,end:i+1,title,target:'',kind,review:i>0&&!freshHeading});
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

export function orderedRows(rows,date,ids=[]) {
  const selected=rows.filter(r=>r.postedDate===date);
  if(ids.length)return ids.map(id=>selected.find(r=>r.id===id)).filter(Boolean);
  const page=r=>Number(r.pdf?.name?.match(/__page-(\d+)-\d+__/u)?.[1])||0;
  const marked=selected.filter(r=>page(r));
  if(marked.length){
    const latest=marked.slice().sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')))[0];
    const batch=latest.pdf.name.match(/__batch-([a-zA-Z0-9-]+)__/)?.[1];
    return marked.filter(r=>r.pdf.name.match(/__batch-([a-zA-Z0-9-]+)__/)?.[1]===batch).sort((a,b)=>page(a)-page(b));
  }
  return selected.slice().sort((a,b)=>KINDS.indexOf(a.kind)-KINDS.indexOf(b.kind)||a.sequence-b.sequence);
}

export function photoTargets(count,rows,offset=0){return Array.from({length:count},(_,i)=>rows[offset+i]?.id||'');}
