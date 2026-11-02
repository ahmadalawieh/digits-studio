import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173',report=[];await fs.mkdir('qa/full-studio/verified',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function readyDetail(page,index,open=true){await page.waitForFunction(({index,open})=>{const element=document.querySelectorAll('#services details')[index];return element.open===open&&(!element.style.height||element.style.height==='auto');},{index,open});}
async function rect(page,selector){return page.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,right:r.right,bottom:r.bottom};});}
try{
 for(const [width,height] of [[320,700],[390,844],[768,1000],[1440,1000]])for(const ar of[false,true])for(const reduced of[false,true]){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<=750,hasTouch:width<=750,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors=[],missing=[],posts=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
  await page.route('**/api/inquiry',route=>route.request().method()==='GET'?route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({available:true})}):(posts.push(route.request().postDataJSON()),route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({sent:true,reference:'interface-test'})})));
  await page.goto(origin+(ar?'/ar/':'/')+'#work');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>document.querySelector('.service-reel-viewport')?.classList.contains('is-draggable'));
  assert.equal(await page.locator('[data-studio-section]').count(),7);assert.equal(await page.locator('h1').count(),1);
  for(const [key,count]of[['branding',4],['website',7],['marketing',4],['all',7]]){
   await page.locator(`[data-project-filter="${key}"]`).click();await page.waitForTimeout(reduced?50:450);assert.equal(await page.locator('[data-project-card]:visible').count(),count);
   if(['branding','marketing'].includes(key)){const suffix=key==='branding'?'#identity':'#campaign';assert((await page.locator('[data-project-card]:visible .project-route').first().getAttribute('href')).endsWith(suffix));}
  }
  if(width===1440){const a=await rect(page,'#work .work-card:nth-child(1)'),b=await rect(page,'#work .work-card:nth-child(2)'),c=await rect(page,'#work .work-card:nth-child(3)');assert(a.w>b.w&&b.w>c.w,'Portfolio did not change to unequal editorial sizes');assert(Math.abs(b.y-c.y)<180,'Paired project composition lost');}
  for(const [selector,expected]of[['#services','rgb(6, 7, 11)'],['#studio','rgb(255, 218, 70)'],['.process','rgb(253, 253, 253)'],['#contact','rgb(255, 218, 70)']])assert.equal(await page.locator(selector).evaluate(e=>getComputedStyle(e).backgroundColor),expected);
  await page.locator('#services details').nth(1).locator('summary').click();await readyDetail(page,1);
  const viewport=page.locator('.service-reel-viewport').nth(1),controls=page.locator('.service-reel-controls').nth(1),track=viewport.locator('.service-project-grid');
  await controls.locator('[data-reel-direction=next]').click();await page.waitForTimeout(reduced?60:650);
  const shift=await track.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m41);assert(ar?shift>60:shift< -60,'Reel button failed to move with the language');
  await viewport.scrollIntoViewIfNeeded();const box=await viewport.boundingBox();const start=box.x+box.width*(ar?.3:.7),y=Math.max(130,box.y+Math.min(130,box.height*.4));
  await page.mouse.move(start,y);await page.mouse.down();await page.mouse.move(start+(ar?110:-110),y,{steps:10});await page.mouse.up();await page.waitForTimeout(reduced?100:650);
  const dragged=await track.evaluate(e=>new DOMMatrixReadOnly(getComputedStyle(e).transform).m41);assert(Math.abs(dragged-shift)>35,'Pointer drag failed');assert(new URL(page.url()).pathname===(ar?'/ar/':'/'),'Dragging accidentally followed a project link');
  await viewport.locator('article').last().locator('a').first().focus();await page.waitForTimeout(reduced?80:650);const last=await viewport.locator('article').last().boundingBox(),bounds=await viewport.boundingBox();assert(last.x>=bounds.x-4&&last.x+last.width<=bounds.x+bounds.width+4,'Keyboard focus left the reel item clipped');
  await page.locator('#services details').nth(1).locator('summary').click();await readyDetail(page,1,false);
  const faq=page.locator('.questions details').first();await faq.locator('summary').click();await page.waitForFunction(()=>document.querySelector('.faq').open&&(!document.querySelector('.faq').style.height||document.querySelector('.faq').style.height==='auto'));assert.equal(await faq.locator('p').isVisible(),true);await faq.locator('summary').press('Enter');await page.waitForFunction(()=>!document.querySelector('.faq').open&&(!document.querySelector('.faq').style.height||document.querySelector('.faq').style.height==='auto'));
  assert.equal(await page.locator('#studio img').count(),0);assert.equal(await page.locator('.studio-sigil svg').count(),1);assert.equal(await page.locator('.process .steps li').count(),3);
  await page.locator('#inquiry-form input[name=name]').fill('Full page review');await page.locator('#inquiry-form input[name=email]').fill('qa@example.com');await page.locator('#inquiry-form textarea[name=message]').fill('Branding and a bilingual website.');await page.locator('#inquiry-form input[value=Branding]').check({force:true});await page.locator('#inquiry-form select[name=budget]').selectOption('$1,000–$3,000');await page.locator('#inquiry-form select[name=timing]').selectOption('1–3 months');await page.locator('#inquiry-form button[type=submit]').click();assert((await page.locator('#inquiry-preview').innerText()).includes('$1,000–$3,000'));assert((await page.locator('#inquiry-whatsapp').getAttribute('href')).startsWith('https://wa.me/96170332361?text='));assert.equal(posts.length,0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if([390,1440].includes(width)&&reduced){
   const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
   for(const selector of['#work','#services','#studio','.process','#dee-lab','.questions','#contact','.footer']){await page.locator(selector).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-100,behavior:'instant'}));await page.waitForTimeout(120);await page.screenshot({path:`qa/full-studio/verified/${width}-${ar?'ar':'en'}-${selector.replace(/[#.]/g,'')}.jpg`,type:'jpeg',quality:87});}
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);report.push({width,height,language:ar?'ar':'en',reduced,passed:true});console.log(`Passed ${width} ${ar?'AR':'EN'} ${reduced?'reduced':'motion'}`);await context.close();
 }
 for(const ar of[false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false}),page=await context.newPage();await page.goto(origin+(ar?'/ar/':'/')+'#services');assert.equal(await page.locator('#services details').first().getAttribute('open'),'');await page.locator('#services details').nth(2).locator('summary').click();assert.equal(await page.locator('#services details').nth(2).getAttribute('open'),'');assert.equal(await page.locator('[data-project-card]').count(),7);assert.equal(await page.locator('#inquiry-form').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);report.push({language:ar?'ar':'en',noJavaScript:true,passed:true});await context.close();
 }
 console.log(JSON.stringify({origin,checks:report.length,passed:true,noEmailSent:true}));
}finally{await browser.close();await fs.writeFile('qa/full-studio/report.json',JSON.stringify(report,null,2));}
