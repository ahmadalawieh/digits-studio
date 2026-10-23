import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const browser=await chromium.launch({channel:'chrome',headless:true}),origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173',reports=[];
await fs.mkdir('qa/projects',{recursive:true});let failed=false;
function assert(ok,message){if(!ok)throw Error(message);}
// Capture actual new websites before the portfolio's website filter loads them.
if(!process.env.QA_ORIGIN)for(const slug of ['dar-saha','paceform'])for(const width of [360,1440]){
 const c=await browser.newContext({viewport:{width,height:900}}),p=await c.newPage();await p.goto(origin+'/demos/'+slug+'/'+(width===360?'?lang=ar':''));await p.evaluate(()=>document.fonts.ready);await p.locator('main img').first().evaluate(img=>img.decode());const file=`qa/projects/${slug}-${width}.png`;await p.screenshot({path:file});await sharp(file).webp({quality:87}).toFile(`dist/assets/concepts/${slug}/website-${width===1440?'desktop':'mobile'}.webp`);await c.close();
}
for(const width of [360,768,1440])for(const ar of [false,true]){
 const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
 await page.goto(origin+(ar?'/ar/':'/'));await page.evaluate(()=>document.fonts.ready);
 assert(await page.locator('[data-project-card]').count()===7,'Seven unified projects');
 assert(await page.locator('.concept-intro').count()===0,'No separate concepts collection');
 for(const [key,count,anchor] of [['branding',4,'identity'],['website',7,'website'],['marketing',4,'campaign'],['all',7,'']]){
  await page.locator(`[data-project-filter="${key}"]`).click();assert(await page.locator('[data-project-card]:visible').count()===count,'Filter count: '+key);
  assert(await page.locator(`[data-project-filter="${key}"]`).getAttribute('aria-pressed')==='true','Pressed filter');
  for(const card of await page.locator('.concept-work-card').all()){
   const href=await card.locator('.project-route').getAttribute('href');assert(anchor?href.endsWith('#'+anchor):!href.includes('#'),'Scoped project destination');
   const image=card.locator('[data-project-image]');await image.evaluate(img=>img.decode());assert(await image.evaluate(img=>img.naturalWidth>0),'Preview loaded');
  }
 }
 for(const [i,count,anchor] of [[0,4,'identity'],[1,7,'website'],[2,4,'campaign']]){
  const service=page.locator('.service').nth(i);if(!await service.evaluate(s=>s.open)){await service.locator('summary').click();await service.evaluate(s=>Promise.allSettled(s.getAnimations({subtree:true}).map(a=>a.finished)));}
  assert(await service.locator('.service-project-grid article').count()===count,'Service examples count');
  for(const href of await service.locator('.service-project-image[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href'))))assert(href.endsWith('#'+anchor),'Service anchor');
 }
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 if(violations.length||overflow||errors.length||missing.length)failed=true;reports.push({route:ar?'/ar/':'/',width,violations,overflow,errors,missing});
 await page.locator('#work').screenshot({path:`qa/projects/projects-${width}-${ar?'ar':'en'}.png`});await context.close();
}
for(const slug of ['dar-saha','paceform'])for(const width of [360,768,1440])for(const ar of [false,true]){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
 const route='/demos/'+slug+'/'+(ar?'?lang=ar':'');await page.goto(origin+route);await page.evaluate(()=>document.fonts.ready);await page.locator('main img').first().evaluate(img=>img.decode());
 if(slug==='dar-saha'){
  await page.locator('.room-detail').first().click();assert(await page.locator('#experience-dialog').evaluate(d=>d.open),'Room details');await page.keyboard.press('Escape');
  await page.locator('.room-select').nth(1).click();assert(await page.locator('[name="room"]').inputValue()==='terrace','Choose room');
  const future=new Date();future.setDate(future.getDate()+7);await page.locator('[name="arrival"]').fill(future.toISOString().slice(0,10));await page.locator('[name="nights"]').selectOption('3');await page.locator('#stay-form button[type="submit"]').click();assert((await page.locator('#stay-result').textContent()).includes('$585.00'),'Room estimate');
  await page.locator('.experience-language').click();assert((await page.locator('#stay-result').textContent()).includes('$585.00'),'Language preserves estimate');
  await page.locator('[name="nights"]').selectOption('2');assert(await page.locator('#stay-result').isHidden(),'Changed inputs invalidate estimate');
  await page.locator('[name="arrival"]').fill('2020-01-01');await page.locator('#stay-form button[type="submit"]').click();assert(await page.locator('#stay-result').isHidden(),'Past date rejected');
 }else{
  for(const [key,count] of [['strength',2],['mobility',2],['reformer',1],['all',5]]){await page.locator(`[data-class-filter="${key}"]`).click();assert(await page.locator('.session-row:visible').count()===count,'Movement filter');}
  await page.locator('.session-detail').first().click();assert(await page.locator('#experience-dialog').evaluate(d=>d.open),'Class details');await page.locator('#experience-dialog-content button').click();assert(await page.locator('#session-result').isVisible(),'Session selected');
  await page.locator('.experience-language').click();assert(await page.locator('#session-result').isVisible(),'Language preserves selection');await page.locator('#clear-session').click();assert(await page.locator('#session-result').isHidden(),'Clear selection');
 }
 await page.locator('.experience-language').click();assert(await page.locator('html').getAttribute('lang')===(ar?'ar':'en'),'Restored language');
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
 if(violations.length||overflow||errors.length||missing.length)failed=true;reports.push({route,width,violations,overflow,errors,missing});await page.screenshot({path:`qa/projects/${slug}-${width}-${ar?'ar':'en'}-full.png`,fullPage:true});await context.close();
}
await browser.close();await fs.writeFile('qa/projects-report.json',JSON.stringify(reports,null,2));console.log(JSON.stringify({checks:reports.length,failed,issues:reports.filter(r=>r.violations.length||r.overflow||r.errors.length||r.missing.length)},null,2));if(failed)process.exitCode=1;
