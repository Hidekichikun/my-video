# 軽トラのおじさんMV: Codex素材 → 緑抜き・コマ切り・ドット粒度そろえ → public/photo/keitora/
# 部長の回の scripts/bucho_process.py をもとに、シートごとに「画面での高さ(px) / 3 = ドット1粒」になるよう縮小する
# （どのスプライトも 画面の3px = ドット1粒 でそろう）
import json, os, sys, importlib.util
import numpy as np
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'mv', '軽トラのおじさん')
OUT = os.path.join(ROOT, 'public', 'photo', 'keitora')
os.makedirs(OUT, exist_ok=True)
DOT = 3  # 画面の何pxでドット1粒か

# bucho_process の関数を借りる（モジュールとして読むと全部実行されるので、関数部分だけ取り出す）
src = open(os.path.join(ROOT, 'scripts', 'bucho_process.py'), encoding='utf-8').read()
src = src.split('frames = {}')[0].replace("os.makedirs(OUT, exist_ok=True)", "")
ns = {'__file__': os.path.join(ROOT, 'scripts', 'bucho_process.py')}
exec(compile(src, 'bucho_process_funcs', 'exec'), ns)
key_green, keep_main, segments, body_segments = ns['key_green'], ns['keep_main'], ns['segments'], ns['body_segments']

def to_native(rgba, scale):
    im = Image.fromarray(rgba, 'RGBA')
    w, h = im.size
    nw, nh = max(1, round(w / scale)), max(1, round(h / scale))
    a = rgba[..., 3:4].astype(np.float32) / 255
    pre = Image.fromarray(np.dstack([(rgba[..., :3] * a).astype(np.uint8), rgba[..., 3]]), 'RGBA')
    small = np.asarray(pre.resize((nw, nh), Image.BOX)).astype(np.float32)
    al = small[..., 3:4] / 255
    rgb = np.where(al > 0, small[..., :3] / np.maximum(al, 1e-3), 0)
    alpha = np.where(small[..., 3] >= 128, 255, 0)
    return Image.fromarray(np.dstack([rgb.clip(0, 255), alpha]).astype(np.uint8), 'RGBA')

# 名前: (コマ数, 画面での高さpx)  ※高さはコマ全部を重ねた外枠の高さ
SPRITES = {
    'O01_idle_armcross': (2, 480), 'O02_lecture_finger': (2, 480), 'O03_palm_no': (2, 480), 'O04_glare_lines': (2, 480),
    'O05_monkey_grin': (3, 480), 'O06_bow_yes': (2, 470), 'O07_angry_point': (2, 470), 'O08_chair_check': (3, 400),
    'O09_whiteboard': (2, 480), 'O10_doya': (2, 490), 'O11_scold_down': (2, 450), 'O12_spine_straight': (2, 480),
    'O13_old_days': (2, 480), 'O14_swing_miss': (3, 450), 'O15_toneup_greet': (2, 480), 'O16_gossip': (2, 460), 'O17_head_tilt': (2, 480),
    'V01_truck_rear_drive': (3, 360), 'V02_truck_side_drive': (2, 400), 'V03_truck_arrive': (3, 430),
    'V04_mirror_closeup': (2, 720), 'V05_truck_throne': (2, 600),
    'H08_umpire_call': (2, 530), 'H09_head_tilt': (2, 516),
    'M06_flatter_clap': (2, 400), 'M07_ukki_cheer': (2, 420), 'K16_hospital_bed': (2, 400),
}

frames = {}
log = []
for name, (n, disp_h) in SPRITES.items():
    rgba = key_green(Image.open(os.path.join(SRC, 'sprites', name + '.png')))
    segs, how = segments(rgba[..., 3], n)
    cells = [rgba[:, a:b] for a, b in segs]
    if how == 'equal':
        bs = body_segments(rgba, n)
        if bs: segs, how = bs, 'body'
        cells = [keep_main(rgba[:, a:b]) for a, b in segs]
    else:
        cells = [keep_main(c) for c in cells]
    boxes = []
    for c in cells:
        ys, xs = np.nonzero(c[..., 3])
        boxes.append((xs.min(), xs.max(), ys.min(), ys.max()))
    top = min(b[2] for b in boxes); bottom = max(b[3] for b in boxes)
    scale = (bottom - top + 1) / (disp_h / DOT)
    half = max(max(c.shape[1] / 2 - b[0], b[1] - c.shape[1] / 2) for c, b in zip(cells, boxes))
    sizes = []
    for i, (c, bx) in enumerate(zip(cells, boxes)):
        # 足元（下端）をそろえ、コマのまん中を中心にする（キャラが動いてもずれない）
        W = int(2 * half) + 8
        canvas = np.zeros((bottom - top + 1, W, 4), np.uint8)
        x0 = int(round(c.shape[1] / 2 - W / 2))
        for xx in range(W):
            sx = x0 + xx
            if 0 <= sx < c.shape[1]:
                canvas[:, xx] = c[top:bottom + 1, sx]
        im = to_native(canvas, scale)
        im.save(os.path.join(OUT, f'{name}_{i}.png'))
        sizes.append(list(im.size))
    frames[name] = sizes
    log.append(f'{name}: {how} {sizes[0]} scale={scale:.2f}')

# 軽トラの設定画（横・後ろの2面）
rgba = key_green(Image.open(os.path.join(SRC, 'characters', 'keitora.png')))
segs, how = segments(rgba[..., 3], 2)
for nm, (a, b), disp in zip(['truck_side', 'truck_rear'], segs, [300, 300]):
    c = keep_main(rgba[:, a:b]); ys, xs = np.nonzero(c[..., 3])
    c = c[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = to_native(c, c.shape[0] / (disp / DOT)); im.save(os.path.join(OUT, f'{nm}_0.png')); frames[nm] = [list(im.size)]
# おじさんの設定画
rgba = key_green(Image.open(os.path.join(SRC, 'characters', 'ojisan.png')))
ys, xs = np.nonzero(rgba[..., 3]); c = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
im = to_native(c, c.shape[0] / (480 / DOT)); im.save(os.path.join(OUT, 'ojisan_0.png')); frames['ojisan'] = [list(im.size)]

# アイコン（4x2）
icons = ['flag', 'fuel', 'crown', 'banana', 'cone', 'marker', 'chair', 'ball']
rgba = key_green(Image.open(os.path.join(SRC, 'characters', 'race_icons.png')))
H, W = rgba.shape[:2]
for i, nm in enumerate(icons):
    r, cc = divmod(i, 4)
    cell = rgba[r * H // 2:(r + 1) * H // 2, cc * W // 4:(cc + 1) * W // 4]
    ys, xs = np.nonzero(cell[..., 3])
    cell = cell[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = to_native(cell, cell.shape[0] / (150 / DOT))
    im.save(os.path.join(OUT, f'icon_{nm}.png'))

# 背景（418x235 → 画面では pixelated で拡大）
for i in range(1, 11):
    f = [x for x in os.listdir(os.path.join(SRC, 'backgrounds')) if x.startswith(f'B{i}_') and x.endswith('.png')][0]
    Image.open(os.path.join(SRC, 'backgrounds', f)).convert('RGB').resize((418, 235), Image.BOX).save(os.path.join(OUT, f'B{i}.png'))

json.dump(frames, open(os.path.join(OUT, 'frames.json'), 'w'), indent=1)
print('\n'.join(log))
