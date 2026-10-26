import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173';
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
const assert=(value,message)=>{if(!value)throw Error(message);};
await fs.mkdir('qa/hero-motion',{recursive:true});
try {
  for(const width of [320,360,768,1440])for(const ar of [false,true])for(const reduced of [false,true]){
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:reduced?'reduce':'no-preference',isMobile:width<751,hasTouch:width<751});
    const page=await context.newPage(),errors=[],missing=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
    await page.goto(origin+(ar?'/ar/':'/'));
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForFunction(state=>document.querySelector('.launch-hero').dataset.motionState===state,reduced?'reduced':'ready');
    assert(await page.locator('h1').innerText()!== '','Headline visible');
    assert(await page.locator('.impact-cta').isVisible(),'Inquiry CTA visible');
    assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'No horizontal page overflow');
    const clipped=await page.locator('.impact-word').evaluateAll(words=>words.some(word=>{
      const range=document.createRange();range.selectNodeContents(word);
      const text=range.getBoundingClientRect(),line=word.parentElement.getBoundingClientRect();
      return text.left<line.left-2||text.right>line.right+2;
    }));
    assert(!clipped,'Whole headline readable without clipping');
    assert(await page.locator('.reel-toggle').getAttribute('aria-pressed')===String(!reduced),'Reel respects initial motion preference');
    await page.locator('.reel-toggle').click();
    // Explicitly pause before checking navigation, regardless of initial mode.
    if(await page.locator('.reel-toggle').getAttribute('aria-pressed')==='true')await page.locator('.reel-toggle').click();
    await page.locator('.reel-next').click();
    await page.waitForFunction(()=>document.querySelector('.reel-name').textContent==='Riwa Grove');
    assert(await page.locator('.reel-link').getAttribute('href')===(ar?'/ar':'')+'/projects/riwa-grove/','Current card opens the matching bilingual project');
    await page.locator('.reel-prev').click();
    await page.waitForFunction(()=>document.querySelector('.reel-name').textContent==='Fornaya');
    // Multiple requests before decoding finishes must preserve every navigation step.
    await page.locator('.reel-next').evaluate(button=>{button.click();button.click();button.click();});
    await page.waitForFunction(()=>document.querySelector('.reel-name').textContent==='Paceform');
    assert((await page.locator('.reel-link').getAttribute('href')).endsWith('/projects/paceform/'),'Rapid navigation has a consistent destination');
    if(width===1440&&!reduced){
      await page.mouse.move(1200,250);
      await page.waitForFunction(()=>Math.abs(window.gsap.getProperty('.impact-stack','rotationY'))>.2);
      await page.locator('.impact-cta').hover();
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>document.querySelector('.launch-hero').dataset.motionState==='reduced');
      assert(await page.locator('.reel-toggle').getAttribute('aria-pressed')==='false','Changing motion preference stops playback');
      assert(await page.evaluate(()=>window.ScrollTrigger.getAll().length)===0,'Changing motion preference removes scroll animations');
      assert(await page.locator('.impact-cta').evaluate(el=>getComputedStyle(el).transform)==='none','Magnetic CTA returns to its resting position');
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.waitForFunction(()=>document.querySelector('.launch-hero').dataset.motionState==='ready');
      await page.evaluate(()=>scrollTo(0,450));
      await page.waitForFunction(()=>Math.abs(window.gsap.getProperty('.impact-reel','y'))>1);
      assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Scroll motion creates no page overflow');
      await page.evaluate(()=>scrollTo(0,0));
    }
    if(reduced&&[360,1440].includes(width)){
      const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
      assert(violations.length===0,'WCAG checks: '+JSON.stringify(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
    }
    assert(!errors.length,'Browser errors: '+errors.join('; '));assert(!missing.length,'Missing assets: '+missing.join('; '));
    await page.goto(origin+(ar?'/ar/':'/'));
    await page.waitForFunction(state=>document.querySelector('.launch-hero').dataset.motionState===state,reduced?'reduced':'ready');
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('.reel-image').evaluate(image=>image.decode());
    await page.screenshot({path:`qa/hero-motion/${width}-${ar?'ar':'en'}-${reduced?'reduced':'motion'}.png`});
    report.push({width,language:ar?'ar':'en',reduced,passed:true});
    await context.close();
  }
  for(const javascript of [true,false]){
    const context=await browser.newContext({viewport:{width:1440,height:1000},javaScriptEnabled:javascript});
    const page=await context.newPage();
    if(javascript)await page.route('**/assets/vendor/**',route=>route.abort());
    await page.goto(origin+'/');await page.evaluate(()=>document.fonts.ready);
    assert(await page.locator('.impact-word').first().isVisible(),'Content visible without motion libraries or JavaScript');
    assert(await page.locator('.impact-cta').isVisible(),'CTA visible in fallback');
    if(javascript){
      await page.waitForFunction(()=>document.querySelector('.launch-hero').dataset.motionState==='fallback');
      await page.locator('.reel-next').click();await page.waitForFunction(()=>document.querySelector('.reel-name').textContent==='Riwa Grove');
    }
    await page.locator('.impact-cta').click();assert(new URL(page.url()).hash==='#contact','Fallback inquiry link navigates');
    report.push({fallback:javascript?'library unavailable':'JavaScript disabled',passed:true});
    await context.close();
  }
  console.log(JSON.stringify({origin,checks:report.length,passed:true},null,2));
} finally {
  await fs.writeFile('qa/hero-motion-report.json',JSON.stringify(report,null,2));
  await browser.close();
}
