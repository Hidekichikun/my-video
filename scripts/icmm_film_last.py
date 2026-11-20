# ラストのサビ：高校＋大学をいちばん速く → 「それぞれの道」でフィルムが上下2本に裂けて離れていく
import os, sys, math
os.environ['SCENE'] = '3'
import numpy as np
from PIL import Image
import render as R
import prints  # 歌詞の読み込み（R.LYR を全曲に）
import now as NW

W, H, FPS = 1920, 1080, 30
T0, T1 = 175.0, 241.5
SPLIT = 199.85
SPLIT_LEN = 3.4

# サビの歌詞はピンク（フィルム側）。裂けたあとは「今」の文字
R.LYR = prints.load_lrc()   # 最後までサビと同じピンクの歌詞
NW.T0 = T0
NW.BRIDGE = 199.6
N8IMG = Image.open('crop/N8v2_full.png')
N6IMG = Image.open('crop/N6v2_full.png')
DIMG = Image.open('crop/DE_full.png')
NW.N6 = N8IMG
GONE = (212.3, 3.0)      # 「あの道だけは覚えてる」で女の子が消えて、道だけになる
HODO = (230.6, 3.0)      # 「But I liked who I was」のあたりで歩道橋へ
TITLE = 237.6
NW.BLOCKS = []   # 「今」の白い文字は使わない
for _, _, rows in NW.BLOCKS:
    for st, s, k in rows:
        NW.TXT[s] = NW.text_img(s, k)

# ---- 散る：写真が1枚ずつはがれて、ふわーっと舞って消える ----
NW.NK, NW.NK_LEN = 0.85, 3.0
NW.BRIDGE = SPLIT + 0.3
PULL = (198.2, 1.6)     # 散る前にカメラが引いて、たくさんのコマが並ぶ
_scale0, _pos0 = R.scale_at, R.pos_at
def _ease_io(x):
    x = min(max(x, 0), 1); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def _scale(t):
    s, a, b = _scale0(t)
    return s * (1 - 0.6 * _ease_io((t - PULL[0]) / PULL[1])), a, b
def _pos(t):
    return _pos0(t) - 2.4 * _ease_io((t - PULL[0]) / PULL[1])
R.scale_at, R.pos_at = _scale, _pos

def ease(x):
    x = min(max(x, 0), 1); return 1 - (1 - x) ** 3

_frozen = {}
def frozen():
    if 'arr' in _frozen: return _frozen
    t = SPLIT
    lyr = R.LYR; R.LYR = []
    arr = R.frame_arr(t, int((t - T0) * FPS)).astype(np.float32)
    R.LYR = lyr
    s, _, _ = R.scale_at(t); p = R.pos_at(t)
    wy = 2.2 * math.sin(t * 13.1) + 1.4 * math.sin(t * 29.7 + 1)
    wx = 1.2 * math.sin(t * 17.3 + 2)
    sy = H / 2 + wy
    band = np.zeros((H, W), np.float32)
    y0, y1 = int(sy - (R.FH / 2 + R.BAND) * s), int(sy + (R.FH / 2 + R.BAND) * s)
    band[max(y0, 0):min(y1, H)] = 1
    cells = []
    rg = np.random.default_rng(21)
    for i, k in enumerate(R.ORDER):
        fx = W / 2 + (i * R.PITCH - p * R.PITCH) * s + wx
        cw, ch = round(R.FW * s), round(R.FH * s)
        x0c, y0c = round(fx - cw / 2), round(sy - ch / 2)
        if x0c + cw < 0 or x0c > W: continue
        xa, xb = max(x0c, 0), min(x0c + cw, W)
        crop = np.zeros((ch, cw, 3), np.float32)
        crop[:, xa - x0c:xb - x0c] = arr[y0c:y0c + ch, xa:xb]
        band[y0c:y0c + ch, xa:xb] = 0
        vm = np.zeros((ch, cw), np.uint8); vm[:, xa - x0c:xb - x0c] = 255
        cells.append(dict(vm=Image.fromarray(vm), img=Image.fromarray(np.clip(crop, 0, 255).astype(np.uint8)), cx=x0c + cw / 2, cy=y0c + ch / 2,
                          dx=rg.uniform(-260, 260), dy=rg.uniform(-520, -180), rot=rg.uniform(-28, 28),
                          delay=rg.uniform(0.0, 0.9), dur=rg.uniform(2.6, 3.6), sway=rg.uniform(20, 60), ph=rg.uniform(0, 6.28)))
    _frozen.update(arr=arr, band=band[..., None], cells=cells)
    return _frozen

def scatter(t, bg):
    F = frozen()
    lt = t - SPLIT
    out = bg.copy()
    # フィルムの帯はさっと消える
    bf = 1 - ease(lt / 0.9)
    if bf > 0:
        m = F['band'] * bf
        out = out * (1 - m) + F['arr'] * m
    for c in F['cells']:
        x = (lt - c['delay']) / c['dur']
        if x < 0:
            im = c['img']; vm = c['vm']; a = 1.0; px, py = c['cx'], c['cy']; rot = 0; sc = 1
        else:
            if x >= 1: continue
            e = ease(x)
            a = 1 - min(max((x - 0.25) / 0.75, 0), 1) ** 1.3
            px = c['cx'] + c['dx'] * e + c['sway'] * math.sin(lt * 1.6 + c['ph']) * e
            py = c['cy'] + c['dy'] * e
            rot = c['rot'] * e
            sc = 1 - 0.18 * e
            im = c['img']; vm = c['vm']
            if sc != 1:
                sz = (max(1, round(im.width * sc)), max(1, round(im.height * sc)))
                im = im.resize(sz, Image.BILINEAR); vm = vm.resize(sz, Image.BILINEAR)
            if x > 0.3: im = im.filter(ImageFilter.GaussianBlur(4 * (x - 0.3)))
        mask = vm
        if rot:
            im = im.rotate(rot, Image.BILINEAR, expand=True); mask = mask.rotate(rot, Image.BILINEAR, expand=True)
        X0, Y0 = round(px - im.width / 2), round(py - im.height / 2)
        xa, ya, xb, yb = max(X0, 0), max(Y0, 0), min(X0 + im.width, W), min(Y0 + im.height, H)
        if xa >= xb or ya >= yb: continue
        ia = np.asarray(im).astype(np.float32)[ya - Y0:yb - Y0, xa - X0:xb - X0]
        ma = (np.asarray(mask).astype(np.float32)[ya - Y0:yb - Y0, xa - X0:xb - X0] / 255 * a)[..., None]
        out[ya:yb, xa:xb] = out[ya:yb, xa:xb] * (1 - ma) + ia * ma
    return out

from PIL import ImageFilter
def draw_lyric(arr, t):
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

from PIL import ImageDraw, ImageFont
TF = ImageFont.truetype(R.FONT, 150)
TF2 = ImageFont.truetype(R.FONT, 45)
def _title_img():
    im = Image.new('L', (1100, 520), 0); d = ImageDraw.Draw(im)
    d.text((10, 140), 'I close', font=TF, fill=255, anchor='ls')
    d.text((10, 300), 'my mind', font=TF, fill=255, anchor='ls')
    x = 14
    for c in '六ツ扉':
        d.text((x, 420), c, font=TF2, fill=255, anchor='ls'); x += 45 + 32
    return im
TIMG = _title_img()
def draw_title(arr, t):
    p = ease((t - TITLE) / 2.0)
    if p <= 0: return arr
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

OUT = 'lframes'
def frame(n):
    t = T0 + n / FPS
    if t < SPLIT:
        arr = R.frame_arr(t, n).astype(np.float32)
    else:
        g = ease((t - GONE[0]) / GONE[1])
        NW.N6 = N8IMG if g <= 0 else (N6IMG if g >= 1 else Image.blend(N8IMG, N6IMG, g))
        bg = NW.now_frame(t, n)
        h = _ease_io((t - HODO[0]) / HODO[1])
        if h > 0:
            z = 1.0 + 0.01 * (t - HODO[0])
            fw, fh = int(W * z * 1.02), int(W * z * 1.02 * 816 / 1456)
            big = np.asarray(DIMG.resize((fw, fh), Image.BILINEAR)).astype(np.float32)
            oy, ox = (fh - H) // 2, (fw - W) // 2
            big = big[oy:oy + H, ox:ox + W] * R.VIG
            bg = bg * (1 - h) + big * h
        arr = draw_lyric(scatter(t, bg), t) if t < TITLE + 1.5 else scatter(t, bg)
        arr = draw_title(arr, t)
    arr *= min(max((t - T0) / 0.4, 0), 1) * min(max((T1 - t) / 1.0, 0), 1)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f'{OUT}/{n:05d}.jpg', quality=92)

def frame_full(n):
    t = n / FPS
    if t < SPLIT:
        arr = R.frame_arr(t, n).astype(np.float32)
    else:
        g = ease((t - GONE[0]) / GONE[1])
        NW.N6 = N8IMG if g <= 0 else (N6IMG if g >= 1 else Image.blend(N8IMG, N6IMG, g))
        bg = NW.now_frame(t, n)
        h = _ease_io((t - HODO[0]) / HODO[1])
        if h > 0:
            z = 1.0 + 0.01 * (t - HODO[0])
            fw, fh = int(W * z * 1.02), int(W * z * 1.02 * 816 / 1456)
            big = np.asarray(DIMG.resize((fw, fh), Image.BILINEAR)).astype(np.float32)
            oy, ox = (fh - H) // 2, (fw - W) // 2
            big = big[oy:oy + H, ox:ox + W] * R.VIG
            bg = bg * (1 - h) + big * h
        arr = draw_lyric(scatter(t, bg), t) if t < TITLE + 1.5 else scatter(t, bg)
        arr = draw_title(arr, t)
    arr *= min(max((T1 - t) / 1.0, 0), 1)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f'full/{n:05d}.jpg', quality=92)


if __name__ == '__main__' and os.environ.get('FULL'):
    os.makedirs('full', exist_ok=True)
    a, b = int(sys.argv[1]), int(sys.argv[2])
    for n in range(a, b):
        frame_full(n)
elif __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    a, b = int(sys.argv[1]), int(sys.argv[2])
    for n in range(a, b):
        frame(n)
