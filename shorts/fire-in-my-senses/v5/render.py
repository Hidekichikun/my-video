"""Fire in my senses v5: still image + looping snow only.
Based on v3 minimal. Camera is fixed; only three layers of snow move, and the snow loops seamlessly at the clip length.
Usage: python render.py [--preview] [--only 1|2] [--dur 30.4|15]
"""
from pathlib import Path
import json,sys,subprocess,math,random,os
import numpy as np
from PIL import Image,ImageDraw,ImageFont,ImageEnhance,ImageFilter
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
W,H,FPS=1080,1920,30
WORK=HERE/'work'; WORK.mkdir(exist_ok=True)
def pickfont(*c):
    for p in c:
        if os.path.exists(p): return p
    raise FileNotFoundError(c)
FONTJP=pickfont('C:/Windows/Fonts/YuGothM.ttc','/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')
FONTEN=pickfont('C:/Windows/Fonts/arial.ttf','/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',FONTJP)

# ---- still background (v3 grade, single fixed framing) ----
im=Image.open(ROOT/'public/fire-in-my-senses-bg.png').convert('RGB')
im=ImageEnhance.Color(im).enhance(.42)
im=ImageEnhance.Contrast(im).enhance(1.13)
im=ImageEnhance.Brightness(im).enhance(.83)
arr=np.asarray(im,dtype=float); arr[:,:,0]*=.96; arr[:,:,2]*=1.035
im=Image.fromarray(np.clip(arr,0,255).astype('uint8'))
z,cx,cy=.975,.49,.46
ih=im.height; iw=im.width; ch=ih*z; cw=ch*W/H
x=min(max(cx*iw-cw/2,0),iw-cw); y=min(max(cy*ih-ch/2,0),ih-ch)
BG=im.resize((W,H),Image.Resampling.LANCZOS,box=(x,y,x+cw,y+ch)).convert('RGBA')
yy=np.linspace(0,1,H)[:,None]
grad=(np.clip((yy-.62)/.30,0,1)**1.6*.96+np.clip((.12-yy)/.12,0,1)*.15)
SHADE=Image.new('RGBA',(W,H),(8,10,12,0))
SHADE.putalpha(Image.fromarray(np.repeat(np.clip(grad*255,0,255).astype('uint8'),W,axis=1)))

# ---- snow ----
def sprite(r,blur,alpha):
    s=int(r*2+blur*4+4); l=Image.new('L',(s,s)); d=ImageDraw.Draw(l)
    d.ellipse((s/2-r,s/2-r,s/2+r,s/2+r),fill=255)
    if blur: l=l.filter(ImageFilter.GaussianBlur(blur))
    a=np.asarray(l,dtype=float)
    if a.max()>0: a=a/a.max()*alpha
    sp=Image.new('RGBA',(s,s),(244,246,250,0)); sp.putalpha(Image.fromarray(a.astype('uint8'))); return sp
# (count, radius range, blur, alpha range, target fall px/s, sway px)
LAYERS=[(120,(1.0,2.0),0.6,(80,140),115,6),   # far: small, slow
        (60,(2.2,3.6),1.1,(135,200),185,12),   # mid
        (10,(6.0,9.5),4.0,(70,115),270,22)]    # near: big soft bokeh, few
TILT=.16  # slight diagonal (moves right while falling)
SPAN=H+120
def make_snow(L,seed=6):
    rnd=random.Random(seed); flakes=[]
    for count,(r0,r1),blur,(a0,a1),v,sway in LAYERS:
        k=max(1,round(v*L/SPAN))  # integer laps per clip -> seamless loop
        for _ in range(count):
            r=rnd.uniform(r0,r1); sp=sprite(r,blur,rnd.uniform(a0,a1))
            flakes.append((sp,rnd.random(),k,rnd.uniform(-TILT*SPAN,W+20),sway*rnd.uniform(.5,1),rnd.choice([1,2]),rnd.uniform(0,6.283)))
    return flakes
def draw_snow(base,t,L,flakes):
    for sp,p0,k,x0,amp,m,ph in flakes:
        p=(p0+k*t/L)%1.0
        y=-60+p*SPAN; x=x0+p*SPAN*TILT+amp*math.sin(6.283*m*t/L+ph)
        xi=int(x-sp.width/2); yi=int(y-sp.height/2)
        if -sp.width<xi<W and -sp.height<yi<H:
            # crop sprite to canvas
            sx=max(0,-xi); sy=max(0,-yi)
            c=sp.crop((sx,sy,min(sp.width,W-xi),min(sp.height,H-yi)))
            base.alpha_composite(c,(xi+sx,yi+sy))

# ---- text (same as v3) ----
def spaced(d,text,y,size,gap,opacity=230,center=True,x=92,kind='en'):
    f=ImageFont.truetype(FONTJP if kind=='jp' else FONTEN,size)
    width=sum(f.getlength(c) for c in text)+gap*(len(text)-1)
    if center: x=(W-width)/2
    for c in text:
        d.text((x,y+round(size*.88)),c,font=f,fill=(241,242,240,opacity),anchor='ls'); x+=f.getlength(c)+gap
def textlayer(txt):
    l=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(l)
    isjp=any(ord(c)>255 for c in txt)
    spaced(d,txt,1495,44 if isjp else 40,3 if isjp else 1.4,kind='jp' if isjp else 'en'); return l
def fade(l,a):
    if a>=1: return l
    l=l.copy(); l.putalpha(l.getchannel('A').point(lambda v:round(v*a))); return l

def render(num,DUR,preview,seg=None,mux=False):
    cfg=json.loads((ROOT/f'shorts/_work/fi{num}.json').read_text(encoding='utf8'))
    label='short01' if num==1 else 'short02_release'
    tag=f'{label}_snow_v5_{int(DUR)}s'
    times=[t-cfg['start'] for t,s in cfg['lyrics']]
    lyrics=[s.replace('　',' ').replace('Burning mind解','Burning mind 解').replace('未来はInside','未来は Inside') for t,s in cfg['lyrics']]
    layers=[textlayer(s) for s in lyrics]
    lyr_end=min(cfg['lyrics_end'],DUR-0.4)
    header=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(header)
    spaced(d,'六ツ扉',106,30,6,185,False,92,'jp')
    spaced(d,'Fire in my senses',1650,42,1,225)
    footer=Image.new('RGBA',(W,H)); d=ImageDraw.Draw(footer)
    spaced(d,'2026.11.06' if num==1 else 'NOW STREAMING',1732,27,4,165)
    flakes=make_snow(DUR)
    def frame(t):
        f=BG.copy(); draw_snow(f,t,DUR,flakes)
        f.alpha_composite(SHADE); f.alpha_composite(header)
        if t<lyr_end:
            ids=[i for i,s in enumerate(times) if s<=t]
            if ids:
                i=ids[-1]; b=times[i]
                e=min(times[i+1] if i+1<len(times) else lyr_end,b+5.35,lyr_end)
                a=min(1,max(0,(t-b)/.15),max(0,(e-t)/.15))
                if a>0: f.alpha_composite(fade(layers[i],a))
        if t>DUR-3: f.alpha_composite(fade(footer,min(1,(t-(DUR-3))/.3)))
        return f.convert('RGB')
    N=round(DUR*FPS)
    if seg:
        A,B=seg; out=WORK/f'{tag}_seg{A:04d}.mp4'
        p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
            '-c:v','libx264','-preset','fast','-crf','17','-tune','grain','-pix_fmt','yuv420p',str(out)],stdin=subprocess.PIPE)
        for n in range(A,min(B,N)): p.stdin.write(frame(n/FPS).tobytes())
        p.stdin.close(); p.wait(); print('seg',out.name,flush=True); return
    if mux:
        segs=sorted(WORK.glob(f'{tag}_seg*.mp4')); lst=WORK/f'{tag}_list.txt'
        lst.write_text(''.join(f"file '{x.name}'\n" for x in segs))
        out=HERE/f'FireInMySenses_{tag}.mp4'
        subprocess.run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(lst),
            '-ss',str(cfg['start']),'-t',str(DUR),'-i',str(ROOT/cfg['audio']),'-map','0:v','-map','1:a','-c:v','copy',
            '-af',f'afade=t=in:d=0.015,afade=t=out:st={DUR-0.6}:d=0.6','-c:a','aac','-b:a','320k','-ar','48000',
            '-t',str(DUR),'-movflags','+faststart',str(out)],check=True); print('SAVED',out.name); return
    ts=[.5,4,7.5,11,DUR*.6,DUR-2.5,DUR-.6,DUR-1/FPS]
    sheet=Image.new('RGB',(1080,1000),(8,10,12))
    for n,t in enumerate(ts):
        sheet.paste(frame(t).resize((270,480)),(n%4*270,n//4*500))
        ImageDraw.Draw(sheet).text((n%4*270+8,n//4*500+482),f'{t:.2f}s',fill='white')
    sheet.save(HERE/f'{tag}-storyboard.jpg',quality=92)
    frame(4).save(HERE/f'{tag}-cover.jpg',quality=95)
    if preview: return
    out=HERE/f'FireInMySenses_{tag}.mp4'; N=round(DUR*FPS)
    p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
        '-ss',str(cfg['start']),'-t',str(DUR),'-i',str(ROOT/cfg['audio']),'-map','0:v','-map','1:a',
        '-af',f'afade=t=in:d=0.015,afade=t=out:st={DUR-0.6}:d=0.6',
        '-c:v','libx264','-preset','medium','-crf','17','-tune','grain','-pix_fmt','yuv420p',
        '-c:a','aac','-b:a','320k','-ar','48000','-t',str(DUR),'-movflags','+faststart',str(out)],stdin=subprocess.PIPE)
    try:
        for n in range(N):
            p.stdin.write(frame(n/FPS).tobytes())
            if n%150==0: print(tag,n,'/',N,flush=True)
    finally: p.stdin.close()
    if p.wait(): raise RuntimeError('ffmpeg failed')
    print('SAVED',out,flush=True)

if __name__=='__main__':
    a=sys.argv
    if '--seg' in a:
        i=a.index('--seg'); render(int(a[i+1]),float(a[i+2]),False,seg=(int(a[i+3]),int(a[i+4]))); sys.exit()
    if '--mux' in a:
        i=a.index('--mux'); render(int(a[i+1]),float(a[i+2]),False,mux=True); sys.exit()
    only=int(a[a.index('--only')+1]) if '--only' in a else None
    durs=[float(a[a.index('--dur')+1])] if '--dur' in a else [30.4,15.0]
    for num in (1,2):
        if only and num!=only: continue
        for D in durs: render(num,D,'--preview' in a)
