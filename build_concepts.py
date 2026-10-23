from pathlib import Path
from io import BytesIO
import json,html,base64,csv
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
import qrcode
from PIL import Image

R=Path(__file__).resolve().parent;D=R/'dist';F=D/'assets/fonts';A=D/'assets/concepts'
DATA=json.loads((R/'concepts-content.json').read_text(encoding='utf-8'));CACHE={}
def esc(s):return html.escape(str(s),quote=True)
def text(s,x,y,size,color,family='InstrumentSans',weight=500,align='left',maxw=None):
    key=(family,weight)
    if key not in CACHE:
        path=F/('IBMPlexSansArabic-SemiBold.ttf' if family=='Arabic' else family+'.ttf')
        font=TTFont(path)
        if 'fvar' in font:
            axes={'wght':weight}
            if family=='Fraunces':axes.update({'opsz':72,'SOFT':20,'WONK':1})
            font=instantiateVariableFont(font,axes,inplace=False)
        out=BytesIO();font.save(out);raw=out.getvalue();hfont=hb.Font(hb.Face(raw));hfont.scale=(font['head'].unitsPerEm,)*2
        CACHE[key]=(font,hfont)
    font,hfont=CACHE[key];buf=hb.Buffer();buf.add_str(s);buf.guess_segment_properties();hb.shape(hfont,buf)
    gs=font.getGlyphSet();order=font.getGlyphOrder();scale=size/font['head'].unitsPerEm;cursor=0;paths=[];bounds=[]
    for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
        glyph=gs[order[info.codepoint]];tr=(scale,0,0,-scale,(cursor+pos.x_offset)*scale,-pos.y_offset*scale)
        pen=SVGPathPen(gs);glyph.draw(TransformPen(pen,tr));bp=BoundsPen(gs);glyph.draw(TransformPen(bp,tr))
        if bp.bounds:bounds.append(bp.bounds)
        if pen.getCommands():paths.append('<path d="'+pen.getCommands()+'"/>')
        cursor+=pos.x_advance
    left=min(v[0] for v in bounds);top=min(v[1] for v in bounds);right=max(v[2] for v in bounds);bottom=max(v[3] for v in bounds)
    w=right-left;ratio=min(1,maxw/w) if maxw else 1
    dx=x-(w*ratio/2 if align=='center' else w*ratio if align=='right' else 0)
    return f'<g fill="{color}" transform="translate({dx} {y}) scale({ratio}) translate({-left} {-top})">'+''.join(paths)+'</g>'
def svg(w,h,body,title):return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{esc(title)}</title>{body}</svg>'
def write(folder,name,w,h,body,title):
    (folder/(name+'.svg')).write_text(svg(w,h,body,title),encoding='utf-8')
def mark(slug,x,y,size,color,bg):
    if slug=='fornaya':
        body=f'<path d="M10 86V60C10 27 31 12 60 12S110 27 110 60V86Q110 103 93 103H27Q10 103 10 86Z" fill="{color}"/>'
        body+=''.join(f'<path d="M{v} 34L{v-12} 55" fill="none" stroke="{bg}" stroke-width="7" stroke-linecap="round"/>' for v in [39,65,91])
    else:
        body=f'<ellipse cx="60" cy="61" rx="32" ry="46" transform="rotate(30 60 61)" fill="{color}"/><path d="M35 94L86 25" fill="none" stroke="{bg}" stroke-width="3"/><ellipse cx="61" cy="63" rx="8" ry="14" transform="rotate(30 61 63)" fill="{bg}"/>'
    return f'<g transform="translate({x} {y}) scale({size/120})">{body}</g>'
def logo(slug,b,color,bg):
    if slug=='fornaya':
        return mark(slug,20,42,155,color,bg)+text('fornaya',195,54,139,color,'Archivo',850,maxw=575)+text(b['arName'],480,206,42,color,'Arabic',600,'center')
    return mark(slug,42,98,150,color,bg)+text('RIWA',475,30,106,color,'Fraunces',500,'center')+text('GROVE',475,147,73,color,'Fraunces',500,'center')+text(b['arName'],475,250,34,color,'Arabic',600,'center')
def placed_logo(slug,b,x,y,width,color=None,bg=None):
    return f'<g transform="translate({x} {y}) scale({width/800})">'+logo(slug,b,color or b['dark'],bg or b['light'])+'</g>'
def photo(file,x,y,w,h):
    out=BytesIO();Image.open(file).convert('RGB').save(out,format='JPEG',quality=88)
    data=base64.b64encode(out.getvalue()).decode()
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice" xlink:href="data:image/jpeg;base64,{data}"/>'
def rect(w,h,color):return f'<rect width="{w}" height="{h}" fill="{color}"/>'

for slug,b in DATA.items():
    folder=A/slug;folder.mkdir(exist_ok=True,parents=True);pack=D/'concepts'/slug;pack.mkdir(exist_ok=True,parents=True)
    for name,color,bg in [('logo-primary',b['dark'],b['light']),('logo-reverse',b['light'],b['dark'])]:write(folder,name,800,315 if slug!='fornaya' else 280,logo(slug,b,color,bg),b['name']+' original bilingual concept logo')
    write(folder,'symbol',120,120,mark(slug,0,0,120,b['dark'],b['light']),b['name']+' original concept symbol')
    packaging=folder/('packaging.webp' if slug=='fornaya' else 'hero.webp')
    board=rect(1600,1000,b['light'])+placed_logo(slug,b,70,45,630)
    board+=photo(packaging,780,40,780,690)
    board+=text(b['display'],70,355,74,b['dark'],b['display'],b['logoWeight'])+text('A familiar feeling. A distinct identity.' if slug=='fornaya' else 'Rooted in a generous table.',70,470,29,b['dark'],maxw=635)
    for i,(name,color) in enumerate([('Signature',b['dark']),('Base',b['light']),('Accent',b['accent'])]):
        x=70+i*215;board+=f'<rect x="{x}" y="555" width="188" height="145" fill="{color}" stroke="{b["dark"]}" stroke-width="1"/>'+text(name,x,727,22,b['dark'])+text(color,x,762,19,b['dark'])
    board+=mark(slug,85,830,95,b['dark'],b['light'])+text('Branding. Website. Launch campaign.',220,850,34,b['dark'])+text('Self-initiated concept by Digits Studio',220,913,22,b['dark'])
    write(folder,'brand-board',1600,1000,board,b['name']+' identity board / self-initiated concept')
    label=rect(600,900,b['light'])+placed_logo(slug,b,55,105,490)
    label+=text('Good mornings. Made slowly.' if slug=='fornaya' else 'Extra virgin olive oil',300,430,29,b['dark'],align='center',maxw=500)
    label+=text('صباحنا من الفرن' if slug=='fornaya' else 'من الزيتون إلى المائدة',300,512,34,b['dark'],'Arabic',600,'center',500)
    label+=mark(slug,240,630,120,b['dark'],b['light'])+text('Packaging concept / Digits Studio',300,817,20,b['dark'],align='center')
    write(folder,'packaging-label',600,900,label,b['name']+' editable packaging label concept')
    front=rect(910,610,b['dark'])+placed_logo(slug,b,130,155,650,b['light'],b['dark'])
    front+=text('Good mornings. Made slowly.' if slug=='fornaya' else 'Pour a little Lebanon.',455,455,32,b['light'],align='center')
    write(folder,'business-card-front',910,610,front,b['name']+' concept business card front')
    qr=qrcode.QRCode(box_size=1,border=4);qr.add_data('https://digitsstudio.online/projects/'+slug+'/');qr.make(fit=True);mat=qr.get_matrix();n=len(mat)
    qrbody=f'<rect width="{n}" height="{n}" fill="white"/>'+''.join(f'<rect x="{x}" y="{y}" width="1" height="1" fill="black"/>' for y,row in enumerate(mat) for x,value in enumerate(row) if value)
    back=rect(910,610,b['light'])+text(b['name'],455,80,55,b['dark'],b['display'],b['logoWeight'],'center')+text(b['arName'],455,165,35,b['dark'],'Arabic',600,'center')
    back+=f'<g transform="translate(355 235) scale({200/n})">{qrbody}</g>'+text('Explore the concept',455,470,26,b['dark'],align='center')+text('Self-initiated / Digits Studio',455,527,20,b['dark'],align='center')
    write(folder,'business-card-back',910,610,back,b['name']+' concept contact card with working case-study QR')
    assets=[]
    for i,(headline,sub) in enumerate(b['posts']+b['stories']+[[b['campaignTitle'],'Explore the concept collection.' if slug!='fornaya' else 'Build your morning.']],1):
        story=3<i<6;ad=i==6;w,h=(1200,628) if ad else (1080,1920) if story else (1080,1350)
        name=('post-0'+str(i)) if i<=3 else ('story-0'+str(i-3)) if story else 'campaign-ad'
        body=rect(w,h,b['dark'] if i in [2,5] else b['light']);fg=b['light'] if i in [2,5] else b['dark']
        body+=placed_logo(slug,b,65,45,300,fg,b['dark'] if i in [2,5] else b['light'])
        lines=headline.split('\n');font='Arabic' if story else b['display'];size=114 if story else 92 if not ad else 67
        start=350 if story else 260 if not ad else 205
        for j,line in enumerate(lines):body+=text(line,w-70 if story else 65,start+j*(size*1.45 if story else size*1.2),size,fg,font,600 if story else b['logoWeight'],'right' if story else 'left',w-135 if not ad else 545)
        body+=text(sub,w-70 if story else 68,start+len(lines)*size*1.55+30 if story else 525 if not ad else 390,30 if story else 25,fg,'Arabic' if story else 'InstrumentSans',500,'right' if story else 'left',w-135 if not ad else 520)
        if ad:body+=photo(folder/'hero.webp',650,0,550,628)
        else:body+=photo(folder/('croissant.webp' if slug=='fornaya' and i==2 else 'pour.webp' if slug!='fornaya' and i==2 else 'hero.webp'),65,970 if story else 650,w-130,690 if story else 570)
        body+=text('A Digits Studio concept',68,h-57,19,fg)
        write(folder,name,w,h,body,b['name']+' '+name+' / proposed campaign creative')
        assets.append({'name':name,'width':w,'height':h,'purpose':'Proposed campaign creative'})
    b['slug']=slug
    (pack/'brand.json').write_text(json.dumps(b,ensure_ascii=False,indent=2),encoding='utf-8')
    (pack/'asset-manifest.json').write_text(json.dumps({'brand':b['name'],'status':'Self-initiated fictional concept','campaignAssets':assets},ensure_ascii=False,indent=2),encoding='utf-8')
    with (pack/'campaign-plan.csv').open('w',encoding='utf-8-sig',newline='') as file:
        writer=csv.writer(file);writer.writerow(['Phase','Message','Deliverables','Proposed measure']);writer.writerows(b['plan'])
    captions=['# '+b['name']+' / proposed launch captions','Self-initiated fictional concept. No campaign has been run.','']
    for i,((en,_),(ar,_)) in enumerate(zip(b['posts'],b['stories']*2),1):captions += [f'## Post {i}',en.replace('\n',' '),b['intro'],'',ar.replace('\n',' '),b['arIntro'],'']
    (pack/'captions.md').write_text('\n'.join(captions),encoding='utf-8')
    (pack/'README.md').write_text(f'''# {b['name']}

A self-initiated, fictional portfolio concept by Digits Studio. No affiliation with an operating bakery, producer or shop is claimed. Names, products, prices and commercial stories are illustrative. Photography was created with the built-in image-generation tool. Campaigns are proposed creative, not reported performance. No client testimonials, awards or certifications are represented.

Deliverables: original outlined bilingual SVG logos and symbol, brand board, packaging label, concept business cards with a working case-study QR, 3 portrait posts, 2 Arabic stories, 1 landscape ad, PNG exports, bilingual captions, a four-week campaign plan, welcome-email preview and a functional website demo. The demo basket performs calculations locally and does not process payments, orders or personal data.

Website: https://digitsstudio.online/demos/{slug}/
Case study: https://digitsstudio.online/projects/{slug}/

Fonts: Archivo, Instrument Sans, IBM Plex Sans Arabic{', and Fraunces' if slug!='fornaya' else ''}, supplied under SIL OFL. SVG text is outlined; colours and paths are editable. Print artwork is a concept, not a printer-certified production file. Editable copy and artwork generators are included in the project source.
''',encoding='utf-8')

def head(title,description,canonical,lang='en',demo=False):
    return f'''<!doctype html><html lang="{lang}" dir="{'rtl' if lang=='ar' else 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title)}</title><meta name="description" content="{esc(description)}"><meta name="robots" content="{'noindex,follow' if demo else 'index,follow'}"><link rel="canonical" href="https://digitsstudio.online{canonical}"><link rel="icon" href="/brand/favicon.svg"><link rel="stylesheet" href="/assets/concepts/concepts.css"><meta property="og:title" content="{esc(title)}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image"><meta property="og:description" content="{esc(description)}"></head>'''
def theme(b):return f'--dark:{b["dark"]};--light:{b["light"]};--accent:{b["accent"]};--paper:{b["white"]};--ink:{b["ink"]};--display:{b["display"]}'
def image(slug,name,alt,cls='',lazy=True):return f'<img class="{cls}" src="/assets/concepts/{slug}/{name}" alt="{esc(alt)}" loading="{"lazy" if lazy else "eager"}" width="1536" height="1024">'

for slug,b in DATA.items():
    asset='/assets/concepts/'+slug+'/';pack='/concepts/'+slug+'/'
    email=head(b['name']+' / Concept welcome email','A proposed email creative by Digits Studio.',pack+'welcome-email.html',demo=True)
    email+=f'''<body class="email-preview" style="{theme(b)}"><main><p class="concept-label">Sample campaign email / not a sent campaign</p><div class="email-card"><img class="email-logo" src="{asset}logo-primary.png" width="240" alt="{b['name']}"><h1>{b['emailSubject']}</h1>{image(slug,'hero.webp',b['name']+' concept photography')}<p>{b['emailBody']}</p><a class="action" href="/demos/{slug}/#collection">{'Explore the morning menu' if slug=='fornaya' else 'Explore the collection'}</a><hr><p class="small">A fictional brand and proposed campaign created by Digits Studio. No subscription has been created and no email has been sent.</p><a href="/projects/{slug}/">Explore the case study</a></div></main></body></html>'''
    (D/'concepts'/slug/'welcome-email.html').write_text(email,encoding='utf-8')
    for ar in [False,True]:
        lang='ar' if ar else 'en';prefix='/ar' if ar else ''
        def t(en,arabic):return arabic if ar else en
        canonical=prefix+'/projects/'+slug+'/';directory=D/canonical.strip('/');directory.mkdir(parents=True,exist_ok=True)
        case=head(b['name']+' | '+t('Branding, website & campaign concept','تصوّر للهوية والموقع والحملة'),b['arBrief'] if ar else b['brief'],canonical,lang)
        case=case.replace('</head>',f'<meta property="og:image" content="https://digitsstudio.online{asset}brand-board.png"><meta property="og:url" content="https://digitsstudio.online{canonical}"><link rel="alternate" hreflang="en" href="https://digitsstudio.online/projects/{slug}/"><link rel="alternate" hreflang="ar" href="https://digitsstudio.online/ar/projects/{slug}/"></head>')
        case+=f'''<body class="case-page {slug}" style="{theme(b)}"><a class="skip" href="#case-main">{t('Skip to content','تخطي إلى المحتوى')}</a><header class="case-header"><a href="{prefix}/#work"><img src="/brand/logo-primary.svg" alt="Digits Studio" width="155" height="47"></a><nav><a href="#identity">{t('Identity','الهوية')}</a><a href="#website">{t('Website','الموقع')}</a><a href="#campaign">{t('Campaign','الحملة')}</a></nav><a class="lang" href="{'/projects/'+slug+'/' if ar else '/ar/projects/'+slug+'/'}">{t('عربي','EN')}</a></header>
<main id="case-main"><section class="case-hero"><div><p class="concept-label">{t('Self-initiated concept project','مشروع تصوّري بمبادرة من الاستوديو')}</p><h1><bdi>{b['name']}</bdi></h1><p class="case-kind">{b['arKind'] if ar else b['kind']}</p><p>{b['arBrief'] if ar else b['brief']}</p><div class="actions"><a class="action" href="/demos/{slug}/{'?lang=ar' if ar else ''}">{t('Explore the live demo','استكشف الموقع التجريبي')} ↗</a><a href="{pack}brand-kit.zip" download>{t('Download the project kit','تحميل ملفات المشروع')}</a></div></div>{image(slug,'packaging.webp' if slug=='fornaya' else 'hero.webp',t(b['name']+' concept packaging photography','تصوير تصوّري لتغليف '+b['arName']),'case-hero-image',False)}</section>
<section class="case-overview"><div><span>{t('The audience','الجمهور')}</span><p>{b['arAudience'] if ar else b['audience']}</p></div><div><span>{t('The scope','نطاق العمل')}</span><p>{t('Brand strategy, bilingual identity, packaging, website and launch campaign.','استراتيجية العلامة، وهوية ثنائية اللغة، وتغليف، وموقع، وحملة إطلاق.')}</p></div><div><span>{t('Project status','حالة المشروع')}</span><p>{t('Fictional brand. Original concept work by Digits Studio.','علامة خيالية وعمل تصوّري أصلي من ديجيتس ستوديو.')}</p></div></section>
<section class="case-section" id="identity"><div class="section-heading"><h2>{t('A feeling, made recognisable.','شعور يتحوّل إلى هوية.')}</h2><p>{b['arStrategy'] if ar else b['strategy']}</p></div>{image(slug,'brand-board.png',t(b['name']+' bilingual identity, colours and typography','هوية '+b['arName']+' وألوانها وخطوطها'),'board')}<div class="application-grid"><div class="logo-application">{image(slug,'logo-primary.svg',b['name']+' bilingual logo')}</div>{image(slug,'business-card-front.svg',t('Concept business card','بطاقة تصوّرية'))}{image(slug,'business-card-back.svg',t('Case-study QR contact card','بطاقة مع رمز للمشروع'))}</div><a class="text-link" href="{pack}brand-guide.html">{t('Open the identity guide','افتح دليل الهوية')} ↗</a></section>
<section class="case-section website-case" id="website"><div class="section-heading"><h2>{t('Made to be used.','تصميم للاستخدام الفعلي.')}</h2><p>{t('English and Arabic, category filters, product details and a working demo basket. A complete journey from first look to reviewing a selection.','لغتان، وفلاتر للفئات، وتفاصيل للمنتجات، وسلّة تجريبية تعمل. رحلة متكاملة من التصفّح إلى مراجعة الاختيارات.')}</p></div><div class="device-pair"><a class="desktop-shot" href="/demos/{slug}/{'?lang=ar' if ar else ''}"><span class="window-bar"><i></i><i></i><i></i><bdi>{b['name']} / website demo</bdi></span>{image(slug,'website-desktop.webp',t('Desktop website preview','معاينة الموقع على الكمبيوتر'))}</a><a class="phone-shot" href="/demos/{slug}/?lang=ar">{image(slug,'website-mobile.webp',t('Mobile website preview','معاينة الموقع على الهاتف'))}</a></div><div class="actions"><a class="action" href="/demos/{slug}/{'?lang=ar' if ar else ''}">{t('Try the website','جرّب الموقع')} ↗</a><p class="small">{t('Demo only. Prices are examples; no orders, payments or personal data are processed.','للتجربة فقط. الأسعار أمثلة، ولا تُعالَج طلبات أو مدفوعات أو بيانات شخصية.')}</p></div></section>
<section class="case-section" id="campaign"><div class="section-heading"><h2>{b['arCampaignTitle'] if ar else b['campaignTitle']}</h2><p>{b['arCampaignIdea'] if ar else b['campaignIdea']}</p></div><p class="concept-label">{t('Proposed launch campaign / no performance results claimed','حملة إطلاق مقترحة / دون ادّعاء نتائج أداء')}</p><div class="creative-grid">'''
        for i in range(1,4):case+=f'<figure><a href="{asset}post-0{i}.png" download>{image(slug,f"post-0{i}.png",t(f"Campaign post {i}",f"منشور الحملة {i}"))}</a><figcaption>{t("Feed creative","تصميم منشور")} / 1080 × 1350</figcaption></figure>'
        case+='</div><div class="campaign-extras">'
        for i in [1,2]:case+=f'<a href="{asset}story-0{i}.png" download>{image(slug,f"story-0{i}.png",t("Arabic campaign story","قصة للحملة بالعربية"))}</a>'
        case+=f'<a href="{asset}campaign-ad.png" download>{image(slug,"campaign-ad.png",t("Landscape campaign creative","تصميم إعلاني أفقي"))}</a></div><div class="campaign-plan"><div><h3>{t("A four-week rollout","خطة لأربعة أسابيع")}</h3><ol>'
        for phase,idea,deliverables,measure in (b['arPlan'] if ar else b['plan']):case+=f'<li><strong>{esc(phase)}</strong><span>{esc(idea)}</span><small>{esc(deliverables)}</small></li>'
        case+=f'''</ol></div><div><h3>{t('What we would measure','ما الذي سنقيسه؟')}</h3><p>{b['arMeasure'] if ar else b['measure']}</p><div class="actions vertical"><a class="action" href="{pack}welcome-email.html">{t('Preview the welcome email','معاينة رسالة الترحيب')} ↗</a><a href="{pack}campaign-plan.csv" download>{t('Download the campaign plan','تحميل خطة الحملة')}</a><a href="{pack}captions.md" download>{t('Download bilingual captions','تحميل النصوص باللغتين')}</a></div></div></div></section>
<section class="case-next"><h2>{t('A clear direction.<br>A complete presence.','توجّه واضح.<br>حضور متكامل.')}</h2><p>{t('Your business could have this level of care, from its first mark to the way it reaches people.','يمكن أن يحظى مشروعك بهذا القدر من الاهتمام، من الشعار الأول إلى طريقة الوصول إلى جمهوره.')}</p><div class="actions"><a class="action" href="{prefix}/#contact">{t('Talk about your project','لنتحدث عن مشروعك')}</a><a href="{pack}brand-kit.zip" download>{t('Download all concept assets','تحميل جميع ملفات المشروع')}</a></div></section></main><footer class="concept-footer"><a href="{prefix}/#work">Digits Studio / {t('Back to selected work','العودة إلى الأعمال')}</a><p>{t('Self-initiated fictional concept. Original identities and generated photography. No client relationship or campaign results are implied.','مشروع خيالي بمبادرة من الاستوديو. هويات أصلية وتصوير مولّد للمشروع. لا يُمثّل علاقة مع عميل أو نتائج حملة فعلية.')}</p></footer></body></html>'''
        (directory/'index.html').write_text(case,encoding='utf-8')
    guide=head(b['name']+' / Identity guide','Original concept identity and source downloads.',pack+'brand-guide.html',demo=True)
    guide+=f'''<body class="case-page {slug}" style="{theme(b)}"><header class="case-header"><a href="/projects/{slug}/">{b['name']} / Identity guide</a><a href="/">Digits Studio</a></header><main class="guide-main"><p class="concept-label">Self-initiated fictional concept</p><h1>{b['name']}</h1><p>{b['strategy']}</p>{image(slug,'brand-board.png',b['name']+' brand board','board',False)}<h2>One system, in two languages.</h2><p>{b['display']} provides the display voice. Instrument Sans provides clear reading text. IBM Plex Sans Arabic supports the Arabic experience without tracking or broken letter connections. All supplied fonts use SIL OFL licences.</p><div class="guide-downloads">'''
    for file,label in [('logo-primary.svg','Primary bilingual logo / SVG'),('logo-reverse.svg','Reverse logo / SVG'),('symbol.svg','Original symbol / SVG'),('packaging-label.svg','Concept packaging label / SVG'),('business-card-front.svg','Business card front / SVG'),('business-card-back.svg','Business card reverse / SVG'),('brand-board.png','Identity board / PNG')]:guide+=f'<a href="{asset}{file}" download>{label} ↓</a>'
    guide+=f'''</div><h2>Use it with care.</h2><p>Leave clear space at least one quarter of the symbol width. Keep small text in the darkest brand colour on a light background. Do not distort the mark. SVG type is outlined; edit copy in the source generator. Packaging and cards are concept artwork, not production-certified print files.</p><p>This is a fictional portfolio brand. Photography was generated for this project. Sample products, prices and campaign plans are illustrative.</p><a class="action" href="{pack}brand-kit.zip" download>Download the concept kit</a></main></body></html>'''
    (D/'concepts'/slug/'brand-guide.html').write_text(guide,encoding='utf-8')
    demo=head(b['name']+' | '+b['kind'],'A working fictional brand website demo by Digits Studio.','/demos/'+slug+'/',demo=True)
    def bi(en,ar,tag='span',attrs=''):return f'<{tag} data-en="{esc(en)}" data-ar="{esc(ar)}" {attrs}>{esc(en)}</{tag}>'
    demo+=f'''<body class="demo {slug}" style="{theme(b)}"><a class="skip" href="#demo-main">Skip to content</a><div class="demo-notice">{bi('A fictional brand, thoughtfully made by Digits Studio.','علامة خيالية صُمّمت بعناية من ديجيتس ستوديو.')}<a href="/projects/{slug}/">{bi('Explore the case study','استكشف المشروع')} ↗</a></div><header class="demo-header"><a href="#demo-main"><img class="demo-logo" src="{asset}logo-primary.svg" alt="{b['name']}" width="175" height="70"></a><nav><a href="#collection">{bi('The menu' if slug=='fornaya' else 'The collection','القائمة' if slug=='fornaya' else 'المجموعة')}</a><a href="#story">{bi('Our idea','الفكرة')}</a></nav><div class="demo-header-actions"><button class="demo-language" type="button" aria-label="Read in Arabic">عربي</button><button class="basket-open" type="button" aria-haspopup="dialog">{bi('Basket','السلّة')} <span class="basket-count">0</span></button></div></header>
<main id="demo-main"><section class="demo-hero"><div class="demo-hero-copy">{bi('A little time for the good part.' if slug=='fornaya' else 'Inspired by the Lebanese table.','وقت صغير لأجمل ما في اليوم.' if slug=='fornaya' else 'إلهام من المائدة اللبنانية.','p','class="demo-intro"')}{bi(b['headline'],b['arHeadline'],'h1')}{bi(b['intro'],b['arIntro'],'p')}<a class="action" href="#collection">{bi('Find your morning' if slug=='fornaya' else 'Explore the collection','اختر صباحك' if slug=='fornaya' else 'اكتشف المجموعة')} ↗</a></div><div class="demo-hero-photo">{image(slug,'hero.webp',b['name']+' concept photography','',False)}<span class="hero-stamp">{bi('Fresh perspective.\nFamiliar favourites.' if slug=='fornaya' else 'A considered\nplace at your table.','روح جديدة.\nنكهات مألوفة.' if slug=='fornaya' else 'مكان مدروس\nعلى مائدتك.')}</span></div></section>
<section class="demo-collection" id="collection"><div class="collection-heading"><div>{bi('What are you in the mood for?' if slug=='fornaya' else 'Choose your occasion.','ماذا تشتهي اليوم؟' if slug=='fornaya' else 'اختر مناسبتك.','h2')}{bi('A short menu. Plenty to look forward to.' if slug=='fornaya' else 'For the everyday pour, and the people you share it with.','قائمة مختصرة، وأسباب كثيرة لتنتظر الصباح.' if slug=='fornaya' else 'للتقديم اليومي، ولمن تشاركهم المائدة.','p')}</div>{bi('Sample prices in USD / demo basket','أسعار توضيحية بالدولار / سلّة تجريبية','p','class="small"')}</div><div class="product-filters" role="group" aria-label="Product categories">'''
    for i,(key,en,ar) in enumerate(b['categories']):demo+=f'<button type="button" data-filter="{key}" aria-pressed="{str(i==0).lower()}">{bi(en,ar)}</button>'
    demo+='</div><div class="product-grid">'
    for product in b['products']:
        demo+=f'''<article class="product-card" data-category="{product['category']}"><button class="product-photo" type="button" data-detail="{product['id']}" aria-label="View {product['name']}">{image(slug,product['image'],product['name'])}</button><div class="product-heading">{bi(product['name'],product['ar'],'h3')}<bdi class="product-price">${product['price']:.2f}</bdi></div>{bi(product['description'],product['arDescription'],'p')}<button class="add-product" type="button" data-add="{product['id']}">{bi('Add to basket','أضف إلى السلّة')} <span aria-hidden="true">+</span></button></article>'''
    demo+=f'''</div><p class="cart-feedback" role="status" aria-live="polite"></p></section>
<section class="demo-story" id="story">{image(slug,'packaging.webp' if slug=='fornaya' else 'pour.webp',b['name']+' editorial concept imagery')}<div>{bi(b['storyTitle'],b['arStoryTitle'],'h2')}{bi(b['story'],b['arStory'],'p')}<a class="text-link" href="/projects/{slug}/">{bi('See how the brand was made','اكتشف كيف صُمّمت العلامة')} ↗</a></div></section>
<section class="demo-email">{bi('Your next good morning.' if slug=='fornaya' else 'More room at the table.','صباح جميل آخر.' if slug=='fornaya' else 'مكان أوسع على المائدة.','h2')}{bi('See the welcome email created for this concept launch.','شاهد رسالة الترحيب المصمّمة لإطلاق هذا المشروع.','p')}<a class="action" href="{pack}welcome-email.html">{bi('Preview the welcome email','معاينة رسالة الترحيب')} ↗</a></section></main>
<footer class="demo-footer"><img src="{asset}logo-reverse.svg" alt="{b['name']}" width="230" height="90"><div><p>{b['name']} / {bi('A Digits Studio concept','تصوّر من ديجيتس ستوديو')}</p>{bi('A fictional brand. Product descriptions and prices are illustrative. No orders, payments or personal-data submissions are processed.','علامة خيالية. أوصاف المنتجات والأسعار توضيحية. لا تُعالَج طلبات أو مدفوعات أو بيانات شخصية.','p','class="small"')}<a href="/projects/{slug}/">{bi('Back to the case study','العودة إلى المشروع')}</a></div></footer>
<dialog id="basket-dialog" aria-labelledby="basket-title"><div class="modal-heading">{bi('Your demo basket','سلّتك التجريبية','h2','id="basket-title"')}<button class="dialog-close" type="button" aria-label="Close basket">×</button></div><div id="basket-items"></div><div class="basket-total"><strong>{bi('Total','المجموع')}</strong><bdi id="basket-total">$0.00</bdi></div><button id="review-order" class="action" type="button">{bi('Review demo order','مراجعة الطلب التجريبي')}</button><div id="order-review" hidden role="status">{bi('Your selection is ready to review. This is a concept demonstration; no order has been placed and no payment is taken.','اختياراتك جاهزة للمراجعة. هذه تجربة تصوّرية؛ لم يُنشأ طلب ولم تُحصّل دفعة.','p')}</div>{bi('Demo only / no checkout or fulfilment.','تجربة فقط / دون دفع أو تنفيذ طلبات.','p','class="small"')}</dialog>
<dialog id="product-dialog" aria-labelledby="product-dialog-title"><div class="modal-heading"><h2 id="product-dialog-title"></h2><button class="dialog-close" type="button" aria-label="Close product">×</button></div><div id="product-dialog-content"></div></dialog><script type="application/json" id="demo-data">{json.dumps(b,ensure_ascii=False).replace('</','<\\/')}</script><script src="/assets/concepts/demo.js" defer></script></body></html>'''
    directory=D/'demos'/slug;directory.mkdir(parents=True,exist_ok=True);(directory/'index.html').write_text(demo,encoding='utf-8')

print('Two bilingual concept identities, 12 campaign creatives, four case pages, two working demo pages, guides, emails and plans built.')
