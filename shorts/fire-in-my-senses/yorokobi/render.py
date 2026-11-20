"""Fire in my senses ショート「喜びは」版（ブリッジ→ラスサビ）
曲の150.0〜180.4秒。v6と同じ1枚絵・雪・明朝の文字で、
  ブリッジ: 青く静かな夜。「種・光・風・海」を1語ずつ特大で
  息を吸って 手放して: ゆっくり暗く → 夜明けを待つだけ: 上からうっすら明るく
  ラスサビ: あたたかい色になって、雪が減り、下から火の粉
最後の3秒に配信日。short01（2026.11.06）と short02（NOW STREAMING）を同時に書き出す。
Usage: python render.py [--preview]
"""
from pathlib import Path
import sys,subprocess,math,random,os
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageEnhance,ImageFilter
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
W,H,FPS=1080,1920,30
START,DUR=150.0,30.4
AUDIO=ROOT/'music/mastered/Fire in my senses (master).wav'
FONTJP=str(ROOT/'public/fonts/ShipporiMincho-SemiBold.ttf')
FONTEN=str(ROOT/'public/fonts/CormorantGaramond-VF.ttf')
_fc={}
def getfont(kind,size):
    k=(kind,size)
    if k not in _fc:
        if kind=='jp': f=ImageFont.truetype(FONTJP,size)
        else:
            f=ImageFont.truetype(FONTEN,size)
            try: f.set_variation_by_axes([600])
            except Exception: pass
        _fc[k]=f
    return _fc[k]
def ramp(t,pts):
    if t<=pts[0][0]: return pts[0][1]
    for (a,va),(b,vb) in zip(pts,pts[1:]):
        if t<=b:
            u=(t-a)/(b-a); u=u*u*(3-2*u); return va+(vb-va)*u
    return pts[-1][1]

# ---- 背景（v6と同じ色調・同じ切り取り）+ 夜版・あたたかい版 ----
im=Image.open(ROOT/'public/fire-in-my-senses-bg.png').convert('RGB')
im=ImageEnhance.Color(im).enhance(.42)
im=ImageEnhance.Contrast(im).enhance(1.13)
im=ImageEnhance.Brightness(im).enhance(.83)
arr=np.asarray(im,dtype=float); arr[:,:,0]*=.96; arr[:,:,2]*=1.035
im=Image.fromarray(np.clip(arr,0,255).astype('uint8'))
z,cx,cy=.975,.49,.46
ih=im.height; iw=im.width; ch=ih*z; cw=ch*W/H
x=min(max(cx*iw-cw/2,0),iw-cw); y=min(max(cy*ih-ch/2,0),ih-ch)
BG=im.resize((W,H),Image.Resampling.LANCZOS,box=(x,y,x+cw,y+ch))
a=np.asarray(BG,dtype=float)
lum=a.mean(2,keepdims=True)
night=lum*np.array([.62,.76,1.02])*.80+a*.12
BG_NIGHT=Image.fromarray(np.clip(night,0,255).astype('uint8'))
warm=a*np.array([1.10,.98,.84]); warm=warm*1.04+np.array([10,4,-4])
BG_WARM=Image.fromarray(np.clip(warm,0,255).astype('uint8'))
yy=np.linspace(0,1,H)[:,None]
grad=(np.clip((yy-.62)/.30,0,1)**1.6*.96+np.clip((.12-yy)/.12,0,1)*.15)
SHADE=Image.new('RGBA',(W,H),(8,10,12,0))
SHADE.putalpha(Image.fromarray(np.repeat(np.clip(grad*255,0,255).astype('uint8'),W,axis=1)))
# 夜明けの光（右上からうっすら）
xx=np.linspace(0,1,W)[None,:]
d=np.sqrt(((xx-.85)/1.0)**2+((yy-(-.05))/.75)**2)
dawn_a=np.clip(1-d,0,1)**1.8
DAWN=Image.new('RGBA',(W,H),(255,214,168,0))
DAWN.putalpha(Image.fromarray(np.clip(dawn_a*255,0,255).astype('uint8')))
# 下からあたたかい光（ラスサビ）
low_a=np.repeat(np.clip((yy-.55)/.45,0,1)**1.5,W,axis=1)
LOWGLOW=Image.new('RGBA',(W,H),(255,140,60,0))
LOWGLOW.putalpha(Image.fromarray(np.clip(low_a*255,0,255).astype('uint8')))
def fadeimg(l,v):
    if v>=1: return l
    l=l.copy(); l.putalpha(l.getchannel('A').point(lambda p:round(p*v))); return l

# ---- 雪（v6と同じ。ラスサビで数を減らす）----
def sprite(r,blur,alpha,col=(244,246,250)):
    s=int(r*2+blur*4+4); l=Image.new('L',(s,s)); dd=ImageDraw.Draw(l)
    dd.ellipse((s/2-r,s/2-r,s/2+r,s/2+r),fill=255)
    if blur: l=l.filter(ImageFilter.GaussianBlur(blur))
    q=np.asarray(l,dtype=float)
    if q.max()>0: q=q/q.max()*alpha
    sp=Image.new('RGBA',(s,s),col+(0,)); sp.putalpha(Image.fromarray(q.astype('uint8'))); return sp
LAYERS=[(120,(1.0,2.0),0.6,(80,140),115,6),(60,(2.2,3.6),1.1,(135,200),185,12),(10,(6.0,9.5),4.0,(70,115),270,22)]
TILT=.16; SPAN=H+120
rnd=random.Random(6); FLAKES=[]
for count,(r0,r1),blur,(a0,a1),v,sway in LAYERS:
    k=max(1,round(v*DUR/SPAN))
    for _ in range(count):
        r=rnd.uniform(r0,r1); sp=sprite(r,blur,rnd.uniform(a0,a1))
        FLAKES.append((sp,rnd.random(),k,rnd.uniform(-TILT*SPAN,W+20),sway*rnd.uniform(.5,1),rnd.choice([1,2]),rnd.uniform(0,6.283),rnd.random()))
def paste(base,sp,x,y):
    xi=int(x-sp.width/2); yi=int(y-sp.height/2)
    if -sp.width<xi<W and -sp.height<yi<H:
        sx=max(0,-xi); sy=max(0,-yi)
        base.alpha_composite(sp.crop((sx,sy,min(sp.width,W-xi),min(sp.height,H-yi))),(xi+sx,yi+sy))
def draw_snow(base,t,keep):
    for sp,p0,k,x0,amp,m,ph,h in FLAKES:
        if h>keep: continue
        p=(p0+k*t/DUR)%1.0
        paste(base,sp,x0+p*SPAN*TILT+amp*math.sin(6.283*m*t/DUR+ph),-60+p*SPAN)
# ---- 火の粉 ----
rnd=random.Random(11); EMBERS=[]
for i in range(85):
    r=rnd.uniform(2.2,5.2); col=rnd.choice([(255,170,80),(255,196,120),(255,140,60)])
    EMBERS.append((sprite(r,r*.9,rnd.uniform(150,240),col),sprite(r*3.2,r*3,rnd.uniform(70,120),col),
                   rnd.uniform(0,W),rnd.uniform(0,1),rnd.uniform(140,320),rnd.uniform(8,30),rnd.uniform(.3,1.1),rnd.uniform(0,6.28),rnd.random()))
def draw_embers(base,T,amount):
    if amount<=0: return
    t=T-167.0
    for core,halo,x0,p0,v,amp,fr,ph,h in EMBERS:
        if h>amount: continue
        life=(H*.75)/v; p=(p0+t/life)%1.0
        yv=H+40-p*H*.78; xv=x0+amp*math.sin(fr*t*6.28+ph)+p*40
        tw=.55+.45*math.sin(t*9*fr+ph)
        fade=min(1,p/.08)*min(1,(1-p)/.35)*tw
        if fade<=.03: continue
        paste(base,fadeimg(halo,fade),xv,yv); paste(base,fadeimg(core,fade),xv,yv)

# ---- 文字（v6と同じ明朝＋Cormorant、影＋光）----
def spaced(d,text,y,size,gap,opacity=230,center=True,x=92,kind='en'):
    f=getfont('jp' if kind=='jp' else 'en',size)
    width=sum(f.getlength(c) for c in text)+gap*(len(text)-1)
    if center: x=(W-width)/2
    for c in text:
        k='jp' if ord(c)>255 else 'en'
        fc=getfont(k,size) if k==kind or kind=='jp' else f
        d.text((x,y+round(size*.88)),c,font=fc,fill=(246,244,240,opacity),anchor='ls'); x+=fc.getlength(c)+gap
def mixed(d,text,y,jsize,esize,gap,opacity=255):
    runs=[]
    for c in text:
        k='jp' if ord(c)>255 else 'en'
        if runs and runs[-1][0]==k: runs[-1][1]+=c
        else: runs.append([k,c])
    def fz(k): return getfont(k,jsize if k=='jp' else esize)
    def g(k): return gap if k=='jp' else 1.5
    width=sum(sum(fz(k).getlength(c)+g(k) for c in r) for k,r in runs)
    x=(W-width)/2; base=y+round(jsize*.88)
    for k,r in runs:
        f=fz(k)
        for c in r:
            d.text((x,base),c,font=f,fill=(250,248,244,opacity),anchor='ls'); x+=f.getlength(c)+g(k)
def glowify(l,shadow=150,glow=70,glowcol=(255,214,170),gblur=22):
    al=l.getchannel('A')
    sh=Image.new('RGBA',l.size,(0,0,0,0)); sh.putalpha(al.filter(ImageFilter.GaussianBlur(9)).point(lambda v:min(255,round(v*shadow/255*1.6))))
    gl=Image.new('RGBA',l.size,glowcol+(0,)); gl.putalpha(al.filter(ImageFilter.GaussianBlur(gblur)).point(lambda v:round(v*glow/255)))
    out=Image.new('RGBA',l.size); out.alpha_composite(sh,(0,4)); out.alpha_composite(gl); out.alpha_composite(l); return out
BLUE=(165,198,255); WARMG=(255,214,170); FIREG=(255,150,70)
def keyword(label,word):
    l=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(l)
    spaced(d,label,1160,58,14,235,kind='jp')
    f=getfont('jp',300); w=f.getlength(word)
    d.text(((W-w)/2,1250+round(300*.88)),word,font=f,fill=(250,250,255,255),anchor='ls')
    return glowify(l,170,120,BLUE,30)
def lyric(txt,glowcol=WARMG,glow=70):
    l=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(l)
    if all(ord(c)<=255 for c in txt):
        a,b=txt.split(' in my',1)
        mixed(d,a,1372,64,92,0); mixed(d,'in my'+b,1462,64,92,0)
    else: mixed(d,txt,1452,64,70,4)
    return glowify(l,150,glow,glowcol)
# (開始, 終了, 画像, 出方)  時間は曲の秒数。MV（lyrics.ts）と同じタイミング
EVENTS=[(152.0,153.9,keyword('喜びは','種'),'rise'),
        (154.0,155.9,keyword('気づきは','光'),'rise'),
        (156.0,157.7,keyword('精進が','風'),'rise'),
        (157.8,159.3,keyword('平常が','海'),'rise'),
        (159.5,162.0,lyric('息を吸って 手放して',BLUE,60),'soft'),
        (162.1,166.9,lyric('夜明けを待つだけ',WARMG,80),'soft'),
        (167.3,170.1,lyric('Break my Fire in my senses',FIREG,130),'flare'),
        (170.2,172.6,lyric('どんな昨日も道に変えて',WARMG,80),'cut'),
        (172.7,175.8,lyric('望む未来は 創れるから',WARMG,80),'cut'),
        (175.9,179.6,lyric('光の方へ歩いていくよ',WARMG,80),'cut')]
header=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(header)
spaced(d,'六ツ扉',100,34,10,200,False,92,'jp')
spaced(d,'Fire in my senses',1630,50,5,225)
HEADER=glowify(header,130,30)
def footer(txt):
    l=Image.new('RGBA',(W,H)); spaced(ImageDraw.Draw(l),txt,1716,34,8,190); return glowify(l,130,30)
FOOTERS={'short01':footer('2026.11.06'),'short02_release':footer('NOW STREAMING')}

def base_frame(t):
    T=START+t
    nt=ramp(T,[(150,0),(150.5,0),(154,1),(161.5,1),(166.8,0)])
    fi=ramp(T,[(150,0),(167.0,0),(167.5,1),(181,1)])
    f=BG
    if nt>0: f=Image.blend(f,BG_NIGHT,nt)
    if fi>0: f=Image.blend(f,BG_WARM,fi*.85)
    dim=ramp(T,[(150,0),(159.4,0),(160.9,.30),(162.2,.22),(163.5,0),(181,0)])
    if dim>0: f=ImageEnhance.Brightness(f).enhance(1-dim)
    f=f.convert('RGBA')
    draw_snow(f,t,1-.65*fi)
    dw=ramp(T,[(150,0),(161,0),(165.5,.55),(167.3,.25),(181,.22)])
    if dw>0: f.alpha_composite(fadeimg(DAWN,dw))
    if fi>0:
        f.alpha_composite(fadeimg(LOWGLOW,.20*fi+.12*ramp(T,[(167,0),(167.3,1),(168.6,0),(181,0)])))
        draw_embers(f,T,fi)
    f.alpha_composite(SHADE); f.alpha_composite(HEADER)
    for b,e,img,mode in EVENTS:
        if b-.05<=T<=e+.3:
            fin=.35 if mode in('rise','soft') else (.08 if mode=='flare' else .15)
            al=min(1,max(0,(T-b)/fin),max(0,(e+.3-T)/.3))
            if al<=0: continue
            if mode=='rise':
                dy=int(14*(1-min(1,(T-b)/.6)))
                layer=Image.new('RGBA',(W,H)); layer.alpha_composite(img,(0,dy)) if dy==0 else layer.paste(img.crop((0,0,W,H-dy)),(0,dy))
                img2=layer
            else: img2=img
            f.alpha_composite(fadeimg(img2,al))
    return f
def final(f,t,tag):
    if t>DUR-3:
        f=f.copy(); f.alpha_composite(fadeimg(FOOTERS[tag],min(1,(t-(DUR-3))/.3)))
    return f.convert('RGB')

def enc(out):
    return subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
        '-ss',str(START),'-t',str(DUR),'-i',str(AUDIO),'-map','0:v','-map','1:a',
        '-af',f'afade=t=in:d=0.015,afade=t=out:st={DUR-0.6}:d=0.6',
        '-c:v','libx264','-preset','medium','-crf','17','-tune','grain','-pix_fmt','yuv420p',
        '-c:a','aac','-b:a','320k','-ar','48000','-t',str(DUR),'-movflags','+faststart',str(out)],stdin=subprocess.PIPE)

if __name__=='__main__':
    ts=[1.0,2.6,4.6,6.6,8.4,10.5,14.0,15.5,17.6,19.0,23.0,29.0]
    sheet=Image.new('RGB',(1080,1500),(8,10,12))
    for n,t in enumerate(ts):
        sheet.paste(final(base_frame(t),t,'short01').resize((270,480)),(n%4*270,n//4*500))
        ImageDraw.Draw(sheet).text((n%4*270+8,n//4*500+482),f'{START+t:.1f}s',fill='white')
    sheet.save(HERE/'yorokobi-storyboard.jpg',quality=92)
    final(base_frame(2.6),2.6,'short01').save(HERE/'yorokobi-cover.jpg',quality=95)
    if '--preview' in sys.argv: sys.exit()
    tags=list(FOOTERS); procs={k:enc(HERE/f'FireInMySenses_{k}_yorokobi_30s.mp4') for k in tags}
    N=round(DUR*FPS)
    try:
        for n in range(N):
            t=n/FPS; f=base_frame(t)
            for k in tags: procs[k].stdin.write(final(f,t,k).tobytes())
            if n%150==0: print(n,'/',N,flush=True)
    finally:
        for p in procs.values(): p.stdin.close()
    for p in procs.values():
        if p.wait(): raise RuntimeError('ffmpeg failed')
    print('SAVED',flush=True)
