# 「今」のパート：絵を出さずに歌詞だけ。黒い背景＋街の光のボケ＋雪
import os, sys, math
os.environ['SCENE'] = '2'
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import render as R

W, H, FPS = 1920, 1080, 30
T0, T1 = 117.5, 151.5
HAND = 121.8          # サビ2のフィルム → 「今」
BRIDGE = 149.0        # 曲がり角の絵がもどってくる
NK, NK_LEN = 0.55, 2.0

JP = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Light.ttc', 68, index=0)
for i in range(10):
    try:
        f = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSerifCJK-Light.ttc', 68, index=i)
        if 'JP' in f.getname()[0]: JP = f; break
    except Exception: break
EN = ImageFont.truetype('GreatVibes.ttf', 156)
EN2 = ImageFont.truetype('GreatVibes.ttf', 126)

# (出る, 消える, [(行の出る時刻, 文字, 種類)])
BLOCKS = [
    (127.6, 131.0, [(127.80, '今じゃ連絡も取らないし', 'jp'), (129.78, 'どこで何してるかも知らない', 'jp')]),
    (131.15, 134.9, [(131.32, '別々の今日を生きながら', 'jp'), (133.06, 'たまに君が浮かんでくる', 'jp')]),
    (134.95, 137.95, [(135.10, '銭湯で若いやつらが', 'jp'), (136.50, 'でかい声で笑ってると', 'jp')]),
    (137.95, 141.1, [(138.10, '「ああ、俺らもあんなだったな」って', 'jp'), (140.05, 'あの頃の声まで聞こえてくる', 'jp')]),
    (141.8, 146.0, [(142.00, 'I wonder where you are now', 'en')]),
    (146.2, 149.4, [(146.40, 'Still laughing somewhere?', 'en2')]),
]

def ease(x):
    x = min(max(x, 0), 1); return 1 - (1 - x) ** 3

def text_img(s, kind):
    if kind == 'jp':
        sp = 20
        ws = [JP.getlength(c) for c in s]
        w = int(sum(ws) + sp * (len(s) - 1)) + 40
        im = Image.new('L', (w, 140), 0); d = ImageDraw.Draw(im)
        x = 20
        for c, cw in zip(s, ws):
            d.text((x, 100), c, font=JP, fill=255, anchor='ls'); x += cw + sp
        return im
    f = EN if kind == 'en' else EN2
    w = int(f.getlength(s)) + 80
    im = Image.new('L', (w, 260), 0)
    ImageDraw.Draw(im).text((40, 175), s, font=f, fill=255, anchor='ls')
    return im
TXT = {}
for _, _, rows in BLOCKS:
    for st, s, k in rows:
        TXT[s] = text_img(s, k)

# ボケ（街の光）
rg = np.random.default_rng(11)
BOKEH = []
for i in range(26):
    col = [(255, 176, 110), (255, 140, 170), (140, 175, 255), (255, 214, 150)][rg.integers(0, 4)]
    BOKEH.append(dict(x=rg.uniform(0, 960), y=rg.uniform(60, 500), r=rg.uniform(14, 60), a=rg.uniform(0.05, 0.16),
                      vx=rg.uniform(-6, 6), ph=rg.uniform(0, 6.28), c=col))
SNOW = [dict(x=rg.uniform(0, W), y=rg.uniform(-H, H), s=rg.uniform(1.5, 4.5), v=rg.uniform(25, 70),
             sw=rg.uniform(10, 40), ph=rg.uniform(0, 6.28), a=rg.uniform(0.25, 0.7)) for _ in range(140)]

N6 = Image.open('crop/N6v2_full.png') if os.path.exists('crop/N6v2_full.png') else None

def now_frame(t, n):
    lay = Image.new('RGB', (960, 540), (0, 0, 0)); d = ImageDraw.Draw(lay)
    for b in BOKEH:
        x = (b['x'] + b['vx'] * (t - T0)) % 1000 - 20
        r = b['r'] * (1 + 0.08 * math.sin(t * 0.6 + b['ph']))
        a = b['a'] * (0.7 + 0.3 * math.sin(t * 0.4 + b['ph']))
        c = tuple(int(v * a) for v in b['c'])
        d.ellipse([x - r, b['y'] - r, x + r, b['y'] + r], fill=c)
    lay = lay.filter(ImageFilter.GaussianBlur(9)).resize((W, H), Image.BILINEAR)
    arr = np.asarray(lay).astype(np.float32) * 1.6 + np.array([6, 6, 10], np.float32)
    # 曲がり角がもどってくる
    if N6 is not None and t > BRIDGE:
        k = ease((t - BRIDGE) / NK_LEN) * NK
        z = 1.0 + 0.012 * (t - BRIDGE)
        fw, fh = int(W * z * 1.02), int(W * z * 1.02 * 816 / 1456)
        big = np.asarray(N6.resize((fw, fh), Image.BILINEAR)).astype(np.float32)
        oy, ox = (fh - H) // 2, (fw - W) // 2
        big = big[oy:oy + H, ox:ox + W] * np.array([0.75, 0.82, 1.0])   # 夜っぽく青く
        arr = arr * (1 - k) + big * k
    # 雪
    snow = Image.new('L', (W, H), 0); sd = ImageDraw.Draw(snow)
    for p in SNOW:
        y = (p['y'] + p['v'] * (t - T0)) % (H + 40) - 20
        x = p['x'] + p['sw'] * math.sin(t * 0.8 + p['ph'])
        sd.ellipse([x - p['s'], y - p['s'], x + p['s'], y + p['s']], fill=int(255 * p['a']))
    snow = np.asarray(snow.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)[..., None] / 255
    arr = arr * (1 - snow * 0.8) + 235 * snow * 0.8
    # 歌詞
    for b0, b1, rows in BLOCKS:
        if not (b0 - 0.1 <= t <= b1 + 0.8): continue
        out = 1 - ease((t - b1) / 0.8)
        nrows = len(rows)
        for i, (st, s, k) in enumerate(rows):
            im = TXT[s]
            if k == 'jp':
                a = ease((t - st) / 1.1) * out
                if a <= 0: continue
                blur = (1 - ease((t - st) / 1.1)) * 7
                if blur > 0.3: im = im.filter(ImageFilter.GaussianBlur(blur))
                m = np.asarray(im).astype(np.float32) / 255 * a
                gl = np.asarray(im.filter(ImageFilter.GaussianBlur(14))).astype(np.float32) / 255 * a
            else:
                # 左の文字から順にフェードイン
                if t < st: continue
                prog = min(max((t - st) / 1.9, 0), 1)
                prog = 1 - (1 - prog) ** 2
                fe = 260.0
                xs = np.arange(im.width, dtype=np.float32)
                wipe = np.clip((prog * (im.width + fe) - xs) / fe, 0, 1)[None, :]
                m = np.asarray(im).astype(np.float32) / 255 * wipe * out
                gl = np.asarray(im.filter(ImageFilter.GaussianBlur(14))).astype(np.float32) / 255 * wipe * out
            if k == 'jp':
                cy = H / 2 + (i - (nrows - 1) / 2) * 150 - 8 * (1 - ease((t - st) / 1.1))
                top = int(cy - 72)
            else:
                cy = H / 2 - 8 * (1 - ease((t - st) / 1.1))
                top = int(cy - 140)
            left = (W - im.width) // 2
            y0, y1 = max(top, 0), min(top + im.height, H)
            reg = arr[y0:y1, left:left + im.width]
            mm = m[y0 - top:y1 - top][..., None]; gg = gl[y0 - top:y1 - top][..., None]
            reg = reg + np.array([255, 236, 220], np.float32) * gg * 0.35
            reg = reg * (1 - mm) + np.array([250, 246, 240], np.float32) * mm
            arr[y0:y1, left:left + im.width] = reg
    # 周辺減光・粒子
    arr = arr * R.VIG
    g = R.GRAINS[n % 6]; g = np.repeat(np.repeat(g, 2, 0), 2, 1)
    arr = arr + g[..., None] * 5
    return arr

OUT = 'nframes'
def frame(n):
    t = T0 + n / FPS
    if t < HAND:
        arr = R.frame_arr(t, n).astype(np.float32)
    else:
        arr = now_frame(t, n)
        x = (t - HAND) / 0.8
        if x < 1:
            arr = arr * x + R.frame_arr(t, n).astype(np.float32) * (1 - x)
    arr *= min(max((t - T0) / 0.4, 0), 1) * min(max((T1 - t) / 0.8, 0), 1)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f'{OUT}/{n:05d}.jpg', quality=92)

def frame_full(n):
    t = n / FPS
    if t < HAND:
        arr = R.frame_arr(t, n).astype(np.float32)
    else:
        arr = now_frame(t, n)
        x = (t - HAND) / 0.8
        if x < 1:
            arr = arr * x + R.frame_arr(t, n).astype(np.float32) * (1 - x)
    os.makedirs('full', exist_ok=True)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f'full/{n:05d}.jpg', quality=92)

if __name__ == '__main__' and os.environ.get('FULL'):
    a, b = int(sys.argv[1]), int(sys.argv[2])
    for n in range(a, b):
        frame_full(n)
elif __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    a, b = int(sys.argv[1]), int(sys.argv[2])
    for n in range(a, b):
        frame(n)
