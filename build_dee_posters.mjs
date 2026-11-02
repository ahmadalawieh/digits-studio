import {chromium} from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4173';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const [name,width,height,phase,target,mobile] of [
  ['right',1440,950,0,{x:.23,y:.36},false],
  ['left',1440,950,1/3,{x:.73,y:.31},false],
  ['up',390,844,0,{x:.4,y:.30},true],
 ]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:2});await page.route('**/assets/editorial-motion.js',route=>route.abort());
  await page.goto(origin);const data=await page.evaluate(async({phase,target,mobile})=>{
   document.body.replaceChildren();const host=document.createElement('div');host.style.cssText=`position:fixed;left:0;top:${mobile?'469px':'0'};width:100vw;height:${mobile?'287px':'100vh'}`;document.body.append(host);
   const {createScene}=await import('/assets/dee-scene.js');const engine=createScene(host);engine.frame(phase,{x:0,y:0},0,target);engine.frame(phase,{x:0,y:0},1500,target);
   const png=host.querySelector('canvas').toDataURL('image/png');engine.dispose();return png.split(',')[1];
  },{phase,target,mobile});
  const output=`dist/assets/dee/hero-${name}.webp`;
  await sharp(Buffer.from(data,'base64')).trim({threshold:12}).resize({width:800,height:900,fit:'inside',withoutEnlargement:true}).webp({quality:88,alphaQuality:95}).toFile(output);
  console.log(output,JSON.stringify(await sharp(output).metadata()));await page.close();
 }
}finally{await browser.close();}
