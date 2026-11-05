import { router, json, error, storage } from '@appdeploy/sdk';

const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._ก-๙-]+/g, '_').slice(0, 120) || 'order-file';

export const handler = router({
  'GET /api/_healthcheck': [async () => json({ message: 'Success' })],
  'GET /api/uc/:id/order-file': [async ({ params }) => {
    const prefix = `uc69/${params.id}/`;
    const listed = await storage.list({ prefix, limit: 20 });
    if (!listed.paths.length) return json({ file: null });
    const path = listed.paths[listed.paths.length - 1];
    const [signed] = await storage.url([path]);
    return json({ file: { name: path.split('/').slice(2).join('/'), url: signed.url } });
  }],
  'POST /api/uc/:id/order-file': [async ({ params, body }) => {
    const data = body as { name?: string; contentType?: string; content?: string };
    if (!data.name || !data.content) return error('กรุณาเลือกไฟล์', 400);
    if (data.content.length > 14_000_000) return error('ไฟล์มีขนาดใหญ่เกิน 10 MB', 413);
    const prefix = `uc69/${params.id}/`;
    const existing = await storage.list({ prefix, limit: 50 });
    if (existing.paths.length) await storage.delete(existing.paths);
    const name = safeName(data.name);
    const path = `${prefix}${name}`;
    const [ok] = await storage.write([{ path, content: data.content, contentType: data.contentType || 'application/octet-stream' }]);
    if (!ok) return error('บันทึกไฟล์ไม่สำเร็จ', 500);
    const [signed] = await storage.url([path]);
    return json({ file: { name, url: signed.url } });
  }],
});