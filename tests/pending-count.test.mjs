import test from 'node:test';
import assert from 'node:assert/strict';
import { countPending, onRequestGet } from '../functions/api/pending-count.js';

test('counts blank numbers, excludes issued and deleted records', () => {
  assert.equal(countPending({ items: [{ announcement_no: '' }, { announcement_no: null }, { announcement_no: '  ' }, { announcement_no: '001' }, { announcement_no: '', deleted: true }] }, 'announcement_no'), 3);
  assert.equal(countPending({ items: [{ contract_no: '' }, { contract_no: '46/2570' }] }, 'contract_no'), 1);
  assert.equal(countPending({ items: [] }, 'contract_no'), 0);
});

test('rejects invalid or incomplete upstream lists', () => {
  for (const data of [{}, { items: [{}] }, { items: [{ contract_no: 0 }] }, { items: [], nextToken: 'next' }]) {
    assert.throws(() => countPending(data, 'contract_no'));
  }
});

test('uses separate fixed read-only upstreams and never caches counts', async () => {
  const originalFetch = globalThis.fetch;
  try {
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, options });
      return Response.json({ items: url.includes('onrender') ? [{ announcement_no: '' }, { announcement_no: '' }] : [{ contract_no: '' }] });
    };
    for (const [system, expected] of [['announcement', 2], ['contract', 1]]) {
      const response = await onRequestGet({ request: new Request(`https://hub.example/api/pending-count?system=${system}`) });
      assert.equal(response.status, 200);
      assert.match(response.headers.get('cache-control'), /no-store/);
      const body = await response.json();
      assert.equal(body.count, expected);
      assert.equal(body.system, system);
    }
    assert.match(calls[0].url, /^https:\/\/uttaradit-announcement-register\.onrender\.com\/api\/announcements$/);
    assert.match(calls[1].url, /^https:\/\/uttaradit-contract-number\.manoosaki65\.workers\.dev\/api\/contracts\?year=2570$/);
    assert.ok(calls.every(({ options }) => !options.method || options.method === 'GET'));
    assert.ok(calls.every(({ options }) => options.redirect === 'manual'));
    globalThis.fetch = async () => new Response(null, { status: 302, headers: { Location: 'https://other.example/' } });
    const redirected = await onRequestGet({ request: new Request('https://hub.example/api/pending-count?system=announcement') });
    assert.equal(redirected.status, 502);
    globalThis.fetch = async () => Response.json({ error: 'offline' }, { status: 503 });
    const unavailable = await onRequestGet({ request: new Request('https://hub.example/api/pending-count?system=contract') });
    assert.equal(unavailable.status, 502);
    assert.equal((await unavailable.json()).count, undefined);
    const unknown = await onRequestGet({ request: new Request('https://hub.example/api/pending-count?system=__proto__') });
    assert.equal(unknown.status, 400);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

