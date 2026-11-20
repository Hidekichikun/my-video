import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path(r'C:\Users\hiden\my-video\public\circle-zero\short')
data = json.loads((root / 'generation-prompts.json').read_text(encoding='utf-8'))
sheet = Image.new('RGB', (1080, 1020), '#080e19')
draw = ImageDraw.Draw(sheet)
for i, entry in enumerate(data['images']):
    target = root / entry['file']
    if target.exists():
        raise FileExistsError(target)
    with Image.open(entry['source']) as im:
        final = im.convert('RGB').resize((1080, 1920), Image.Resampling.LANCZOS)
        final.save(target, 'PNG')
        thumb = final.resize((252, 448), Image.Resampling.LANCZOS)
        x, y = 9 + (i % 4) * 270, 12 + (i // 4) * 510
        sheet.paste(thumb, (x, y))
        draw.text((x, y + 459), f'{i + 1:02d}', fill='#d9f9ff')
    with Image.open(target) as check:
        check.verify()
    print(f'{entry["file"]}: 1080x1920 OK')
sheet.save(root / 'preview.jpg', quality=92)
print('Complete: 8 PNG illustrations + preview.jpg + generation-prompts.json')
