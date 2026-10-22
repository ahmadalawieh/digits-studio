import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require('sharp');
const root=path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/,'$1');
const brand=path.join(root,'dist','brand');
for(const name of (await fs.readdir(brand)).filter(n=>n.endsWith('.svg'))){
  const file=path.join(brand,name); const meta=await sharp(file).metadata();
  const width=name.startsWith('logo')?4000:name.startsWith('symbol')?1024:name.startsWith('business-card')?1820:name==='whatsapp-qr.svg'?1480:name.includes('letterhead')||name.includes('proposal')?2480:meta.width;
  await sharp(file,{density:220}).resize({width}).png().toFile(file.replace(/\.svg$/,'.png'));
}
const thumb=async(name,w,h,bg)=>({input:await sharp(path.join(brand,name)).resize(w,h,{fit:'contain',background:bg}).flatten({background:bg}).png().toBuffer()});
const board=sharp({create:{width:1800,height:1350,channels:3,background:'#EEEDF2'}});
await board.composite([
 {...await thumb('logo-primary.svg',980,400,'#FFDA46'),left:32,top:32},
 {...await thumb('avatar.svg',400,400,'#FFDA46'),left:1044,top:32},
 {...await thumb('logo-white.svg',292,400,'#292A32'),left:1476,top:32},
 {...await thumb('business-card-back.svg',644,432,'#292A32'),left:32,top:466},
 {...await thumb('post-01-launch.svg',336,420,'#FFDA46'),left:708,top:466},
 {...await thumb('post-03-websites.svg',336,420,'#292A32'),left:1076,top:466},
 {...await thumb('post-04-marketing.svg',324,420,'#B4A6ED'),left:1444,top:466},
 {...await thumb('linkedin-cover.svg',1736,386,'#FFDA46'),left:32,top:932},
]).png().toFile(path.join(root,'brand-board.png'));
console.log('Transparent PNG exports and brand board ready.');
