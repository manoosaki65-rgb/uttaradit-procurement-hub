# ย้ายระบบงบประมาณ 2570 ออกจาก AppDeploy

ต้นทาง: https://2570-8iw897.v2.appdeploy.ai/#uc
AppDeploy app_id: `2570-8iw897`
สำรองจาก Source snapshot: `1790559774633` (5 พ.ย. 2569)
สาขา GitHub แยก: `migration-budget-2570-20261105`
โค้ดเว็บต้นฉบับเก็บใน `src/`, `backend/index.ts`, ไฟล์โครงงานอื่น ๆ; เวอร์ชันที่แปลงให้ Cloudflare ใช้ `src/App.tsx` + `functions/`.

## 1) Deploy ที่ Cloudflare Pages (ยังไม่ได้กดแทนเว็บใช้งานจริง)

ใช้ Git integration, เลือก repository `manoosaki65-rgb/uttaradit-procurement-hub`, branch `migration-budget-2570-20261105`.

- Root directory: `budget-2570`
- Framework: Vite
- Build command: `npm install && npm run build`
- Output directory: `dist`
- Environment: Node.js 22
- ตั้ง Production branch เป็น `migration-budget-2570-20261105`
- อย่าแก้ลิงก์บน Home จนทดสอบครบ

## 2) ไฟล์แนบ UC / Cloudflare R2

หน้าเดิมเก็บไฟล์แนบ UC ใน AppDeploy storage แยกจากข้อมูลหน้าเว็บ. Cloudflare Pages Function ใน `functions/api/uc/[id]/order-file.js` เปลี่ยนไปใช้ R2.

ก่อนใช้งานไฟล์แนบที่เว็บใหม่ ให้สร้าง R2 bucket เช่น `uttaradit-budget-2570-uc`, ไปที่ Pages > Settings > Bindings > Add > R2 bucket และตั้งชื่อตัวแปร `UC_FILES` แล้ว redeploy.
API ทดสอบ: `/api/_healthcheck`, `/api/uc/1/order-file`.
**ไฟล์แนบเดิมไม่ได้อยู่ใน R2 โดยอัตโนมัติ**. ต้องสำรวจจำนวนไฟล์แนบต้นทาง ดาวน์โหลดและย้ายทีละชุด/เป็น batch จาก AppDeploy storage พร้อมเทียบ ID ก่อนปิดระบบเก่า.

## 3) ข้อมูลที่เก็บในเบราว์เซอร์เดิม

เว็บต้นฉบับใช้ localStorage 3 คีย์:
`budget70RowsOfficial28`, `plan69RowsEditable`, `uc69Rows34Real`.
ต้องเปิดเว็บเก่าบน Chrome/โปรไฟล์/เครื่องที่ใช้บันทึกข้อมูลจริง จึงจะได้ข้อมูลล่าสุด. เว็บใหม่ต่างโดเมน ไม่สามารถอ่าน localStorage ของเว็บเก่าได้.

วิธีส่งออกจากเว็บเก่า **บนคอมพิวเตอร์เครื่องที่เคยแก้ข้อมูล**:
1. เปิด https://2570-8iw897.v2.appdeploy.ai/#uc
2. กด F12 > Console
3. วางโค้ด JavaScript ชุดนี้และ Enter:

```js
(() => {
  const keys=['budget70RowsOfficial28','plan69RowsEditable','uc69Rows34Real'];
  const payload={app:'uttaradit-budget-2570',createdAt:new Date().toISOString(),
    source:location.origin,data:Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]))};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='budget2570-appdeploy-backup.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
})();
```

4. ในเว็บไซต์ Cloudflare ใหม่ เปิด `/import-data.html`, เลือก JSON และกดนำเข้าข้อมูล. ระบบจะสำรองข้อมูลของเว็บใหม่ก่อนเขียนทับ.

ต้องเปิดเว็บใหม่ด้วย Chrome/โปรไฟล์เดียวกับที่จะใช้งานต่อ; localStorage ไม่ใช่ฐานข้อมูลกลางระหว่างเครื่อง

## 4) เกณฑ์ผ่านก่อนใช้งานจริง

- เปิดได้ครบ #budget, #plan, #uc; จำนวนรายการและยอดรวมเหมือนเว็บเดิม
- ทดสอบแก้ไขข้อมูล 1 รายการแล้วรีเฟรช ดูว่าคงอยู่
- ทดสอบนำเข้าข้อมูลจริงจากเบราว์เซอร์เดิม
- ตั้ง R2 binding และทดสอบแนบ / ดาวน์โหลดไฟล์ UC
- ตรวจและนำเข้าทุกไฟล์แนบ UC เดิมเทียบ ID
- ยืนยันหน้าเว็บมือถือและ Excel export ใช้งานได้
- หลังผ่านจึงเปลี่ยนลิงก์ในหน้า Home; เก็บ AppDeploy เดิมเป็นสำรองไว้ก่อน

ข้อจำกัด: ระบบเดิมเก็บข้อมูลแก้ไขไว้เฉพาะ localStorage ของแต่ละเบราว์เซอร์ ไม่ใช่ฐานกลาง หากหลายคนใช้คนละเครื่องต้องวางแผนย้ายไป DB กลางอย่างระมัดระวัง และห้ามรวมข้อมูลทับกันโดยไม่ตรวจ.
