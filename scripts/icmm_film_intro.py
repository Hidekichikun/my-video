# イントロ（0:00〜0:14.6）：ふり返る女の子の歩道橋＋曲名 → 机の上のプリントへ
import os, sys
os.environ['SCENE'] = '1'
import numpy as np
from PIL import Image
import render as R
import prints as PR
import shots as S

FPS = 30
END = 14.6
XF = (13.3, 1.2)   # プリントの机へ切り替え

def frame_full(n):
    t = n / FPS
    z = 1.0 + 0.007 * t
    arr = S.shot('D', z, panx=-0.15 + 0.02 * t)
    arr = S.film_fx(arr, t, n, R, leak=0.8)
    p_in = S.ease((t - 2.6) / 2.2)
    p_out = 1 - S.ease((t - 10.8) / 1.6)
    arr = S.draw_title(arr, p_in * p_out, R.FONT)
    arr *= min(max(t / 1.6, 0), 1)
    x = S.ease_io((t - XF[0]) / XF[1])
    if x > 0:
        arr = arr * (1 - x) + PR.print_frame(t, n).astype(np.float32) * x
    os.makedirs('full', exist_ok=True)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).save(f'full/{n:05d}.jpg', quality=92)

if __name__ == '__main__':
    a, b = int(sys.argv[1]), int(sys.argv[2])
    for n in range(a, b):
        frame_full(n)
