import fs from 'node:fs';

const version = '20261014v2';
for (const room of ['egp','gf']) {
  const source = `public/room-${room}.b64`;
  const targets = [
    `public/room-${room}.jpg`,
    `public/meeting-${room}-${version}.jpg`,
  ];
  const base64 = fs.readFileSync(source, 'utf8').trim();
  const bytes = Buffer.from(base64, 'base64');
  for (const target of targets) {
    fs.writeFileSync(target, bytes);
    console.log(`decoded ${source} -> ${target}`);
  }
}
