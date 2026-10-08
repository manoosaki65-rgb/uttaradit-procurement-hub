const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequest({request,env}) {
  if(!env.POSTING_SCRIPT_URL || !env.POSTING_SCRIPT_SECRET || !env.POSTING_ACCESS_CODE) return reply({error:'ต้องให้เจ้าของบัญชีอนุญาต Apps Script และตั้งค่าการเชื่อม Google Drive ก่อนบันทึก',code:'SETUP_REQUIRED'},503);
  if(request.headers.get('X-Posting-Code')!==env.POSTING_ACCESS_CODE) return reply({error:'กรุณาระบุรหัสเข้าใช้งานที่เจ้าของระบบกำหนด'},401);
  if(!['GET','POST'].includes(request.method)) return reply({error:'Method not allowed'},405);
  try {
    if(Number(request.headers.get('content-length')||0)>30*1024*1024) return reply({error:'ไฟล์รวมต่อการบันทึกเกิน 30 MB'},413);
    const body=request.method==='GET'?{action:'list'}:await request.json();
    const response=await fetch(env.POSTING_SCRIPT_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,posting:true,secret:env.POSTING_SCRIPT_SECRET}),redirect:'follow'});
    if(!response.ok) throw Error('Google Drive ไม่ตอบรับการบันทึก');
    const result=await response.json();
    return reply(result,result.error?400:200);
  } catch { return reply({error:'เชื่อม Google Drive ไม่สำเร็จ กรุณาลองใหม่ ข้อมูลที่ยังไม่บันทึกยังอยู่บนหน้าจอ'},502); }
}
