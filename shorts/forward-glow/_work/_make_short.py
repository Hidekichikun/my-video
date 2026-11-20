import subprocess, numpy as np, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
B = '../../'
W, H, FPS = 1080, 1920, 30
START, DUR = 34.0, 25.0
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'
LYR = [(0.24,'前に 攻め 跳ねて 進め 上げて 出でて'),(4.28,'繰り返すのみ'),
       (6.49,'越えて 詰めて 乗って 攻めて 晴れた 空を'),(9.60,'迷いなんて'),
       (11.54,'跳ねて 越えて キモチ たかめ 攻め つづけ'),(14.86,'小さな一歩で'),
       (16.57,'詰めて ぎゅっと 攻めて 前へ'),(18.79,'かぜに 乗るよ'),
       (20.00,'グッと押し出していけ'),(21.67,None)]
SHOTS = [(0.0,'build/public/forward-glow-chorus-1.png',0.62),
         (6.49,'build/public/forward-glow-04.png',0.5),
         (11.54,'build/public/forward-glow-chorus-2.png',0.6),
         (16.57,'build/public/forward-glow-17.png',0.5),
         (21.67,'END',0)]
def prep(path, cx):
    im = Image.open(B+path).convert('RGB')
    w, h = im.size; cw = int(h*W/H)
    x0 = int(min(max(cx*w - cw/2, 0), w-cw))
    im = im.crop((x0,0,x0+cw,h)).resize((int(W*1.12),int(H*1.12)), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(2,50,2))
imgs = [prep(p,c) if p!='END' else None for _,p,c in SHOTS]
# end card
jk = Image.open(B+'music/jacket/Forward Glow_jacket.png').convert('RGB')
bg = jk.resize((H,H)).crop(((H-W)//2,0,(H-W)//2+W,H)).filter(ImageFilter.GaussianBlur(40))
bg = Image.blend(bg, Image.new('RGB',(W,H),(12,10,14)), 0.45)
bg.paste(jk.resize((900,900),Image.LANCZOS),(90,420))
d = ImageDraw.Draw(bg)
def spaced(d, txt, size, y, fill, gap, font=SERIF):
    f = ImageFont.truetype(font, size)
    w = sum(d.textlength(c,font=f) for c in txt)+gap*(len(txt)-1); x = W/2-w/2
    for c in txt:
        d.text((x,y),c,font=f,fill=fill,anchor='lm'); x += d.textlength(c,font=f)+gap
spaced(d,'2026.10.30',64,1450,(255,236,210),10)
spaced(d,'配信スタート',56,1545,(240,232,222),24)
END = bg
def frame_bg(t):
    k = max(i for i,s in enumerate(SHOTS) if s[0]<=t)
    def get(i, t):
        if SHOTS[i][1]=='END': return END
        s0 = SHOTS[i][0]; s1 = SHOTS[i+1][0]
        p = (t-s0)/(s1-s0); z = 1.12 - 0.10*p   # slow push-in feel
        im = imgs[i]; cw, ch = W*z/1.12*im.size[0]/W, H*z/1.12*im.size[1]/H
        cx, cy = im.size[0]/2, im.size[1]/2
        return im.resize((W,H), Image.BILINEAR, box=(cx-cw/2,cy-ch/2,cx+cw/2,cy+ch/2))
    cur = get(k,t)
    if k>0 and t-SHOTS[k][0] < 0.35:
        a = (t-SHOTS[k][0])/0.35
        cur = Image.blend(get(k-1,t), cur, a)
    return cur
yy=np.linspace(0,1,H); grad = np.clip((yy-0.55)/0.25,0,1)**1.1*0.72 + np.clip((0.2-yy)/0.2,0,1)**1.3*0.55
shade = Image.fromarray((grad[:,None]*255).astype(np.uint8).repeat(W,1),'L')
dark = Image.new('RGB',(W,H),(12,10,14))
def fit_font(txt, maxw, size):
    while True:
        f = ImageFont.truetype(SERIF,size)
        if f.getlength(txt)+6*len(txt) <= maxw or size<36: return f,size
        size -= 2
cache = {}
def lyric_layer(txt):
    if txt in cache: return cache[txt]
    L = Image.new('RGBA',(W,H),(0,0,0,0)); d = ImageDraw.Draw(L)
    f,_ = fit_font(txt, 940, 66)
    gap = 6; w = sum(f.getlength(c) for c in txt)+gap*(len(txt)-1); x=W/2-w/2; y=1430
    for c in txt:
        d.text((x,y),c,font=f,fill=(255,236,210,255),anchor='lm'); x+=f.getlength(c)+gap
    sh = L.split()[3].filter(ImageFilter.GaussianBlur(10))
    S = Image.new('RGBA',(W,H),(0,0,0,0)); S.putalpha(sh.point(lambda v:min(255,int(v*2.2))))
    out = Image.alpha_composite(S, L); cache[txt]=out; return out
TOP = Image.new('RGBA',(W,H),(0,0,0,0)); dt = ImageDraw.Draw(TOP)
spaced(dt,'Forward Glow',50,170,(255,236,210,230),8); spaced(dt,'六ツ扉',34,240,(240,232,222,210),30)
ff = subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
   '-ss',str(START),'-t',str(DUR),'-i',B+'music/mastered/Forward Glow (master).wav',
   '-af',f'afade=t=in:d=0.05,afade=t=out:st={DUR-2.5}:d=2.5',
   '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-shortest',
   '-movflags','+faststart','ForwardGlow_short01_sabi.mp4'], stdin=subprocess.PIPE)
for n in range(int(DUR*FPS)):
    t = n/FPS
    im = frame_bg(t)
    if t < 21.67:
        im = Image.composite(dark, im, shade).convert('RGBA')
        im = Image.alpha_composite(im, TOP)
        cur = [x for x in LYR if x[0]<=t]
        if cur and cur[-1][1]:
            ly = lyric_layer(cur[-1][1]); a = min(1,(t-cur[-1][0])/0.18)
            if a<1: ly = Image.blend(Image.new('RGBA',(W,H),(0,0,0,0)), ly, a)
            im = Image.alpha_composite(im, ly)
        im = im.convert('RGB')
    elif t < 22.1:
        pass
    ff.stdin.write(im.tobytes())
    if n%150==0: print(n, flush=True)
ff.stdin.close(); ff.wait(); print('done', ff.returncode)
