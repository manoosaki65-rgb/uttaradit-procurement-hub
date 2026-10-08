import fs from 'node:fs';
fs.mkdirSync('public/posting-assets/core',{recursive:true});
fs.copyFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs','public/posting-assets/pdf.worker.min.mjs');
fs.copyFileSync('node_modules/tesseract.js/dist/worker.min.js','public/posting-assets/worker.min.js');
for(const name of fs.readdirSync('node_modules/tesseract.js-core'))if(/\.wasm(\.js)?$/.test(name))fs.copyFileSync('node_modules/tesseract.js-core/'+name,'public/posting-assets/core/'+name);
