import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173';
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
const assert=(value,message)=>{if(!value)throw Error(message);};
await fs.mkdir('qa/editorial',{recursive:true});

async function settledFilter(page,key){
  await page.waitForFunction(key=>{
    const button=document.querySelector(`[data-project-filter="${key}"]`),background=button.querySelector('[data-filter-background]');
    if(!background)return false;
    const a=button.getBoundingClientRect(),b=background.getBoundingClientRect();
    return Math.abs(a.x-b.x)<.6&&Math.abs(a.width-b.width)<.6&&Math.abs(a.y-b.y)<.6;
  },key);
}

try{
  for(const width of [320,360,768,1440])for(const ar of [false,true])for(const reduced of [false,true]){
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:reduced?'reduce':'no-preference',hasTouch:width<751,isMobile:width<751});
    const page=await context.newPage(),errors=[],missing=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
    page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
    await page.addInitScript(()=>{
      window.headingSamples=[];
      new MutationObserver(records=>{
        if(!records.some(r=>r.target.classList?.contains('impact-word')))return;
        window.headingSamples.push([...document.querySelectorAll('.impact-word')].map(e=>({transform:e.style.transform,height:e.offsetHeight})));
      }).observe(document,{subtree:true,attributes:true,attributeFilter:['style']});
    });
    await page.goto(origin+(ar?'/ar/':'/'));
    await page.waitForFunction(state=>document.querySelector('.hero').dataset.motionState===state,reduced?'reduced':'ready');
    await page.waitForFunction(()=>document.querySelector('.project-filters').dataset.motionReady==='true');
    await page.evaluate(()=>document.fonts.ready);
    assert((await page.locator('h1').innerText()).replace(/\s+/g,' ').trim()===(ar?'اترك بصمتك.':'Make your mark.'),'Original headline and language retained');
    assert(await page.locator('.impact-mask').count()===2,'Two nested clipping masks');
    assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'No page overflow');
    const clipped=await page.locator('.impact-word').evaluateAll(words=>words.some(word=>{
      const range=document.createRange();range.selectNodeContents(word);
      const a=range.getBoundingClientRect(),b=word.closest('.impact-line').getBoundingClientRect();
      return a.left<b.left-2||a.right>b.right+2;
    }));
    assert(!clipped,'Headline text is not clipped at rest');
    assert(await page.locator('.reel-toggle').getAttribute('aria-pressed')===String(!reduced),'Autoplay preference retained');
    if(!reduced){
      assert(await page.evaluate(()=>window.headingSamples.some(lines=>lines.some(line=>line.transform.includes('translateY')&&!/translateY\(0%\)/.test(line.transform)))),'Headline actually moved through its mask');
    }
    // The native menu still controls the hydrated nodes, including keyboard close.
    if(width<751){
      await page.locator('.menu-button').click();assert(await page.locator('#mobile-menu').isVisible(),'Mobile menu opens');
      await page.keyboard.press('Escape');assert(await page.locator('#mobile-menu').isHidden(),'Escape closes mobile menu');
      await page.locator('.menu-button').click();await page.locator('#mobile-menu a[href="#work"]').click();assert(await page.locator('#mobile-menu').isHidden(),'Menu link closes mobile menu');
    }
    assert(await page.locator('.header .language').getAttribute('href')===(ar?'../':'ar/'),'Existing language route retained');
    for(const [key,count] of [['branding',4],['website',7],['marketing',4],['all',7]]){
      await page.locator(`[data-project-filter="${key}"]`).click();
      await settledFilter(page,key);
      assert(await page.locator('[data-project-card]:visible').count()===count,'Category count: '+key);
      assert(await page.locator('[data-project-filter][aria-pressed=true]').getAttribute('data-project-filter')===key,'Native and React selection agree');
      if(key!=='all'){
        const suffix={branding:'#identity',website:'#website',marketing:'#campaign'}[key];
        const href=await page.locator('[data-project-card]:visible .project-route').first().getAttribute('href');
        assert(href.endsWith(suffix),'Category-specific project destination retained');
      }
    }
    await page.locator('[data-project-filter=marketing]').focus();await page.keyboard.press('Enter');await settledFilter(page,'marketing');
    assert(await page.locator('[data-project-card]:visible').count()===4,'Keyboard filtering');
    if(width===1440&&!reduced){
      await page.evaluate(()=>scrollTo(0,0));await page.mouse.move(1200,300);
      await page.waitForFunction(()=>{const s=getComputedStyle(document.querySelector('.impact-stack')).transform;return s!=='none'&&!s.includes('matrix(1, 0, 0, 1, 0, 0)');});
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>document.querySelector('.hero').dataset.motionState==='reduced');
      assert(await page.locator('.reel-toggle').getAttribute('aria-pressed')==='false','Dynamic reduced motion stops autoplay');
      await page.waitForFunction(()=>getComputedStyle(document.querySelector('.impact-stack')).transform==='none',null,{timeout:2000});
      await page.locator('[data-project-filter=all]').click();await settledFilter(page,'all');
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.waitForFunction(()=>document.querySelector('.hero').dataset.motionState==='ready');
    }
    if(reduced&&[360,1440].includes(width)){
      const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
      assert(!violations.length,'Accessibility: '+JSON.stringify(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
    }
    assert(!errors.length,'Browser/hydration errors: '+errors.join('; '));assert(!missing.length,'Missing assets: '+missing.join('; '));
    await page.goto(origin+(ar?'/ar/':'/'));
    await page.waitForFunction(state=>document.querySelector('.hero').dataset.motionState===state,reduced?'reduced':'ready');
    await page.evaluate(()=>document.fonts.ready);await page.locator('.reel-image').evaluate(image=>image.decode());
    await page.screenshot({path:`qa/editorial/verified-hero-${width}-${ar?'ar':'en'}-${reduced?'reduced':'motion'}.png`});
    report.push({width,language:ar?'ar':'en',reduced,passed:true});await context.close();
  }
  for(const javascript of [true,false])for(const ar of [false,true]){
    const context=await browser.newContext({viewport:{width:360,height:1000},javaScriptEnabled:javascript,reducedMotion:'reduce'}),page=await context.newPage();
    if(javascript)await page.route('**/assets/editorial-motion.js',route=>route.abort());
    await page.goto(origin+(ar?'/ar/':'/'));await page.evaluate(()=>document.fonts.ready);
    assert(await page.locator('h1').isVisible(),'Static headline retained without the motion bundle');
    if(javascript){
      await page.locator('.menu-button').click();assert(await page.locator('#mobile-menu').isVisible(),'Native menu fallback');await page.keyboard.press('Escape');
      await page.locator('[data-project-filter=branding]').click();assert(await page.locator('[data-project-card]:visible').count()===4,'Native category fallback');
      assert(await page.locator('[data-project-filter=branding]').evaluate(e=>getComputedStyle(e).backgroundColor)==='rgb(6, 7, 11)','Fallback active pill stays legible');
      await page.locator('input[name=name]').fill('Editorial review');await page.locator('input[name=email]').fill('review@example.com');await page.locator('textarea[name=message]').fill('A bilingual brand and website.');await page.locator('#inquiry-form button[type=submit]').click();
      assert((await page.locator('#inquiry-whatsapp').getAttribute('href')).startsWith('https://wa.me/96170332361?text='),'Native inquiry fallback');
    }
    await page.locator('.impact-cta').click();assert(new URL(page.url()).hash==='#contact','Static CTA route retained');
    report.push({fallback:javascript?'motion bundle blocked':'JavaScript disabled',language:ar?'ar':'en',passed:true});await context.close();
  }
  console.log(JSON.stringify({origin,checks:report.length,passed:true},null,2));
}finally{await fs.writeFile('qa/editorial-report.json',JSON.stringify(report,null,2));await browser.close();}
