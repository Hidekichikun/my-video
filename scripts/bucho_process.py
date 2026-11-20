# 部長MV: Codex素材 → 緑抜き・コマ切り・ドット粒度そろえ → public/photo/bucho/
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'mv', '部長ここは地上です')
OUT = os.path.join(ROOT, 'public', 'photo', 'bucho')
os.makedirs(OUT, exist_ok=True)
SCALE = 4.5  # Codexの絵 → 前作のドットの粗さ（主人公 約172px）にそろえる

SPRITES = {  # 名前: コマ数
    'D01_idle': 2, 'D02_ganimata_walk': 4, 'D03_chest_thump': 2, 'D04_never_said': 2,
    'D05_float': 3, 'D06_point_shout': 2, 'D07_fix_machine': 3, 'D08_souka': 2,
    'D09_eye_to_eye': 2, 'D10_fly': 3, 'D11_rush': 4, 'D12_walk_away': 4, 'D13_question': 2,
    'G01_papers': 2, 'G02_sigh': 2, 'H05_pull_down': 3, 'H06_tsukkomi_point': 2,
    'H07_extinguisher': 3, 'S10_no_helmet': 2, 'S11_helmet_on': 3,
}

def key_green(im):
    a = np.asarray(im.convert('RGB')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = (g > 120) & (g > r + 50) & (g > b + 50)
    alpha = np.where(green, 0, 255).astype(np.uint8)
    # 緑かぶり（ふち）を消す
    # ふち（透明から3px以内）だけ。腕章の緑は残す
    near = green.copy()
    for _ in range(3):
        n2 = near.copy()
        n2[1:] |= near[:-1]; n2[:-1] |= near[1:]; n2[:, 1:] |= near[:, :-1]; n2[:, :-1] |= near[:, 1:]
        near = n2
    spill = (g > r) & (g > b) & ~green & near
    g2 = np.where(spill, np.maximum(r, b), g)
    rgb = np.stack([r, g2, b], -1).clip(0, 255).astype(np.uint8)
    return np.dstack([rgb, alpha])


def keep_main(c):
    """コマの端にくっついた、となりのコマのかけらを消す（いちばん大きいかたまり＋端に触れないものを残す）"""
    m = c[..., 3] > 0
    sm = m[::2, ::2]
    H, W = sm.shape
    lab = np.zeros((H, W), np.int32); sizes = [0]; touch = [False]
    cur = 0
    for y0 in range(H):
        for x0 in np.nonzero(sm[y0] & (lab[y0] == 0))[0]:
            if lab[y0, x0]: continue
            cur += 1; st = [(y0, x0)]; lab[y0, x0] = cur; n = 0; t = False
            while st:
                y, x = st.pop(); n += 1
                if x == 0 or x == W - 1: t = True
                for yy, xx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
                    if 0 <= yy < H and 0 <= xx < W and sm[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = cur; st.append((yy, xx))
            sizes.append(n); touch.append(t)
    big = int(np.argmax(sizes))
    keep = np.array([i == big or (not touch[i] and sizes[i] > 30) for i in range(len(sizes))])
    keep[0] = False
    km = keep[lab].repeat(2, 0).repeat(2, 1)[:m.shape[0], :m.shape[1]]
    out = c.copy(); out[..., 3] = np.where(km, out[..., 3], 0)
    return out

def segments(alpha, n):
    cols = (alpha > 0).sum(0) > 2
    runs, start = [], None
    for x, v in enumerate(cols):
        if v and start is None: start = x
        if not v and start is not None: runs.append([start, x]); start = None
    if start is not None: runs.append([start, len(cols)])
    # 小さいすき間をまとめる
    while len(runs) > n:
        gaps = [runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)]
        i = int(np.argmin(gaps))
        runs[i] = [runs[i][0], runs[i + 1][1]]; del runs[i + 1]
    if len(runs) == n:
        widths = [r[1] - r[0] for r in runs]
        if min(widths) > 0.35 * max(widths):
            return runs, 'gap'
    w = alpha.shape[1] / n
    return [[int(i * w), int((i + 1) * w)] for i in range(n)], 'equal'

def body_segments(rgba, n):
    """白いけむり等を無視して、体の左端の位置でコマを区切る"""
    a = rgba.astype(np.int16)
    body = (a[..., 3] > 0) & (a[..., :3].min(-1) < 170)
    cols = body.sum(0) > 40
    runs, start = [], None
    for x, v in enumerate(cols):
        if v and start is None: start = x
        if not v and start is not None: runs.append([start, x]); start = None
    if start is not None: runs.append([start, len(cols)])
    while len(runs) > n:
        gaps = [runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)]
        i = int(np.argmin(gaps)); runs[i] = [runs[i][0], runs[i + 1][1]]; del runs[i + 1]
    if len(runs) != n: return None
    starts = [0] + [r[0] - 6 for r in runs[1:]]
    # 右側は次のコマに少しはみ出して切る（けむりの先を残す）→ はみ出た次の体は keep_main で消える
    ends = [min(rgba.shape[1], r[0] + 140) for r in runs[1:]] + [rgba.shape[1]]
    return [[starts[i], ends[i]] for i in range(n)]

def to_native(rgba):
    im = Image.fromarray(rgba, 'RGBA')
    w, h = im.size
    nw, nh = max(1, round(w / SCALE)), max(1, round(h / SCALE))
    # 色は平均（にじみ防止に先に透明部分を近い色で埋めない→alphaで重み）
    a = rgba[..., 3:4].astype(np.float32) / 255
    pre = Image.fromarray(np.dstack([(rgba[..., :3] * a).astype(np.uint8), rgba[..., 3]]), 'RGBA')
    small = np.asarray(pre.resize((nw, nh), Image.BOX)).astype(np.float32)
    al = small[..., 3:4] / 255
    rgb = np.where(al > 0, small[..., :3] / np.maximum(al, 1e-3), 0)
    alpha = np.where(small[..., 3] >= 128, 255, 0)
    return Image.fromarray(np.dstack([rgb.clip(0, 255), alpha]).astype(np.uint8), 'RGBA')

frames = {}
log = []
for name, n in SPRITES.items():
    rgba = key_green(Image.open(os.path.join(SRC, 'sprites', name + '.png')))
    segs, how = segments(rgba[..., 3], n)
    cells = [rgba[:, a:b] for a, b in segs]
    if how == 'equal':
        bs = body_segments(rgba, n)
        if bs: segs, how = bs, 'body'
        cells = [keep_main(rgba[:, a:b]) for a, b in segs]
    # 全コマ共通の大きさ（足元をそろえる）
    boxes = []
    for c in cells:
        ys, xs = np.nonzero(c[..., 3])
        boxes.append((xs.min(), xs.max(), ys.min(), ys.max()))
    top = min(b[2] for b in boxes); bottom = max(b[3] for b in boxes)
    half = max(max(c.shape[1] / 2 - b[0], b[1] - c.shape[1] / 2) for c, b in zip(cells, boxes))
    sizes = []
    for i, (c, bx) in enumerate(zip(cells, boxes)):
        # 中心をそろえる: キャラの体（不透明ピクセルの多い列）の中心
        cx = (bx[0] + bx[1]) / 2
        W = int(2 * half) + 8
        canvas = np.zeros((bottom - top + 1, W, 4), np.uint8)
        x0 = int(round(cx - W / 2))
        for xx in range(W):
            sx = x0 + xx
            if 0 <= sx < c.shape[1]:
                canvas[:, xx] = c[top:bottom + 1, sx]
        im = to_native(canvas)
        im.save(os.path.join(OUT, f'{name}_{i}.png'))
        sizes.append(list(im.size))
    frames[name] = sizes
    log.append(f'{name}: {how} {sizes[0]}')

# 設定画（参照用）・アイコン
for name in ['bucho', 'somu']:
    rgba = key_green(Image.open(os.path.join(SRC, 'characters', name + '.png')))
    ys, xs = np.nonzero(rgba[..., 3])
    im = to_native(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    im.save(os.path.join(OUT, f'{name}.png')); frames[name] = [list(im.size)]
icons = ['fire', 'smoke', 'gear', 'lamp', 'spark', 'leak', 'papers', 'phone']
rgba = key_green(Image.open(os.path.join(SRC, 'characters', 'trouble_icons.png')))
H, W = rgba.shape[:2]
for i, nm in enumerate(icons):
    r, c = divmod(i, 4)
    cell = rgba[r * H // 2:(r + 1) * H // 2, c * W // 4:(c + 1) * W // 4]
    ys, xs = np.nonzero(cell[..., 3])
    im = to_native(cell[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    im.save(os.path.join(OUT, f'icon_{nm}.png'))

# 背景
for i in range(1, 10):
    f = [x for x in os.listdir(os.path.join(SRC, 'backgrounds')) if x.startswith(f'B{i}_') and x.endswith('.png')][0]
    Image.open(os.path.join(SRC, 'backgrounds', f)).convert('RGB').resize((418, 235), Image.BOX).save(os.path.join(OUT, f'B{i}.png'))

json.dump(frames, open(os.path.join(OUT, 'frames.json'), 'w'), indent=1)
print('\n'.join(log))
