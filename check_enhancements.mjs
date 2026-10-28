import {chromium} from 'playwright';
import fs from 'node:fs/promises';

const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173',report=[];
const browser=await chromium.launch({channel:'chrome',headless:true});
const assert=(value,message)=>{if(!value)throw Error(message);};
await fs.mkdir('qa/enhancements',{recursive:true});
try{
 for(const width of [360,1440])for(const ar of [false,true])for(const reduced of [false,true]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:reduced?'reduce':'no-preference',hasTouch:width===360,isMobile:width===360});
  const page=await context.newPage(),errors=[],requests=[];let sends=0;
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('502'))errors.push(m.text());});
  // Production uses the real Resend connection. These browser checks intercept
  // only delivery POSTs, exercising UI success/failure without emailing a person.
  await page.route('**/api/inquiry',async route=>{
   if(route.request().method()==='GET')return route.continue();
   requests.push(route.request().postDataJSON());sends++;
   await route.fulfill({status:sends===1?502:200,contentType:'application/json',body:JSON.stringify(sends===1?{error:'delivery_failed'}:{sent:true,reference:'browser-test-reference'})});
  });
  await page.goto(origin+(ar?'/ar/':''));await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(state=>document.querySelector('.hero').dataset.motionState===state,reduced?'reduced':'ready');
  const schema=await page.locator('script[type="application/ld+json"]').textContent();
  const graph=JSON.parse(schema)['@graph'];
  assert(graph.some(node=>node['@type']==='Organization'&&node.email==='hello@digitsstudio.online'),'Verified business structured data');
  assert(graph.some(node=>node['@type']==='Person'&&!node.image),'Founder structured data has no removed portrait');
  assert(!graph.some(node=>['Review','AggregateRating'].includes(node['@type'])),'Sample feedback is not represented as real reviews');
  assert(await page.locator('#dee-lab').isVisible(),'DEE design demonstration replaces sample feedback');
  assert(await page.locator('.demo-feedback-label').count()===0,'Sample testimonials retired');
  const dock=page.locator('.mobile-contact-dock');
  if(width===360){
   assert(await dock.getAttribute('aria-hidden')==='true','Dock hidden in hero');
   await page.locator('#work').scrollIntoViewIfNeeded();
   await page.evaluate(()=>scrollTo({top:document.querySelector('#work').offsetTop+12,behavior:'instant'}));
   await page.waitForFunction(()=>document.querySelector('.mobile-contact-dock').getAttribute('aria-hidden')==='false');
   assert(await dock.locator('.dock-project').getAttribute('href')==='#contact','Dock inquiry destination');
   assert((await dock.locator('.dock-whatsapp').getAttribute('href'))==='https://wa.me/96170332361','Dock WhatsApp destination');
   await page.locator('.menu-button').click();
   await page.waitForFunction(()=>document.querySelector('.mobile-contact-dock').getAttribute('aria-hidden')==='true');
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>document.querySelector('.mobile-contact-dock').getAttribute('aria-hidden')==='false');
  }
  await page.locator('#studio').scrollIntoViewIfNeeded();
  assert(await page.locator('#studio img').count()===0,'Studio remains text-only until replacement imagery is selected');
  assert(await page.locator('.studio-identity').getAttribute('href')==='/brand-kit.html','Existing identity review route retained');
  await page.locator('#studio').screenshot({path:`qa/enhancements/verified-studio-${width}-${ar?'ar':'en'}-${reduced?'reduced':'motion'}.png`});
  await page.locator('#contact').scrollIntoViewIfNeeded();
  if(width===360)await page.waitForFunction(()=>document.querySelector('.mobile-contact-dock').getAttribute('aria-hidden')==='true');
  await page.locator('input[name=name]').fill('Website review');await page.locator('input[name=email]').fill('review@example.com');
  await page.locator('input[value=Website]').check({force:true});await page.locator('textarea[name=message]').fill('A bilingual website <script>literal text</script>.');
  await page.locator('select[name=budget]').selectOption('$1,000–$3,000');await page.locator('select[name=timing]').selectOption('1–3 months');
  await page.locator('#inquiry-form button[type=submit]').click();
  const preview=await page.locator('#inquiry-preview').textContent();
  assert(preview.includes('$1,000–$3,000')&&preview.includes('1–3 months')&&preview.includes('<script>literal text</script>'),'Budget, timing and safe literal text in reviewed brief');
  assert((await page.locator('#inquiry-email').getAttribute('href')).startsWith('mailto:hello@digitsstudio.online?'),'Manual email uses the real branded inbox');
  const send=page.locator('#inquiry-send-direct');await send.waitFor({state:'visible'});
  await send.click();await page.waitForFunction(()=>document.querySelector('#inquiry-send-direct').disabled===false);
  assert(await send.isEnabled(),'Failed delivery permits retry');assert(requests.length===1,'Only one failed attempt');
  await send.click();await page.waitForFunction(()=>document.querySelector('#inquiry-send-direct').disabled&&document.querySelector('#inquiry-delivery-status').textContent.length>20);
  assert(requests.length===2&&requests[0].requestId===requests[1].requestId,'Retry retains idempotency identity');
  assert(requests[1].budget==='$1,000–$3,000'&&requests[1].timing==='1–3 months','Direct delivery contains the reviewed brief');
  await page.locator('textarea[name=message]').fill('Updated project brief.');
  assert(await page.locator('#inquiry-result').isHidden(),'Editing requires a fresh review');
  assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'No horizontal overflow');
  assert(!errors.length,'Browser errors: '+errors.join('; '));
  report.push({width,language:ar?'ar':'en',reduced,passed:true});await context.close();
 }
 for(const slug of ['b1-ventures','kaizen-firm','umbrella500'])for(const ar of [false,true]){
  const context=await browser.newContext({viewport:{width:360,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
  await page.goto(origin+(ar?'/ar':'')+'/projects/'+slug+'/#film');
  const video=page.locator('#film video');assert(await video.getAttribute('preload')==='none','Film does not load automatically');assert(await video.getAttribute('autoplay')===null,'Film does not autoplay');
  assert(await video.locator('track[kind=captions]').count()===2,'Both caption languages provided');
  await video.evaluate(element=>{element.load();});
  await page.waitForFunction(()=>Number.isFinite(document.querySelector('video').duration)&&document.querySelector('video').duration>11);
  await video.evaluate(element=>element.play());await page.waitForFunction(()=>document.querySelector('video').currentTime>.25);await video.evaluate(element=>element.pause());
  assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Case film fits mobile');
  await page.locator('#film').screenshot({path:`qa/enhancements/film-${slug}-${ar?'ar':'en'}.png`});
  const response=await page.request.get(origin+`/assets/projects/films/${slug}.webm`,{headers:{Range:'bytes=0-127'}});
  assert(response.status()===206&&(await response.body()).length===128,'Video byte ranges support playback and seeking');
  report.push({film:slug,language:ar?'ar':'en',passed:true});await context.close();
 }
 console.log(JSON.stringify({origin,checks:report.length,passed:true,noRealEmailSent:true},null,2));
}finally{await fs.writeFile('qa/enhancements-report.json',JSON.stringify(report,null,2));await browser.close();}
