import {readFile,stat} from 'node:fs/promises';
const origin='https://digitsstudio.online';
for(const [file,canonical] of [['index.html',origin+'/'],['ar/index.html',origin+'/ar/']]){
  const html=await readFile(new URL('./dist/'+file,import.meta.url),'utf8');
  if(!html.includes(`rel="canonical" href="${canonical}"`))throw new Error('Incorrect production canonical: '+file);
  if(html.includes('.chatgpt.site')||/ATOCODE|Nawri|Sitevation|Websitovation/i.test(html))throw new Error('Obsolete public identity: '+file);
  if(!html.includes('assets/motion.css'))throw new Error('Motion stylesheet missing: '+file);
}
for(const file of ['dist/brand/logo-primary.svg','dist/brand/og-cover.png','dist/brand/digits-studio-brand-kit.zip','dist/assets/site.js','dist/assets/site.css','dist/assets/motion.css','dist/assets/fonts/IBMPlexSansArabic-Regular.woff2','dist/assets/fonts/IBMPlexSansArabic-SemiBold.woff2','dist/robots.txt','dist/sitemap.xml']){
  if(!(await stat(new URL('./'+file,import.meta.url))).size)throw new Error('Missing production asset: '+file);
}
const robots=await readFile(new URL('./dist/robots.txt',import.meta.url),'utf8');
if(!robots.includes(origin+'/sitemap.xml'))throw new Error('Incorrect sitemap origin');
console.log('Digits Studio production assets and canonical URLs verified.');
for(const slug of ['fornaya','riwa-grove']){
 for(const prefix of ['', 'ar/']){
  const html=await readFile(new URL(`./dist/${prefix}projects/${slug}/index.html`,import.meta.url),'utf8');
  if(!html.includes(`rel="canonical" href="${origin}/${prefix}projects/${slug}/"`))throw Error('Incorrect concept canonical');
 }
 const demo=await readFile(new URL(`./dist/demos/${slug}/index.html`,import.meta.url),'utf8');
 if(!demo.includes('noindex,follow')||!demo.includes('demo-data'))throw Error('Incomplete demo: '+slug);
 for(const file of [`concepts/${slug}/brand-kit.zip`,`assets/concepts/${slug}/hero.webp`,`assets/concepts/${slug}/brand-board.png`,`assets/concepts/${slug}/website-desktop.webp`,`assets/concepts/${slug}/website-mobile.webp`]){
  if(!(await stat(new URL('./dist/'+file,import.meta.url))).size)throw Error('Missing concept asset: '+file);
 }
}
console.log('Both bilingual concepts, demo pages, previews and downloadable kits verified.');
