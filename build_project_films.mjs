import {chromium} from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

const clients=JSON.parse(await fs.readFile('projects-catalog.json','utf8')).clients;
const directory='dist/assets/projects/films';await fs.mkdir(directory,{recursive:true});
const cache=path.join(os.homedir(),'AppData','Local','ms-playwright');
const ffmpegDirectory=(await fs.readdir(cache)).filter(name=>name.startsWith('ffmpeg-')).sort().at(-1);
const ffmpeg=process.env.FFMPEG_PATH||path.join(cache,ffmpegDirectory,'ffmpeg-win64.exe');
const font=pathToFileURL(path.resolve('dist/assets/fonts/InterEditorial.woff2')).href;
const logo=(await fs.readFile('dist/brand/logo-white.svg')).toString('base64');
const browser=await chromium.launch({channel:'chrome',headless:true});
const metadata={};
try{
 for(const client of clients){
  const image=(await fs.readFile('dist/assets/projects/'+client.file)).toString('base64');
  const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
  await page.setContent(`<!doctype html><html><head><style>@font-face{font-family:Inter;src:url('${font}')}*{box-sizing:border-box}body{margin:0;background:#06070B;color:#FDFDFD;font-family:Inter,Arial,sans-serif;padding:38px 40px}header{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#adb3bf}header img{width:130px}main{display:flex;align-items:center;gap:42px;margin-top:61px}.screen{width:880px;height:550px;overflow:hidden;border-radius:18px;border:1px solid #ffffff38;background:#15171c;box-shadow:0 35px 80px #0009;flex-shrink:0}.screen img{display:block;width:880px;height:auto;transform-origin:50% 25%}aside{width:240px}aside>p:first-child{font-size:11px;color:#9ca3b1;line-height:1.8}h1{font-size:43px;line-height:1.08;letter-spacing:-.055em;font-weight:500;margin:22px 0}aside>p{font-size:15px;line-height:1.8}aside>p:last-child{font-size:11px;color:#9ca3b1;margin-top:35px}footer{position:absolute;bottom:30px;left:40px;right:40px;display:flex;justify-content:space-between;font-size:10px;color:#9ca3b1}</style></head><body><header><img src="data:image/svg+xml;base64,${logo}"><span>Project archive / ${client.name}</span></header><main><div class="screen"><img src="data:image/png;base64,${image}"></div><aside><p>Website work by<br>Ahmad Alawieh</p><h1>${client.name}</h1><p>${client.role}</p><p>A design overview using the original project capture. External websites may change.</p></aside></main><footer><span>Digits Studio / Beirut & worldwide</span><span>Website / archive preview</span></footer></body></html>`);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode()));window.filmAnimations=[document.querySelector('.screen>img').animate([{transform:'scale(1) translateY(0)'},{transform:'scale(1.075) translateY(-8px)',offset:.65},{transform:'scale(1) translateY(0)'}],{duration:12000,easing:'ease-in-out',fill:'both'}),document.querySelector('aside').animate([{opacity:.2,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)',offset:.15},{opacity:1,transform:'translateY(0)'}],{duration:12000,fill:'both'})];window.filmAnimations.forEach(animation=>animation.pause());});
  const encoder=spawn(ffmpeg,['-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-r','24','-i','pipe:0','-c:v','libvpx-vp9','-b:v','0','-crf','35','-deadline','realtime','-cpu-used','5','-threads','2','-an','-y',`${directory}/${client.slug}.webm`],{windowsHide:true,stdio:['pipe','ignore','pipe']});
  const encoderErrors=[];encoder.stderr.on('data',data=>encoderErrors.push(data.toString()));
  const done=once(encoder,'close');
  for(let frame=0;frame<288;frame++){
   await page.evaluate(time=>window.filmAnimations.forEach(animation=>{animation.currentTime=time;}),frame/24*1000);
   const jpeg=await page.screenshot({type:'jpeg',quality:89});
   if(frame===48)await sharp(jpeg).webp({quality:88}).toFile(`${directory}/${client.slug}-poster.webp`);
   if(!encoder.stdin.write(jpeg))await once(encoder.stdin,'drain');
  }
  encoder.stdin.end();const [code]=await done;if(code!==0)throw Error(encoderErrors.join(''));
  for(const ar of [false,true])await fs.writeFile(`${directory}/${client.slug}-${ar?'ar':'en'}.vtt`,`WEBVTT\n\n00:00:00.000 --> 00:00:12.000\n${client.name} / ${ar?client.arRole:client.role}\n${ar?'لقطة أصلية من أرشيف المشروع. عرض صامت للتصميم.':'Original archived website capture. Silent design overview.'}\n`);
  metadata[client.slug]={source:client.file,type:'supplied archive design overview',duration:12,width:1280,height:800,bytes:(await fs.stat(`${directory}/${client.slug}.webm`)).size};
  console.log('Archive film rendered:',client.name,metadata[client.slug].bytes,'bytes');await page.close();
 }
 await fs.writeFile('project-films.json',JSON.stringify(metadata,null,2)+'\n');
}finally{await browser.close();}
