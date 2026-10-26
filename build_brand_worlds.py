"""Original vector applications that use the exact identity masters throughout."""
from brand_drawing import *

def panel(x,y,w,h,color,r=0):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{color}"/>'
def line(x,y,x2,y2,color,width=2):return f'<path d="M{x} {y}H{x2}" stroke="{color}" stroke-width="{width}"/>' if y==y2 else f'<path d="M{x} {y}L{x2} {y2}" stroke="{color}" stroke-width="{width}"/>'
def bottle(b,x,y,scale=1):
    body=f'<defs><linearGradient id="glass"><stop stop-color="#15271B"/><stop offset=".36" stop-color="#3A5231"/><stop offset=".64" stop-color="#263E2A"/><stop offset="1" stop-color="#172B1D"/></linearGradient></defs><ellipse cx="130" cy="750" rx="126" ry="18" fill="#193f2c" opacity=".12"/><path d="M83 125V32H177V125Q180 154 211 182Q242 209 242 250V687Q242 735 199 735H61Q18 735 18 687V250Q18 209 49 182Q80 154 83 125Z" fill="url(#glass)"/><rect x="80" y="12" width="100" height="95" rx="10" fill="#14271B"/><path d="M39 255V678" stroke="#718263" stroke-width="8" opacity=".35"/><rect x="35" y="287" width="190" height="309" fill="{b['light']}"/>'
    body+=placed_logo('riwa-grove',b,47,315,162)
    body+=text('EXTRA VIRGIN',130,435,11,b['dark'],align='center')+text('OLIVE OIL',130,459,13,b['dark'],align='center')
    body+=line(66,508,194,508,b['dark'],1)+text('A place at your table.',130,529,10,b['dark'],align='center')+text('500 ml',130,562,13,b['dark'],align='center')
    return f'<g transform="translate({x} {y}) scale({scale})">{body}</g>'

for slug,b in DATA.items():
    folder=A/slug;dark=b['dark'];light=b['light'];accent=b['accent']
    if slug=='fornaya':
        cover=rect(1600,1100,light)+placed_logo(slug,b,70,55,680)
        cover+=photo(folder/'croissant.webp',1000,0,600,1100)
        cover+=f'<g transform="translate(115 365) rotate(-7 260 300)">'+panel(0,0,510,650,dark)+placed_logo(slug,b,45,95,420,light,dark)+mark(slug,170,340,180,light,dark)+text('Good mornings.',255,553,37,light,'Archivo',750,'center')+'</g>'
        cover+=f'<g transform="translate(635 450) rotate(6 150 240)">'+panel(0,0,300,475,'#FFFCF5')+text('The morning',28,38,35,dark,'Archivo',750)+text('menu.',28,85,55,dark,'Archivo',750)
        for i,(name,price) in enumerate([('Zaatar manoushe','4.50'),('Butter croissant','3.50'),('Flat white','4.00')]):cover+=text(name,28,205+i*65,18,dark)+text(price,270,205+i*65,18,dark,align='right')+line(28,240+i*65,270,240+i*65,dark,1)
        cover+='</g>'
        app=rect(1600,1000,dark)+text('A good morning,',80,65,100,light,'Archivo',800)+text('in every detail.',80,185,100,light,'Archivo',800)
        app+=f'<g transform="translate(100 400) rotate(-4)">'+panel(0,0,650,440,light)+placed_logo(slug,b,55,70,540)+text('Warm bread. Good company.',325,310,31,dark,align='center')+'</g>'
        app+=f'<g transform="translate(920 350) rotate(8)">'+panel(0,0,390,510,'#FFFCF5')+mark(slug,110,80,170,dark,light)+text('Take the',195,325,45,dark,'Archivo',800,'center')+text('good part.',195,390,45,dark,'Archivo',800,'center')+'</g>'
    elif slug=='riwa-grove':
        cover=rect(1600,1100,'#DCE4D6')+text('From grove',75,70,119,dark,'Fraunces',500)+text('to gathering.',75,212,119,dark,'Fraunces',500)+text('Riwa Grove',80,892,50,dark,'Fraunces',500)+text('Identity, packaging & digital',80,982,23,dark)
        cover+=bottle(b,860,250,1.02)+bottle(b,1225,375,.81)
        app=rect(1600,1000,light)+placed_logo(slug,b,65,65,590)+text('One considered system.',75,415,56,dark,'Fraunces',500)
        app+=panel(85,560,580,340,dark)+placed_logo(slug,b,150,620,450,light,dark)+bottle(b,930,80,1.05)
        for name,body in [('bottle-single',rect(900,1050,'#E7EBDD')+bottle(b,300,65,1.15)),('bottle-pair',rect(900,1050,'#E7EBDD')+bottle(b,100,180,.97)+bottle(b,510,145,1.01))]:write(folder,name,900,1050,body,b['name']+' original packaging visualization')
    elif slug=='dar-saha':
        cover=rect(1600,1100,dark)+placed_logo(slug,b,70,70,730,light,dark)
        for x in [90,340,590]:cover+=f'<path d="M{x} 1010V675C{x} 510 {x+210} 510 {x+210} 675V1010" fill="none" stroke="{light}" stroke-width="5" opacity=".35"/>'
        cover+=f'<g transform="translate(925 160) rotate(8 250 400)">'+panel(0,0,500,770,light)+mark(slug,165,90,170,dark,light)+text('Make room',250,355,58,dark,'Fraunces',500,'center')+text('for a slower day.',250,430,46,dark,'Fraunces',500,'center')+line(65,570,435,570,dark,1)+text('A considered welcome.',250,625,22,dark,align='center')+'</g>'
        app=rect(1600,1000,light)+photo(folder/'room.webp',850,0,750,1000)+text('A welcome,',70,65,93,dark,'Fraunces',500)+text('worth keeping.',70,177,83,dark,'Fraunces',500)
        app+=f'<g transform="translate(85 425) rotate(-4)">'+panel(0,0,620,380,dark)+placed_logo(slug,b,80,45,460,light,dark)+text('Room for a slower day.',310,280,29,light,align='center')+'</g>'
    else:
        cover=rect(1600,1100,dark)+text('FIND',75,80,225,'#FFFFFF','Archivo',850)+text('YOUR',75,325,225,'#FFFFFF','Archivo',850)+text('PACE.',75,570,225,'#FFFFFF','Archivo',850)
        cover+=mark(slug,1110,70,360,accent,dark)+text('Strength.',1100,615,50,'#FFFFFF','Archivo',750)+text('Mobility.',1100,685,50,'#FFFFFF','Archivo',750)+text('Your rhythm.',1100,755,50,'#FFFFFF','Archivo',750)+placed_logo(slug,b,76,944,500,'#FFFFFF',dark)
        app=rect(1600,1000,light)+photo(folder/'studio.webp',0,0,800,1000)+panel(845,65,680,870,dark)+text('YOUR WEEK.',895,130,69,'#FFFFFF','Archivo',850)+text('YOUR PACE.',895,220,69,'#FFFFFF','Archivo',850)
        for i,(day,title,time) in enumerate([('MON','Strength','07:30'),('TUE','Mobility','18:00'),('WED','Reformer','09:00')]):app+=text(day,900,415+i*140,21,'#FFFFFF')+text(title,900,457+i*140,41,'#FFFFFF','Archivo',750)+text(time,1450,457+i*140,27,'#FFFFFF',align='right')
    write(folder,'project-cover',1600,1100,cover,b['name']+' brand direction and original applications')
    write(folder,'brand-applications',1600,1000,app,b['name']+' identity applications')
    # Typography and logo system, rather than another photograph-heavy generic board.
    board=rect(1600,1000,light)+placed_logo(slug,b,75,65,690)+mark(slug,1160,65,270,dark,light)
    board+=text(b['tagline'] if 'tagline' in b else 'Good mornings. Made slowly.' if slug=='fornaya' else 'From grove to gathering.',80,440,65,dark,b['display'],b['logoWeight'],maxw=1410)
    board+=text(b['arHeadline'].replace('\n',' '),80,550,59,dark,'Arabic',600,maxw=1400)
    for i,(label,col) in enumerate([('Signature',dark),('Base',light),('Accent',accent)]):board+=panel(80+i*490,710,450,170,col)+text(label,90+i*490,914,22,dark)+text(col,360+i*490,914,22,dark)
    write(folder,'brand-board',1600,1000,board,b['name']+' original bilingual identity system')
    for i in range(1,4):
        w,h=1080,1350;fg=light if i!=2 else dark;bg=dark if i!=2 else light
        body=rect(w,h,bg)+placed_logo(slug,b,55,40,340,fg,bg)
        if slug=='fornaya':
            if i==1:body+=photo(folder/'croissant.webp',0,540,1080,810)
            if i==2:body+=mark(slug,670,640,350,dark,light)
            if i==3:body+=photo(folder/'manoushe.webp',70,580,940,620)
        elif slug=='riwa-grove':body+=bottle(b,680 if i==2 else 575,520,.95)+text('500 ml',70,1195,40,fg,'Fraunces',500)
        elif slug=='dar-saha':
            if i==2:body+=photo(folder/'room.webp',70,600,940,600)
            else:body+=mark(slug,650,750,330,fg,bg)
        else:
            body+=mark(slug,615,800,390,accent,bg)
            body+=text('MOVE / RESET / REPEAT',65,1155,30,fg,'Archivo',700,maxw=900)
        for j,title in enumerate(b['posts'][i-1][0].split('\n')):body+=text(title,65,250+j*119,102,fg,b['display'],b['logoWeight'],maxw=950)
        body+=text(b['posts'][i-1][1],65,520,25,fg,maxw=930)
        write(folder,f'post-0{i}',w,h,body,b['name']+' launch campaign creative')
    # Arabic campaign stories use the same distinctive composition and connected type.
    for i in [1,2]:
        fg=light if i==1 else dark;bg=dark if i==1 else light;body=rect(1080,1920,bg)+placed_logo(slug,b,65,65,380,fg,bg)
        for j,title in enumerate(b['stories'][i-1][0].split('\n')):body+=text(title,1000,430+j*175,135,fg,'Arabic',600,'right',930)
        body+=text(b['stories'][i-1][1],1000,900,34,fg,'Arabic',600,'right',930)+mark(slug,570,1210,430,fg,bg)
        write(folder,f'story-0{i}',1080,1920,body,b['name']+' Arabic campaign story')
    ad=rect(1200,628,dark)+placed_logo(slug,b,50,35,350,light,dark)
    ad+=text(b['campaignTitle'],55,260,70,light,b['display'],b['logoWeight'],maxw=1030)+text('Discover '+b['name'],60,500,27,light)
    write(folder,'campaign-ad',1200,628,ad,b['name']+' campaign banner')
print('Four original brand worlds, coherent application systems and distinct campaign layouts built.')
