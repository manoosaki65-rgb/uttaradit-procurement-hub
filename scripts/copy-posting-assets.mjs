import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const core=path.dirname(createRequire(require.resolve('tesseract.js')).resolve('tesseract.js-core/package.json'));
fs.mkdirSync('public/posting-assets/core',{recursive:true});
fs.copyFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','public/posting-assets/pdf.worker.min.mjs');
fs.copyFileSync('node_modules/tesseract.js/dist/worker.min.js','public/posting-assets/worker.min.js');
for(const name of fs.readdirSync(core))if(/\.wasm(\.js)?$/.test(name))fs.copyFileSync(path.join(core,name),'public/posting-assets/core/'+name);
