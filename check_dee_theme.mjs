import {chromium} from 'playwright';import AxeBuilder from '@axe-core/playwright';import sharp from 'sharp';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true}),report=[];
try{
 for(const width of [390,768,1440])for(const ar of[false,true]){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'no-preference'}),page=await context.newPage();await page.goto('http://127.0.0.1:4173/'+(ar?'ar/':''));
  for(const index of[1,2]){
   await page.locator('.chapter-navigation button').nth(index).click();await page.waitForFunction(i=>document.querySelector('.dee-journey').dataset.scene===String(i)&&Number(getComputedStyle(document.querySelector(`.chapter-${i}`)).opacity)>.999,index);await page.waitForTimeout(180);
   const sample=await page.screenshot({clip:{x:3,y:330,width:2,height:2}}),stats=await sharp(sample).removeAlpha().stats();assert(stats.channels.every(c=>c.mean>245),`Paper scene is covered at ${width}/${ar}/${index}: ${JSON.stringify(stats.channels.map(c=>c.mean))}`);
   const contrast=(await new AxeBuilder({page}).include('.dee-journey').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;assert.deepEqual(contrast.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
   await page.screenshot({path:`qa/dee-production/theme-${width}-${ar?'ar':'en'}-${index}.jpg`,type:'jpeg',quality:87});report.push({width,language:ar?'ar':'en',scene:index,paperPixels:true,axeViolations:0});
  }
  await context.close();
 }
 console.log(JSON.stringify({passed:true,checks:report.length}));
}finally{await browser.close();await fs.writeFile('qa/dee-production/theme-report.json',JSON.stringify(report,null,2));}
