import fs from 'node:fs';

for (const room of ['egp','gf']) {
  const source = `public/room-${room}.b64`;
  const target = `public/room-${room}.jpg`;
  const base64 = fs.readFileSync(source, 'utf8').trim();
  fs.writeFileSync(target, Buffer.from(base64, 'base64'));
  console.log(`decoded ${source} -> ${target}`);
}
