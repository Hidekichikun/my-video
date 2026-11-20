# So stupid, but so good. — 1枚絵ショート（歌詞なし・ビート同期）
import subprocess, numpy as np, random, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
B='../'; W,H,FPS=1080,1920,30
SERIF='/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'
AUDIO='music/So stupid, but so good..mp3'
IMG='photo/So stupid, but so good/オラオラ娘.png'
TITLE='So stupid, but so good.'
BEAT0, SPB = 176.0464, 60/112.347
START = BEAT0 + 11*SPB            # ≈3:02 (拍頭)
LEND  = 52*SPB                    # 26小節 ≈27.8s
ENDDUR = 3.5; DUR = LEND+ENDDUR
OUT = sys.argv[1] if len(sys.argv)>1 else 'so-stupid-but-so-good/SoStupidButSoGood_short01_sabi.mp4'
BAR = 4*SPB
# [開始拍, cx, cy, z0, z1]   z = 切り出し高さ（画像の高さ比）
SHOTS = [
 (0,  0.58,0.15, 0.36,0.30),   # 顔アップ（いきなり目線）
 (8,  0.50,0.50, 1.00,0.88),   # 全身
 (16, 0.50,0.22, 0.50,0.42),   # 指さし＋顔
 (24, 0.50,0.80, 0.55,0.45),   # ブーツ踏みつけ
 (32, 0.60,0.14, 0.30,0.25),   # 顔もっと寄り
 (40, 0.50,0.42, 0.95,0.80),   # 全身ゆっくり寄り
]
im0 = Image.open(B+IMG).convert('RGB')
SRC = im0.resize((im0.size[0]*2, im0.size[1]*2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,60,2))
iw, ih = SRC.size
def shot(i, t, pulse):
    b, cx, cy, z0, z1 = SHOTS[i]
    ts = b*SPB; te = SHOTS[i+1][0]*SPB if i+1<len(SHOTS) else LEND
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
spaced(d, TITLE, 62, 1500, (255,236,210), 6)
spaced(d, '六ツ扉', 50, 1600, (240,232,222), 26)
# 上下のグラデ＋上部タイトル
yy=np.linspace(0,1,H); grad=np.clip((yy-0.72)/0.28,0,1)**1.2*0.55+np.clip((0.18-yy)/0.18,0,1)**1.3*0.55
shade=Image.fromarray((grad[:,None]*255).astype(np.uint8).repeat(W,1),'L')
dark=Image.new('RGB',(W,H),(12,10,14))
TOP=Image.new('RGBA',(W,H),(0,0,0,0)); dt=ImageDraw.Draw(TOP)
spaced(dt,TITLE,52,165,(255,236,210,235),5); spaced(dt,'六ツ扉',34,235,(240,232,222,215),30)
PINK=Image.new('RGB',(W,H),(255,70,170))
random.seed(3)
SP=[(random.uniform(0,W),random.uniform(0,H),random.uniform(2,6),random.uniform(60,220),random.uniform(-30,30),random.random()*6.28) for _ in range(70)]
ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
  '-ss',f'{START:.3f}','-t',f'{DUR:.3f}','-i',B+AUDIO,
  '-af',f'afade=t=in:d=0.03,afade=t=out:st={DUR-2.8:.2f}:d=2.8',
  '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','256k','-shortest',
  '-movflags','+faststart',OUT],stdin=subprocess.PIPE)
for n in range(int(DUR*FPS)):
    t=n/FPS; bt=t/SPB; ph=bt-int(bt)
    pulse=0.035*np.exp(-ph*6)
    if t<LEND:
        k=max(i for i,s in enumerate(SHOTS) if s[0]*SPB<=t)
        im=shot(k,t,pulse)
        if k>0 and t-SHOTS[k][0]*SPB<0.12:   # カットはビートでパッと切替＋白フラッシュ
            im=Image.blend(im,Image.new('RGB',(W,H),(255,240,250)),0.55*(1-(t-SHOTS[k][0]*SPB)/0.12))
        if int(bt)%4==0: im=Image.blend(im,PINK,0.10*np.exp(-ph*5))  # 小節頭にピンクの光
        im=Image.composite(dark,im,shade).convert('RGBA')
        im=Image.alpha_composite(im,TOP)
        if t>LEND-0.35: im=Image.blend(im.convert('RGB'),END,(t-(LEND-0.35))/0.35).convert('RGBA')
    else:
        im=END.convert('RGBA')
    sl=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sl)
    for x,y,r,v,dx,p in SP:
        px=(x+dx*t)%W; py=(y-v*t)%H; a=int((0.5+0.5*np.sin(p+t*4))*170)+40
        sd.ellipse((px-r,py-r,px+r,py+r),fill=(255,170,215,a))
    im=Image.alpha_composite(im,sl.filter(ImageFilter.GaussianBlur(1.5)))
    ff.stdin.write(im.convert('RGB').tobytes())
    if n%150==0: print(n,flush=True)
ff.stdin.close(); ff.wait(); print('done',ff.returncode,flush=True)
