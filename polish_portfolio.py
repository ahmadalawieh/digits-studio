"""Final editorial pass over generated HTML; keeps rebuilds repeatable."""
from pathlib import Path
import json,html,re
from bs4 import BeautifulSoup
R=Path(__file__).resolve().parent;D=R/'dist'
for slug in ['fornaya','riwa-grove','dar-saha','paceform']:
 p=D/'demos'/slug/'index.html';soup=BeautifulSoup(p.read_text(encoding='utf8'),'html.parser')
 css=soup.new_tag('link',rel='stylesheet',href='/assets/concepts/brand-experiences.css');
 if not soup.find('link',href='/assets/concepts/brand-experiences.css'):soup.head.append(css)
 for element in soup.select('.hero-stamp,.demo-intro'):element.decompose()
 for element in soup.select('.demo-notice [data-en]'):
  if 'fictional' in element.get('data-en',''):
   element['data-en']='Independent design concept by Digits Studio.';element['data-ar']='تصوّر مستقل من ديجيتس ستوديو.';element.string=element['data-en']
 if slug=='fornaya':
  soup.select_one('.demo-hero-photo img')['src']='/assets/concepts/fornaya/croissant.webp'
  title=soup.select_one('.collection-heading h2');title['data-en']='The morning menu.';title['data-ar']='قائمة الصباح.';title.string=title['data-en']
 if slug=='riwa-grove':
  soup.select_one('.demo-hero-photo img')['src']='/assets/concepts/riwa-grove/bottle-pair.webp'
 if slug=='dar-saha':
  hero=soup.select_one('.stay-hero');hero.insert(0,hero.find('img').extract())
 for footer in soup.select('.demo-footer'):
  note=footer.select_one('.small')
  if note:
   note['data-en']='Independent concept. Sample prices and interactions; no payments, reservations or orders. Reference photography is credited.'
   note['data-ar']='تصوّر مستقل بأسعار وتجارب توضيحية، دون دفع أو حجز أو طلبات فعلية. الصور المرجعية موثّقة.';note.string=note['data-en']
  credits=soup.new_tag('a',href='/photography-credits.html');credits.string='Photography credits / مصادر الصور';
  if not footer.find('a',href='/photography-credits.html'):footer.append(credits)
 # Replace the large email-preview sales section with a quiet useful footer link.
 for section in soup.select('.demo-email,.experience-end'):
  section['class']=['brand-footnote'];heading=section.find('h2')
  if heading:heading.decompose()
  paragraph=section.find('p')
  if paragraph:paragraph.decompose()
 p.write_text(str(soup),encoding='utf8')

credits=json.loads((R/'photography-credits.json').read_text(encoding='utf8'))
for slug in ['fornaya','riwa-grove','dar-saha','paceform']:
 (D/'concepts'/slug/'photography-credits.json').write_text(json.dumps([r for r in credits if r['brand']==slug],ensure_ascii=False,indent=2),encoding='utf8')
items=[]
for item in credits:
 author=re.sub('<[^>]+>','',item.get('authorHtml',item.get('author','')))
 items.append(f'<article><h2>{html.escape(item["brand"].replace("-"," ").title())}</h2><p>{html.escape(author)} / <a href="{html.escape(item["source"],quote=True)}">Source photograph</a> / <a href="{html.escape(item.get("licenseUrl","https://creativecommons.org/licenses/by-sa/2.0/"),quote=True)}">{html.escape(item["license"])}</a></p><p class="small">{html.escape(item["asset"])} — resized and converted to WebP. Reference imagery for a fictional concept; no association with the photographer, people, premises or original business is implied.</p></article>')
(D/'photography-credits.html').write_text('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Photography credits | Digits Studio</title><link rel="stylesheet" href="/assets/concepts/concepts.css"><style>body{background:#F8F8F4;color:#292A32}main{max-width:950px;margin:auto;padding:45px 24px}h1{font:650 48px/1.1 Archivo,sans-serif;letter-spacing:-.04em;margin:35px 0}h2{font:600 24px/1.3 InstrumentSans,sans-serif;margin:25px 0 15px}article{border-top:1px solid #ccc;margin:30px 0;padding-top:15px}p{overflow-wrap:anywhere}.small{margin-top:12px}</style></head><body><main><a href="/">Digits Studio</a><h1>Photography credits.</h1><p>Licensed reference photography accompanies original identities and vector applications. The concept brands are fictional. Photograph subjects are not represented as actual client premises, staff or products.</p>'''+''.join(items)+'''<p>Creative Commons photographs retain their stated licences. Photo credits and licence links are provided for the photographs, resized copies and photo-bearing compositions. Standalone original identity masters are supplied separately.</p></main></body></html>''',encoding='utf8')
print('Four branded demo experiences and photography credits prepared.')
