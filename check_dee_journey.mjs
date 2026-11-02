import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173',directory='qa/dee-production',report=[];
await fs.mkdir(directory,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
async function settle(page,index){
 await page.waitForFunction(i=>{
  const root=document.querySelector('.dee-journey'),chapter=root.querySelector(`.chapter-${i}`),canvas=root.querySelector('canvas');
  return root.dataset.scene===String(i)&&Number(getComputedStyle(chapter).opacity)>.999&&Number(canvas?.dataset.aimAlignment)>.94;
 },index,{timeout:18000});await page.waitForTimeout(150);
}
async function filter(page,key,count){
 await page.locator(`[data-project-filter="${key}"]`).click();
 await page.waitForFunction(key=>{const b=document.querySelector(`[data-project-filter="${key}"]`),p=b.querySelector('[data-filter-background]');if(!p)return false;const x=b.getBoundingClientRect(),y=p.getBoundingClientRect();return Math.abs(x.left-y.left)<1&&Math.abs(x.width-y.width)<1;},key);
 assert.equal(await page.locator('[data-project-card]:visible').count(),count);
}
try{
 for(const [width,height] of [[320,568],[375,667],[390,844],[667,375],[768,950],[1440,950]])for(const ar of [false,true]){
  const portrait=width<=750&&!(width>height&&height<=500),context=await browser.newContext({viewport:{width,height},isMobile:width<751,hasTouch:width<751,reducedMotion:'no-preference'}),page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400&&!r.url().includes('/_vercel/'))missing.push(r.url());});
  await page.addInitScript(()=>{window.layoutShifts=[];new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.layoutShifts.push(entry.value);}).observe({type:'layout-shift',buffered:true});});
  await page.goto(origin+(ar?'/ar/':'/'));await page.evaluate(()=>document.fonts.ready);await settle(page,0);
  assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.header .language').getAttribute('href'),ar?'../':'ar/');
  const canvasTop=[];
  for(let index=0;index<4;index++){
   if(index){await page.locator('.chapter-navigation button').nth(index).click();await settle(page,index);}
   const geometry=await page.evaluate(i=>{
    const hero=document.querySelector('.dee-journey'),chapter=hero.querySelector(`.chapter-${i}`),canvas=hero.querySelector('.three-layer'),rect=chapter.getBoundingClientRect(),c=canvas.getBoundingClientRect(),nav=hero.querySelector('.chapter-navigation').getBoundingClientRect(),header=document.querySelector('.header').getBoundingClientRect();
    const range=document.createRange();range.selectNodeContents(chapter.querySelector('.journey-heading'));const title=range.getBoundingClientRect();
    return {horizontal:canvas.querySelector('canvas').dataset.pointingX,gesture:canvas.querySelector('canvas').dataset.gesture,canvasTop:c.top,canvasBottom:c.bottom,copyTop:rect.top,copyBottom:rect.bottom,navTop:nav.top,headerBottom:header.bottom,titleLeft:title.left,titleRight:title.right,overflow:document.documentElement.scrollWidth>innerWidth};
   },index);
   assert.equal(portrait?geometry.gesture:geometry.horizontal,portrait?'up':index%2?'right':'left',`Wrong gesture ${width}/${ar}/${index}`);
   assert.equal(geometry.overflow,false);assert(geometry.titleLeft>=12&&geometry.titleRight<=width-12,`Clipped title ${JSON.stringify(geometry)}`);
   if(index===1||index===2){const pixel=await page.screenshot({clip:{x:3,y:Math.round(height*.35),width:2,height:2}}),stats=await sharp(pixel).removeAlpha().stats();assert(stats.channels.every(channel=>channel.mean>245),'Paper story scene obscured by an overlay');}
   assert(geometry.copyTop>geometry.headerBottom+4,`Copy behind header ${width}/${ar}/${index}: ${JSON.stringify(geometry)}`);
   if(portrait){assert(geometry.canvasTop>=geometry.copyBottom+12);assert(geometry.navTop>=geometry.canvasBottom+5);canvasTop.push(geometry.canvasTop);}
   if([390,768,1440].includes(width))await page.screenshot({path:`${directory}/final-${width}-${ar?'ar':'en'}-${index}.jpg`,type:'jpeg',quality:87});
  }
  if(portrait)assert(Math.max(...canvasTop)-Math.min(...canvasTop)<2,'Camera jumps between chapters');
  if(width===390&&!ar){
   const before=await page.locator('canvas').screenshot();await page.waitForTimeout(700);const after=await page.locator('canvas').screenshot();
   const a=await sharp(before).ensureAlpha().raw().toBuffer(),b=await sharp(after).ensureAlpha().raw().toBuffer();let changed=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>18)changed++;
   assert(changed>100,'Idle remains frozen');report.push({idleChangedPixels:changed});
   await page.locator('.dee-pause').click();assert.equal(await page.locator('.dee-pause').getAttribute('aria-pressed'),'true');await page.locator('.chapter-navigation button').nth(2).click();await settle(page,2);await page.locator('.dee-pause').click();
   await page.setViewportSize({width:844,height:390});await page.waitForTimeout(150);await page.locator('.chapter-navigation button').nth(2).click();await settle(page,2);assert.equal(await page.locator('canvas').count(),1);await page.setViewportSize({width,height});await page.waitForTimeout(150);await page.locator('.chapter-navigation button').nth(2).click();await settle(page,2);
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('.dee-journey').dataset.motionState==='reduced');assert.equal(await page.locator('canvas').count(),0);
   await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.chapter-navigation button').nth(2).click();await settle(page,2);assert.equal(await page.locator('canvas').count(),1);
  }
  await page.locator('.stage-bottom a[href="#work"]').click();await page.waitForFunction(()=>{const element=document.querySelector('#work'),work=element.getBoundingClientRect(),header=document.querySelector('.header').getBoundingClientRect(),offset=parseFloat(getComputedStyle(element).scrollMarginTop)+parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);return location.hash==='#work'&&work.top>=header.bottom+4&&Math.abs(work.top-offset)<5;});
  if([390,1440].includes(width)){
   for(const [key,count] of [['branding',4],['website',7],['marketing',4],['all',7]])await filter(page,key,count);
   await filter(page,'branding',4);assert((await page.locator('[data-project-card]:visible .project-route').first().getAttribute('href')).endsWith('#identity'));await filter(page,'all',7);
   if(width===390){await page.locator('.menu-button').click();assert.equal(await page.locator('#mobile-menu').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#mobile-menu').isHidden(),true);}
   await page.locator('#inquiry-form input[name=name]').fill('Website QA');await page.locator('#inquiry-form input[name=email]').fill('qa@example.com');await page.locator('#inquiry-form textarea[name=message]').fill('A bilingual branding and website project.');await page.locator('#inquiry-form button[type=submit]').click();
   assert((await page.locator('#inquiry-whatsapp').getAttribute('href')).startsWith('https://wa.me/96170332361?text='));
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  const cls=await page.evaluate(()=>window.layoutShifts.reduce((a,b)=>a+b,0));
  report.push({width,height,language:ar?'ar':'en',scenes:4,cls,passed:true});console.log(`Passed ${width}×${height} ${ar?'AR':'EN'}`);await context.close();
 }
 for(const reduced of [false,true])for(const ar of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:reduced?'reduce':'no-preference',javaScriptEnabled:reduced}),page=await context.newPage(),requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto(origin+(ar?'/ar/':'/'));await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.chapter').count(),4);assert.equal(await page.locator('canvas').count(),0);assert(!requests.some(url=>url.endsWith('/assets/dee-scene.js')));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(reduced){const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;assert.deepEqual(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);}
  await page.locator('.impact-cta').click();await page.waitForFunction(()=>location.hash==='#contact');report.push({fallback:reduced?'reduced-motion':'no-javascript',language:ar?'ar':'en',passed:true});await context.close();
 }
 for(const failure of ['ui-bundle','renderer','webgl']){
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  if(failure==='ui-bundle')await page.route('**/assets/editorial-motion.js',route=>route.abort());
  if(failure==='renderer')await page.route('**/assets/dee-scene.js',route=>route.abort());
  if(failure==='webgl')await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(String(type).startsWith('webgl'))return null;return original.call(this,type,...args);};});
  await page.goto(origin);if(failure!=='ui-bundle')await page.waitForFunction(()=>document.querySelector('.dee-journey').dataset.renderMode==='fallback');
  assert.equal(await page.locator('.chapter[aria-hidden=true]').count(),0);assert.equal(await page.locator('canvas').count(),0);assert.equal(await page.locator('.impact-cta').getAttribute('href'),'#contact');
  await page.locator('.menu-button').click();assert.equal(await page.locator('#mobile-menu').isVisible(),true);await page.keyboard.press('Escape');
  await page.locator('[data-project-filter=branding]').click();assert.equal(await page.locator('[data-project-card]:visible').count(),4);
  report.push({fallback:failure,passed:true});await context.close();
 }
 console.log(JSON.stringify({origin,passed:true,checks:report.length,report},null,2));
}finally{await browser.close();await fs.writeFile(directory+'/report.json',JSON.stringify(report,null,2));}
