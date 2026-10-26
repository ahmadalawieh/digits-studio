import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const AxeBuilder=require('@axe-core/playwright').default;
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
const qa=new URL('./qa/',import.meta.url);await fs.mkdir(qa,{recursive:true});
const report=[];
for(const lang of ['en','ar']){
  for(const width of [360,768,1440]){
    const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:1});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4173/'+(lang==='ar'?'ar/':''));await page.evaluate(()=>document.fonts.ready);
    await page.locator('.hero').evaluate(el=>Promise.allSettled(el.getAnimations({subtree:true}).map(animation=>animation.finished)));
    await page.screenshot({path:new URL(`${lang}-${width}.png`,qa).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});
    await page.screenshot({path:new URL(`${lang}-${width}-hero.png`,qa).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:false});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    if(width===360){await page.locator('.menu-button').click();if(await page.locator('#mobile-menu').isHidden())errors.push('Mobile menu did not open');await page.locator('#mobile-menu a[href="#services"]').click();if(!(await page.locator('#mobile-menu').isHidden()))errors.push('Mobile menu did not close after navigation');}
    await page.locator('.client-project-link').first().click();if(!page.url().includes('/projects/b1-ventures/'))errors.push('Client case did not open');await page.goBack();
    await page.locator('input[name="name"]').fill('Test Visitor');await page.locator('input[name="email"]').fill('visitor@example.com');await page.locator('input[value="Website"]').check({force:true});await page.locator('textarea[name="message"]').fill('A bilingual website & brand project. <script>alert(1)</script>');await page.locator('button[type="submit"]').click();
    const preview=await page.locator('#inquiry-preview').textContent();const whatsapp=await page.locator('#inquiry-whatsapp').getAttribute('href');const email=await page.locator('#inquiry-email').getAttribute('href');
    if(!preview.includes('<script>')||!decodeURIComponent(whatsapp).includes('visitor@example.com')||!email.startsWith('mailto:ahmad.alawieh77@gmail.com?'))errors.push('Inquiry composition failed');
    report.push({lang,width,overflow,errors,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});await context.close();
  }
}
await fs.writeFile(new URL('report.json',qa),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));
if(report.some(item=>item.overflow||item.errors.length||item.violations.length))process.exitCode=1;
