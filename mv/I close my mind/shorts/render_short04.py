# I close my mind ショート v3「思い出フィルム」
# 使い方: python render.py pre|release [out.mp4]
import sys, math, random, subprocess, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

MODE = sys.argv[1] if len(sys.argv) > 1 else "pre"
OUT = sys.argv[2] if len(sys.argv) > 2 else f"IClosemyMind_short04_film_{MODE}.mp4"
PREVIEW = os.environ.get("PREVIEW")  # "t1,t2,..." -> write PNGs only

U = "/mnt/user-data/uploads/my-video"
PH = U + "/photo/I close my mind"
WAV = U + "/music/mastered/I close my mind (master).wav"
JACKET = U + "/music/jacket/I close my mind_jacket.png"
F_MIN = U + "/public/fonts/ShipporiMincho-SemiBold.ttf"
F_COR = U + "/public/fonts/CormorantGaramond-VF.ttf"
F_CORI = U + "/public/fonts/CormorantGaramond-Italic-VF.ttf"
F_DOT = U + "/public/fonts/DotGothic16.ttf"

W, H, FPS = 1080, 1920, 30
T0, T1 = 47.04, 79.30
DUR = T1 - T0
NF = int(round(DUR * FPS))

# librosa で出したビート（136BPM）
BEATS = [40.44, 40.86, 41.3, 41.74, 42.18, 42.65, 43.07, 43.51, 43.95, 44.39, 44.83, 45.27,
         45.71, 46.15, 46.59, 47.04, 47.48, 47.92, 48.36, 48.78, 49.22, 49.66, 50.1, 50.54,
         50.98, 51.42, 51.87, 52.28, 52.72, 53.17, 53.61, 54.05, 54.49, 54.91, 55.35, 55.77,
         56.21, 56.65, 57.09, 57.53, 57.97, 58.39, 58.83, 59.27, 59.71, 60.15, 60.6, 61.01,
         61.46, 61.9, 62.34, 62.78, 63.2, 63.64, 64.08, 64.52, 64.96, 65.4, 65.84, 66.28,
         66.73, 67.14, 67.59, 68.03, 68.47, 68.91, 69.35, 69.77, 70.21, 70.65, 71.09, 71.53,
         71.97, 72.39, 72.83, 73.27, 73.72, 74.16, 74.6, 75.02, 75.46, 75.9, 76.34, 76.78,
         77.22, 77.66, 78.08, 78.52, 78.96, 79.38]
I0 = BEATS.index(50.1)
def B(i): return BEATS[I0 + i]

def font(path, size, wght=None):
    f = ImageFont.truetype(path, size)
    if wght:
        try: f.set_variation_by_axes([wght])
        except Exception: pass
    return f

# ---------- 写真 ----------
PHOTOS = {
    "A":   ("服装変更_v2/教室_制服_ヘッドホンなし.png", 0.26, "'09  6 12"),
    "B":   ("服装変更_v2/追加シーン/自販機前_クリームパーカー.png", 0.50, "'09  8 03"),
    "C":   ("服装変更_v2/追加シーン/花火_クリームパーカー.png", 0.50, "'09  8 15"),
    "D":   ("服装変更_v2/追加シーン/歩道橋_クリームパーカー.png", 0.60, "'09 12 24"),
    "N1":  ("MV素材/N1_BBQ.png", 0.48, "'09  7 26"),
    "N2":  ("MV素材/N2_自販機.png", 0.42, "'09  7 08"),
    "N6b": ("MV素材/N6b_曲がり角_過去.png", 0.44, "'09 10 30"),
    "P1":  ("MV素材/P1_寝起き.png", 0.40, "'09  8 16"),
    "P2":  ("MV素材/P2_線路沿い.png", 0.40, "'09  9 05"),
    "P3":  ("MV素材/P3_夜の公園.png", 0.42, "'09  8 21"),
    "P4":  ("MV素材/P4_改札.png", 0.52, "'09 11 02"),
    "P5":  ("MV素材/P5_屋上.png", 0.36, "'09  6 19"),
}
PS = 900      # 写真の大きさ（正方形）
BD = 26       # 白フチ
PCX, PCY = 540, 860
f_stamp = font(F_DOT, 40)

def square_crop(im, cx):
    w, h = im.size
    s = min(w, h)
    x = int(round(cx * w - s / 2)); x = max(0, min(w - s, x))
    return im.crop((x, 0, x + s, s))

def make_print(key):
    path, cx, date = PHOTOS[key]
    im = Image.open(f"{PH}/{path}").convert("RGB")
    sq = square_crop(im, cx).resize((PS, PS), Image.LANCZOS)
    # 使い捨てカメラっぽく：少しあたたかく、黒を浮かせる
    a = np.asarray(sq).astype(np.float32)
    a = a * np.array([1.04, 1.0, 0.92]) * 0.94 + 10
    sq = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    # 日付スタンプ（オレンジ）
    lay = Image.new("RGBA", sq.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    tw = d.textlength(date, font=f_stamp)
    pos = (PS - tw - 34, PS - 74)
    d.text(pos, date, font=f_stamp, fill=(255, 120, 30, 255))
    glow = lay.filter(ImageFilter.GaussianBlur(6))
    sq = sq.convert("RGBA"); sq.alpha_composite(glow); sq.alpha_composite(glow); sq.alpha_composite(lay)
    pr = Image.new("RGBA", (PS + BD * 2, PS + BD * 2), (246, 242, 234, 255))
    pr.paste(sq, (BD, BD))
    return pr

def make_bg(img_rgb, cx=0.5):
    w, h = img_rgb.size
    sc = H / h
    im = img_rgb.resize((int(w * sc), H), Image.LANCZOS)
    x = int(cx * im.width - W / 2); x = max(0, min(im.width - W, x))
    im = im.crop((x, 0, x + W, H)).filter(ImageFilter.GaussianBlur(36))
    a = np.asarray(im).astype(np.float32) * 0.42
    return a

PRINTS, BGS = {}, {}
for k, (p, cx, _) in PHOTOS.items():
    PRINTS[k] = make_print(k)
    BGS[k] = make_bg(Image.open(f"{PH}/{p}").convert("RGB"), cx)
jk = Image.open(JACKET).convert("RGB")
JS = 800
jprint = Image.new("RGBA", (JS + BD * 2, JS + BD * 2), (246, 242, 234, 255))
jprint.paste(jk.resize((JS, JS), Image.LANCZOS), (BD, BD))
BGS["J"] = make_bg(jk)
PRINTS["J"] = jprint

# ---------- カット割り（ビート番号） ----------
# (開始ビート, 写真, 画面ぜんぶネガにするか)
SHOTS = [
    (0, "A", True),    # We were young, we were stupid
    (5, "P5", False),  # But damn, it felt alright
    (10, "P1", False), # 寝て起きて　また君がいて
    (14, "P2", False), # それだけでよかった
    (18, "N1", False), # No plans, no rules
    (20, "B", False),
    (23, "C", False),  # 何者でもなかったけど
    (25, "P3", False), # あれはあれで
    (30, "P4", False), # 悪くなかったよな
    (36, "A", True),   # ここから1拍ずつ連打
    (37, "N1", True),
    (38, "P1", True),
    (39, "C", True),
    (40, "N6b", True), # We were young
    (48, "D", False),  # We were stupid
    (56, "J", True),   # エンドカード（君も笑って）
]
SHOT_T = [(B(i), k, neg) for i, k, neg in SHOTS]
END_T = B(56)
ROTS = [-3.0, 2.6, -2.2, 3.4, -1.6, 2.0, -3.2, 1.8, -2.6, 4.0, -4.0, 3.5, -3.5, 2.2, -1.2, 0.0]
DIRS = [(-1, -1), (1, 1), (1, -1), (-1, 1)]

# ---------- 歌詞 ----------
LRC = [(50.20, "We were young, we were stupid"), (52.60, "But damn, it felt alright"),
       (54.54, "寝て起きて　また君がいて"), (56.48, "それだけでよかった"),
       (58.06, "No plans, no rules"), (59.40, "何者でもなかったけど"),
       (61.36, "あれはあれで"), (63.31, "悪くなかったよな"),
       (68.50, "We were young"), (71.80, "We were stupid")]
LYR_END = {63.31: 66.2, 71.80: END_T}

def text_img(txt, fnt, fill=(255, 255, 255), glowc=(255, 214, 170), pad=60, stroke=0):
    d0 = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    l, t, r, b = d0.textbbox((0, 0), txt, font=fnt, stroke_width=stroke)
    w, h = r - l + pad * 2, b - t + pad * 2
    lay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text((pad - l, pad - t), txt, font=fnt, fill=fill + (255,), stroke_width=stroke, stroke_fill=fill + (255,))
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((pad - l + 4, pad - t + 6), txt, font=fnt, fill=(0, 0, 0, 230), stroke_width=stroke + 2)
    sh = sh.filter(ImageFilter.GaussianBlur(10))
    al = np.asarray(lay)[:, :, 3]
    gl = Image.new("RGBA", (w, h), glowc + (0,)); gl.putalpha(Image.fromarray((al * 0.7).astype(np.uint8)))
    gl = gl.filter(ImageFilter.GaussianBlur(14))
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.alpha_composite(sh); out.alpha_composite(sh); out.alpha_composite(gl); out.alpha_composite(lay)
    return out

def is_ascii(s): return all(ord(c) < 128 for c in s)

def lyric_img(txt):
    if is_ascii(txt):
        size = 92
        while True:
            f = font(F_CORI, size, 600)
            if ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(txt, font=f) < 960 or size < 50: break
            size -= 4
    else:
        size = 70
        while True:
            f = font(F_MIN, size)
            if ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(txt, font=f) < 940 or size < 40: break
            size -= 4
    return text_img(txt, f)

LYR = []
for i, (t, s) in enumerate(LRC):
    end = LYR_END.get(t, LRC[i + 1][0] if i + 1 < len(LRC) else END_T)
    LYR.append((t, end, lyric_img(s)))

# ---------- タイトル（斜めから叩きつけ） ----------
TW = [  # 単語, サイズ, 着地(x,y), 角度, 飛んでくる向き, 着地ビート
    ("I", 330, (250, 520), -12, (-1, -1), -6),
    ("close", 250, (660, 740), 7, (1, 1), -5),
    ("my", 220, (330, 975), -6, (1, -1), -4),
    ("mind", 280, (660, 1200), 10, (-1, 1), -3),
]
TITLE = []
for w_, sz, xy, ang, dr, bi in TW:
    im = text_img(w_, font(F_CORI, sz, 700), glowc=(255, 190, 120), stroke=1)
    im = im.rotate(ang, resample=Image.BICUBIC, expand=True)
    TITLE.append((im, xy, dr, B(bi)))
HEADER = text_img("I close my mind", font(F_CORI, 70, 600))
HEADER2 = text_img("六ツ扉", font(F_MIN, 34), glowc=(200, 200, 200))

# エンドカードの文字
E_TITLE = text_img("I close my mind", font(F_CORI, 110, 700), glowc=(255, 190, 120))
E_ART = text_img("六ツ扉", font(F_MIN, 56))
if MODE == "pre":
    E_REL = text_img("2026.11.13 配信スタート", font(F_MIN, 72), glowc=(255, 170, 90))
    E_REL2 = None
else:
    E_REL = text_img("NOW STREAMING", font(F_COR, 84, 700), glowc=(255, 170, 90))
    E_REL2 = text_img("各種音楽配信サービスで配信中", font(F_MIN, 40))

# ---------- 質感 ----------
rng = np.random.default_rng(7)
GRAIN = [rng.normal(0, 9, (H, W, 1)).astype(np.float32) for _ in range(6)]
yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
VIG = np.clip(1.15 - 0.55 * r ** 2, 0.35, 1.0)[..., None].astype(np.float32)
leak = np.exp(-(((xx - 0) / 420.0) ** 2 + ((yy - 520) / 700.0) ** 2))[..., None]
LEAK = (leak * np.array([255, 110, 30])).astype(np.float32)

def paste(canvas, im, cx, cy, alpha=1.0):
    if alpha < 1.0:
        im = im.copy(); a = np.asarray(im)[:, :, 3].astype(np.float32) * alpha
        im.putalpha(Image.fromarray(a.astype(np.uint8)))
    canvas.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))

def paste_clip(canvas, im, cx, cy, alpha=1.0):
    x, y = int(cx - im.width / 2), int(cy - im.height / 2)
    l, t = max(0, -x), max(0, -y)
    r_, b_ = min(im.width, W - x), min(im.height, H - y)
    if r_ <= l or b_ <= t: return
    sub = im.crop((l, t, r_, b_))
    if alpha < 1.0:
        a = np.asarray(sub)[:, :, 3].astype(np.float32) * alpha
        sub.putalpha(Image.fromarray(a.astype(np.uint8)))
    canvas.alpha_composite(sub, (x + l, y + t))

def beat_pulse(t, k=9.0):
    prev = [b for b in BEATS if b <= t]
    return math.exp(-(t - prev[-1]) * k) if prev else 0.0

def ease_out(x): return 1 - (1 - x) ** 3

def render(fi):
    t = T0 + fi / FPS
    # 今のカット
    cur, si = None, -1
    for i, (st, k, neg) in enumerate(SHOT_T):
        if t >= st: cur, si = (st, k, neg), i
    intro = cur is None
    key = "A" if intro else cur[1]
    u = 0 if intro else t - cur[0]
    whole_neg = (not intro) and cur[2] and u < 2 / FPS
    print_neg = (not intro) and (not cur[2]) and u < 2 / FPS

    frame = BGS[key].copy()
    canvas = Image.fromarray(frame.astype(np.uint8)).convert("RGBA")

    # 揺れ（タイトル着地）
    shake = 0.0
    for im, xy, dr, tb in TITLE:
        if t >= tb: shake = max(shake, 26 * math.exp(-(t - tb) * 14))
    if not intro and si == 0: shake = max(shake, 30 * math.exp(-u * 12))
    if key == "J": shake = max(shake, 22 * math.exp(-u * 12))
    rs = random.Random(fi)
    sx, sy = rs.uniform(-1, 1) * shake, rs.uniform(-1, 1) * shake

    # ---- プリント写真 ----
    pr = PRINTS[key]
    if intro:
        blur = 16; scale = 1.0 + 0.02 * (t - T0); rot = -3.0; ox = oy = 0; dim = 0.75
    else:
        k_in = max(0.0, 1 - u / 0.13)
        dx, dy = DIRS[si % 4]
        ox, oy = dx * 360 * k_in ** 2, dy * 360 * k_in ** 2
        scale = 1 + 0.22 * k_in ** 2 + 0.022 * beat_pulse(t)
        rot = ROTS[si] + (dx * 7) * k_in ** 2
        # ピンボケ → ピントが合う
        fd = 0.16 if 9 <= si <= 12 else 0.38
        blur = 20 * max(0.0, 1 - u / fd) ** 1.5
        # 1小節に1回、ピントが迷う
        bp = [b for b in BEATS if b <= t]
        if bp:
            bi = BEATS.index(bp[-1]) - I0
            if bi % 4 == 2 and t - cur[0] > 0.3:
                blur = max(blur, 7 * math.exp(-(t - bp[-1]) * 9))
        dim = 1.0
        if key == "J":
            scale += 0.0
        # エンドは写真をゆっくり寄せる
        scale += 0.03 * min(u, 4) / 4
    im = pr
    if blur > 0.4: im = im.filter(ImageFilter.GaussianBlur(blur))
    if print_neg:
        rgb = ImageOps.invert(im.convert("RGB")); rgb.putalpha(im.getchannel("A")); im = rgb
    if dim < 1:
        a = np.asarray(im).astype(np.float32); a[..., :3] *= dim; im = Image.fromarray(a.astype(np.uint8))
    nw = int(im.width * scale)
    im = im.resize((nw, nw), Image.BILINEAR).rotate(rot, resample=Image.BICUBIC, expand=True)
    # 影
    shadow = Image.new("RGBA", im.size, (0, 0, 0, 0)); shadow.putalpha(im.getchannel("A").point(lambda v: int(v * 0.6)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    pcy = PCY if key != "J" else 800
    paste_clip(canvas, shadow, PCX + ox + sx + 10, pcy + oy + sy + 24)
    paste_clip(canvas, im, PCX + ox + sx, pcy + oy + sy)

    # ---- タイトル（イントロ） ----
    if intro:
        for im_, (x, y), (dx, dy), tb in TITLE:
            if t < tb - 0.10: continue
            k_ = min(1.0, max(0.0, (t - (tb - 0.10)) / 0.10))
            dist = 1100 * (1 - ease_out(k_))
            sc = 1 + 0.35 * (1 - k_) + 0.06 * math.exp(-max(0, t - tb) * 10) + 0.05 * beat_pulse(t) * (t > B(-2))
            w2 = im_.resize((int(im_.width * sc), int(im_.height * sc)), Image.BILINEAR)
            if k_ < 1:  # 残像（モーションブラー風）
                for g in range(5, 0, -1):
                    gd = dist + g * 70
                    paste_clip(canvas, w2, x + dx * gd + sx, y + dy * gd + sy, 0.12 * (6 - g) / 5)
            paste_clip(canvas, w2, x + dx * dist + sx, y + dy * dist + sy)

    # ---- ヘッダー ----
    if not intro and key != "J":
        a = min(1.0, (t - B(0)) / 0.25)
        paste(canvas, HEADER, 540, 150, 0.92 * a)
        paste(canvas, HEADER2, 540, 228, 0.8 * a)

    # ---- 歌詞 ----
    if key != "J":
        for st, en, im_ in LYR:
            if st <= t < en:
                a = min(1.0, (t - st) / 0.12) * min(1.0, (en - t) / 0.10)
                yo = 18 * (1 - min(1.0, (t - st) / 0.15))
                paste(canvas, im_, 540, 1440 + yo, a)

    # ---- エンドカード文字 ----
    if key == "J":
        items = [(E_REL, 1340, B(58), (-1, -1))]
        if E_REL2 is not None: items.append((E_REL2, 1450, B(60), (1, 1)))
        for im_, y, tb, (dx, dy) in items:
            if t < tb - 0.08: continue
            k_ = min(1.0, max(0.0, (t - (tb - 0.08)) / 0.08))
            dist = 900 * (1 - ease_out(k_))
            sc = 1 + 0.25 * (1 - k_) + 0.03 * beat_pulse(t)
            w2 = im_.resize((int(im_.width * sc), int(im_.height * sc)), Image.BILINEAR)
            if k_ < 1:
                for g in range(4, 0, -1):
                    gd = dist + g * 60
                    paste_clip(canvas, w2, 540 + dx * gd, y + dy * gd, 0.12 * (5 - g) / 4)
            paste_clip(canvas, w2, 540 + dx * dist + sx * 0.5, y + dy * dist + sy * 0.5)

    a = np.asarray(canvas.convert("RGB")).astype(np.float32)
    # 光もれ（過去パートだけ、ゆらゆら）
    if key not in ("J",):
        la = 0.20 + 0.12 * math.sin(t * 1.7)
        a = 255 - (255 - a) * (1 - LEAK / 255 * la)
    # 色ずれ（カットの瞬間）
    cs = 0 if intro else 16 * max(0.0, 1 - u / 0.15)
    for im_, xy, dr, tb in TITLE:
        if intro and t >= tb: cs = max(cs, 14 * max(0.0, 1 - (t - tb) / 0.12))
    if cs >= 1:
        c = int(cs)
        a[:, :, 0] = np.roll(a[:, :, 0], c, axis=1)
        a[:, :, 2] = np.roll(a[:, :, 2], -c, axis=1)
    a = a * VIG + GRAIN[fi % 6]
    if whole_neg:
        a = 255 - a
    # タイトル「mind」着地の一瞬だけネガ
    if intro and abs(t - TITLE[3][3]) < 1 / FPS:
        a = 255 - a
    return np.clip(a, 0, 255).astype(np.uint8)

if PREVIEW:
    for s in PREVIEW.split(","):
        tt = float(s); fi = int(round((tt - T0) * FPS))
        Image.fromarray(render(fi)).save(f"prev_{MODE}_{tt:.2f}.jpg", quality=88)
    sys.exit()

tmpv = OUT + ".video.mp4"
p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                      "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                      "-pix_fmt", "yuv420p", tmpv], stdin=subprocess.PIPE)
for fi in range(NF):
    p.stdin.write(render(fi).tobytes())
    if fi % 100 == 0: print(MODE, fi, "/", NF, flush=True)
p.stdin.close(); p.wait()
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmpv, "-ss", str(T0), "-t", f"{DUR:.3f}", "-i", WAV,
                "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                "-af", f"afade=t=in:d=0.02,afade=t=out:st={DUR - 1.3:.3f}:d=1.3", "-shortest",
                "-movflags", "+faststart", OUT], check=True)
os.remove(tmpv)
print("done", OUT)
