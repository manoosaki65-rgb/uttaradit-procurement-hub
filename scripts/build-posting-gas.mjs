import fs from 'node:fs';
fs.mkdirSync('google-apps-script',{recursive:true});
fs.writeFileSync('google-apps-script/Posting.gs',fs.readFileSync('node_modules/xlsx/dist/xlsx.full.min.js','utf8')+'\n'+fs.readFileSync('lib/posting-core.js','utf8').replace(/export /g,'')+'\n'+fs.readFileSync('google-apps-script/Service.js','utf8'));
