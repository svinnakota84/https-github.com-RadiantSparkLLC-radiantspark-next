import {readFile,readdir,rm} from 'node:fs/promises';
// Never publish stale downloadable builds, archived HTML or internal SQL assets.
await rm('dist/assets/aistudio',{recursive:true,force:true});
for(const f of await readdir('dist')) if(/\.(zip|sql)$/.test(f)) await rm('dist/'+f);
const html=await readFile('dist/index.html','utf8');
if(/src=.[/]src[/]/.test(html)||!html.includes('./assets/')) throw Error('Invalid static entrypoint');
for(const path of ['sparkdeals.html','business-readiness.html','app.html','portal.html']) await readFile('dist/'+path);
console.log('Static entrypoints verified; archived builds excluded.');
