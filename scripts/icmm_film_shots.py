# 全画面の1枚絵（イントロ・ブリッジ用）の共通部品
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1920, 1080
_full = {}
def full_img(k):
    if k not in _full:
        _full[k] = Image.open(f'crop/{k}_full.png').convert('RGB')
    return _full[k]

def ease(x):
    x = min(max(x, 0), 1); return 1 - (1 - x) ** 3
def ease_io(x):
    x = min(max(x, 0), 1); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2

def shot(k, z, panx=0.0, tint=None, dark=1.0):
    """元の16:9の絵を画面いっぱいに。z=拡大率、panx=-1..1"""
    im = full_img(k)
    fw, fh = int(W * z * 1.02), int(W * z * 1.02 * 816 / 1456)
    big = np.asarray(im.resize((fw, fh), Image.BILINEAR)).astype(np.float32)
    ox = int((fw - W) / 2 * (1 + panx * 0.9)); oy = (fh - H) // 2
    a = big[oy:oy + H, ox:ox + W]
    if tint is not None: a = a * np.array(tint, np.float32)
    return a * dark

def film_fx(arr, t, n, R, leak=0.6):
    """フィルムっぽさ（光漏れ・チラつき・周辺減光・粒子）"""
    if leak > 0:
        lk = 0.5 + 0.5 * math.sin(t * 0.8 + 1.3)
        lx = W * (0.85 + 0.1 * math.sin(t * 0.5)); ly = H * 0.1
        leakm = np.exp(-(((R.xx - lx) / 520) ** 2 + ((R.yy - ly) / 380) ** 2))[..., None]
        arr = arr + leakm * np.array([255, 120, 40], np.float32) * (0.12 + 0.14 * lk) * leak
    fl = 1 + 0.03 * math.sin(n * 2.9) * math.sin(n * 1.37 + 0.5)
    arr = arr * fl * R.VIG
    g = R.GRAINS[n % 6]; g = np.repeat(np.repeat(g, 2, 0), 2, 1)
    return arr + g[..., None] * 8

def draw_lyric(arr, t, R):
    L = R.lyric_layer(t, 0)
    if not L: return arr
    txt, gl, gl2, y = L
    y0, y1 = max(y, 0), min(y + 200, H)
    sl = slice(y0 - y, y1 - y)
    reg = arr[y0:y1]
    reg = reg * (1 - 0.55 * np.clip(gl[sl] * 1.4, 0, 1)[..., None])
    reg = reg + R.PINK * (gl[sl][..., None] * 1.5 + gl2[sl][..., None] * 0.6)
    tt = txt[sl][..., None]
    reg = reg * (1 - tt) + np.array([255, 246, 250], np.float32) * tt
    arr[y0:y1] = reg
    return arr

# 曲名（v3と同じ並び：左寄せ「I close / my mind」＋「六ツ扉」）
_T = {}
def title_img(font_path):
    if 'im' in _T: return _T['im']
    TF = ImageFont.truetype(font_path, 150); TF2 = ImageFont.truetype(font_path, 45)
    im = Image.new('L', (1100, 520), 0); d = ImageDraw.Draw(im)
    d.text((10, 140), 'I close', font=TF, fill=255, anchor='ls')
    d.text((10, 300), 'my mind', font=TF, fill=255, anchor='ls')
    x = 14
    for c in '六ツ扉':
        d.text((x, 420), c, font=TF2, fill=255, anchor='ls'); x += 45 + 32
    _T['im'] = im
    return im

def draw_title(arr, p, font_path):
    if p <= 0: return arr
    TIMG = title_img(font_path)
    im = TIMG.filter(ImageFilter.GaussianBlur((1 - p) * 10)) if p < 0.98 else TIMG
    m = np.asarray(im).astype(np.float32)[..., None] / 255 * p
    gl = np.asarray(TIMG.filter(ImageFilter.GaussianBlur(26))).astype(np.float32)[..., None] / 255 * p
    sh = np.asarray(TIMG.filter(ImageFilter.GaussianBlur(10))).astype(np.float32)[..., None] / 255 * p
    x0, y0 = 140, (H - TIMG.height) // 2
    reg = arr[y0:y0 + TIMG.height, x0:x0 + TIMG.width]
    reg = reg * (1 - 0.6 * np.clip(sh * 1.5, 0, 1))
    reg = reg + np.array([255, 110, 180], np.float32) * gl * 0.9
    reg = reg * (1 - m) + 255 * m
    arr[y0:y0 + TIMG.height, x0:x0 + TIMG.width] = reg
    return arr
