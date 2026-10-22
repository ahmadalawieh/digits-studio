import {readFile,stat} from 'node:fs/promises';
const origin='https://digitsstudio.online';
for(const [file,canonical] of [['index.html',origin+'/'],['ar/index.html',origin+'/ar/']]){
  const html=await readFile(new URL('./dist/'+file,import.meta.url),'utf8');
  if(!html.includes(`rel="canonical" href="${canonical}"`))throw new Error('Incorrect production canonical: '+file);
  if(html.includes('.chatgpt.site')||/ATOCODE|Nawri|Sitevation|Websitovation/i.test(html))throw new Error('Obsolete public identity: '+file);
}
for(const file of ['dist/brand/logo-primary.svg','dist/brand/og-cover.png','dist/assets/site.js','dist/assets/site.css','dist/robots.txt','dist/sitemap.xml']){
  if(!(await stat(new URL('./'+file,import.meta.url))).size)throw new Error('Missing production asset: '+file);
}
const robots=await readFile(new URL('./dist/robots.txt',import.meta.url),'utf8');
if(!robots.includes(origin+'/sitemap.xml'))throw new Error('Incorrect sitemap origin');
console.log('Digits Studio production assets and canonical URLs verified.');
