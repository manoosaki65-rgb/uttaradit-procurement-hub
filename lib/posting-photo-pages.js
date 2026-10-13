export function photoPage(photo,index,notes=''){
 let map={};try{map=JSON.parse(notes.match(/\n\[posting-photo-pages:(.*)\]$/)?.[1]||'{}');}catch{}
 const page=Number(map[photo.id||photo.url]||photo.name.match(/^หน้า-(\d+)__/u)?.[1]||index+1);
 return Number.isInteger(page)&&page>0&&page<=500?page:index+1;
}
export function storedPageCount(notes=''){try{const n=JSON.parse(notes.match(/\n\[posting-photo-pages:(.*)\]$/)?.[1]||'{}').__count;return Number.isInteger(n)&&n>0&&n<=500?n:0;}catch{return 0;}}
export function documentPageCount(row){
 const range=row.pdf?.name?.match(/__page-(\d+)-(\d+)__/u);
 const pages=range?Number(range[2])-Number(range[1])+1:0;
 return storedPageCount(row.notes)||(pages>0&&pages<=500?pages:0);
}
export function preservePhotoPages(row,count){
 const mapping=Object.fromEntries(row.photos.map((p,i)=>[p.id||p.url,photoPage(p,i,row.notes)]));
 try{if(JSON.parse((row.notes||'').match(/\n\[posting-photo-pages:(.*)\]$/)?.[1]||'{}').__manual)mapping.__manual=true;}catch{}
 mapping.__count=count||storedPageCount(row.notes)||Math.max(1,...row.photos.map((p,i)=>photoPage(p,i,row.notes)));
 return (row.notes||'').replace(/\n\[posting-photo-pages:.*\]$/,'')+'\n[posting-photo-pages:'+JSON.stringify(mapping)+']';
}
// Explicit page assignments precede filenames and list order on every reload.
export function manualPhotoPages(notes,photos,count){
 const map={__count:count,__manual:true};
 for(const {asset,page} of photos)map[asset.id||asset.url]=page;
 return (notes||'').replace(/\n\[posting-photo-pages:.*\]$/,'')+'\n[posting-photo-pages:'+JSON.stringify(map)+']';
}
