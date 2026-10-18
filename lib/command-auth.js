/* No new accounts or login are created. Only an existing, server-verified
   Hub principal may write. Without that middleware production is read-only. */
export function identity(context){
  const principal=context.data?.hubUser;
  if(principal?.verified!==true||typeof principal.id!=='string'||typeof principal.name!=='string'||!Array.isArray(principal.roles))return null;
  return {id:principal.id,name:principal.name,roles:principal.roles.filter(role=>['issuer','procurement'].includes(role))};
}
export function requireRole(user,roles){
  if(!user)throw Object.assign(Error('ยังไม่ยืนยันบัญชีเจ้าหน้าที่จากระบบ Hub เดิม จึงเปิดอ่านและค้นหาได้ แต่ยังบันทึกหรือจองไม่ได้'),{status:401});
  if(!roles.some(role=>user.roles.includes(role)))throw Object.assign(Error('บัญชีเดิมนี้ไม่มีสิทธิ์ทำรายการนี้'),{status:403});
}
