import random
from PIL import Image, ImageDraw, ImageFont
W,H=1080,1920
F='../../../public/fonts/DotGothic16.ttf'
Y0,MH=700,608  # MV band (full width, no side crop so UI stays)
im=Image.new('RGB',(W,H),(13,11,36))
d=ImageDraw.Draw(im)
random.seed(7)
for _ in range(260):
    x,y=random.randrange(0,W,4),random.randrange(0,H,4)
    if Y0-12<=y<=Y0+MH+12: continue
    s=random.choice([4,4,4,8]); c=random.choice([(255,250,240),(180,190,255),(255,210,63)])
    d.rectangle([x,y,x+s-1,y+s-1],fill=c)
def txt(t,y,size,fill,stroke=8):
    f=ImageFont.truetype(F,size)
    d.text((W/2,y),t,font=f,fill=fill,anchor='mm',stroke_width=stroke,stroke_fill=(10,8,20))
txt('＼ 社畜あるある ／',330,56,(255,111,181),6)
txt('部長、',450,104,(255,210,63))
txt('ここは地上です！',570,112,(255,210,63))
d.rectangle([0,Y0-10,W-1,Y0-1],fill=(255,210,63)); d.rectangle([0,Y0+MH,W-1,Y0+MH+9],fill=(255,210,63))
txt('フルMVは関連動画から >>',Y0+MH+100,52,(95,227,255),6)
im.save('overlay.png')
