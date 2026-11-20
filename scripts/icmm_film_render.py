# I close my mind — フィルム版サビ1 試作（46.5s〜71.0s）
import numpy as np, math, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1920, 1080, 30
OUT = 'frames' + os.environ.get('SCENE', '1')
os.makedirs(OUT, exist_ok=True)
FONT = '/mnt/user-data/uploads/my-video/public/fonts/GenkaiMincho.ttf'

SCENE = os.environ.get('SCENE', '1')
if SCENE == '1':
    T0, T1 = 46.5, 77.4
    SEQ = ['H1', 'H2', 'H8', 'P1', 'H10', 'H7', 'H5', 'K2', 'H13', 'H12', 'H3', 'H11', 'H4', 'H14', 'P5']
    ORDER = ['FOG1', 'FOG2', 'P2'] + SEQ + ['FOG3', 'FOG4']
    PRE, POST = 'P2', 'P5'
    _T = [51.409, 52.291, 53.174, 54.056, 54.915, 55.774, 56.657, 57.539, 58.398, 59.281, 60.163, 61.022, 61.904,
          62.764, 63.646, 64.528, 65.411]
    STEPS = [(tt, k, 0.32) for tt, k in zip(_T, SEQ)]
    ZOOM_OUT = (50.109, 0.86)
    ZOOM_IN = (68.034, 0.86)
    DARKEN = None
elif SCENE == '3':
    T0, T1 = 174.0, 241.5
    SEQ = ['H10', 'U5', 'U6', 'I3', 'H1', 'U4', 'K2', 'H13', 'SB4', 'H5', 'I5', 'H12', 'U7', 'D1',
           'H7', 'SB3', 'H3', 'I2', 'H8', 'D4', 'H11', 'SB1', 'D3', 'P5', 'P2']
    ORDER = ['FOG1', 'FOG2', 'CV1'] + SEQ + ['FOG3', 'FOG4']
    PRE, POST = 'CV1', 'CV1'
    _B = [181.348, 181.766, 182.184, 182.625, 183.066, 183.507, 183.925, 184.366, 184.808, 185.226, 185.644, 186.061,
          186.479, 186.921, 187.362, 187.803, 188.244, 188.685, 189.127, 189.544, 189.962, 190.404, 190.845, 191.263,
          191.704, 192.145, 192.563, 193.004, 193.422, 193.863, 194.281, 194.723, 195.14, 195.582, 196.023, 196.464,
          196.882, 197.3, 197.741, 198.182, 198.623, 199.041, 199.483]
    # 後ろから1拍ずつ、前のほうは2拍ずつ。合計がコマ数になるように
    _n = len(SEQ)
    for k1 in range(len(_B), 0, -1):
        k2 = (len(_B) - k1 + 1) // 2
        if k1 + k2 <= _n:
            break
    _times = _B[:len(_B) - k1][::2][:_n - k1] + _B[len(_B) - k1:]
    STEPS = [(tt, SEQ[i], 0.3 if i < _n - k1 else 0.17) for i, tt in enumerate(_times[:_n])]
    ZOOM_OUT = (180.048, 0.86)
    ZOOM_IN = (999.0, 1.0)
    DARKEN = None
else:
    T0, T1 = 101.5, 122.5
    SEQ = ['U1', 'I1', 'U2', 'I2', 'I4', 'D1', 'U8', 'D2M', 'SB1', 'D3', 'SB2', 'D5', 'D4', 'U9']
    ORDER = ['FOG1', 'FOG2', 'BUS2'] + SEQ + ['FOG3', 'FOG4']
    PRE, POST = 'BUS2', 'U9'
    _T = [106.789, 107.671, 108.53, 109.389, 110.272, 111.154, 112.013, 112.872, 113.755, 114.614, 115.473,
          116.332, 117.214, 118.097]
    STEPS = [(tt, k, 0.32) for tt, k in zip(_T, SEQ)]
    ZOOM_OUT = (105.488, 0.86)
    ZOOM_IN = (118.75, 1.1)
    DARKEN = (119.8, 122.3)   # 間奏で暗くして「今」へ

IDX = {k: i for i, k in enumerate(ORDER)}
def _fog(seed):
    rg = np.random.default_rng(seed)
    yy_, xx_ = np.mgrid[0:816, 0:1088].astype(np.float32)
    cx, cy = rg.uniform(0, 1088), rg.uniform(0, 816)
    g = np.exp(-(((xx_ - cx) / 700) ** 2 + ((yy_ - cy) / 520) ** 2))[..., None]
    a = np.array([40, 22, 14], np.float32) + g * np.array([230, 120, 50], np.float32) * rg.uniform(0.5, 1.0)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
IMG = {k: (_fog(int(k[3:])) if k.startswith('FOG') else Image.open(f'crop/{k}.png')) for k in ORDER}
FW, FH, GAP, BAND = 1088, 816, 96, 136
PITCH = FW + GAP
S0 = 590 / FH
SFULL = 1920 / 1456 * 1.04
FULL = {k: Image.open(f'crop/{k}_full.png') for k in [PRE, POST]}

def ease(x):
    x = min(max(x, 0), 1)
    return 1 - (1 - x) ** 3 if x < 1 else 1
def ease_io(x):
    x = min(max(x, 0), 1)
    return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2

def pos_at(t):
    p = IDX[PRE]
    for st, k, d in STEPS:
        if t >= st:
            p = p + (IDX[k] - p) * ease((t - st) / d)
    # 止まってる間もちょっとだけ流れる
    p += 0.035 * math.sin(t * 0.9)
    if t > STEPS[-1][0]:
        p += 0.05 * (t - STEPS[-1][0]) / 5
    return p

def scale_at(t):
    a = ease_io((t - ZOOM_OUT[0]) / ZOOM_OUT[1])
    b = ease_io((t - ZOOM_IN[0]) / ZOOM_IN[1])
    s = SFULL + (S0 - SFULL) * a
    s = s + (SFULL - s) * b
    return s, a, b

# ---------- キャッシュ ----------
_cache = {}
def resized(k, s):
    key = (k, round(s, 3))
    if key not in _cache:
        if len(_cache) > 60: _cache.clear()
        _cache[key] = IMG[k].resize((max(1, round(FW * s)), max(1, round(FH * s))), Image.BILINEAR)
    return _cache[key]
_bg = {}
def bg_of(k):
    if k not in _bg:
        im = IMG[k].resize((480, 270)).filter(ImageFilter.GaussianBlur(18)).resize((W, H), Image.BILINEAR)
        a = np.asarray(im).astype(np.float32) * 0.42
        _bg[k] = a
    return _bg[k]

rng = np.random.default_rng(7)
GRAINS = [(rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32)) for _ in range(6)]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIG = 1 - 0.55 * (((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
VIG = np.clip(VIG, 0.25, 1)[..., None]

# ---------- 歌詞 ----------
LYR = [
    (45.50, '気づけば君が隣にいた'), (50.20, 'We were young, we were stupid'), (52.60, 'But damn, it felt alright'),
    (54.54, '寝て起きて　また君がいて'), (56.48, 'それだけでよかった'), (58.06, 'No plans, no rules'),
    (59.40, '何者でもなかったけど'), (61.36, 'あれはあれで'), (63.31, '悪くなかったよな'), (68.50, 'We were young'),
] if SCENE == '1' else [
    (101.10, '当たり前だと思ってた'), (105.90, 'We were young, we were stupid'), (108.43, 'But damn, it felt alright'),
    (110.09, '寝て起きて　また君がいて'), (112.19, '次の日も　また会ってた'), (113.87, 'No money, no clue'),
    (115.19, 'それでも世界は広かった'), (117.24, '何でもないあの毎日が'), (119.07, '俺には全部だった'),
]
BIG = {'We were young, we were stupid', 'But damn, it felt alright', 'We were young'}
_fonts = {}
def font(sz):
    if sz not in _fonts: _fonts[sz] = ImageFont.truetype(FONT, sz)
    return _fonts[sz]

def lyric_layer(t, centered):
    """(RGBA画像) 1文字ずつ浮かんでピンクに光る"""
    cur = None
    for i, (st, tx) in enumerate(LYR):
        end = LYR[i + 1][0] if i + 1 < len(LYR) else 999
        end = min(end, st + 4.2)
        if st - 0.05 <= t < end + 0.35:
            cur = (st, tx, end)
    if not cur: return None
    st, tx, end = cur
    big = tx in BIG
    sz = 74 if big else 58
    f = font(sz)
    out = 1 - min(max((t - end) / 0.35, 0), 1)
    stag = 0.045 if big else 0.06
    widths = [f.getlength(c) for c in tx]
    sp = 4 if not big else 3
    total = sum(widths) + sp * (len(tx) - 1)
    # サビ中は帯の下、全画面のときは下のほう
    y = H - 66
    x = (W - total) / 2
    txt = Image.new('L', (W, 200), 0); glow = Image.new('L', (W, 200), 0)
    dt, dg = ImageDraw.Draw(txt), ImageDraw.Draw(glow)
    for i, c in enumerate(tx):
        a = min(max((t - st - i * stag) / 0.35, 0), 1)
        if a > 0:
            g = a * (0.45 + 0.9 * math.exp(-((t - st - i * stag) - 0.3) ** 2 / 0.08))
            dt.text((x, 100), c, font=f, fill=int(255 * a * out), anchor='ls')
            dg.text((x, 100), c, font=f, fill=int(255 * min(g, 1) * out), anchor='ls')
        x += widths[i] + sp
    gl = glow.filter(ImageFilter.GaussianBlur(10))
    gl2 = glow.filter(ImageFilter.GaussianBlur(3))
    return np.asarray(txt).astype(np.float32) / 255, np.asarray(gl).astype(np.float32) / 255, np.asarray(gl2).astype(np.float32) / 255, y - 100

PINK = np.array([255, 120, 190], np.float32)

def frame_arr(t, n):
    s, za, zb = scale_at(t)
    p = pos_at(t)
    # ゆれ（ゲートウィーブ）
    wy = 2.2 * math.sin(t * 13.1) + 1.4 * math.sin(t * 29.7 + 1)
    wx = 1.2 * math.sin(t * 17.3 + 2)
    full_amt = max(1 - za, zb)  # 1=全画面

    ci = int(round(p))
    ci = min(max(ci, 0), len(ORDER) - 1)
    base = bg_of(ORDER[ci]).copy()
    canvas = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(canvas)

    cx_world = p * PITCH            # カメラ中心（コマ i の中心は x = -i*PITCH）
    sy = H / 2 + wy
    # 帯
    half = W / 2 / s + PITCH
    x_l = (-(half) ) ; x_r = half
    strip_top = sy - (FH / 2 + BAND) * s
    strip_bot = sy + (FH / 2 + BAND) * s
    d.rectangle([0, strip_top, W, strip_bot], fill=(22, 14, 10))
    # 穴（パーフォレーション）
    HP = PITCH / 8
    hw, hh = 52 * s, 74 * s
    k0 = math.floor((cx_world - half) / HP); k1 = math.ceil((cx_world + half) / HP)
    for k in range(k0, k1 + 1):
        hx = W / 2 + (k * HP - cx_world) * s + wx
        for yc in (sy - (FH / 2 + BAND / 2) * s, sy + (FH / 2 + BAND / 2) * s):
            d.rounded_rectangle([hx - hw / 2, yc - hh / 2, hx + hw / 2, yc + hh / 2], radius=max(1, 10 * s), fill=(236, 214, 186))
    # ふちの文字
    if s < 1.2:
        fs = font(max(8, int(24 * s)))
        for i in range(len(ORDER)):
            fx = W / 2 + (i * PITCH - cx_world) * s + wx
            if -400 < fx < W + 400:
                d.text((fx - FW / 2 * s, sy + (FH / 2 + BAND - 10) * s), f'{10 + i} ▸  ICMM 400', font=fs, fill=(214, 120, 52), anchor='ls')
                d.text((fx + 80 * s, sy - (FH / 2 + BAND - 30) * s), f'{10 + i}A', font=fs, fill=(214, 120, 52), anchor='ls')
    # コマ
    for i, k in enumerate(ORDER):
        fx = W / 2 + (i * PITCH - cx_world) * s + wx
        if fx + FW / 2 * s < 0 or fx - FW / 2 * s > W: continue
        im = resized(k, s)
        canvas.paste(im, (round(fx - im.width / 2), round(sy - im.height / 2)))
    arr = np.asarray(canvas).astype(np.float32)

    # 全画面のとき（ズームの前後）は元の16:9の絵をかぶせて、フチが残らないように
    if full_amt > 0.001:
        k = PRE if t < ZOOM_IN[0] else POST
        z = 1.0 + (0.04 * (t - T0) if k == PRE else 0.015 * (t - ZOOM_IN[0]))
        fim = FULL[k]
        fw, fh = int(W * z * 1.02), int(W * z * 1.02 * 816 / 1456)
        big = np.asarray(fim.resize((fw, fh), Image.BILINEAR)).astype(np.float32)
        oy, ox = (fh - H) // 2, (fw - W) // 2
        big = big[oy:oy + H, ox:ox + W]
        m = ease_io(min(max((full_amt - 0.55) / 0.45, 0), 1))
        arr = arr * (1 - m) + big * m

    # 光漏れ（右上からオレンジ）
    lk = 0.5 + 0.5 * math.sin(t * 0.8 + 1.3)
    lx = W * (0.85 + 0.1 * math.sin(t * 0.5)); ly = H * 0.1
    leak = np.exp(-(((xx - lx) / 520) ** 2 + ((yy - ly) / 380) ** 2))[..., None]
    arr = arr + leak * np.array([255, 120, 40], np.float32) * (0.22 + 0.25 * lk)
    # チラつき
    fl = 1 + 0.035 * math.sin(n * 2.9) * math.sin(n * 1.37 + 0.5)
    arr = arr * fl * VIG
    # 粒子
    g = GRAINS[n % 6]
    g = np.repeat(np.repeat(g, 2, 0), 2, 1)
    arr = arr + g[..., None] * 9
    # たまに傷（縦線）
    r = np.random.default_rng(n * 31 + 5)
    if r.random() < 0.18:
        x0 = int(r.uniform(100, W - 100))
        arr[:, x0:x0 + 2] = arr[:, x0:x0 + 2] * 0.6 + 200 * 0.4
    for _ in range(int(r.integers(0, 3))):
        x0, y0 = int(r.uniform(0, W - 6)), int(r.uniform(0, H - 6))
        arr[y0:y0 + 3, x0:x0 + 4] = 235

    # 歌詞
    L = lyric_layer(t, full_amt)
    if L:
        txt, gl, gl2, y = L
        y0, y1 = max(y, 0), min(y + 200, H)
        sl = slice(y0 - y, y1 - y)
        reg = arr[y0:y1]
        sh = gl[sl][..., None]
        reg = reg * (1 - 0.55 * np.clip(gl[sl] * 1.4, 0, 1)[..., None])  # 文字の後ろを少し暗く
        reg = reg + PINK * (sh * 1.5 + gl2[sl][..., None] * 0.6)
        tt = txt[sl][..., None]
        reg = reg * (1 - tt) + np.array([255, 246, 250], np.float32) * tt
        arr[y0:y1] = reg

    # 終わりのフェードアウト
    fo = min(max((T1 - t) / 0.7, 0), 1)
    if DARKEN: fo *= 1 - 0.85 * min(max((t - DARKEN[0]) / (DARKEN[1] - DARKEN[0]), 0), 1)
    fi = min(max((t - T0) / 0.4, 0), 1)
    arr = arr * fo * fi
    return np.clip(arr, 0, 255).astype(np.uint8)

def frame(n):
    os.makedirs(OUT, exist_ok=True)
    Image.fromarray(frame_arr(T0 + n / FPS, n)).save(f'{OUT}/{n:05d}.jpg', quality=93)

if __name__ == '__main__':
    a, b = int(sys.argv[1]), int(sys.argv[2])
    for n in range(a, b):
        frame(n)
