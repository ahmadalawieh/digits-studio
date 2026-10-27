// Deterministic ZIP export using Node built-ins; no production dependencies.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {deflateRawSync} from 'node:zlib';
const root=path.dirname(fileURLToPath(import.meta.url));
const dist=path.join(root,'dist');
const table=Array.from({length:256},(_,value)=>{
 for(let bit=0;bit<8;bit++)value=(value&1)?0xedb88320^(value>>>1):value>>>1;
 return value>>>0;
});
const crc32=bytes=>{
 let crc=0xffffffff;for(const byte of bytes)crc=table[(crc^byte)&255]^(crc>>>8);
 return (crc^0xffffffff)>>>0;
};
async function walk(directory){
 const files=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  const file=path.join(directory,entry.name);
  if(entry.isDirectory())files.push(...await walk(file));
  else if(entry.isFile()&&!entry.name.endsWith('.zip'))files.push(file);
 }
 return files;
}
const sources=['build_professional.py','build_brand_worlds.py','brand_drawing.py','build_client_cases.py','polish_portfolio.py','check_professional.mjs','professional-direction.md','photography-credits.json','build_assets.py','build_public_kit.mjs','export_assets.mjs','build_site.py','hero_template.py','build_editorial.mjs','motion-fragments.json','editorial-refactor-plan.md','DESIGN.md','check_editorial.mjs','hero-motion-plan.md','check_hero_motion.mjs','build_guide.py','build_showcase.py','build_experience_demos.py','projects-catalog.json','concept-generation-briefs.json','check_projects.mjs','build_concepts.py','export_concepts.mjs','concepts-content.json','concepts-plan.md','CONCEPT_ASSET_NOTES.md','check_concepts.mjs','package_kit.py','check_site.mjs','check_extras.mjs','check_motion.mjs','package.json','package-lock.json','vercel.json','validate-production.mjs','design-plan.md','QA_REPORT.md','DEPLOYMENT.md','.gitattributes','README.md','strategy.md'];
async function zipFiles(files,destination,prefix,base=root){
const local=[],central=[];let offset=0;
for(const file of files){
 const name=Buffer.from(prefix+'/'+path.relative(base,file).split(path.sep).join('/'));
 const raw=await readFile(file),packed=deflateRawSync(raw),crc=crc32(raw);
 const header=Buffer.alloc(30);
 header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);
 header.writeUInt16LE(8,8);header.writeUInt16LE(33,12);header.writeUInt32LE(crc,14);
 header.writeUInt32LE(packed.length,18);header.writeUInt32LE(raw.length,22);header.writeUInt16LE(name.length,26);
 local.push(header,name,packed);
 const directory=Buffer.alloc(46);
 directory.writeUInt32LE(0x02014b50,0);directory.writeUInt16LE(20,4);directory.writeUInt16LE(20,6);
 directory.writeUInt16LE(0x800,8);directory.writeUInt16LE(8,10);directory.writeUInt16LE(33,14);
 directory.writeUInt32LE(crc,16);directory.writeUInt32LE(packed.length,20);directory.writeUInt32LE(raw.length,24);
 directory.writeUInt16LE(name.length,28);directory.writeUInt32LE(offset,42);
 central.push(directory,name);offset+=header.length+name.length+packed.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);
end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);
end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
await writeFile(destination,Buffer.concat([...local,directory,end]));
console.log(`${prefix} kit generated from ${files.length} files.`);
}
for(const slug of ['fornaya','riwa-grove','dar-saha','paceform']){
 const files=[...await walk(path.join(dist,'assets','concepts',slug)),...await walk(path.join(dist,'concepts',slug)),...await walk(path.join(dist,'demos',slug)),...await walk(path.join(dist,'assets','fonts')),path.join(dist,'assets','concepts','concepts.css'),path.join(dist,'assets','concepts','demo.js'),path.join(dist,'assets','concepts','experiences.css'),path.join(dist,'assets','concepts','experiences.js'),path.join(dist,'assets','concepts','brand-experiences.css'),path.join(dist,'assets','case-editorial.css'),path.join(dist,'photography-credits.html')].sort();
 await zipFiles(files,path.join(dist,'concepts',slug,'brand-kit.zip'),slug,dist);
}
const files=[...await walk(dist),...await walk(path.join(root,'src')),...sources.map(name=>path.join(root,name))].sort();
await zipFiles(files,path.join(dist,'brand','digits-studio-brand-kit.zip'),'Digits Studio');
