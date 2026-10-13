const items=[
 {pages:'1',photos:[],missing:true,kind:'ประกาศประกวดราคา',title:'Compliance Balloon Catheter จำนวน 1,000 เส้น'},
 {pages:'2',photos:['IMG20261009132855.jpg'],kind:'ประกาศประกวดราคา',title:'Drug Eluting Stent ขนาดใหญ่ จำนวน 60 เส้น'},
 {pages:'3',photos:['IMG20261009132900.jpg'],kind:'ประกาศประกวดราคา',title:'ชุดเครื่องมือเจาะตัดกระดูกชนิดเปลี่ยนหัวได้ จำนวน 2 ชุด'},
 {pages:'4',photos:['IMG20261009132907.jpg'],kind:'ประกาศประกวดราคา',title:'เครื่องพร้อมน้ำยาตรวจ CD4 จำนวน 2,000 Test'},
 {pages:'5',photos:['IMG20261009132912.jpg'],kind:'ประกาศประกวดราคา',title:'วัสดุวิทยาศาสตร์การแพทย์ จำนวน 3 รายการ'},
 {pages:'6',photos:['IMG20261009132915.jpg'],kind:'ประกาศประกวดราคา',title:'เครื่องพร้อมน้ำยาตรวจชุดทดสอบความไวของสารต้านจุลชีพ จำนวน 2,000 Test'},
 {pages:'7–8',photos:['IMG20261009132922.jpg','IMG20261009132925.jpg'],kind:'ประกาศเผยแพร่แผน',title:'Tissue mitral valve 25–33 mm. (เนื้อเยื่อหมู ชนิดมีโครง)'}
];

export default function Oct9Pairing(){
 return <section style={{maxWidth:1060,margin:'16px auto',padding:'18px',background:'#fff',border:'1px solid #dbeafe',borderRadius:14,color:'#16304f',fontFamily:'system-ui,sans-serif'}}>
  <h2 style={{marginTop:0}}>✅ จับคู่รายการวันที่ 9 ตุลาคม 2569</h2>
  <p style={{margin:'0 0 14px'}}>PDF 8 หน้า = 7 เรื่อง · รูปที่ควรมี 8 รูป แต่รูปหน้า 1 หาย จึงเหลือ 7 รูป · จับคู่ตามลำดับหน้า PDF และลำดับถ่ายรูปจริง</p>
  <div style={{display:'grid',gap:12}}>{items.map((item,i)=>{
   return <article key={item.pages} style={{display:'grid',gridTemplateColumns:'minmax(120px,220px) 1fr',gap:14,border:'1px solid #dbeafe',borderRadius:10,padding:10,alignItems:'start'}}>
    <div>{item.missing?<div style={{minHeight:160,display:'grid',placeContent:'center',textAlign:'center',background:'#fff7ed',border:'1px dashed #fb923c',borderRadius:8,fontWeight:700}}>⚠️ รูปหน้า 1 หาย<br/><small style={{fontWeight:400}}>ยังไม่จับคู่รูปอื่นแทน</small></div>:<div style={{display:'grid',gap:8}}>{item.photos.map((photo,j)=>{const url=`/posting-evidence/2026-10-09/${photo}`;return <a key={photo} href={url} target="_blank" rel="noreferrer"><img src={url} alt={`รูปติดประกาศเรื่อง ${i+1} รูป ${j+1}`} style={{width:'100%',height:'auto',display:'block',borderRadius:8}}/></a>;})}</div>}</div>
    <div><b>ลำดับ {i+1} · PDF หน้า {item.pages}</b><div style={{marginTop:4}}>{item.kind}</div><div style={{fontSize:17,fontWeight:700,margin:'6px 0'}}>{item.title}</div>{item.missing?<div style={{color:'#c2410c',fontWeight:700}}>รูปหลักฐานหน้าแรกยังขาด</div>:item.photos.map(photo=>{const url=`/posting-evidence/2026-10-09/${photo}`;return <div key={photo} style={{marginTop:5}}><span style={{fontSize:13,color:'#64748b'}}>{photo}</span> · <a href={url} target="_blank" rel="noreferrer">ดูรูปใหญ่</a></div>;})}</div>
   </article>;
  })}</div>
 </section>;
}
