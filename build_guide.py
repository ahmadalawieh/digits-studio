from pathlib import Path
from io import BytesIO
import shutil,json
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as RLFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT=Path(__file__).resolve().parent;B=ROOT/'dist'/'brand';OUT=ROOT/'output'/'pdf'
G='#292A32';Y='#FFDA46';L='#B4A6ED';M='#EEEDF2';W='#FFFFFF'
for name,fam,w in [('Body','InstrumentSans',450),('Bold','InstrumentSans',700),('Display','Archivo',780)]:
    font=TTFont(ROOT/'dist'/'assets'/'fonts'/(fam+'.ttf'))
    axes={a.axisTag:a.defaultValue for a in font['fvar'].axes};axes['wght']=w
    font=instantiateVariableFont(font,axes,inplace=False);bio=BytesIO();font.save(bio);bio.seek(0);pdfmetrics.registerFont(RLFont(name,bio))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
PW,PH=960,600;c=canvas.Canvas(str(OUT/'digits-studio-brand-guide.pdf'),pagesize=(PW,PH));c.setTitle('Digits Studio / Brand guide');c.setAuthor('Digits Studio / Ahmad Alawieh');page_no=0
def box(x,y,w,h,color):c.setFillColor(HexColor(color));c.rect(x,PH-y-h,w,h,fill=1,stroke=0)
def text(s,x,y,size=18,font='Body',color=G):c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,PH-y-size,s)
def para(s,x,y,width,size=16,color=G):
    style=ParagraphStyle('p',fontName='Body',fontSize=size,leading=size*1.5,textColor=HexColor(color),spaceAfter=0)
    p=Paragraph(s,style);w,h=p.wrap(width,PH);p.drawOn(c,x,PH-y-h);return h
def asset(name,x,y,width,maxh=999):
    d=svg2rlg(str(B/(name+'.svg')));scale=min(width/d.width,maxh/d.height);c.saveState();c.translate(x,PH-y-d.height*scale);c.scale(scale,scale);renderPDF.draw(d,c,0,0);c.restoreState()
def page(title,sub='',bg=W):
    global page_no
    page_no+=1;box(0,0,PW,PH,bg);text('Digits Studio / Brand guide',48,25,11,'Bold');text(f'{page_no:02d}',885,25,11,'Bold');text(title,48,78,43,'Display')
    if sub:para(sub,50,140,830,15)
def end():c.showPage()
page('Make your mark.','Brand identity and launch toolkit / 22 October 2026',Y);asset('logo-primary',100,245,760);text('Branding. Websites. Marketing.',50,535,18,'Bold');end()
page('A clear direction.','A founder-led digital studio in Beirut, for businesses in Lebanon and beyond.')
text('What we stand for',50,210,23,'Bold');para('Bring a business\'s identity, website and marketing into one clear direction. Make the offer understandable and the next step easy.',50,252,380,20)
text('How we show up',510,210,23,'Bold');para('Direct, capable and approachable. Speak plainly. Show the work. Explain the scope. Make it easy to talk to the person doing the project.',510,252,390,20)
box(50,430,860,96,M);para('<b>Brand line:</b> Make your mark.<br/><b>Descriptor:</b> Branding, websites and marketing.<br/><b>Founder:</b> Ahmad Alawieh.',72,445,810,16);end()
page('The logo family.','Use the solid primary logo for everyday work. Reserve the outline edition for larger applications.')
box(50,200,550,186,Y);asset('logo-primary',90,232,470,125);box(620,200,290,186,G);asset('logo-white',650,250,230,100)
box(50,406,550,138,M);asset('logo-display',110,422,410,110);box(620,406,130,138,Y);asset('symbol',645,433,80,80);box(770,406,140,138,G);asset('symbol-white',800,433,80,80);end()
page('Give it room.','One consistent identity, from an Instagram avatar to a proposal.')
c.setStrokeColor(HexColor('#A6A4AD'));c.setDash(4,4);c.rect(70,PH-200-205,570,205,fill=0,stroke=1);c.setDash();asset('logo-primary',100,235,510)
para('Leave at least one quarter of the symbol\'s width clear on every side. Keep the logo away from text, trim lines and busy photography.',700,207,205,15)
para('<b>Primary logo:</b> minimum 150 px on screen; use the symbol when the descriptor becomes difficult to read.<br/><br/><b>Symbol:</b> minimum 24 px; retain its open gap.<br/><br/><b>Outline edition:</b> minimum 400 px. Use solid masters for small print.',75,455,800,15);end()
page('Colour with purpose.','Yellow makes the introduction. Graphite carries the message. White gives the work room.')
palette=[('Signal yellow',Y),('Graphite',G),('White',W),('Quiet grey',M),('Lilac',L)]
for i,(name,v) in enumerate(palette):
    x=50+i*174;box(x,215,156,175,v);text(name,x,410,15,'Bold');text(v,x,438,14)
para('Use graphite text on yellow, lilac, grey or white. Use white or yellow text on graphite. Do not use yellow body text on white. Lilac is a secondary campaign colour, not a second logo identity.',50,490,840,15);end()
page('Type that speaks clearly.','Licensed font files and their SIL Open Font License documents are supplied in assets/fonts/.')
text('Archivo',50,210,56,'Display');para('Headlines and the wordmark. Strong, compact and direct. Use weight 700-850 for the largest statements.',50,290,390,17)
text('Instrument Sans',510,218,37,'Body');para('Reading, navigation and contact details. Use regular and medium weights, with generous line spacing and short paragraphs.',510,290,390,17)
box(50,417,860,112,M);para('<b>Arabic:</b> Noto Sans Arabic. Arabic website pages use right-to-left layouts, logical spacing and room for the script to breathe.<br/><br/>Logo SVG masters contain outlined paths. The separate live-text alternative needs the supplied fonts installed.',72,436,810,15);end()
page('A mark that does the work.','The original open D supplies a recognisable frame and shape across the identity.')
asset('symbol',60,215,250);asset('pattern',390,205,240,260);box(690,205,220,260,G);asset('symbol-yellow',720,250,160)
para('Keep the opening clear. Crop the symbol boldly in large compositions, but leave the complete logo intact in the signature. Do not stretch it, add gradients, invent 3D effects or place it on low-contrast backgrounds.',50,492,840,16);end()
page('In your pocket.','Business card artwork: 85 x 55 mm trim, plus 3 mm bleed on all sides. Two-page vector PDF proof included.')
asset('business-card-front',50,220,415);asset('business-card-back',495,220,415)
para('The cards use Ahmad\'s actual contact details and a WhatsApp QR with a quiet zone. Leave important content inside the 5 mm trim-safe area. The print proof is RGB: ask your printer to confirm paper, CMYK conversion and final colour before production.',50,510,840,14);end()
page('Show up consistently.','Six portrait feed posts, a square launch post, three stories and a LinkedIn cover are included.')
for i,name in enumerate(['post-01-launch','post-02-branding','post-03-websites','post-04-marketing']):asset(name,50+i*220,200,200,270)
para('Portrait feed: 1080 x 1350. Stories: 1080 x 1920. LinkedIn: 1584 x 396. Use the local social editor to update a headline and export a fresh PNG. Bilingual captions and a content calendar are supplied separately.',50,503,840,15);end()
page('Say something useful.','Be confident, specific and human. Make the next step clear.')
text('Use',50,215,25,'Bold');para('"Tell Ahmad what you are building."<br/><br/>"Branding, websites and marketing."<br/><br/>"A website that helps people understand your offer and get in touch."',50,265,380,20)
text('Leave out',510,215,25,'Bold');para('Unsupported growth promises, invented metrics, stock testimonials and claims of a large team.<br/><br/>The supplied portfolio is previous web work by Ahmad, before the Digits Studio launch.',510,265,390,19);end()
page('A website that connects.','A responsive English and Arabic site with real project previews and direct contact paths.')
box(50,205,860,125,Y);text('Make your mark.',76,224,48,'Display');text('Branding. Websites. Marketing.',78,294,17,'Bold')
para('<b>Visitor journey:</b> introduction, selected work, services, founder, process, practical questions and project inquiry.<br/><br/><b>Inquiry behaviour:</b> prepare and review a message, then open WhatsApp or email. Nothing is sent automatically by the website.<br/><br/><b>Language:</b> English at / and Arabic at /ar/. Local fonts; no analytics or advertising pixels included.',50,370,840,17);end()
page('Ready for the next chapter.','Keep these practical decisions with the identity as it moves into use.')
para('<b>Use the name consistently:</b> Digits Studio, singular. Arabic supporting name: see launch-copy.md for correctly shaped live Arabic text.<br/><br/><b>Files:</b> SVG for vectors; transparent PNG for everyday use; supplied PDFs for print review. SVG colours are editable flat fills. Outlined text is not native editable text; use source scripts or the social editor for copy changes.<br/><br/><b>Contact:</b> Ahmad Alawieh / +961 70 332 361 / ahmad.alawieh77@gmail.com / digitsstudio.online.<br/><br/><b>Name status:</b> approved by Ahmad for this design work; not legally cleared. Ahmad purchased digitsstudio.online for the public launch. Trademark rights and social handles remain separate from domain ownership. See strategy.md for research links.<br/><br/><b>Launch:</b> complete the contact and content checks, select your channels, and use the supplied 30-day plan. These files do not schedule or publish social posts.',50,205,840,16)
end();c.save()
for file in OUT.glob('*.pdf'):shutil.copy2(file,B/file.name)
print('12-page vector brand guide and downloadable print PDFs ready.')
