# ブリッジ（2:29〜2:55）：今の夜の曲がり角 → あの頃の曲がり角 → ふり返った瞬間プリントになって止まる → 夜道で笑う → ラスサビ
import os, sys, math
os.environ['SCENE'] = '3'
import numpy as np
from PIL import Image
import render as R
import prints as PR          # 机・プリントの部品
import now as NW              # 直前の「今」の背景
import shots as S

FPS, W, H = 30, 1920, 1080
R.LYR = PR.load_lrc()
NIGHT = [0.75, 0.82, 1.0]

# (開始, 絵, 夜っぽくするか, z開始, z終わり, パン)
SHOTS = [
    (149.0, 'N6v2', True, 1.00, 1.07, 0.0),
    (158.0, 'W1', False, 1.04, 1.10, -0.2),
    (161.5, 'S2', False, 1.08, 1.02, 0.2),
    (164.2, 'N6c', False, 1.02, 1.06, 0.0),
    (171.0, 'U4', False, 1.06, 1.12, 0.1),
]
XFADE = 1.0
FREEZE = (165.6, 1.0)       # ふり返った瞬間にプリントになる
PRINT_END = 171.0
TO_FILM = (174.4, 0.6)      # ラスサビのフィルム（コンビニの駐車場）へ

PIMG, (PB, _, PIW, PIH) = PR.make_print('N6c', "'10 10  2")

def render_shot(i, t, n):
    st, k, night, z0, z1, pan = SHOTS[i]
    end = SHOTS[i + 1][0] if i + 1 < len(SHOTS) else 175.5
    u = (t - st) / max(end - st, 0.1)
    z = z0 + (z1 - z0) * u
    a = S.shot(k, z, panx=pan * (u - 0.5) * 2, tint=NIGHT if night else None, dark=0.82 if night else 1.0)
    return a

def print_scene(t, n):
    """N6c がプリントになって机の上で止まる"""
    p = S.ease_io((t - FREEZE[0]) / FREEZE[1])
    base_s = 0.82
    s_full = W * 1.02 * (1.02 + 0.04 * (FREEZE[0] - 164.2) / 6.8) / PIW
    push = 0.05 * min(max((t - FREEZE[0] - FREEZE[1]) / 4.4, 0), 1)
    s = (s_full + (base_s - s_full) * p) * (1 + push)
    rot = -3.0 * p
    canvas = Image.fromarray(np.clip(PR.TABLE, 0, 255).astype(np.uint8))
    im = PIMG.resize((max(1, round(PIMG.width * s)), max(1, round(PIMG.height * s))), Image.BILINEAR)
    mask = Image.new('L', im.size, 255)
    if rot:
        im = im.rotate(rot, Image.BILINEAR, expand=True); mask = mask.rotate(rot, Image.BILINEAR, expand=True)
    cy = H / 2 + (470 - H / 2) * p
    canvas.paste(im, (round(W / 2 - im.width / 2), round(cy - im.height / 2)), mask)
    return np.asarray(canvas).astype(np.float32)

def frame_full(n):
    t = n / FPS
    # 今いる絵と、前の絵からのクロスフェード
    i = max(j for j, s in enumerate(SHOTS) if s[0] <= t)
    if SHOTS[i][1] == 'N6c' and t >= FREEZE[0]:
        arr = print_scene(t, n)
    elif SHOTS[i][1] == 'U4' and t < SHOTS[i][0] + XFADE:
        x = S.ease_io((t - SHOTS[i][0]) / XFADE)
        arr = render_shot(i, t, n) * x + print_scene(t, n) * (1 - x)
    else:
        arr = render_shot(i, t, n)
        if i > 0 and t < SHOTS[i][0] + XFADE:
            x = S.ease_io((t - SHOTS[i][0]) / XFADE)
            arr = arr * x + render_shot(i - 1, t, n) * (1 - x)
    if i == 0 and t < 150.4:
        x = S.ease_io((t - 149.0) / 1.4)
        arr = arr * x + NW.now_frame(t, n) * (1 - x)
    arr = S.film_fx(arr, t, n, R, leak=0.5)
    arr = S.draw_lyric(arr, t, R)
    x = S.ease_io((t - TO_FILM[0]) / TO_FILM[1])
    if x > 0:
        arr = arr * (1 - x) + R.frame_arr(t, n).astype(np.float32) * x
    os.makedirs('full', exist_ok=True)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f'full/{n:05d}.jpg', quality=92)

if __name__ == '__main__':
    a, b = int(sys.argv[1]), int(sys.argv[2])
    for n in range(a, b):
        frame_full(n)
