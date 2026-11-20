import random
from PIL import Image, ImageDraw, ImageFont
F='../../../public/fonts/DotGothic16.ttf'
MV='../../../mv/部長ここは地上です/'
W,H=1080,1920
NAVY=(20,22,64); YEL=(255,210,63); DARK=(10,8,20)
def font(s): return ImageFont.truetype(F,s)
def base():
    im=Image.new('RGB',(W,H),(13,11,36)); d=ImageDraw.Draw(im)
    random.seed(11)
    for _ in range(320):
        x,y=random.randrange(0,W,4),random.randrange(0,H,4)
        s=random.choice([4,4,8]); c=random.choice([(255,250,240),(180,190,255),YEL])
        d.rectangle([x,y,x+s-1,y+s-1],fill=c)
    return im
def ctext(d,t,y,size,fill,stroke=10):
    d.text((W/2,y),t,font=font(size),fill=fill,anchor='mm',stroke_width=stroke,stroke_fill=DARK)
def window(d,box,border=6):
    x0,y0,x1,y1=box
    d.rectangle(box,fill=(255,255,255)); d.rectangle([x0+border,y0+border,x1-border,y1-border],fill=DARK)
    d.rectangle([x0+border*2,y0+border*2,x1-border*2,y1-border*2],fill=NAVY)
def status(d):
    window(d,(20,612,392,780))
    d.text((48,646),'部長',font=font(42),fill=(255,255,255))
    d.text((146,656),'ぜっこうちょう',font=font(26),fill=(255,255,255))
    for i in range(5): d.rectangle([48+i*48,712,84+i*48,740],fill=(255,150,40))
    d.text((298,706),'MAX',font=font(34),fill=YEL)
    window(d,(816,612,1060,780))
    d.text((846,640),'TROUBLE',font=font(30),fill=(255,90,90))
    d.text((846,684),'999',font=font(64),fill=(255,255,255))
def msg(d,tag,lines):
    window(d,(24,1500,1056,1840))
    d.rectangle([48,1452,48+len(tag)*44+40,1512],fill=(110,90,10)); d.rectangle([54,1458,42+len(tag)*44+40,1506],fill=(60,48,0))
    d.text((68,1482),tag,font=font(40),fill=(255,240,180),anchor='lm')
    y=1600 if len(lines)==2 else 1670
    for l in lines:
        d.text((W/2,y),l,font=font(76),fill=YEL,anchor='mm'); y+=130
def title(d):
    ctext(d,'＼ 社畜あるある ／',200,60,(255,111,181),8)
    ctext(d,'部長、',330,130,YEL,12)
    ctext(d,'ここは地上です！',480,130,YEL,12)
def place(im,art,top=580,h=1100):
    im.paste(art,(0,top))
    d=ImageDraw.Draw(im); d.rectangle([0,top-12,W,top-1],fill=YEL); d.rectangle([0,top+h,W,top+h+11],fill=YEL)

# ① patrol: jacket art (部長が浮いて主人公が引っぱる)
im=base(); d=ImageDraw.Draw(im)
j=Image.open(MV+'thumbnail/J1_jacket_square.png').convert('RGB')
j=j.resize((1100,1100),Image.LANCZOS).crop((10,0,1090,1100))
place(im,j); title(d); status(d)
msg(d,'主人公',['「部長もなーー！！」'])
im.save('../サムネ_short01_patrol.png')

# ② ittoite: T2 (サムズアップ)
im=base(); d=ImageDraw.Draw(im)
t=Image.open(MV+'thumbnail/T2_thumb_bucho.png').convert('RGB')
s=1100/941; t=t.resize((round(1671*s),1100),Image.LANCZOS)
cx=int(860*s); t=t.crop((cx-560,0,cx+520,1100))
place(im,t); title(d); status(d)
msg(d,'部長',['「俺が言っといてやる」','「俺は言ってねぇぞ」'])
im.save('../サムネ_short02_ittoite.png')
