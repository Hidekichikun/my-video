# So stupid, but so good. — 1枚絵ショート（歌詞なし・ビート同期）
import os, subprocess, numpy as np, random, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
B='../'; W,H,FPS=1080,1920,30
SERIF='/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'
import json
C=json.load(open(sys.argv[1],encoding='utf-8'))
AUDIO,IMG,TITLE,OUT=C['audio'],C['image'],C['title'],C['out']
SPB=60/C['bpm']; START=C['start']
if 'beat_times' in C:   # 実際のキック位置（曲の秒）に合わせる
    BTS=np.array(C['beat_times'])-START
else:
    BTS=np.arange(0,C['beats']+400)*SPB
def bpos(t):   # 時間→拍位置（小数）
    if t<=BTS[0]: return (t-BTS[0])/SPB
    if t>=BTS[-1]: return len(BTS)-1+(t-BTS[-1])/SPB
    return float(np.interp(t,BTS,np.arange(len(BTS))))
def btime(b): return float(np.interp(b,np.arange(len(BTS)),BTS))
LEND=btime(C['beats'])
ENDDUR=C.get('enddur',3.5); DUR=LEND+ENDDUR
SHOTS=[tuple(x) for x in C['shots']]   # [開始拍, cx, cy, z0, z1]  z=切り出し高さ（画像の高さ比）
CALM=C.get('calm',[])
FADEIN=C.get('fadein',0); HIT=C.get('hit')   # 冒頭フェードイン秒・ガツンと入る拍                  # 静かな区間 [開始拍,終了拍] はビートの揺れを弱く
im0 = Image.open(B+IMG).convert('RGB')
_cache={}
def src(p):
    if p not in _cache:
        a=Image.open(B+p).convert('RGB')
        _cache[p]=a.resize((a.size[0]*2,a.size[1]*2),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,60,2))
    return _cache[p]
for x in SHOTS: src(x[5] if len(x)>5 else IMG)
def shot(i, t, pulse):
    b, cx, cy, z0, z1 = SHOTS[i][:5]
    SRC=src(SHOTS[i][5] if len(SHOTS[i])>5 else IMG); iw, ih = SRC.size
    ts = btime(b); te = btime(SHOTS[i+1][0]) if i+1<len(SHOTS) else LEND
    pr = min(max((t-ts)/(te-ts),0),1.15); z = (z0+(z1-z0)*pr)*(1-pulse)
    ch = ih*z; cw = ch*W/H
    if cw > iw: cw = iw; ch = cw*H/W
    x0 = min(max(cx*iw-cw/2,0),iw-cw); y0 = min(max(cy*ih-ch/2,0),ih-ch)
    return SRC.resize((W,H), Image.BILINEAR, box=(x0,y0,x0+cw,y0+ch))
def spaced(d, txt, size, y, fill, gap):
    f = ImageFont.truetype(SERIF,size)
    w = sum(d.textlength(c,font=f) for c in txt)+gap*(len(txt)-1); x=W/2-w/2
    for c in txt: d.text((x,y),c,font=f,fill=fill,anchor='lm'); x+=d.textlength(c,font=f)+gap
# エンドカード：同じ絵（ぼかし背景＋中央に絵）
bg = im0.resize((W*1536//1536*2//1, H)) if False else im0.resize((int(H*im0.size[0]/im0.size[1]),H), Image.LANCZOS)
bg = bg.crop(((bg.size[0]-W)//2,0,(bg.size[0]-W)//2+W,H)).filter(ImageFilter.GaussianBlur(40))
END = Image.blend(bg, Image.new('RGB',(W,H),(12,10,14)), 0.5)
card = im0.resize((760,1140), Image.LANCZOS)
END.paste(card, ((W-760)//2, 230))
d = ImageDraw.Draw(END)
TF=C.get('title_font')
if TF:   # パンク風タイトル
    sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); from punk_title import punk_title
    _t=punk_title(W,TF,size=110,y=1440); END=Image.alpha_composite(END.convert('RGBA'),_t).convert('RGB'); d=ImageDraw.Draw(END)
else:
    spaced(d, TITLE, 64, 1530, (255,236,210), 6)
# 上下のグラデ＋上部タイトル
yy=np.linspace(0,1,H); grad=np.clip((yy-0.72)/0.28,0,1)**1.2*0.55+np.clip((0.18-yy)/0.18,0,1)**1.3*0.55
shade=Image.fromarray((grad[:,None]*255).astype(np.uint8).repeat(W,1),'L')
dark=Image.new('RGB',(W,H),(12,10,14))
TOP=Image.new('RGBA',(W,H),(0,0,0,0)); dt=ImageDraw.Draw(TOP)
spaced(dt,TITLE,52,190,(255,236,210,235),5)
_sh=TOP.split()[3].filter(ImageFilter.GaussianBlur(9)).point(lambda v:min(255,int(v*2.4)))
_S=Image.new('RGBA',(W,H),(20,0,20,0)); _S.putalpha(_sh); TOP=Image.alpha_composite(_S,TOP)
if TF: TOP=punk_title(W,TF,size=128,y=150)
PINK=Image.new('RGB',(W,H),(255,70,170))
random.seed(3)
SP=[(random.uniform(0,W),random.uniform(0,H),random.uniform(2,6),random.uniform(60,220),random.uniform(-30,30),random.random()*6.28) for _ in range(70)]
import os
N0=int(os.environ.get('N0',0)); N1=int(os.environ.get('N1',int(DUR*FPS))); SEG=os.environ.get('SEG')
if SEG:   # 分割レンダー（映像のみ）
    ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
      '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',SEG],stdin=subprocess.PIPE)
else:
    ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
      '-ss',f'{START:.3f}','-t',f'{DUR:.3f}','-i',B+AUDIO,
      '-af',f'afade=t=in:d=0.03,afade=t=out:st={DUR-2.8:.2f}:d=2.8',
      '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-shortest',
      '-movflags','+faststart',OUT],stdin=subprocess.PIPE)

for n in range(N0,N1):
    t=n/FPS; bt=bpos(t); ph=bt-np.floor(bt)
    calm=any(a<=bt<b for a,b in CALM)
    pulse=(0.012 if calm else 0.035)*np.exp(-ph*6)
    if C.get('strong_from') is not None and bt>=C['strong_from']: pulse*=1.8   # キックの子は強めに揺らす
    pre = HIT is not None and bt<HIT
    if pre: pulse*=0.3
    hd = (t-btime(HIT)) if HIT is not None else -1
    if 0<=hd<0.6: pulse+=0.10*np.exp(-hd*7)
    XB,XA=C.get('xfade',[0.35,0.0])   # エンドカードへのクロスフェード（前・後ろの秒）
    if t<LEND+XA:
        k=max(i for i,s in enumerate(SHOTS) if btime(s[0])<=t)
        im=shot(k,t,pulse)
        if 0<=hd<0.5: im=Image.blend(im,Image.new('RGB',(W,H),(255,235,250)),0.9*np.exp(-hd*9))
        if k>0 and t-btime(SHOTS[k][0])<0.12:   # カットはビートでパッと切替＋白フラッシュ
            im=Image.blend(im,Image.new('RGB',(W,H),(255,240,250)),0.55*(1-(t-btime(SHOTS[k][0]))/0.12))
        if int(bt)%4==0 and not calm: im=Image.blend(im,PINK,0.10*np.exp(-ph*5))  # 小節頭にピンクの光
        im=Image.composite(dark,im,shade).convert('RGBA')
        th=C.get('title_hide_from')
        ta=1.0 if th is None else max(0.0,1-(t-btime(th)+0.15)/0.3)
        if ta>=1: im=Image.alpha_composite(im,TOP)
        elif ta>0: im=Image.blend(im,Image.alpha_composite(im,TOP),ta)
        if t>LEND-XB:
            u=min(1,(t-(LEND-XB))/(XB+XA)); u=u*u*(3-2*u)   # じわっと（smoothstep）
            im=Image.blend(im.convert('RGB'),END,u).convert('RGBA')
    else:
        im=END.convert('RGBA')
    sl=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sl)
    for x,y,r,v,dx,p in SP:
        px=(x+dx*t)%W; py=(y-v*t)%H; a=int((0.5+0.5*np.sin(p+t*4))*170)+40
        sd.ellipse((px-r,py-r,px+r,py+r),fill=(255,170,215,a))
    im=Image.alpha_composite(im,sl.filter(ImageFilter.GaussianBlur(1.5)))
    im=im.convert('RGB')
    if t<FADEIN: im=Image.blend(Image.new('RGB',(W,H),(0,0,0)),im,(t/FADEIN)**1.5)
    ff.stdin.write(im.tobytes())
    if n%150==0: print(n,flush=True)
ff.stdin.close(); ff.wait(); print('done',ff.returncode,flush=True)
