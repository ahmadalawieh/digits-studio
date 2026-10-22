from pathlib import Path
from io import BytesIO
import json, shutil, html, sys
import qrcode
from PIL import ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg

ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'; BRAND=DIST/'brand'; FONT=DIST/'assets'/'fonts'
for p in [BRAND,FONT,ROOT/'output'/'pdf']: p.mkdir(parents=True,exist_ok=True)
SOURCE=FONT
for family in ['Archivo','InstrumentSans','NotoSansArabic']:
    for ext in ['.ttf','-OFL.txt']:
        src=SOURCE/(family+ext);dest=FONT/(family+ext)
        if src.resolve()!=dest.resolve():shutil.copy2(src,dest)
Y='#FFDA46'; G='#292A32'; W='#FFFFFF'; M='#EEEDF2'; L='#B4A6ED'
CACHE={}
def outlined(text,size=100,color=G,family='Archivo',weight=800,tracking=0):
    key=(family,weight)
    if key not in CACHE:
        f=TTFont(FONT/(family+'.ttf'))
        if 'fvar' in f: f=instantiateVariableFont(f,{'wght':weight},inplace=False)
        stream=BytesIO();f.save(stream);stream.seek(0)
        CACHE[key]=(f,ImageFont.truetype(stream,1000))
    font,pil=CACHE[key]; glyphs=font.getGlyphSet(); cmap=font.getBestCmap();s=size/font['head'].unitsPerEm
    paths=[];bounds=[]
    for i,ch in enumerate(text):
        x=(pil.getlength(text[:i+1])-pil.getlength(ch))/1000*size+i*tracking
        glyph=glyphs[cmap[ord(ch)]];tr=(s,0,0,-s,x,0)
        pen=SVGPathPen(glyphs);glyph.draw(TransformPen(pen,tr))
        bp=BoundsPen(glyphs);glyph.draw(TransformPen(bp,tr))
        if bp.bounds: bounds.append(bp.bounds)
        if pen.getCommands(): paths.append('<path d="'+pen.getCommands()+'"/>')
    left=min(b[0] for b in bounds);top=min(b[1] for b in bounds);right=max(b[2] for b in bounds);bottom=max(b[3] for b in bounds)
    return f'<g fill="{color}" transform="translate({-left:.3f} {-top:.3f})">'+''.join(paths)+'</g>',right-left,bottom-top
def label(text,x,y,size=30,color=G,weight=500,family='InstrumentSans',tracking=0):
    body,_,_=outlined(text,size,color,family,weight,tracking)
    return f'<g transform="translate({x} {y})">{body}</g>'
def svg(w,h,body,title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><title>{html.escape(title)}</title>{body}</svg>'
# Original flat open D. Its left opening survives small-format use.
DP='M8 8H58C88 8 110 30 110 60S88 112 58 112H8V66H34V86H58C73 86 84 75 84 60S73 34 58 34H8Z'
def mark(color=G,x=0,y=0,size=120): return f'<path fill="{color}" d="{DP}" transform="translate({x} {y}) scale({size/120})"/>'
def logo(color=G,display=False):
    word,ww,wh=outlined('IGITS',146,color,weight=850,tracking=1.5)
    desc,dw,dh=outlined('STUDIO',25,color,'InstrumentSans',700,6)
    width=132+ww;body=mark(color,0,0,120)+f'<g transform="translate(132 8)">{word}</g>'
    if display:
        body=body.replace(f'fill="{color}"',f'fill="none" stroke="{color}" stroke-width="3.5" stroke-linejoin="round"')
    body+=f'<g transform="translate({(width-dw)/2} 138)">{desc}</g>'
    return svg(round(width+8,3),168,body,'Digits Studio '+('outline display logo' if display else 'primary logo'))
def write(name,w,h,body,title=None): (BRAND/(name+'.svg')).write_text(svg(w,h,body,title or name.replace('-',' ')),encoding='utf-8')
def logo_at(x,y,w,color=G,display=False):
    import xml.etree.ElementTree as ET
    el=ET.fromstring(logo(color,display));vw,vh=float(el.get('width')),float(el.get('height'))
    el.set('x',str(x));el.set('y',str(y));el.set('width',str(w));el.set('height',str(w*vh/vw))
    return ET.tostring(el,encoding='unicode')
for name,color,display in [('logo-primary',G,False),('logo-black','#000000',False),('logo-white',W,False),('logo-yellow',Y,False),('logo-display',G,True),('logo-display-white',W,True)]:
    (BRAND/(name+'.svg')).write_text(logo(color,display),encoding='utf-8')
for name,color in [('symbol',G),('symbol-black','#000000'),('symbol-white',W),('symbol-yellow',Y)]: write(name,120,120,mark(color),'Digits Studio D symbol')
word,ww,wh=outlined('Digits Studio',80,G,weight=750)
write('logo-simple',ww+8,wh+8,f'<g transform="translate(4 4)">{word}</g>','Digits Studio simple wordmark')
live=svg(760,200,'<text x="20" y="116" font-family="Archivo" font-size="130" font-weight="850" fill="'+G+'">DIGITS</text><text x="225" y="172" font-family="Instrument Sans" font-size="29" letter-spacing="9" fill="'+G+'">STUDIO</text>','Digits Studio live text alternative; install included fonts')
(BRAND/'logo-live-text.svg').write_text(live,encoding='utf-8')
write('avatar',1080,1080,f'<rect width="1080" height="1080" rx="230" fill="{Y}"/>'+mark(G,210,210,660),'Digits Studio social avatar')
write('favicon',64,64,f'<rect width="64" height="64" rx="14" fill="{Y}"/>'+mark(G,8,8,48),'Digits Studio favicon')
write('pattern',1080,1080,f'<rect width="1080" height="1080" fill="{Y}"/>'+''.join(mark(G,x,y,180) for y in range(35,1035,210) for x in range(35,1035,210)),'Digits Studio repeating D pattern')

# Small editorial devices are all derived from the D, not stock symbols.
def post(name,lines,foot,bg=Y,fg=G,kind='headline'):
    body=f'<rect width="1080" height="1350" fill="{bg}"/>'+logo_at(72,64,295,fg)
    if kind=='mark':
        body+=mark(fg,510,270,580)
        for i,line in enumerate(lines):body+=label(line,72,885+i*116,96,fg,800,'Archivo')
    else:
        for i,line in enumerate(lines):body+=label(line,72,340+i*145,118 if len(line)<15 else 93,fg,800,'Archivo')
        body+=mark(fg,850,1050,155)
    body+=label(foot,74,1178,31,fg,500)+label('Branding. Websites. Marketing.',74,1247,26,fg,500)+label('digitsstudio.online',74,1297,23,fg,500)
    write(name,1080,1350,body,'Digits Studio '+name.replace('-',' '))
post('post-01-launch',['Make','your mark.'],'Introducing Digits Studio.',kind='mark')
post('post-02-branding',['More than','a logo.'],'A voice. A look. A reason to remember.',M)
post('post-03-websites',['A website','with a job','to do.'],'Help people understand. Then act.',G,W)
post('post-04-marketing',['Say the','right thing.','Reach further.'],'Content and campaigns with a clear purpose.',L)
post('post-05-bilingual',['Two languages.','One clear','message.'],'English and Arabic, considered together.',Y)
post('post-06-founder',['Small studio.','Direct','connection.'],'Meet Ahmad Alawieh, founder.',W)
for i,(headline,sub,bg,fg) in enumerate([('Make your mark.','Branding. Websites. Marketing.',Y,G),('Ready for a fresh start?','Tell us what you are building.',G,W),('From Lebanon. For what is next.','Meet Digits Studio.',L,G)],1):
    words=headline.split();lines=[];line=''
    for w in words:
        if len(line+' '+w)>15:lines.append(line);line=w
        else:line=(line+' '+w).strip()
    if line:lines.append(line)
    body=f'<rect width="1080" height="1920" fill="{bg}"/>'+logo_at(86,180,335,fg)+mark(fg,510,480,600)
    for j,line in enumerate(lines):body+=label(line,86,1080+j*130,105,fg,800,'Archivo')
    body+=label(sub,86,1640,29,fg,500)+label('WhatsApp +961 70 332 361',86,1710,28,fg,500)+label('digitsstudio.online',86,1770,28,fg,500)
    write(f'story-0{i}',1080,1920,body,'Digits Studio social story')
write('linkedin-cover',1584,396,f'<rect width="1584" height="396" fill="{Y}"/>'+logo_at(330,77,375)+label('Make your mark.',850,96,68,G,800,'Archivo')+label('Branding. Websites. Marketing.',854,229,28)+label('digitsstudio.online',854,300,24)+mark(G,1395,292,92),'Digits Studio LinkedIn cover')
write('social-square',1080,1080,f'<rect width="1080" height="1080" fill="{Y}"/>'+logo_at(110,300,860)+label('Make your mark.',305,688,50,G,750,'Archivo'),'Digits Studio square launch post')
write('og-cover',1200,630,f'<rect width="1200" height="630" fill="{Y}"/>'+logo_at(70,65,330)+label('Make',70,250,104,G,800,'Archivo')+label('your mark.',70,370,104,G,800,'Archivo')+mark(G,820,240,300)+label('Branding. Websites. Marketing.',73,548,27,G,500),'Digits Studio social sharing cover')
qr=qrcode.QRCode(version=None,error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=10,border=4);qr.add_data('https://wa.me/96170332361');qr.make(fit=True)
matrix=qr.get_matrix();n=len(matrix)
qrbody=f'<rect width="{n}" height="{n}" fill="white"/>'+''.join(f'<rect x="{x}" y="{y}" width="1" height="1" fill="black"/>' for y,row in enumerate(matrix) for x,v in enumerate(row) if v)
write('whatsapp-qr',n,n,qrbody,'WhatsApp Ahmad Alawieh +961 70 332 361')

# Cards: trim 85x55mm; artwork 91x61mm includes 3mm bleed on each side.
def card_center(text,y,size,color=G,weight=500,family='InstrumentSans',tracking=0):
    body,width,_=outlined(text,size,color,family,weight,tracking)
    return f'<g transform="translate({455-width/2:.3f} {y})">{body}</g>'

def card_logo(y,width):
    import xml.etree.ElementTree as ET
    art=logo(Y);native_width=float(ET.fromstring(art).get('width'))
    body=art.split('>',1)[1].rsplit('</svg>',1)[0]
    return f'<g transform="translate({455-width/2} {y}) scale({width/native_width})">{body}</g>'

# Centre by visible letter bounds, so long contact lines and short captions share one axis.
# The complete mark remains untouched; a low-contrast enlargement supplies the front texture.
front=f'<rect width="910" height="610" fill="{G}"/>'
front+=mark('#3D3B34',93.625,-62.5,735)
front+=f'<rect x="64" y="64" width="782" height="482" rx="2" fill="none" stroke="#55565D" stroke-width="1.5"/>'
front+=f'<path d="M438 0H472V65H438Z M438 545H472V610H438Z" fill="{Y}"/>'
front+=card_logo(204,550)
front+=card_center('Make your mark.',398,30,W,550)
front+=card_center('Branding. Websites. Marketing.',468,23,Y,550)
front+=card_center('Beirut, Lebanon / Working worldwide',508,19,M,450)
write('business-card-front',910,610,front,'Digits Studio centred charcoal business card front; 3mm bleed')

back=f'<rect width="910" height="610" fill="{M}"/>'
back+=f'<path d="M425 0H485V49H425Z" fill="{Y}"/>'
back+=card_center('Ahmad Alawieh',95,48,G,750,'Archivo')
back+=card_center('Founder / Digits Studio',157,24,G,500)
back+=f'<rect x="410" y="192" width="90" height="3" fill="{Y}"/>'
back+=card_center('+961 70 332 361',206,30,G,550)
back+=card_center('ahmad.alawieh77@gmail.com',246,28,G,450)
back+=card_center('digitsstudio.online',286,32,G,650)
back+=card_center('Connect on WhatsApp',326,19,G,500)
back+=f'<g transform="translate(365 348) scale({180/n})">{qrbody}</g>'
write('business-card-back',910,610,back,'Digits Studio centred contact card with WhatsApp QR; 3mm bleed')
write('letterhead',794,1123,f'<rect width="794" height="1123" fill="{W}"/>'+logo_at(60,55,215)+f'<rect x="0" y="0" width="794" height="12" fill="{Y}"/>'+label('Digits Studio',60,1012,14,G,650)+label('+961 70 332 361',60,1040,12)+label('ahmad.alawieh77@gmail.com',270,1040,12)+label('Beirut, Lebanon',610,1040,12)+label('digitsstudio.online',60,1066,12),'Digits Studio blank A4 letterhead template')
write('proposal-cover',794,1123,f'<rect width="794" height="1123" fill="{Y}"/>'+logo_at(60,60,280)+mark(G,405,270,425)+label('The next',60,718,80,G,800,'Archivo')+label('chapter.',60,812,80,G,800,'Archivo')+label('Project proposal',62,953,25,G,600)+label('Prepared by Digits Studio',62,1010,16),'Digits Studio reusable A4 proposal cover')

tokens={'brand':'Digits Studio','tagline':'Make your mark.','website':'https://digitsstudio.online','colors':{'yellow':Y,'graphite':G,'white':W,'mist':M,'lilac':L},'fonts':{'display':'Archivo','body':'Instrument Sans','arabic':'IBM Plex Sans Arabic','arabicSocial':'Noto Sans Arabic'},'contact':{'name':'Ahmad Alawieh','phone':'+96170332361','email':'ahmad.alawieh77@gmail.com','whatsapp':'https://wa.me/96170332361'},'logo':{'minimumWidthPx':150,'minimumSymbolPx':24,'clearSpace':'one quarter of the symbol width','displayOutlineMinimumWidthPx':400}}
(BRAND/'brand-tokens.json').write_text(json.dumps(tokens,ensure_ascii=False,indent=2),encoding='utf-8')
(BRAND/'brand-tokens.css').write_text(':root{--digits-yellow:'+Y+';--digits-graphite:'+G+';--digits-white:'+W+';--digits-mist:'+M+';--digits-lilac:'+L+';--digits-display:"Archivo",sans-serif;--digits-body:"Instrument Sans",sans-serif;--digits-arabic:"IBM Plex Sans Arabic",sans-serif;}\n',encoding='utf-8')

def pdf_from_svgs(names,path,size):
    c=canvas.Canvas(str(path),pagesize=size);c.setTitle('Digits Studio / '+path.stem.replace('-',' '))
    for name in names:
        drawing=svg2rlg(str(BRAND/(name+'.svg')))
        sx=size[0]/drawing.width;sy=size[1]/drawing.height
        c.saveState();c.scale(sx,sy);renderPDF.draw(drawing,c,0,0);c.restoreState();c.showPage()
    c.save()
    if names==['business-card-front','business-card-back']:
        from pypdf import PdfReader,PdfWriter
        from pypdf.generic import RectangleObject
        reader=PdfReader(path);writer=PdfWriter()
        writer.clone_document_from_reader(reader)
        for page in writer.pages:
            page.trimbox=RectangleObject([3*mm,3*mm,88*mm,58*mm])
            page.bleedbox=RectangleObject([0,0,91*mm,61*mm])
        buffer=BytesIO();writer.write(buffer);path.write_bytes(buffer.getvalue())
pdf_from_svgs(['business-card-front','business-card-back'],ROOT/'output'/'pdf'/'business-cards-print-proof.pdf',(91*mm,61*mm))
if '--cards-only' not in sys.argv:
    pdf_from_svgs(['letterhead'],ROOT/'output'/'pdf'/'letterhead-a4.pdf',(210*mm,297*mm))
    pdf_from_svgs(['proposal-cover'],ROOT/'output'/'pdf'/'proposal-cover-a4.pdf',(210*mm,297*mm))
print('Vector identity, social artwork and '+('card print PDF' if '--cards-only' in sys.argv else 'three print PDFs')+' created.')
