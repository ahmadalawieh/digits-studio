import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright'),AxeBuilder=require('@axe-core/playwright').default;
const root=path.dirname(fileURLToPath(import.meta.url)),dist=path.join(root,'dist'),qa=path.join(root,'qa');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});const report=[];
for(const route of ['brand-kit.html','social-editor.html','privacy.html'])for(const width of [360,1440]){
 const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/'+route);await page.evaluate(()=>document.fonts.ready);
 if(route==='social-editor.html'){
   await page.waitForFunction(()=>{const c=document.getElementById('preview');return c?.getContext('2d').getImageData(0,0,1,1).data[3]===255;});
   await page.locator('#headline').fill('A clear brand. A website that works.');
   const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;await download.saveAs(path.join(qa,`editor-download-${width}.png`));
   await page.locator('#post-language').selectOption('ar');await page.locator('#headline').fill('اترك بصمتك.');await page.locator('#support').fill('الهوية والمواقع والتسويق');
   await page.locator('#preview').screenshot({path:path.join(qa,`editor-ar-${width}.png`)});
 }
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 await page.screenshot({path:path.join(qa,`${route}-${width}.png`),fullPage:true});report.push({route,width,errors,overflow,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});await context.close();
}
// Verify all local links, including same-page anchor targets, exist in the generated distribution.
const pages=['index.html','ar/index.html','brand-kit.html','social-editor.html','privacy.html',...['fornaya','riwa-grove'].flatMap(slug=>['projects/'+slug+'/index.html','ar/projects/'+slug+'/index.html','demos/'+slug+'/index.html','concepts/'+slug+'/brand-guide.html','concepts/'+slug+'/welcome-email.html'])];const missing=[];
for(const file of pages){const source=await fs.readFile(path.join(dist,file),'utf8');for(const m of source.matchAll(/(?:href|src)="([^"]+)"/g)){const url=m[1];if(/^(https?:|mailto:|tel:|data:)/.test(url))continue;const parsed=new URL(url,'https://digitsstudio.online/'+file),anchor=decodeURIComponent(parsed.hash.slice(1)),relative=decodeURIComponent(parsed.pathname);let target=path.resolve(dist,'.'+relative);let stat;try{stat=await fs.stat(target);}catch{missing.push({file,url});continue;}if(stat.isDirectory())target=path.join(target,'index.html');if(anchor){const doc=await fs.readFile(target,'utf8');if(!doc.includes(`id="${anchor}"`))missing.push({file,url,reason:'missing anchor'});}}}
const assets=await fs.readdir(path.join(dist,'brand'));const result={pages:report,missingLinks:missing,brandAssets:assets.length};await fs.writeFile(path.join(qa,'extras-report.json'),JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify(result,null,2));

if(missing.length||report.some(p=>p.overflow||p.errors.length||p.violations.length))process.exitCode=1;
