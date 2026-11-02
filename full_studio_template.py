"""Homepage presentation layer; existing bilingual data and actions stay authoritative."""
from bs4 import BeautifulSoup
from bs4.formatter import HTMLFormatter
from bs4.dammit import EntitySubstitution

class SourceOrderFormatter(HTMLFormatter):
    def attributes(self, tag):
        return tag.attrs.items()

SYMBOL='M8 8H58C88 8 110 30 110 60S88 112 58 112H8V66H34V86H58C73 86 84 75 84 60S73 34 58 34H8Z'

def restyle_studio(page, ar=False):
    soup=BeautifulSoup(page,'html.parser')
    soup.body['class']=soup.body.get('class',[])+['full-studio']
    for name,selector in [('work','#work'),('services','#services'),('studio','#studio'),('process','.process'),('questions','.questions'),('contact','#contact'),('footer','.footer')]:
        soup.select_one(selector)['data-studio-section']=name
    filters=soup.select_one('#work .project-filters')
    toolbar=soup.new_tag('div',attrs={'class':'work-toolbar'})
    filters.wrap(toolbar)
    toolbar.append(soup.select_one('#project-filter-status').extract())
    for index,grid in enumerate(soup.select('#services .service-project-grid')):
        title=grid.find_parent('details').select_one('.service-title').get_text(strip=True)
        viewport=soup.new_tag('div',attrs={'class':'service-reel-viewport','role':'region','aria-label':title+(' / أمثلة أعمال' if ar else ' / project examples')})
        grid.wrap(viewport)
        controls=soup.new_tag('div',attrs={'class':'service-reel-controls','hidden':''})
        hint=soup.new_tag('p');hint.string='اسحب لاستكشاف الأعمال' if ar else 'Drag to explore the work';controls.append(hint)
        for direction in ['prev','next']:
            label=('المشاريع السابقة' if direction=='prev' else 'المشاريع التالية') if ar else ('Previous projects' if direction=='prev' else 'Next projects')
            button=soup.new_tag('button',attrs={'type':'button','data-reel-direction':direction,'aria-label':label+' / '+title})
            icon=soup.new_tag('span',attrs={'aria-hidden':'true'});icon.string=('→' if direction=='prev' else '←') if ar else ('←' if direction=='prev' else '→');button.append(icon);controls.append(button)
        viewport.insert_after(controls)
    studio=soup.select_one('#studio')
    art=BeautifulSoup('<div class="studio-sigil" aria-hidden="true"><div class="studio-sigil-ring"></div><svg viewBox="0 0 120 120" fill="currentColor"><path d="'+SYMBOL+'"/></svg></div>','html.parser')
    studio.append(art.div)
    line=BeautifulSoup('<div class="process-connector" aria-hidden="true"><span></span></div>','html.parser')
    soup.select_one('.process .steps').insert_before(line.div)
    for selector in ['#work .section-intro h2','#services .section-intro h2','#contact .contact-copy h2']:
        heading=soup.select_one(selector)
        fragments=heading.decode_contents().replace('<br/>','<br>').split('<br>')
        heading.clear()
        for text in fragments:
            outer=soup.new_tag('span',attrs={'class':'studio-title-mask'})
            inner=soup.new_tag('span',attrs={'class':'studio-title-line'})
            for child in list(BeautifulSoup(text,'html.parser').contents):inner.append(child)
            outer.append(inner);heading.append(outer)
    return soup.decode(formatter=SourceOrderFormatter(entity_substitution=EntitySubstitution.substitute_xml))
