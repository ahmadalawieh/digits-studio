import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173',report=[];
await fs.mkdir('qa/dee',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
async function settledPill(page){
  await page.waitForFunction(()=>{
    const active=document.querySelector('.dee-tabs [aria-selected=true]'),pill=active?.querySelector('.dee-tab-active');
    if(!pill)return false;const a=active.getBoundingClientRect(),b=pill.getBoundingClientRect();
    return Math.abs(a.left-b.left)<1&&Math.abs(a.top-b.top)<1&&Math.abs(a.width-b.width)<1;
  });
}
try{
 for(const width of [320,360,768,1440])for(const ar of [false,true])for(const reduced of [false,true]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
  await page.goto(origin+(ar?'/ar/':''));await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(state=>document.querySelector('.hero').dataset.motionState===state,reduced?'reduced':'ready');
  await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.hero-dee')).opacity)>.99);
  assert.equal(await page.locator('.impact-cta').getAttribute('href'),'#contact');
  assert.equal(await page.locator('.hero-dee img').getAttribute('alt'),'');
  assert.equal(await page.locator('.feedback-preview').count(),0);
  await page.screenshot({path:`qa/dee/hero-${width}-${ar?'ar':'en'}-${reduced?'reduced':'motion'}.jpg`,type:'jpeg',quality:86});
  const lab=page.locator('#dee-lab'),tabs=lab.getByRole('tab');await lab.scrollIntoViewIfNeeded();
  if(width<751)await page.waitForFunction(()=>document.querySelector('.mobile-contact-dock').getAttribute('aria-hidden')==='true');
  await page.locator('.dee-character').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  await page.waitForFunction(()=>document.querySelector('#dee-lab').dataset.deeStep==='0');
  assert.equal(await tabs.count(),3);assert.equal(await lab.locator('.dee-example-vague').count(),3);
  assert.match(await lab.locator('.dee-lab-footer>p').innerText(),ar?/خيالية/:/Fictional/);
  await lab.locator('.dee-next').click();assert.equal(await lab.getAttribute('data-dee-step'),'1');
  assert.equal(await tabs.nth(1).evaluate(element=>element===document.activeElement),true);
  assert.match(await lab.locator('.dee-preview-copy h3').innerText(),ar?/بيروت/:/Beirut/);
  assert.equal(await lab.locator('.dee-example-vague').count(),3);
  await lab.locator('.dee-next').click();assert.equal(await lab.getAttribute('data-dee-step'),'2');
  assert.equal(await lab.locator('.dee-example-primary').count(),1);assert.equal(await lab.locator('.dee-example-vague').count(),0);
  assert.equal(await lab.locator('.dee-example-primary a,.dee-example-primary button').count(),0);
  await settledPill(page);
  await tabs.nth(2).press('Home');assert.equal(await lab.getAttribute('data-dee-step'),'0');
  await tabs.nth(0).press('ArrowRight');assert.equal(await lab.getAttribute('data-dee-step'),ar?'2':'1');
  await page.locator('.dee-tabs [aria-selected=true]').press('End');assert.equal(await lab.getAttribute('data-dee-step'),'2');
  await tabs.nth(0).click();await tabs.nth(2).click();await tabs.nth(1).click();await tabs.nth(2).click();await settledPill(page);
  if(!reduced){
   await tabs.nth(1).click();await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForFunction(()=>document.querySelector('.hero').dataset.motionState==='reduced');
   await tabs.nth(2).click();await settledPill(page);
   assert.equal(await page.locator('.hero-dee').evaluate(element=>getComputedStyle(element).transform),'none');
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(reduced&&[360,1440].includes(width)){
   const violations=(await new AxeBuilder({page}).include('#dee-lab').include('.hero-primary-action').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
   assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
   await lab.screenshot({path:`qa/dee/final-${width}-${ar?'ar':'en'}.jpg`,type:'jpeg',quality:87});
  }
  await page.locator('#inquiry-form input[value=Branding]').check({force:true});
  await lab.locator('.dee-contact').click();
  assert.equal(await page.locator('#inquiry-form input[value=Website]').isChecked(),true);
  assert.equal(await page.locator('#inquiry-form input[value=Branding]').isChecked(),true);
  assert.equal(new URL(page.url()).hash,'#contact');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  report.push({width,language:ar?'ar':'en',reduced,passed:true});await context.close();
 }
 for(const blockedBundle of [false,true])for(const ar of [false,true]){
  const context=await browser.newContext({viewport:{width:360,height:1000},javaScriptEnabled:blockedBundle,reducedMotion:'reduce'}),page=await context.newPage();
  if(blockedBundle)await page.route('**/assets/editorial-motion.js',route=>route.abort());
  await page.goto(origin+(ar?'/ar/':''));const lab=page.locator('#dee-lab');await lab.scrollIntoViewIfNeeded();
  assert.equal(await lab.getAttribute('data-dee-step'),'2');assert.equal(await lab.locator('.dee-example-primary').count(),1);
  assert.equal(await lab.getByRole('tab').nth(0).isDisabled(),true);assert.equal(await lab.locator('.dee-contact').getAttribute('href'),'#contact');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  report.push({fallback:blockedBundle?'unavailable-bundle':'no-javascript',language:ar?'ar':'en',passed:true});await context.close();
 }
 console.log(JSON.stringify({origin,checks:report.length,passed:true,noMessageSent:true},null,2));
}finally{await browser.close();await fs.writeFile('qa/dee/report.json',JSON.stringify(report,null,2));}
