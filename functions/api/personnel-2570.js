/**
 * Hospital personnel 2570, authenticated Cloudflare Pages Function.
 *
 * Sensitive records are NEVER placed in the public Pages output or public GitHub.
 * Configuration is deliberately fail-closed:
 *   PERSONNEL_KV = separate Workers KV namespace binding
 *   PERSONNEL_ACCESS_TEAM_DOMAIN = <team>.cloudflareaccess.com
 *   PERSONNEL_ACCESS_AUD = Cloudflare Access application audience tag
 *   PERSONNEL_ADMIN_EMAIL = administrator's authorized email
 *
 * Create a Cloudflare Access self-hosted application matching /api/personnel-2570
 * and grant only approved hospital personnel. The JWT is independently verified
 * here; a spoofed CF-Access-Authenticated-User-Email header is not trusted.
 */
const DATA_KEY = "hospital-personnel-2570-v1";
const MAX_BODY_BYTES = 900_000;
const MAX_STAFF = 10_000;
const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Vary": "Cookie, CF-Access-Jwt-Assertion"
};
let jwksState = { domain: "", until: 0, keys: [] };

function respond(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function readPart(segment) {
  if (typeof segment !== "string" || !/^[\w-]+$/.test(segment)) throw new Error("Invalid JWT encoding");
  const standard = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = standard.padEnd(Math.ceil(standard.length / 4) * 4, "=");
  const decoded = atob(padded);
  return Uint8Array.from(decoded, ch => ch.charCodeAt(0));
}

function decodeJSONPart(segment) {
  return JSON.parse(new TextDecoder().decode(readPart(segment)));
}
function text(value) {
  return typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, 190) : "";
}
function settings(env) {
  const domain = String(env?.PERSONNEL_ACCESS_TEAM_DOMAIN ?? "").trim().toLowerCase()
    .replace(/^https:\/\//, "").replace(/\/$/, "");
  const aud = String(env?.PERSONNEL_ACCESS_AUD ?? "").trim();
  const admin = String(env?.PERSONNEL_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const kv = env?.PERSONNEL_KV;
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain) ||
      !/^[a-f0-9]{32,128}$/i.test(aud) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(admin) ||
      !kv || typeof kv.get !== "function" || typeof kv.put !== "function") return null;
  return { domain, aud, admin, kv };
}

async function cloudflareKeys(domain) {
  if (jwksState.domain === domain && jwksState.until > Date.now() && jwksState.keys.length) {
    return jwksState.keys;
  }
  const response = await fetch("https://" + domain + "/cdn-cgi/access/certs", {
    headers: { "Accept": "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true }
  });
  if (!response.ok) throw new Error("Unable to read Access public verification keys");
  const body = await response.json();
  const keys = Array.isArray(body.keys) ? body.keys.filter(x =>
    x && x.kty === "RSA" && typeof x.kid === "string" && x.n && x.e
  ) : [];
  if (!keys.length) throw new Error("Access public verification keys missing");
  jwksState = { domain, until: Date.now() + 10 * 60_000, keys };
  return keys;
}

async function verifiedIdentity(request, options) {
  const token = request.headers.get("CF-Access-Jwt-Assertion");
  if (!token || token.length > 12000) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const header = decodeJSONPart(parts[0]);
  const claims = decodeJSONPart(parts[1]);
  if (header.alg !== "RS256" || !header.kid || header.typ && header.typ !== "JWT") return null;

  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== "https://" + options.domain ||
      !(Array.isArray(claims.aud) ? claims.aud.includes(options.aud) : claims.aud === options.aud) ||
      !Number.isFinite(claims.exp) || now >= claims.exp ||
      !Number.isFinite(claims.iat) || claims.iat > now + 60 ||
      claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > now + 60)) {
    return null;
  }

  const keys = await cloudflareKeys(options.domain);
  const keyData = keys.find(item => item.kid === header.kid);
  if (!keyData) return null;
  const key = await crypto.subtle.importKey(
    "jwk", keyData, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
  );
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", key, readPart(parts[2]),
    new TextEncoder().encode(parts[0] + "." + parts[1])
  );
  if (!valid) return null;
  const email = text(claims.email).toLowerCase();
  return email ? { email } : null;
}

function sanitizedRecords(records) {
  if (!Array.isArray(records) || records.length < 1 || records.length > MAX_STAFF) return null;
  const result = [];
  for (const row of records) {
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    const keys = Object.keys(row);
    if (keys.length !== 3 || !keys.includes("name") ||
        !keys.includes("position") || !keys.includes("workplace")) return null;
    const name = text(row.name);
    const position = text(row.position);
    const workplace = text(row.workplace);
    if (!name || !position || !workplace || name.length < 3) return null;
    result.push({ name, position, workplace });
  }
  return result;
}

async function authorize(context) {
  const cfg = settings(context.env);
  if (!cfg) return { result: respond({ error: "ACCESS_NOT_CONFIGURED" }, 503) };
  let user = null;
  try { user = await verifiedIdentity(context.request, cfg); }
  catch { return { result: respond({ error: "ACCESS_VALIDATION_FAILED" }, 503) }; }
  if (!user) return { result: respond({ error: "AUTH_REQUIRED" }, 403) };
  return { cfg, user };
}

export async function onRequestGet(context) {
  const access = await authorize(context);
  if (access.result) return access.result;
  try {
    const data = await access.cfg.kv.get(DATA_KEY, "json");
    if (!data) return respond({ status: "empty", records: [], canPublish: access.user.email === access.cfg.admin });
    const records = sanitizedRecords(data.records);
    if (!records) return respond({ error: "INVALID_STORED_DIRECTORY" }, 503);
    return respond({
      status: "ready", records,
      updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : null,
      canPublish: access.user.email === access.cfg.admin
    });
  } catch { return respond({ error: "DIRECTORY_STORAGE_UNAVAILABLE" }, 503); }
}

export async function onRequestPost(context) {
  const access = await authorize(context);
  if (access.result) return access.result;
  if (access.user.email !== access.cfg.admin) return respond({ error: "ADMIN_ONLY" }, 403);

  const request = context.request;
  const origin = request.headers.get("Origin");
  if (!origin || origin !== new URL(request.url).origin) return respond({ error: "INVALID_ORIGIN" }, 403);
  if (!/^application\/json(?:;|$)/i.test(request.headers.get("Content-Type") || "")) {
    return respond({ error: "JSON_REQUIRED" }, 415);
  }
  const size = Number(request.headers.get("Content-Length") || 0);
  if (size > MAX_BODY_BYTES) return respond({ error: "PAYLOAD_TOO_LARGE" }, 413);
  let body;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return respond({ error: "PAYLOAD_TOO_LARGE" }, 413);
    body = JSON.parse(raw);
  } catch { return respond({ error: "INVALID_JSON" }, 400); }
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).join(",") !== "records") {
    return respond({ error: "ONLY_RECORDS_ALLOWED" }, 400);
  }
  const records = sanitizedRecords(body.records);
  if (!records) return respond({ error: "INVALID_RECORDS" }, 400);
  try {
    const updatedAt = new Date().toISOString();
    await access.cfg.kv.put(DATA_KEY, JSON.stringify({
      records, updatedAt, updatedBy: access.user.email
    }));
    return respond({ status: "saved", count: records.length, updatedAt });
  } catch { return respond({ error: "DIRECTORY_STORAGE_UNAVAILABLE" }, 503); }
}