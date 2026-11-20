# 軽トラのおじさん: サムネ（1280x720）とジャケ（3000x3000）にレースゲーム風UIと曲名を重ねる
# 使い方: my-video で python3 scripts/keitora_thumbs.py
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
MV = os.path.join(ROOT, 'mv', '軽トラのおじさん')
FONT = os.path.join(ROOT, 'public', 'fonts', 'DotGothic16.ttf')
OJI = os.path.join(ROOT, 'public', 'photo', 'keitora', 'ojisan_0.png')
TITLE = '軽トラのおじさん'
NAVY, BLUE, WHITE, BLACK = (10, 12, 48), (29, 42, 138), (255, 250, 240), (0, 0, 0)
YELLOW, ORANGE, RED, GREY, GREEN, CYAN = (255, 210, 63), (255, 154, 46), (255, 80, 80), (185, 180, 214), (125, 255, 154), (127, 232, 255)

def font(px): return ImageFont.truetype(FONT, px)

def win(d, box, u):
    x0, y0, x1, y1 = box
    d.rectangle([x0 - 2 * u, y0 - 2 * u, x1 + 2 * u, y1 + 2 * u], fill=BLACK)
    d.rectangle([x0, y0, x1, y1], fill=WHITE)
    d.rectangle([x0 + 3 * u, y0 + 3 * u, x1 - 3 * u, y1 - 3 * u], fill=BLUE)
    d.rectangle([x0 + 5 * u, y0 + 5 * u, x1 - 5 * u, y1 - 5 * u], fill=NAVY)

def text(d, xy, s, f, fill, shadow=3, anchor='la'):
    d.text((xy[0] + shadow, xy[1] + shadow), s, font=f, fill=BLACK, anchor=anchor)
    d.text(xy, s, font=f, fill=fill, anchor=anchor)

def thumb(src, out, tag, hud=True):
    im = Image.open(src).convert('RGB').resize((1280, 720), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    u = 2
    # 左上: POS・おじさん・ごきげん（hud=False なら上の2つは出さない）
    if hud: draw_hud(im, d, u)
    # 下: メッセージ窓＋タイトル
    title_win(d, u, tag)
    im.save(out)

def draw_hud(im, d, u):
    win(d, (22, 22, 380, 150), u)
    oji = Image.open(OJI).convert('RGBA')
    oji = oji.resize((round(oji.width * 112 / oji.height), 112), Image.NEAREST)
    im.paste(oji, (36, 32), oji)
    text(d, (110, 34), 'POS 1/1', font(34), YELLOW)
    text(d, (262, 42), 'おじさん', font(24), WHITE, 2)
    text(d, (110, 78), 'やくしょく：なし', font(20), GREY, 2)
    text(d, (110, 110), 'ごきげん', font(20), WHITE, 2)
    for i in range(5):
        x = 200 + i * 30
        d.rectangle([x, 112, x + 24, 130], fill=WHITE); d.rectangle([x + 3, 115, x + 21, 127], fill=GREEN)
    text(d, (356, 108), 'F', font(22), GREEN, 2)
    # 右上: STRIKE ●●●
    win(d, (968, 22, 1258, 110), u)
    text(d, (988, 34), 'STRIKE', font(30), CYAN)
    for i in range(3):
        cx = 1145 + i * 40
        d.ellipse([cx - 16, 34, cx + 16, 66], fill=WHITE); d.ellipse([cx - 13, 37, cx + 13, 63], fill=RED)
    text(d, (988, 76), 'じしょう せいぎ 999km/h', font(19), ORANGE, 2)

def title_win(d, u, tag):
    win(d, (40, 548, 1240, 696), u)
    tf = font(110)
    text(d, (640, 626), TITLE, tf, YELLOW, 5, anchor='mm')
    tw = d.textlength(tag, font=font(26)) + 28
    d.rectangle([58, 494, 58 + tw + 8, 548], fill=BLACK)
    d.rectangle([62, 498, 62 + tw, 544], fill=WHITE)
    d.rectangle([66, 502, 58 + tw, 540], fill=(122, 59, 0))
    text(d, (76, 521), tag, font(26), WHITE, 2, anchor='lm')

def jacket(src, out):
    im = Image.open(src).convert('RGB').resize((3000, 3000), Image.LANCZOS)
    # 下30%を暗く（曲名の読みやすさ）
    shade = Image.new('L', (1, 3000))
    for y in range(3000):
        shade.putpixel((0, y), 0 if y < 2000 else min(170, int((y - 2000) / 600 * 170)))
    dark = Image.new('RGB', im.size, BLACK)
    im = Image.composite(dark, im, shade.resize(im.size))
    d = ImageDraw.Draw(im)
    text(d, (1500, 2620), TITLE, font(330), YELLOW, 14, anchor='mm')
    im.save(out)

T = os.path.join(MV, 'thumbnail')
thumb(os.path.join(T, 'T1_thumb_hero.png'), os.path.join(MV, 'サムネ_軽トラのおじさん_A_主人公.png'), '主人公', hud=False)
thumb(os.path.join(T, 'T2_thumb_ojisan.png'), os.path.join(MV, 'サムネ_軽トラのおじさん_B_おじさん.png'), 'おじさん')
jacket(os.path.join(T, 'J1_jacket_square.png'), os.path.join(MV, 'ジャケ_軽トラのおじさん_3000.png'))
print('ok')
