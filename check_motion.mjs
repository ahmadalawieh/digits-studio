import {chromium} from 'playwright';import fs from 'node:fs/promises';
const b=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true}),report=[];
try{for(const lang of ['en','ar'])for(const reduced of [false,true]){
 const c=await b.newContext({viewport:{width:1440,height:1000},reducedMotion:reduced?'reduce':'no-preference'}),p=await c.newPage();await p.goto('http://127.0.0.1:4173/'+(lang==='ar'?'ar/':''));await p.evaluate(()=>document.fonts.ready);
 if(await p.locator('.reel-toggle').getAttribute('aria-pressed')!==String(!reduced))throw Error('Initial playback');
 await p.locator('.reel-next').click();await p.waitForFunction(()=>document.querySelector('.reel-name').textContent==='Riwa Grove');
 if(!(await p.locator('.reel-link').getAttribute('href')).includes('/projects/riwa-grove/'))throw Error('Project destination');
 for(const i of [1,2,0]){const d=p.locator('.service').nth(i);if(await d.evaluate(e=>e.open)){await d.locator('summary').click();await p.waitForFunction(i=>{const d=document.querySelectorAll('.service')[i];return !d.open&&!d.dataset.transition;},i);}
 await d.locator('summary').focus();await p.keyboard.press('Enter');await p.waitForFunction(i=>{const d=document.querySelectorAll('.service')[i];return d.open&&!d.dataset.transition;},i);if(!await d.locator('.service-projects').isVisible())throw Error('Service content');await d.locator('summary').click();await p.waitForFunction(i=>{const d=document.querySelectorAll('.service')[i];return !d.open&&!d.dataset.transition;},i);}
 report.push({lang,reducedMotion:reduced,reelRouting:'passed',keyboardAccordion:'passed'});await c.close();}
 await fs.writeFile('qa/motion-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}finally{await b.close();}
