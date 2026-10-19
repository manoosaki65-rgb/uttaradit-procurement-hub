/* Reuse the Hub's existing verified principal when available. If the Hub middleware
   is not present, reuse the existing POSTING_ACCESS_CODE already used by /posting.
   This does not create a new account or login system. */
export function identity(context){
  const principal=context.data?.hubUser;
  if(principal?.verified===true&&typeof principal.id==='string'&&typeof principal.name==='string'&&Array.isArray(principal.roles)){
    return {id:principal.id,name:principal.name,roles:principal.roles.filter(role=>['issuer','procurement'].includes(role)),sharedCode:false};
  }
  const configured=String(context.env?.POSTING_ACCESS_CODE||'');
  const supplied=String(context.request?.headers?.get('X-Posting-Code')||'');
  if(configured&&supplied&&supplied===configured){
    return {id:'posting-access-code',name:'เจ้าหน้าที่พัสดุ',roles:['issuer','procurement'],sharedCode:true};
  }
  return null;
}
export function requireRole(user,roles){
  if(!user)throw Object.assign(Error('กรุณาเชื่อมรหัสเจ้าหน้าที่เดิมก่อนบันทึกหรือจองเลข'),{status:401});
  if(!roles.some(role=>user.roles.includes(role)))throw Object.assign(Error('บัญชีเดิมนี้ไม่มีสิทธิ์ทำรายการนี้'),{status:403});
}
