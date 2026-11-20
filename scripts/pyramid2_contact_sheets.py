"""Build chapter-by-chapter QA sheets from the actual rendered line midpoints."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import json, math, sys
root=Path(__file__).resolve().parents[1]
qa=root/('out/pyramid2-pop-check' if '--pop' in sys.argv else 'out/pyramid2-check')
timeline=json.loads((qa/'timeline.json').read_text(encoding='utf-8'))
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',20)
def sheet(paths, name, cols=4):
    w,h=480,296
    out=Image.new('RGB',(w*cols,h*math.ceil(len(paths)/cols)), '#eee8dc')
    draw=ImageDraw.Draw(out)
    for i,p in enumerate(paths):
        x=i%cols*w;y=i//cols*h
        with Image.open(p) as im:out.paste(ImageOps.fit(im.convert('RGB'),(w,270),method=Image.Resampling.LANCZOS),(x,y))
        draw.text((x+10,y+271),p.stem,font=font,fill='black')
    out.save(qa/name,quality=92)
for chapter in timeline['chapters']:
    paths=[qa/(l['id']+'.png') for l in chapter['lines']]
    assert all(p.is_file() for p in paths)
    sheet(paths,chapter['id']+'-contact.jpg')
sheet([qa/('0'+str(i)+'-title.png') for i in range(1,9)]+[qa/'credits.png'],'titles-contact.jpg',3)
print('Saved 9 chapter sheets and titles-contact.jpg')
