const systems = {
  announcement: {
    url: 'https://uttaradit-announcement-register.onrender.com/api/announcements',
    field: 'announcement_no',
  },
  contract: {
    // Match the fiscal year shown by the existing contract register.
    url: 'https://uttaradit-contract-number.manoosaki65.workers.dev/api/contracts?year=2570',
    field: 'contract_no',
  },
};

export function countPending(data, field) {
  if (!Array.isArray(data?.items) || data.nextToken) throw new Error('Incomplete register response');
  return data.items.reduce((count, item) => {
    if (!item || !(field in item) || (item[field] !== null && typeof item[field] !== 'string')) {
      throw new Error('Invalid register record');
    }
    return count + (!item.deleted && !String(item[field] ?? '').trim() ? 1 : 0);
  }, 0);
}

export async function onRequestGet({ request }) {
  const system = new URL(request.url).searchParams.get('system');
  const config = systems[system];
  const headers = { 'Cache-Control': 'no-store, max-age=0', 'X-Content-Type-Options': 'nosniff' };
  if (!Object.hasOwn(systems, system)) return Response.json({ error: 'Unknown system' }, { status: 400, headers });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(config.url, {
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      redirect: 'error',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Register unavailable (HTTP ${response.status})`);
    const count = countPending(await response.json(), config.field);
    return Response.json({ system, count, checkedAt: new Date().toISOString() }, { headers });
  } catch (error) {
    console.error('Pending count upstream failed', system, error.name, error.message);
    return Response.json({ system, error: 'อ่านจำนวนรายการรอออกเลขไม่สำเร็จ', diagnostic: `${error.name}: ${error.message}` }, { status: 502, headers });
  } finally {
    clearTimeout(timer);
  }
}
