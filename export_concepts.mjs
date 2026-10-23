import sharp from 'sharp';
import {readdir} from 'node:fs/promises';
for(const slug of ['fornaya','riwa-grove']){
 const folder=new URL('./dist/assets/concepts/'+slug+'/',import.meta.url);
 for(const file of await readdir(folder)){
  if(!file.endsWith('.svg'))continue;
  const size=file.startsWith('logo-')?2400:file==='symbol.svg'?512:undefined;
  const renderer=sharp(new URL(file,folder).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
  if(size)renderer.resize({width:size});
  await renderer.png().toFile(new URL(file.replace('.svg','.png'),folder).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
 }
 console.log(slug+' SVGs exported to PNG.');
}
