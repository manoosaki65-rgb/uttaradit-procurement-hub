import fs from 'node:fs';
import path from 'node:path';

const version = '20261017hd';

// Keep the existing low-size fallbacks for compatibility.
for (const room of ['egp','gf']) {
  const source = `public/room-${room}.b64`;
  if (!fs.existsSync(source)) continue;
  const targets = [
    `public/room-${room}.jpg`,
    `public/meeting-${room}-20261014v3.jpg`,
  ];
  const base64 = fs.readFileSync(source, 'utf8').trim();
  const bytes = Buffer.from(base64, 'base64');
  for (const target of targets) {
    fs.writeFileSync(target, bytes);
    console.log(`decoded ${source} -> ${target}`);
  }
}

// Rebuild the HD e-GP photo from text chunks committed to the repo.
const hdDir = 'public/room-hd';
const egpChunks = fs.existsSync(hdDir)
  ? fs.readdirSync(hdDir).filter((name)=>/^egp-\d+\.b64$/.test(name)).sort()
  : [];
if (egpChunks.length) {
  const base64 = egpChunks.map((name)=>fs.readFileSync(path.join(hdDir,name),'utf8').trim()).join('');
  const bytes = Buffer.from(base64,'base64');
  const target = `public/meeting-egp-${version}.jpg`;
  fs.writeFileSync(target,bytes);
  console.log(`rebuilt ${target} from ${egpChunks.length} chunks (${bytes.length} bytes)`);
}
