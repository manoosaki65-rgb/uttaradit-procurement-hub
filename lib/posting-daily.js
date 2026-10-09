export function isTestEvidence(row){return /TEST[\s_-]*ONLY/i.test(`${row.title||''} ${row.notes||''}`)||/^ทดสอบระบบ(?:\s|$)/.test(row.title||'');}
export function dailyGroups(rows){
 const days=new Map();
 for(const row of rows){if(row.deleted||isTestEvidence(row)||!/^\d{4}-\d{2}-\d{2}$/.test(row.postedDate||''))continue;
  const group=days.get(row.postedDate)||{date:row.postedDate,photos:[],notes:[]};
  for(const photo of row.photos||[])if(photo.url&&!group.photos.some(p=>(p.id&&p.id===photo.id)||p.url===photo.url))group.photos.push(photo);
  if(row.notes?.trim()&&!group.notes.includes(row.notes.trim()))group.notes.push(row.notes.trim());
  if(group.photos.length)days.set(row.postedDate,group);
 }
 return [...days.values()].sort((a,b)=>b.date.localeCompare(a.date));
}
export const dailyId=date=>'daily-evidence-'+date;
export function appendNotes(previous,next){const value=String(next||'').trim(),old=String(previous||'').trim();return !value||old.split('\n').includes(value)?old:[old,value].filter(Boolean).join('\n');}
export function uploadBatches(items,maxBytes=18*1024*1024){const batches=[];let batch=[],size=0;for(const item of items){if(item.file.size>20*1024*1024)throw Error('รูปแต่ละไฟล์ต้องไม่เกิน 20 MB');if(batch.length&&size+item.file.size>maxBytes){batches.push(batch);batch=[];size=0;}batch.push(item);size+=item.file.size;}if(batch.length)batches.push(batch);return batches;}
export function photoId(photo){return photo.id||photo.url?.match(/\/d\/([^/?]+)/)?.[1]||'';}
export function photoThumbnail(photo){if(photo.url?.startsWith('/posting-evidence/'))return photo.url;const id=photoId(photo);return id?'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w600':photo.url;}
export function photoDownload(photo){if(photo.url?.startsWith('/posting-evidence/'))return photo.url;const id=photoId(photo);return id?'https://drive.google.com/uc?export=download&id='+encodeURIComponent(id):photo.url;}
