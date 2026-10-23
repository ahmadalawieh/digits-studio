import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.QA_ORIGIN||'http://127.0.0.1:4173';
const context=await browser.newContext();
await fs.mkdir('qa/concepts',{recursive:true});const report=[];let failed=false;
const assert=(condition,message)=>{if(!condition)throw Error(message);};
for(const slug of ['fornaya','riwa-grove']){
 for(const width of [360,768,1440])for(const ar of [false,true]){
  const page=await context.newPage(),errors=[],missing=[];
  await page.setViewportSize({width,height:900});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
  const route='/demos/'+slug+'/'+(ar?'?lang=ar':'');await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);
  await page.locator('.demo-hero-photo>img').evaluate(img=>img.decode());
  assert(await page.locator('html').getAttribute('lang')===(ar?'ar':'en'),'Demo language');
  const all=await page.locator('.product-card:visible').count();assert(all===(slug==='fornaya'?4:3),'Initial products');
  await page.locator('[data-filter]').nth(1).click();assert(await page.locator('.product-card:visible').count()===2,'Category filter');await page.locator('[data-filter="all"]').click();
  await page.locator('[data-detail]').first().click();assert(await page.locator('#product-dialog').evaluate(d=>d.open),'Product details');
  await page.locator('#product-dialog .action').click();assert(await page.locator('.basket-count').textContent()==='1','Product add');
  await page.locator('[data-add]').nth(1).click();await page.locator('.basket-open').click();
  const expected=slug==='fornaya'?'$8.00':'$68.00';assert(await page.locator('#basket-total').textContent()===expected,'Basket total');
  await page.locator('.quantity').first().locator('button').last().click();
  assert(await page.locator('#basket-total').textContent()===(slug==='fornaya'?'$12.50':'$92.00'),'Quantity total');
  await page.locator('#review-order').click();assert(await page.locator('#order-review').isVisible(),'Review disclosure');
  await page.keyboard.press('Escape');await page.locator('.demo-language').click();await page.locator('.basket-open').click();
  assert(await page.locator('.basket-row').count()===2,'Language preserves basket');
  await page.locator('.remove-item').first().click();await page.locator('.remove-item').first().click();assert(await page.locator('#review-order').isDisabled(),'Empty basket');
  await page.keyboard.press('Escape');await page.locator('.demo-language').click();
  const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  await page.screenshot({path:`qa/concepts/${slug}-${width}-${ar?'ar':'en'}.png`,fullPage:true});
  report.push({route,width,errors,missing,overflow,violations});if(errors.length||missing.length||overflow||violations.length)failed=true;
  if(width===1440&&!ar&&base.includes('127.0.0.1')){await page.screenshot({path:`qa/concepts/${slug}-desktop.png`});await sharp(`qa/concepts/${slug}-desktop.png`).webp({quality:88}).toFile(`dist/assets/concepts/${slug}/website-desktop.webp`);}
  if(width===360&&ar&&base.includes('127.0.0.1')){await page.screenshot({path:`qa/concepts/${slug}-mobile.png`});await sharp(`qa/concepts/${slug}-mobile.png`).webp({quality:88}).toFile(`dist/assets/concepts/${slug}/website-mobile.webp`);}
  await page.close();
 }
}
for(const slug of ['fornaya','riwa-grove'])for(const width of [360,768,1440])for(const prefix of ['', '/ar']){
 const page=await context.newPage(),route=prefix+'/projects/'+slug+'/',errors=[],missing=[];
 await page.setViewportSize({width,height:900});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});await page.goto(base+route);await page.evaluate(()=>document.fonts.ready);await page.locator('.case-hero-image').evaluate(img=>img.decode());
 await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));});
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);report.push({route,width,errors,missing,overflow,violations});if(errors.length||missing.length||overflow||violations.length)failed=true;
 await page.screenshot({path:`qa/concepts/${slug}-case-${width}-${prefix?'ar':'en'}.png`,fullPage:true});await page.close();
}
for(const slug of ['fornaya','riwa-grove'])for(const file of ['brand-guide.html','welcome-email.html']){
 const page=await context.newPage();await page.setViewportSize({width:360,height:900});await page.goto(base+'/concepts/'+slug+'/'+file);const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);report.push({route:'/concepts/'+slug+'/'+file,width:360,overflow,violations});if(overflow||violations.length)failed=true;await page.close();
}
await browser.close();await fs.writeFile('qa/concepts-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({pages:report.length,failed,issues:report.filter(r=>r.overflow||r.errors?.length||r.missing?.length||r.violations.length)},null,2));if(failed)process.exitCode=1;
