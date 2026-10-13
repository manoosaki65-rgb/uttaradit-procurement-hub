import { PDFDocument } from 'pdf-lib';

export function imageType(file) {
  return file.type || (/\.hei[cf]$/i.test(file.name) ? 'image/heic' : '');
}
export function validatePhoto(file) {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(imageType(file))) {
    throw Error('รองรับรูป JPG, PNG, WebP และ HEIC');
  }
  if (file.size > 20 * 1024 * 1024) throw Error('รูปแต่ละไฟล์ต้องไม่เกิน 20 MB');
}
export async function pdfPageCount(file) {
  if (!file || !/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
    throw Error('กรุณาเลือกไฟล์ PDF');
  }
  if (file.size > 20 * 1024 * 1024) throw Error('PDF ต้องไม่เกิน 20 MB');
  let doc;
  try { doc = await PDFDocument.load(await file.arrayBuffer()); }
  catch { throw Error('อ่าน PDF ไม่สำเร็จ กรุณาตรวจไฟล์หรือเอารหัสผ่าน PDF ออกก่อน'); }
  const count = doc.getPageCount();
  if (count < 1 || count > 500) throw Error('รองรับ PDF ตั้งแต่ 1 ถึง 500 หน้า');
  return count;
}
export async function singlePdfPage(file, page) {
  const src = await PDFDocument.load(await file.arrayBuffer());
  if (!Number.isInteger(page) || page < 1 || page > src.getPageCount()) throw Error('ไม่พบหน้า PDF');
  const dst = await PDFDocument.create();
  const [copy] = await dst.copyPages(src, [page - 1]);
  dst.addPage(copy);
  return new File([new Uint8Array(await dst.save())], `หน้า-${page}.pdf`, { type: 'application/pdf' });
}
