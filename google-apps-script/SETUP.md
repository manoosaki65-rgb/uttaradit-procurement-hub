# เปิดใช้งานการเชื่อม Drive ของระบบเดิม

เว็บไซต์เดิม: https://uttaradit-procurement-hub.pages.dev/posting

Apps Script เดิมที่เตรียมโค้ดไว้:
https://script.google.com/home/projects/1p_Fov1lA_C9UPc_yAlOTa2RdiuCct6Sbve-Pnd9bPU9cXn77_dGlNkDs/edit

เจ้าของบัญชีเรียก `initializePosting` และอนุญาต Google Drive เมื่อ Google ขอสิทธิ์ ฟังก์ชันนี้ตรวจ Master และโฟลเดอร์เดิมและสร้างเฉพาะค่าการเชื่อมต่อใน Script Properties ไม่สร้าง Master หรือโฟลเดอร์ซ้ำ

จากนั้น Deploy เป็น Web app โดย Execute as: Me, Who has access: Anyone (คำขอทุกครั้งต้องผ่าน secret จาก backend; ไม่มีการเผยแพร่สิทธิ์ไฟล์ Drive) ถ้ามี deployment เดิมให้แก้เวอร์ชัน deployment นั้นเพื่อคง URL ของ Script

ตั้ง Cloudflare Pages project `uttaradit-procurement-hub` ฝั่ง production:
- `POSTING_SCRIPT_URL`: URL /exec ของ deployment
- `POSTING_SCRIPT_SECRET`: ค่าชื่อเดียวกันจาก Script Properties
- `POSTING_ACCESS_CODE`: ค่าชื่อเดียวกันจาก Script Properties เป็นรหัสสำหรับเจ้าหน้าที่

เก็บสองค่าหลังเป็น secret ไม่ใส่ใน source code หรือข้อความสาธารณะ Redeploy โปรเจกต์ Pages เดิมหลังตั้งค่า

ไฟล์โค้ดสำหรับกู้คืน/ติดตั้งสร้างด้วย `node scripts/build-posting-gas.mjs` หลัง `npm install` มีไฟล์ `Posting.gs` พร้อม SheetJS ฝังครบ หากใส่ร่วมกับ Script เดิม ต้องเปลี่ยนชื่อ handler doPost เดิมเป็น doPostLegacy การทำงานทะเบียนเลขประกาศ/สัญญาเดิมจึงยังส่งต่อ handler เดิม

Master: 12e7bfzCiv9M3NpPOQmdtd6r75QZj9g98
โฟลเดอร์งาน: 1FVpx-2alioghme97E-sqGIe8vNdg63Fu
PDF: 1MHw3_RWhHaTSx2JlsWiSmqIrMnwvWaLQ
รูป: 1OwCa4aOr3gCpwchCTZD_2FsLwP6scEIs

ข้อมูลกลางอ่านจาก XLSX นี้ทุกครั้ง ไม่มีฐานข้อมูลรายการอีกชุด การลบเป็น tombstone ในคอลัมน์ข้อมูลระบบซ่อนเพื่อเก็บเลขที่ใช้ไป การเปลี่ยนประเภทหรือวันจองเลขใหม่ในกลุ่มปลายทางและเก็บเลขกลุ่มเดิมไว้ใน metadata คอลัมน์แรก 10 คอลัมน์เก็บข้อมูลใช้งานตามประเภทครบ 4 Sheet

ก่อนถือว่าเสร็จ ต้องทดสอบผ่านหน้าเว็บจริง: เพิ่มชื่อ → แนบ/แยก PDF หลายหน้า → เลือกรูปหลายรูป → ยืนยันจับคู่ → บันทึก → Refresh/เปิดอีกเครื่อง → ตรวจไฟล์จริงใน Drive และอ่านแถว/ลิงก์ใน XLSX หลังบันทึก การทดสอบจำลองใน tests ยังไม่แทนขั้นตอนนี้

ยังไม่ได้ทดสอบ runtime ของ Apps Script บนบัญชีจริงจนกว่าเจ้าของจะอนุญาต รหัสเจ้าหน้าที่ช่วยจำกัดการเขียนผ่านเว็บ ส่วนสิทธิ์เปิด/ดาวน์โหลดไฟล์ยึดสิทธิ์ Drive เดิม OCR ทำใน Browser และต้องดาวน์โหลดโมเดลภาษาไทย/อังกฤษเมื่อใช้ครั้งแรก ภาพ HEIC ที่ OCR อ่านไม่ได้ให้ผู้ใช้เลือกจับคู่ด้วยตัวเอง
