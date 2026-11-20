import subprocess, numpy as np, sys, json, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
B = '../'
W, H, FPS = 1080, 1920, 30
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'
cfg = json.load(open(sys.argv[1], encoding='utf-8'))
START, LEND, ENDDUR = cfg['start'], cfg['lyrics_end'], 3.5
DUR = LEND + ENDDUR
LYR = [(t-START, s) for t, s in cfg['lyrics']]
SHOTS = cfg['shots']   # [t, src, cx, cy, z0, z1]  z = crop height fraction of image
srcs = {}
def load(p):
    if p not in srcs:
        im = Image.open(B+p).convert('RGB')
        im = im.resize((im.size[0]*2, im.size[1]*2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,60,2))
        srcs[p] = im
    return srcs[p]
for s in SHOTS: load(s[1])
def spaced(d, txt, size, y, fill, gap):
    f = ImageFont.truetype(SERIF, size)
    w = sum(d.textlength(c,font=f) for c in txt)+gap*(len(txt)-1); x = W/2-w/2
    for c in txt:
        d.text((x,y),c,font=f,fill=fill,anchor='lm'); x += d.textlength(c,font=f)+gap
jk = Image.open(B+cfg['jacket']).convert('RGB')
bg = jk.resize((H,H)).crop(((H-W)//2,0,(H-W)//2+W,H)).filter(ImageFilter.GaussianBlur(40))
END = Image.blend(bg, Image.new('RGB',(W,H),(12,10,14)), 0.45)
END.paste(jk.resize((900,900),Image.LANCZOS),(90,420))
d = ImageDraw.Draw(END)
spaced(d,cfg['end1'],64,1450,(255,236,210),10)
spaced(d,cfg['end2'],56,1545,(240,232,222),24)
def shot_img(i, t):
    ts, p, cx, cy, z0, z1 = SHOTS[i]
    te = SHOTS[i+1][0] if i+1 < len(SHOTS) else LEND
    pr = min(max((t-ts)/(te-ts),0),1.2); z = z0+(z1-z0)*pr
    im = srcs[p]; iw, ih = im.size
    ch = ih*z; cw = ch*W/H
    if cw > iw: cw = iw; ch = cw*H/W
    x0 = min(max(cx*iw-cw/2,0),iw-cw); y0 = min(max(cy*ih-ch/2,0),ih-ch)
    return im.resize((W,H), Image.BILINEAR, box=(x0,y0,x0+cw,y0+ch))
def frame_bg(t):
    if t >= LEND:
        e = END
        if t-LEND < 0.35: e = Image.blend(shot_img(len(SHOTS)-1,t), END, (t-LEND)/0.35)
        return e, True
    k = max(i for i,s in enumerate(SHOTS) if s[0]<=t)
    cur = shot_img(k,t)
    if k>0 and t-SHOTS[k][0] < 0.35:
        cur = Image.blend(shot_img(k-1,t), cur, (t-SHOTS[k][0])/0.35)
    return cur, False
yy=np.linspace(0,1,H); grad = np.clip((yy-0.55)/0.25,0,1)**1.1*0.72 + np.clip((0.2-yy)/0.2,0,1)**1.3*cfg.get('top_shade',0.55)
shade = Image.fromarray((grad[:,None]*255).astype(np.uint8).repeat(W,1),'L')
dark = Image.new('RGB',(W,H),(12,10,14))
cache = {}
def lyric_layer(txt):
    if txt in cache: return cache[txt]
    L = Image.new('RGBA',(W,H),(0,0,0,0)); dd = ImageDraw.Draw(L)
    size = 66
    while True:
        f = ImageFont.truetype(SERIF,size); gap=6
        w = sum(f.getlength(c) for c in txt)+gap*(len(txt)-1)
        if w <= 940 or size <= 36: break
        size -= 2
    x=W/2-w/2; y=1430
    for c in txt:
        dd.text((x,y),c,font=f,fill=(255,236,210,255),anchor='lm'); x+=f.getlength(c)+gap
    sh = L.split()[3].filter(ImageFilter.GaussianBlur(10))
    S = Image.new('RGBA',(W,H),(0,0,0,0)); S.putalpha(sh.point(lambda v:min(255,int(v*2.2))))
    out = Image.alpha_composite(S, L); cache[txt]=out; return out
TOP = Image.new('RGBA',(W,H),(0,0,0,0)); dt = ImageDraw.Draw(TOP)
spaced(dt,cfg['title'],50,170,(255,236,210,230),8); spaced(dt,'六ツ扉',34,240,(240,232,222,210),30)
random.seed(1)
SNOW = [(random.uniform(0,W), random.uniform(0,H), random.uniform(1.5,5), random.uniform(40,140), random.uniform(-20,20)) for _ in range(90)] if cfg.get('snow') else []
ff = subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
   '-ss',str(START),'-t',str(DUR),'-i',B+cfg['audio'],
   '-af',f'afade=t=in:d=0.05,afade=t=out:st={DUR-2.5}:d=2.5',
   '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-shortest',
   '-movflags','+faststart',cfg['out']], stdin=subprocess.PIPE)
for n in range(int(DUR*FPS)):
    t = n/FPS
    im, is_end = frame_bg(t)
    im = im.convert('RGBA')
    if not is_end:
        im = Image.composite(dark, im.convert('RGB'), shade).convert('RGBA')
        im = Image.alpha_composite(im, TOP)
        cur = [x for x in LYR if x[0]<=t]
        if cur and cur[-1][1]:
            ly = lyric_layer(cur[-1][1]); a = min(1,(t-cur[-1][0])/0.18)
            if a<1: ly = Image.blend(Image.new('RGBA',(W,H),(0,0,0,0)), ly, a)
            im = Image.alpha_composite(im, ly)
    if SNOW:
        sl = Image.new('RGBA',(W,H),(0,0,0,0)); sd = ImageDraw.Draw(sl)
        for x,y,r,v,dx in SNOW:
            px=(x+dx*t)%W; py=(y+v*t)%H
            sd.ellipse((px-r,py-r,px+r,py+r),fill=(255,250,245,int(60+r*25)))
        im = Image.alpha_composite(im, sl.filter(ImageFilter.GaussianBlur(1.2)))
    ff.stdin.write(im.convert('RGB').tobytes())
    if n%150==0: print(cfg['out'], n, flush=True)
ff.stdin.close(); ff.wait(); print('done', cfg['out'], ff.returncode, flush=True)
