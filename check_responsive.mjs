import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173';
const slugs=['b1-ventures','kaizen-firm','umbrella500','fornaya','riwa-grove','dar-saha','paceform'];
const routes=['/','/ar/',...['','/ar'].flatMap(prefix=>slugs.map(slug=>`${prefix}/projects/${slug}/`)),...['fornaya','riwa-grove','dar-saha','paceform'].flatMap(slug=>[`/demos/${slug}/`,`/demos/${slug}/?lang=ar`]),'/privacy.html','/brand-kit.html','/photography-credits.html'];
const report=[],directory='qa/responsive';
await fs.mkdir(directory,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});

// Inspect text ranges, not just scrollWidth: a clipped mask hides its overflow.
function clippedCopy(){
 const problems=[],walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 for(let node;node=walker.nextNode();){
  const element=node.parentElement,text=node.textContent.trim();
  if(!text||!element||element.closest('script,style,svg,option,[hidden],[inert],[aria-hidden="true"],.service-reel-viewport,.reel-track,.project-film,.sr-only,.visually-hidden'))continue;
  let visible=true,clips=[];
  for(let ancestor=element;ancestor;ancestor=ancestor.parentElement){
   const style=getComputedStyle(ancestor);
   if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0){visible=false;break;}
   if(['hidden','clip','auto','scroll'].includes(style.overflowX))clips.push(ancestor);
  }
  if(!visible)continue;
  const range=document.createRange();range.selectNodeContents(node);
  for(const rect of range.getClientRects()){
   if(rect.width<1||rect.height<1)continue;
   let clip=clips.find(el=>{const box=el.getBoundingClientRect();return rect.left<box.left-2||rect.right>box.right+2;});
   if(rect.left< -2||rect.right>innerWidth+2||clip){
    problems.push({text:text.slice(0,100),element:element.tagName.toLowerCase()+'.'+String(element.className).replaceAll(' ','.'),clip:clip?.className||'viewport',left:Math.round(rect.left),right:Math.round(rect.right)});break;
   }
  }
 }
 return problems;
}

try{
 for(const width of [360,768,1440])for(const route of routes){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400&&!response.url().includes('/_vercel/'))missing.push(response.url());});
  await page.goto(origin+route);await page.evaluate(()=>document.fonts.ready);
  if(route==='/'||route==='/ar/')await page.waitForFunction(()=>document.querySelector('.dee-journey').dataset.motionState==='reduced');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),clipped=await page.evaluate(clippedCopy);
  const brokenLinks=await page.locator('a[href]').evaluateAll(links=>links.filter(link=>{const href=link.getAttribute('href');return href.startsWith('#')&&href.length>1&&!document.getElementById(decodeURIComponent(href.slice(1)));}).map(link=>link.getAttribute('href')));
  const result={route,width,overflow,clipped,errors,missing,brokenLinks};report.push(result);
  if(overflow||clipped.length||errors.length||missing.length||brokenLinks.length){console.log(JSON.stringify(result));await page.screenshot({path:`${directory}/issue-${width}-${route.replace(/[^a-z0-9]/gi,'_')}.jpg`,fullPage:true,type:'jpeg',quality:80});}
  await context.close();
 }
 const failures=report.filter(r=>r.overflow||r.clipped.length||r.errors.length||r.missing.length||r.brokenLinks.length);
 console.log(JSON.stringify({origin,checks:report.length,failures:failures.length}));
 assert.equal(failures.length,0,'Responsive text/link audit found issues; see qa/responsive/report.json');
}finally{await browser.close();await fs.writeFile(directory+'/report.json',JSON.stringify(report,null,2));}
