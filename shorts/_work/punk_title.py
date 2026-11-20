# パンク風タイトル（斜め・2段・縁取り＋ネオングロー）
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
FD=os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../font/punk/')
def punk_title(W, font, lines=('So stupid,','but so good.'), size=118, angle=-9, fill=(255,255,255),
               stroke=(20,0,25), glow=(255,40,160), y=150, x_off=(-40,60)):
    L=Image.new('RGBA',(W,700),(0,0,0,0)); d=ImageDraw.Draw(L)
    f=ImageFont.truetype(FD+font,size); yy=120
    for i,t in enumerate(lines):
        w=d.textlength(t,font=f); x=W/2-w/2+x_off[i]
        d.text((x,yy),t,font=f,fill=fill+(255,),stroke_width=max(4,size//18),stroke_fill=stroke+(255,))
        yy+=int(size*1.05)
    a=L.split()[3]
    g=Image.new('RGBA',L.size,glow+(0,)); g.putalpha(a.filter(ImageFilter.GaussianBlur(16)).point(lambda v:min(255,int(v*1.6))))
    out=Image.alpha_composite(g,L).rotate(-angle,resample=Image.BICUBIC,center=(W/2,300))
    C=Image.new('RGBA',(W,1920),(0,0,0,0)); C.alpha_composite(out,(0,y-120)); return C
