import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'});
const report=[];
try{
 for(const lang of ['en','ar'])for(const reduced of [false,true]){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:reduced?'reduce':'no-preference'});
  const page=await context.newPage();const errors=[],failed=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
  await page.goto('http://127.0.0.1:4173/'+(lang==='ar'?'ar/':''));await page.evaluate(()=>document.fonts.ready);
  await page.locator('.hero').evaluate(el=>Promise.allSettled(el.getAnimations({subtree:true}).map(animation=>animation.finished)));
  assert.equal(await page.locator('main>section').count(),7);
  if(lang==='ar'){
   assert(await page.evaluate(()=>document.fonts.check('600 20px Arabic','اترك بصمتك')));
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
  }
  for(const i of [1,2,0]){
   const pick=page.locator(`[data-preview="${i}"]`);await pick.click();
   await page.waitForFunction(()=>!document.querySelector('.hero-preview').disabled);
   assert.equal(await pick.getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.hero-preview').getAttribute('data-open'),'project-'+i);
   await page.locator('.hero-preview').click();assert(await page.locator('#project-'+i).evaluate(el=>el.open));
   await page.keyboard.press('Escape');assert(!(await page.locator('#project-'+i).evaluate(el=>el.open)));
  }
  const services=page.locator('.service');
  for(const i of [1,2,0]){
   const service=services.nth(i);if(await service.evaluate(el=>el.open))await service.locator('summary').click();
   await service.evaluate(el=>Promise.allSettled(el.getAnimations({subtree:true}).map(animation=>animation.finished)));
   await service.locator('summary').focus();await page.keyboard.press('Enter');
   await service.evaluate(el=>Promise.allSettled(el.getAnimations({subtree:true}).map(animation=>animation.finished)));
   assert(await service.evaluate(el=>el.open));assert(await service.locator('.service-visual').isVisible());
   if(!reduced)await service.screenshot({path:`qa/motion-${lang}-service-${i}.png`});
   await service.locator('summary').click();
   await service.evaluate(el=>Promise.allSettled(el.getAnimations({subtree:true}).map(animation=>animation.finished)));
   assert(!(await service.evaluate(el=>el.open)));
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.hero-mark path').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.locator('#main').scrollIntoViewIfNeeded();
  await page.locator('.hero').screenshot({path:`qa/motion-${lang}-${reduced?'reduced':'normal'}.png`});
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  report.push({lang,reducedMotion:reduced,previewRouting:'passed',keyboardAccordion:'passed',fontLoaded:true,errors,failed});
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:360,height:900},reducedMotion:'reduce'});const page=await context.newPage();
 for(const lang of ['en','ar']){
  await page.goto('http://127.0.0.1:4173/'+(lang==='ar'?'ar/':''));await page.evaluate(()=>document.fonts.ready);
  assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)));
  for(const selector of ['h1','.hero-preview','.preview-controls']){
   const box=await page.locator(selector).boundingBox();assert(box.x>=-1&&box.x+box.width<=361,`${lang} ${selector} is clipped`);
  }
 }
 await context.close();
 await fs.writeFile('qa/motion-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
