from pathlib import Path
import json
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(r'C:\Users\hiden\my-video')
SRC = Path(r'C:\Users\hiden\.codex\generated_images\01a171c5-2cf2-7972-bf48-33123dcc8c3d')
OUT = ROOT / 'build/public/CIRCLE'
QA = ROOT / 'output/circle-clock'
QA.mkdir(parents=True, exist_ok=True)
N = 1024
# Source hub locations inspected in the generated originals. Common destination
# pivot is (512,512); the same transform is applied to both dial versions.
specs = [
 ('circle-zero-clock-face.png','exec-4ffbf123-f6a9-47b9-bdd2-c3434ec1633d.png',(627,615),.76),
 ('circle-zero-clock-face-cracked.png','exec-449899c2-e1c3-42ed-b57e-11faeb633caa.png',(627,615),.76),
 ('circle-zero-hand-hour.png','exec-158cb1a9-b3de-406f-93c1-1afbb338706b.png',(627,662),266/466),
 ('circle-zero-hand-minute.png','exec-498da299-aa5a-4644-9f66-27dc1799b22b.png',(627,662),390/582),
 ('circle-zero-hand-second.png','exec-a64e6a60-60dc-4356-b758-cbace57aa290.png',(627,627),432/565),
]
images = {}
report = []
for name, source, (cx,cy), scale in specs:
    im = Image.open(SRC/source).convert('RGB')
    # Remove generated near-black background noise, preserving luminous lines.
    pixels = list(im.getdata())
    im.putdata([(0,0,0) if max(p)<16 else p for p in pixels])
    im = im.transform((N,N), Image.Transform.AFFINE,
        (1/scale,0,cx-512/scale,0,1/scale,cy-512/scale),
        resample=Image.Resampling.BICUBIC,fillcolor=(0,0,0))
    im.putdata([(0,0,0) if max(p)<8 else p for p in im.getdata()])
    im.save(OUT/name)
    images[name] = im
    report.append({'file':name,'size':list(im.size),'pivot':[512,512],
      'source_pivot':[cx,cy],'scale':scale,'background':'#000000',
      'corner_pixels':[list(im.getpixel(pt)) for pt in [(0,0),(1023,0),(0,1023),(1023,1023)]],
      'foreground_bbox':im.getbbox()})

face = images['circle-zero-clock-face.png']
composite = face.copy()
for name,angle in [('hour',60),('minute',-60),('second',180)]:
    hand=images[f'circle-zero-hand-{name}.png'].rotate(angle,Image.Resampling.BICUBIC,center=(512,512))
    composite=ImageChops.screen(composite,hand)
composite.save(QA/'clock-overlay-preview.png')
tiles = list(images.values()) + [composite]
sheet=Image.new('RGB',(1200,840),'#15181c')
draw=ImageDraw.Draw(sheet)
labels=['DIAL / NO HANDS','CRACKED DIAL / NO HANDS','HOUR','MINUTE','SECOND','SCREEN OVERLAY CHECK']
for i,(im,label) in enumerate(zip(tiles,labels)):
    x=(i%3)*400; y=(i//3)*420
    sheet.paste(im.resize((400,400),Image.Resampling.LANCZOS),(x,y))
    draw.text((x+12,y+402),label,fill='white')
sheet.save(QA/'clock-assets-preview.jpg',quality=95)
checks={'assets':report,'needle_lengths_px':{'hour':266,'minute':390,'second':432},
 'method':'Built-in image_gen; deterministic alignment and black-level cleanup per supplied specification.',
 'prompt_source':str(ROOT/'Claude outputs/circle-zero_clock_codex.md')}
(QA/'validation.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
print(json.dumps(checks,indent=2))
