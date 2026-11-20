"""Build a reproducible scene/prompt manifest from the original MV plan."""
import json
import pathlib
import re
import shutil
import html

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEST = ROOT / 'public' / 'enshu-love'
DEST.mkdir(parents=True, exist_ok=True)
plan = (ROOT / 'mv/円周ラブ/円周ラブ_MVプラン.md').read_text(encoding='utf-8')
common = '''Use case: illustration-story. Asset: one finished cinematic anime music video frame. Reference 1 locks the adult university girl's identity: softly wavy black bob with magenta inner hair and tips, amber eyes, gold choker, oversized off-shoulder white blouse with voluminous sleeves, grey plaid mini skirt, white sneakers. Keep her face, hair and clothes consistent. Reference 2 supplies the dark green-black chalkboard texture and soft white chalk glow. IMPORTANT override: the circle has NO face, NO eyes, NO mouth; only a single center dot and one radius line. Japanese anime illustration, delicate polished lineart, cel shading with soft glow, chalk dust particles, cinematic lighting, hot pink and cyan subtle RGB split accents. No text, letters, numbers, equations, watermark, borders, panels or collage. Full-bleed 16:9 landscape composition. '''
scenes = []
for name, prompt in re.findall(r'### ((?:\d\d_|thumb_|short_)\S+)[^\n]*\n```\n(.*?)\n```', plan, re.S):
    if name.startswith(('01_', '02_')):
        continue
    name = name.split('（')[0]
    portrait = name.startswith('short_')
    style = common.replace('16:9 landscape', '9:16 portrait') if portrait else common
    if name == '08_pre_spin':
        prompt = 'Adult university woman dancing a gentle turn in front of the chalkboard, holding a large wooden blackboard compass like a dance partner. Eye-level wide shot showing her complete outfit from the reference, natural modest pose, playful blush and smile, white blouse and plaid skirt, white sneakers. Her hair sways, chalk dust spirals around her feet. Focus on face, compass and magical circle, cinematic 16:9 environment.'
    if name == 'short_02':
        prompt = 'Vertical 9:16 anime music video frame. Eye-level medium waist-up portrait of the adult 20-year-old university woman from reference 1, fully clothed in her oversized white blouse, black and magenta bob hair and amber eyes. Both clenched fists held beside her shoulders, determined face singing passionately. Behind her is a cracked university chalkboard with a glowing faceless circle, center dot and radius. Intense red and cyan concert lighting, horizontal pixel-sorting glitch at the frame edges, chalk dust and flying chalk fragments. Keep bottom quarter quiet and dark for lyrics to be overlaid later. No text. Focus on face, hands and chalkboard, energetic rock music atmosphere.'
    scenes.append({'name': name, 'prompt': style + '\nScene: ' + prompt, 'file': name + '.png'})
(DEST / 'prompts.json').write_text(json.dumps(scenes, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(scenes)} scene prompts saved to {DEST / "prompts.json"}')

# Section boundaries are editorial placeholders until a real LRC is available.
# The source lyric text is authoritative; never paraphrase it in the video.
source = ROOT / 'mv/円周ラブ'
shutil.copy2(ROOT / 'music/円周ラブ.mp3', DEST / 'song.mp3')
text = (source / '円周ラブ_歌詞.txt').read_text(encoding='utf-8-sig')
sections = []
for line in text.splitlines():
    line = line.strip()
    if line.startswith('[') and line.endswith(']'):
        sections.append({'name': line[1:-1], 'lines': []})
    elif line and sections:
        sections[-1]['lines'].append(line)
boundaries = [0, 9, 31, 43, 64, 74, 96, 108, 129, 139, 156, 177, 183, 199, 204.76]
if len(sections) != len(boundaries)-1:
    raise ValueError('Section count changed: update provisional boundaries.')
lrc = source / '円周ラブ.lrc'
timed = []
if lrc.exists():
    for line in lrc.read_text(encoding='utf-8-sig').splitlines():
        match = re.match(r'^\[(\d+):(\d+(?:\.\d+)?)\](.*)', line)
        if match and match[3].strip() and not match[3].strip().startswith('['):
            timed.append({'start': int(match[1])*60+float(match[2]), 'text': match[3].strip()})
    timed.sort(key=lambda item: item['start'])
    if not timed:
        raise ValueError('LRC exists but contains no timed lyrics.')

def normalized(value):
    return re.sub(r'\s+', '', value).replace('−', '-').replace('—', '-')

cues = []
cursor = 0
for i, section in enumerate(sections):
    start, end = boundaries[i:i+2]
    weights = [max(3, len(line)**0.65) for line in section['lines']]
    position = start
    for line, weight in zip(section['lines'], weights):
        length = (end-start)*weight/sum(weights)
        cue = {'text': line, 'start': round(position, 3), 'end': round(position+length, 3), 'section': i}
        if timed:
            found = next((j for j in range(cursor, len(timed)) if normalized(timed[j]['text']) == normalized(line)), None)
            if found is None:
                raise ValueError(f'LRC missing or changed lyric: {line}')
            cue['start'] = timed[found]['start']
            cue['end'] = timed[found+1]['start'] if found+1 < len(timed) else 204.76
            cursor = found+1
        cues.append(cue)
        position += length
    section['start'] = next(c['start'] for c in cues if c['section'] == i)
for i, section in enumerate(sections):
    section['end'] = sections[i+1]['start'] if i+1 < len(sections) else 204.76

layouts = [
    [(3, .0), (4, .55)], [(5, .0), (6, .25), (7, .69)],
    [(8, .0), (9, .68)], [(10, .0), (11, .57), (12, .8)],
    [(13, .0)], [(14, .0), (15, .5)], [(16, .0)],
    [(10, .0), (17, .5)], [(13, .0)], [(18, .0)],
    [(20, .0), (21, .52)], [(22, .0)], [(23, .0), (24, .65)], [(25, .0)]
]
shots = []
for section, layout in zip(sections, layouts):
    for j, (number, fraction) in enumerate(layout):
        name = next(s['name'] for s in scenes if s['name'].startswith(f'{number:02}_'))
        end_fraction = layout[j+1][1] if j+1 < len(layout) else 1
        shots.append({'id': number, 'image': name+'.png', 'start': round(section['start']+(section['end']-section['start'])*fraction, 3), 'end': round(section['start']+(section['end']-section['start'])*end_fraction, 3)})
data = {'syncMode': 'lrc' if timed else 'provisional', 'duration': 204.76, 'cues': cues, 'sections': sections, 'shots': shots}
(DEST / 'timeline.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
target = ROOT / 'src/EnshuLove'
target.mkdir(parents=True, exist_ok=True)
(target / 'timeline.ts').write_text('/* Generated by scripts/prepare-enshu-love.py. */\nexport const timeline = '+json.dumps(data, ensure_ascii=False, indent=2)+' as const;\n', encoding='utf-8')
print(f'{len(cues)} exact lyric cues; sync mode: {data["syncMode"]}')

cards = ''.join(f'<figure><a href="{html.escape(s["file"])}"><img loading="lazy" src="{html.escape(s["file"])}" alt="{html.escape(s["name"])}"></a><figcaption>{html.escape(s["name"])}</figcaption></figure>' for s in scenes)
gallery = '''<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>円周ラブ — Scene gallery</title><style>*{box-sizing:border-box}body{margin:0;padding:48px;background:#071d17;color:#fff7e7;font-family:system-ui,sans-serif}h1{font-size:40px;margin:0 0 12px}p{color:#a9c4bb;margin-bottom:40px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:24px}figure{margin:0;border:1px solid #2b493f;background:#102c23;border-radius:8px;overflow:hidden}img{width:100%;aspect-ratio:16/9;object-fit:contain;display:block;background:#04120e}figcaption{padding:15px;color:#f986c0;font-size:14px}a{color:inherit}</style><h1>円周ラブ</h1><p>絵コンテ23カット + サムネイル + 縦型2枚。画像を選ぶと原寸表示。歌詞・数式はRemotionで合成。</p><div class="grid">'''+cards+'</div></html>'
(DEST / 'gallery.html').write_text(gallery, encoding='utf-8')
