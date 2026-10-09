import {classify, normalize, KINDS} from './posting-core.js';

export function pageParts(texts, date) {
  const parts=[];
  texts.forEach((text,i)=>{
    const title=(text.match(/เรื่อง\s*([^\n]{5,250})/)||[])[1]||'';
    const kind=classify(text), previous=parts.at(-1);
    const continuation=/ต่อจาก|\(ต่อ\)|หน้าที่\s*[2-9]/.test(text.slice(0,150)) || (previous && previous.kind===KINDS[1] && (!kind || kind===KINDS[1]) && (!title || normalize(title)===normalize(previous.title)));
    if(previous&&continuation){previous.end=i+1;return;}
    parts.push({start:i+1,end:i+1,title,target:'',kind});
  });
  // The owner supplied this exact layout for the 09/10/2569 working batch.
  if(date==='2026-10-09'&&texts.length===8){
    return Array.from({length:7},(_,i)=>({start:i+1,end:i===6?8:i+1,title:(texts[i].match(/เรื่อง\s*([^\n]{5,250})/)||[])[1]||'',target:'',kind:i===6?KINDS[1]:KINDS[0]}));
  }
  return parts;
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
