const reply = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
const fileKey = (id) => 'uc69/' + id + '/order-file';
const publicFile = (id, name) => ({ name, url: '/api/uc/' + id + '/order-file?download=1' });
const fileName = (s) => String(s || 'order-file').replace(/[\\/\r\n\x00-\x1f]/g, '_').slice(0, 120);

function validId(context) {
  const id = String(context.params.id || '');
  return /^\d{1,6}$/.test(id) ? id : null;
}

export async function onRequestGet(context) {
  const id = validId(context);
  if (!id) return reply({ error: 'รหัส UC ไม่ถูกต้อง' }, 400);
  if (!context.env.UC_FILES) return reply({ error: 'R2 binding UC_FILES ยังไม่พร้อม' }, 503);
  const object = await context.env.UC_FILES.get(fileKey(id));
  if (!object) return reply({ file: null });
  const name = object.customMetadata?.name || 'order-file';
  if (new URL(context.request.url).searchParams.has('download')) {
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(name),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }
  return reply({ file: publicFile(id, name) });
}

export async function onRequestPost(context) {
  const id = validId(context);
  if (!id) return reply({ error: 'รหัส UC ไม่ถูกต้อง' }, 400);
  if (!context.env.UC_FILES) return reply({ error: 'R2 binding UC_FILES ยังไม่พร้อม' }, 503);
  let data;
  try { data = await context.request.json(); } catch { return reply({ error: 'JSON ไม่ถูกต้อง' }, 400); }
  if (!data?.name || typeof data.content !== 'string') return reply({ error: 'กรุณาเลือกไฟล์' }, 400);
  if (data.content.length > 14_000_000) return reply({ error: 'ไฟล์มีขนาดใหญ่เกิน 10 MB' }, 413);
  let binary;
  try { binary = Uint8Array.from(atob(data.content), c => c.charCodeAt(0)); }
  catch { return reply({ error: 'ไฟล์แนบไม่ถูกต้อง' }, 400); }
  if (binary.byteLength > 10 * 1024 * 1024) return reply({ error: 'ไฟล์มีขนาดใหญ่เกิน 10 MB' }, 413);
  const name = fileName(data.name);
  await context.env.UC_FILES.put(fileKey(id), binary, {
    httpMetadata: { contentType: String(data.contentType || 'application/octet-stream') },
    customMetadata: { name },
  });
  return reply({ file: publicFile(id, name) });
}
