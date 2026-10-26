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
    elif slug=='dar-saha':
        body=f'<path d="M18 105V17H102V105H78V61C78 35 42 35 42 61V105Z" fill="none" stroke="{color}" stroke-width="7"/><path d="M60 13V25M14 61H26M94 61H106" stroke="{color}" stroke-width="5"/>'
    elif slug=='paceform':
        body=f'<path d="M12 33H51L34 87H-5Z M70 33H109L92 87H53Z" transform="translate(8 0)" fill="{color}"/>'
    else:
        body=f'<ellipse cx="60" cy="61" rx="32" ry="46" transform="rotate(30 60 61)" fill="{color}"/><path d="M35 94L86 25" fill="none" stroke="{bg}" stroke-width="3"/><ellipse cx="61" cy="63" rx="8" ry="14" transform="rotate(30 61 63)" fill="{bg}"/>'
    return f'<g transform="translate({x} {y}) scale({size/120})">{body}</g>'
def logo(slug,b,color,bg):
    if slug=='fornaya':
        return mark(slug,20,42,155,color,bg)+text('fornaya',195,54,139,color,'Archivo',850,maxw=575)+text(b['arName'],480,206,42,color,'Arabic',600,'center')
    if slug=='dar-saha':
        return mark(slug,28,71,165,color,bg)+text('Dar Saha',245,65,108,color,'Fraunces',500,maxw=530)+text(b['arName'],510,230,35,color,'Arabic',600,'center')
    if slug=='paceform':
        return mark(slug,18,60,145,color,bg)+text('paceform',190,74,111,color,'Archivo',850,maxw=580)+text(b['arName'],480,227,33,color,'Arabic',600,'center')
    return mark(slug,42,98,150,color,bg)+text('RIWA',475,30,106,color,'Fraunces',500,'center')+text('GROVE',475,147,73,color,'Fraunces',500,'center')+text(b['arName'],475,250,34,color,'Arabic',600,'center')
def placed_logo(slug,b,x,y,width,color=None,bg=None):
    return f'<g transform="translate({x} {y}) scale({width/800})">'+logo(slug,b,color or b['dark'],bg or b['light'])+'</g>'
def photo(file,x,y,w,h):
    out=BytesIO();Image.open(file).convert('RGB').save(out,format='JPEG',quality=88)
    data=base64.b64encode(out.getvalue()).decode()
    return f'<image x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice" xlink:href="data:image/jpeg;base64,{data}"/>'
def rect(w,h,color):return f'<rect width="{w}" height="{h}" fill="{color}"/>'

