import {readFile,stat} from 'node:fs/promises';
const origin='https://digitsstudio.online';

for(const [file,canonical] of [['index.html',origin+'/'],['ar/index.html',origin+'/ar/']]){
  const html=await readFile(new URL('./dist/'+file,import.meta.url),'utf8');
  if(!html.includes(`rel="canonical" href="${canonical}"`))throw new Error('Incorrect production canonical: '+file);
  if(html.includes('.chatgpt.site')||/ATOCODE|Nawri|Sitevation|Websitovation/i.test(html))throw new Error('Obsolete public identity: '+file);
  for(const marker of ['assets/digits.css','assets/digits.js','live-demo-frame','scope-estimator','inquiry-send-direct','application/ld+json','hello@digitsstudio.online']){
    if(!html.includes(marker))throw new Error('Missing A-to-Z revamp marker: '+marker+' in '+file);
  }
  if(file.startsWith('ar/')&&!html.includes('fonts/Alexandria.woff2'))throw new Error('Alexandria preload missing from Arabic homepage');
}

for(const file of [
  'dist/brand/logo-primary.svg','dist/brand/logo-white.svg','dist/brand/og-cover.png','dist/brand/digits-studio-brand-kit.zip',
  'dist/assets/digits.css','dist/assets/digits.js','dist/assets/fonts/Alexandria.woff2','dist/assets/fonts/InterEditorial.woff2',
  'dist/assets/fonts/PlayfairEditorial.woff2','dist/demos/venture-os/index.html','dist/demos/dar-saha-booking/index.html',
  'dist/demos/riwa-store/index.html','dist/branding-agency-beirut.html','dist/bilingual-web-design.html',
  'dist/ecommerce-websites.html','dist/seo-digital-marketing.html','dist/robots.txt','dist/sitemap.xml','api/inquiry.js'
]){
  if(!(await stat(new URL('./'+file,import.meta.url))).size)throw new Error('Missing production asset: '+file);
}

const robots=await readFile(new URL('./dist/robots.txt',import.meta.url),'utf8');
if(!robots.includes(origin+'/sitemap.xml'))throw new Error('Incorrect sitemap origin');

for(const slug of ['fornaya','riwa-grove','dar-saha','paceform','b1-ventures','kaizen-firm','umbrella500']){
  for(const prefix of ['','ar/']){
    const html=await readFile(new URL(`./dist/${prefix}projects/${slug}/index.html`,import.meta.url),'utf8');
    if(!html.includes(`rel="canonical" href="${origin}/${prefix}projects/${slug}/"`))throw new Error('Incorrect project canonical: '+slug);
  }
}

console.log('Digits Studio A-to-Z production build, demos, SEO pages, and assets verified.');
