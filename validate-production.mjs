import {readFile,stat} from 'node:fs/promises';
const origin='https://digitsstudio.online';
for(const [file,canonical] of [['index.html',origin+'/'],['ar/index.html',origin+'/ar/']]){
  const html=await readFile(new URL('./dist/'+file,import.meta.url),'utf8');
  if(!html.includes(`rel="canonical" href="${canonical}"`))throw new Error('Incorrect production canonical: '+file);
  if(html.includes('.chatgpt.site')||/ATOCODE|Nawri|Sitevation|Websitovation/i.test(html))throw new Error('Obsolete public identity: '+file);
  if(!html.includes('data-motion-heading')||!html.includes('data-motion-navigation')||!html.includes('data-motion-filters')||!html.includes('assets/editorial.css')||!html.includes('assets/editorial-motion.js'))throw Error('Editorial entry points missing: '+file);
  if(html.includes('src="'+(file.startsWith('ar/')?'../':'')+'assets/hero-motion.js'))throw Error('Conflicting legacy hero engine: '+file);
  if(!html.includes('assets/motion.css'))throw new Error('Motion stylesheet missing: '+file);
  for(const marker of ['data-motion-dock','assets/studio-enhancements.css','studio-text-only','inquiry-send-direct','name="budget"','name="timing"','application/ld+json','hello@digitsstudio.online','data-motion-dee-hero','data-motion-dee-lab','assets/dee.css'])if(!html.includes(marker))throw Error('Studio enhancement missing: '+marker+' in '+file);
  if(html.includes('demo-feedback-label')||html.includes('feedback-quotes'))throw Error('Retired sample testimonials still referenced: '+file);
  if(html.includes('ahmad-alawieh.webp')||html.includes('studio-portrait'))throw Error('Removed founder portrait still referenced: '+file);
  if(file.startsWith('ar/')&&!html.includes('fonts/Alexandria.woff2'))throw Error('Alexandria preload missing from Arabic homepage');
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  if(!graph.some(node=>node['@type']==='Organization'&&node.email==='hello@digitsstudio.online')||graph.some(node=>['Review','AggregateRating'].includes(node['@type'])))throw Error('Invalid business/sample-feedback structured data');
}
for(const file of ['dist/brand/logo-primary.svg','dist/brand/og-cover.png','dist/brand/digits-studio-brand-kit.zip','dist/assets/editorial.css','dist/assets/editorial-motion.js','dist/assets/editorial-motion.js.LEGAL.txt','dist/assets/editorial-motion-LICENSES.txt','dist/assets/fonts/Alexandria.woff2','dist/assets/fonts/Alexandria.ttf','dist/assets/fonts/Alexandria-OFL.txt','dist/assets/fonts/InterEditorial.woff2','dist/assets/fonts/PlayfairEditorial.woff2','dist/assets/hero-motion.css','dist/assets/hero-motion.js','dist/assets/vendor/gsap.min.js','dist/assets/vendor/ScrollTrigger.min.js','dist/assets/vendor/GSAP-NOTICE.txt','dist/assets/site.js','dist/assets/site.css','dist/assets/motion.css','dist/assets/fonts/IBMPlexSansArabic-Regular.woff2','dist/assets/fonts/IBMPlexSansArabic-SemiBold.woff2','dist/robots.txt','dist/sitemap.xml']){
  if(!(await stat(new URL('./'+file,import.meta.url))).size)throw new Error('Missing production asset: '+file);
}
const robots=await readFile(new URL('./dist/robots.txt',import.meta.url),'utf8');
if(!robots.includes(origin+'/sitemap.xml'))throw new Error('Incorrect sitemap origin');
console.log('Digits Studio production assets and canonical URLs verified.');
for(const slug of ['fornaya','riwa-grove','dar-saha','paceform']){
 for(const prefix of ['', 'ar/']){
  const html=await readFile(new URL(`./dist/${prefix}projects/${slug}/index.html`,import.meta.url),'utf8');
  if(!html.includes(`rel="canonical" href="${origin}/${prefix}projects/${slug}/"`))throw Error('Incorrect concept canonical');
 }
 const demo=await readFile(new URL(`./dist/demos/${slug}/index.html`,import.meta.url),'utf8');
 if(!demo.includes('noindex,follow')||!(demo.includes('demo-data')||demo.includes('experience-data')))throw Error('Incomplete demo: '+slug);
 for(const file of [`concepts/${slug}/brand-kit.zip`,`assets/concepts/${slug}/hero.webp`,`assets/concepts/${slug}/brand-board.png`,`assets/concepts/${slug}/website-desktop.webp`,`assets/concepts/${slug}/website-mobile.webp`]){
  if(!(await stat(new URL('./dist/'+file,import.meta.url))).size)throw Error('Missing concept asset: '+file);
 }
}
console.log('All four bilingual concepts, demo pages, previews and downloadable kits verified.');

for(const slug of ['b1-ventures','kaizen-firm','umbrella500'])for(const prefix of ['', 'ar/']){const html=await readFile(new URL(`./dist/${prefix}projects/${slug}/index.html`,import.meta.url),'utf8');if(!html.includes(`rel="canonical" href="${origin}/${prefix}projects/${slug}/"`))throw Error('Incorrect client case canonical');}
for(const file of ['dist/assets/professional.css','dist/assets/case-editorial.css','dist/assets/concepts/brand-experiences.css','dist/photography-credits.html'])if(!(await stat(new URL('./'+file,import.meta.url))).size)throw Error('Missing professional portfolio asset: '+file);
console.log('Seven project case studies and professional portfolio assets verified.');
for(const file of ['dist/assets/studio-enhancements.css','api/inquiry.js','lib/inquiry-handler.mjs'])if(!(await stat(new URL('./'+file,import.meta.url))).size)throw Error('Missing studio enhancement: '+file);
for(const slug of ['b1-ventures','kaizen-firm','umbrella500']){
 for(const suffix of ['.webm','-poster.webp','-en.vtt','-ar.vtt'])if(!(await stat(new URL(`./dist/assets/projects/films/${slug}${suffix}`,import.meta.url))).size)throw Error('Missing archive film asset: '+slug+suffix);
 for(const prefix of ['','ar/']){
  const html=await readFile(new URL(`./dist/${prefix}projects/${slug}/index.html`,import.meta.url),'utf8');
  if(!html.includes('id="film"')||!html.includes('preload="none"')||!html.includes(slug+'.webm'))throw Error('Missing captioned archive film: '+slug);
 }
}
console.log('Text-only studio, structured data, reviewed inquiry and three captioned archive films verified.');
for(const name of ['dee-pointing.webp','dee-curious.webp','dee-pointing.png','dee-curious.png'])if(!(await stat(new URL('./dist/assets/dee/'+name,import.meta.url))).size)throw Error('Missing DEE pose: '+name);
if(!(await stat(new URL('./dist/assets/dee.css',import.meta.url))).size)throw Error('Missing DEE interaction stylesheet');
console.log('DEE hero cameo and bilingual design demonstration assets verified.');
