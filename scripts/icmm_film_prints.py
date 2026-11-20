# Aメロ・Bメロ＝机の上に現像したプリントが1枚ずつ重なっていく → サビのフィルムへ
import os, sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import render as R

W, H, FPS = 1920, 1080, 30
SCENE = os.environ.get('SCENE', '1')

if SCENE == '1':
    T0, T1 = 12.0, 71.0
    PRINTS = [(14.45, 'A', "'09  6 12"), (17.9, 'S1', "'09  6 12"), (21.3, 'BUS1', "'09  6 12"),
              (25.0, 'N1', "'09  8  3"), (33.0, 'N2', "'09  9 21"), (41.7, 'P2', "'09 10  4")]
    HAND = 49.35          # ここでフィルムの全画面に切り替わる
else:
    T0, T1 = 77.4, 122.5
    PRINTS = [(78.2, 'B', "'11  8 27"), (85.0, 'C', "'11  8 15"), (91.8, 'V2P', "'12  5 19"),
              (97.6, 'BUS2', "'12 11 30")]
    HAND = 104.75
ZOOM_LEN = 1.5

# ---- 歌詞（全部） ----
LRC = '/mnt/user-data/uploads/my-video/lyrics.lrc'
def load_lrc():
    out = []
    import re
    for line in open(LRC, encoding='utf-8'):
        m = re.match(r'\[(\d+):(\d+\.\d+)\](.*)', line.strip())
        if m and m.group(3).strip():
            out.append((int(m.group(1)) * 60 + float(m.group(2)), m.group(3).strip()))
    return out
R.LYR = load_lrc()
R.BIG = {'We were young, we were stupid', 'But damn, it felt alright', 'We were young'}

# ---- 机（木目） ----
rng = np.random.default_rng(3)
def make_table():
    n = rng.normal(0, 1, (H // 4, W // 32)).astype(np.float32)
    im = Image.fromarray(((n - n.min()) / (n.max() - n.min()) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    g = np.asarray(im).astype(np.float32) / 255
    yy = np.arange(H, dtype=np.float32)[:, None]
    grain = 0.5 + 0.5 * np.sin(yy * 0.045 + g * 9)
    base = np.array([58, 36, 22], np.float32)
    a = base * (0.75 + 0.35 * grain[..., None]) * (0.85 + 0.3 * g[..., None])
    # 電気スタンドの明かり
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
    lamp = np.exp(-(((X - W * 0.45) / 1100) ** 2 + ((Y - H * 0.35) / 750) ** 2))[..., None]
    a = a * (0.35 + 0.9 * lamp)
    return a
TABLE = make_table()

DATEF = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 30)
def make_print(k, date):
    img = Image.open(f'crop/{k}_full.png').convert('RGB')     # 16:9 のまま
    iw, ih = 1240, round(1240 * 816 / 1456)
    img = img.resize((iw, ih), Image.LANCZOS)
    b, bb = 34, 34
    pw, ph = iw + b * 2, ih + b + bb
    p = Image.new('RGB', (pw, ph), (240, 234, 222))
    p.paste(img, (b, b))
    d = ImageDraw.Draw(p)
    # 日付の焼き込み（オレンジ）
    gl = Image.new('L', (pw, ph), 0); ImageDraw.Draw(gl).text((b + iw - 210, b + ih - 56), date, font=DATEF, fill=255)
    glow = gl.filter(ImageFilter.GaussianBlur(4))
    pa = np.asarray(p).astype(np.float32)
    pa += (np.asarray(glow).astype(np.float32)[..., None] / 255) * np.array([255, 120, 30]) * 0.9
    m = np.asarray(gl).astype(np.float32)[..., None] / 255
    pa = pa * (1 - m) + np.array([255, 170, 70]) * m
    p = Image.fromarray(np.clip(pa, 0, 255).astype(np.uint8))
    return p, (b, b, iw, ih)
PR = {}
for i, (st, k, date) in enumerate(PRINTS):
    pr = np.random.default_rng(100 + i)
    PR[k] = dict(img=make_print(k, date), st=st, rot=pr.uniform(-4, 4) if i < len(PRINTS) - 1 else pr.uniform(-2, 2),
                 off=(pr.uniform(-60, 60), pr.uniform(-30, 30)), frm=(pr.choice([-1, 1]) * 1500, pr.uniform(300, 600)))

def ease(x):
    x = min(max(x, 0), 1); return 1 - (1 - x) ** 3
def ease_io(x):
    x = min(max(x, 0), 1); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2

BASE_S = 0.82   # 机の上でのプリントの大きさ
CY = 470        # プリントの中心（下に歌詞）

def print_frame(t, n):
    canvas = Image.fromarray(np.clip(TABLE, 0, 255).astype(np.uint8))
    shadow = Image.new('L', (W, H), 0)
    vis = [(k, v) for k, v in PR.items() if t >= v['st'] - 0.05]
    if not vis:
        vis = []
    cur = vis[-1][1] if vis else None
    # カメラ：今のプリントにゆっくり寄る。最後のプリントは全画面まで寄る
    cs = 1.0 + 0.05 * min(max((t - cur['st']) / 8, 0), 1) if cur else 1.0
    last = list(PR.values())[-1]
    zin = ease_io((t - (HAND - ZOOM_LEN)) / ZOOM_LEN)
    if vis and cur is last:
        (pimg, (bx, by, iw, ih)) = cur['img']
        s_full = W * 1.02 * (1 + 0.04 * (HAND - R.T0)) / iw / BASE_S
        cs = cs + (s_full - cs) * zin
    # カメラの中心は今のプリント（寄るときは写真の真ん中へ）
    camx, camy = 0.0, 0.0
    if cur:
        camx, camy = cur['off'][0] * ease((t - cur['st']) / 0.9), cur['off'][1] * ease((t - cur['st']) / 0.9)
    layers = vis[-3:]
    for k, v in layers:
        pimg, (bx, by, iw, ih) = v['img']
        a = ease((t - v['st']) / 0.9)
        x = v['frm'][0] * (1 - a) + v['off'][0]
        y = v['frm'][1] * (1 - a) + v['off'][1]
        rot = v['rot'] + (1 - a) * 14 * (1 if v['frm'][0] > 0 else -1)
        if v is last:
            rot = rot * (1 - zin)
        s = BASE_S * cs
        # 下になったプリントは少し暗く
        dim = 1.0
        if v is not cur:
            dim = 0.72
        sw, sh = max(1, round(pimg.width * s)), max(1, round(pimg.height * s))
        im = pimg.resize((sw, sh), Image.BILINEAR)
        if dim < 1:
            im = Image.fromarray((np.asarray(im).astype(np.float32) * dim).astype(np.uint8))
        mask = Image.new('L', im.size, 255)
        im = im.rotate(rot, Image.BILINEAR, expand=True)
        mask = mask.rotate(rot, Image.BILINEAR, expand=True)
        # 写真の中心（白フチの上下非対称を補正）
        sx = W / 2 + (x - camx) * cs
        sy = CY + (y - camy) * cs + (H / 2 - CY) * zin * (1 if v is last else 0)
        px, py = round(sx - im.width / 2), round(sy - im.height / 2)
        sm = mask.filter(ImageFilter.GaussianBlur(6))
        shadow_im = Image.new('L', (W, H), 0); shadow_im.paste(sm, (px + 14, py + 18))
        ca = np.asarray(canvas).astype(np.float32)
        ca *= 1 - 0.55 * (np.asarray(shadow_im).astype(np.float32)[..., None] / 255)
        canvas = Image.fromarray(ca.astype(np.uint8))
        canvas.paste(im, (px, py), mask)
    arr = np.asarray(canvas).astype(np.float32)
    # ランプのゆらぎ・粒子・周辺減光（フィルム側と同じ）
    arr = arr * (1 + 0.02 * math.sin(n * 0.7)) * R.VIG
    g = R.GRAINS[n % 6]; g = np.repeat(np.repeat(g, 2, 0), 2, 1)
    arr = arr + g[..., None] * 7
    # 歌詞
    L = R.lyric_layer(t, 0)
    if L:
        txt, gl, gl2, y = L
        y0, y1 = max(y, 0), min(y + 200, H)
        sl = slice(y0 - y, y1 - y)
        reg = arr[y0:y1]
        reg = reg * (1 - 0.55 * np.clip(gl[sl] * 1.4, 0, 1)[..., None])
        reg = reg + R.PINK * (gl[sl][..., None] * 1.5 + gl2[sl][..., None] * 0.6)
        tt = txt[sl][..., None]
        reg = reg * (1 - tt) + np.array([255, 246, 250], np.float32) * tt
        arr[y0:y1] = reg
    return np.clip(arr, 0, 255).astype(np.uint8)

OUT = 'pframes' + SCENE
def frame(n):
    t = T0 + n / FPS
    if t < HAND:
        arr = print_frame(t, n).astype(np.float32)
    else:
        arr = R.frame_arr(t, n).astype(np.float32)
        x = (t - HAND) / 0.3
        if x < 1:
            arr = arr * x + print_frame(t, n).astype(np.float32) * (1 - x)
    fi = min(max((t - T0) / 0.6, 0), 1)
    arr *= fi
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f'{OUT}/{n:05d}.jpg', quality=92)

if __name__ == '__main__' and not os.environ.get('FULL'):
    os.makedirs(OUT, exist_ok=True)
    a, b = int(sys.argv[1]), int(sys.argv[2])
    for n in range(a, b):
        frame(n)


def frame_full(n):
    t = n / FPS
    if t < HAND:
        arr = print_frame(t, n).astype(np.float32)
    else:
        arr = R.frame_arr(t, n).astype(np.float32)
        x = (t - HAND) / 0.3
        if x < 1:
            arr = arr * x + print_frame(t, n).astype(np.float32) * (1 - x)
    if SCENE == '2':
        arr *= min(max((t - T0) / 0.6, 0), 1)
    if SCENE == '1' and t >= 74.2:
        import shots as S
        def sh(k, st, pan):
            a = S.shot(k, 1.03 + 0.012 * (t - st), panx=pan)
            return S.draw_lyric(S.film_fx(a, t, n, R, leak=0.6), t, R)
        x1 = S.ease_io((t - 74.25) / 0.5)
        arr = arr * (1 - x1) + sh('PC1', 74.25, -0.3) * x1
        x2 = S.ease_io((t - 76.3) / 0.4)
        if x2 > 0: arr = arr * (1 - x2) + sh('PC2', 76.3, 0.0) * x2
        x3 = S.ease_io((t - 77.45) / 0.55)
        if x3 > 0:
            tb = TABLE * (1 + 0.02 * math.sin(n * 0.7)) * R.VIG
            g = R.GRAINS[n % 6]; g = np.repeat(np.repeat(g, 2, 0), 2, 1)
            tb = S.draw_lyric(tb + g[..., None] * 7, t, R)
            arr = arr * (1 - x3) + tb * x3
    os.makedirs('full', exist_ok=True)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f'full/{n:05d}.jpg', quality=92)

if __name__ == '__main__' and os.environ.get('FULL'):
    a, b = int(sys.argv[1]), int(sys.argv[2])
    for n in range(a, b):
        frame_full(n)
