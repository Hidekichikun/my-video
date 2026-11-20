from pathlib import Path
import json, re, html, struct, hashlib
from PIL import Image

root = Path(r'C:\Users\hiden\my-video\mv\軽トラのおじさん')
memo = (root / '制作メモ.md').read_text(encoding='utf-8')
labels = {'ojisan':'おじさん・全身設定画','keitora':'軽トラ・横と後ろの設定画','race_icons':'レース用アイコン8個','T1_thumb_hero':'サムネ第1候補・主人公の審判コール','T2_thumb_ojisan':'サムネ第2候補・軽トラの玉座','J1_jacket_square':'正方形ジャケット・ミラーのいい男'}
for line in memo.splitlines():
    cols = [x.strip() for x in line.split('|')]
    if len(cols) >= 5 and re.match(r'^(O\d|V\d|H\d|M\d|K\d)', cols[1]):
        labels[cols[1]] = re.sub(r'[*`]', '', cols[3])
    elif len(cols) >= 5 and re.match(r'^B\d+_', cols[1]):
        labels[cols[1]] = cols[3]

manifest = {'date':'2026-10-26','generator':'built-in image_gen','status':'generated source images; sprite extraction and MV assembly pending'}
manifest['updated'] = '2026-10-27'
manifest['character_revision'] = {'character':'ojisan','design':'細身・短髪・サル顔（丸い寄り目・張り出した耳・長い上くちびる）、白ヘルメット前面の丸いライト','updated_assets':25,'backup':'backup/before-slim-monkey-revision/'}
sections = {'characters':'キャラクター・アイコン','sprites':'動作スプライト','backgrounds':'背景','thumbnail':'サムネ・ジャケット（イラスト）'}
thumb_refs = ['../課長ここは会社ですよ/サムネ_課長ここは会社です_イラスト版.png','../社長ここは地球です/サムネ案_イラスト×ゲームUI.png','characters/ojisan.png','characters/keitora.png']
for category in sections:
    entries = []
    for prompt_file in sorted((root/category).glob('*-prompt.txt'), key=lambda p:[int(x) if x.isdigit() else x for x in re.split(r'(\d+)',p.name)]):
        name = prompt_file.name.removesuffix('-prompt.txt')
        dest = prompt_file.with_name(name+'.png')
        assert dest.exists(), dest
        with Image.open(dest) as im:
            im.verify()
        with Image.open(dest) as im:
            width,height = im.size
        prompt = prompt_file.read_text(encoding='utf-8')
        entry = {'file':f'{category}/{name}.png','prompt':f'{category}/{prompt_file.name}','label':labels.get(name,name),'width':width,'height':height}
        entry['sha256'] = hashlib.sha256(dest.read_bytes()).hexdigest()
        if (category == 'characters' and name == 'ojisan') or (category == 'sprites' and name[0] in 'OV') or category == 'thumbnail':
            entry['updated'] = '2026-10-27'
            old = root/'backup/before-slim-monkey-revision'/entry['file']
            assert old.is_file() and old.read_bytes() != dest.read_bytes(), entry['file']
        if category == 'sprites':
            entry['frames'] = int(re.search(r'EXACTLY (\d+) animation frames',prompt)[1])
            prefix = name[0]
            if prefix == 'O': entry.update(character='ojisan',reference='characters/ojisan.png')
            elif prefix == 'V': entry.update(character='keitora+ojisan',reference=['characters/keitora.png','characters/ojisan.png'])
            elif prefix == 'H': entry.update(character='hero',reference='../社長ここは地球です/characters/hero.png')
            elif prefix == 'M': entry.update(character='coworkers',reference='../ウェルカムトゥザ社畜/characters/coworkers.png')
            elif prefix == 'K': entry.update(character='kacho',reference='../課長ここは会社ですよ/characters/kacho.png')
        elif category == 'backgrounds':
            entry['reference'] = '../部長ここは地上です/backgrounds/B2_factory_floor.png'
            entry['reference_role'] = 'coarse pixel size and detail level only'
        elif category == 'thumbnail':
            entry['reference'] = thumb_refs
            if name.startswith('J1'): entry['target_size'] = '3000x3000 (upscale in finishing stage)'
        elif name == 'ojisan':
            entry['reference'] = '../社長ここは地球です/characters/hero.png'
            entry['reference_role'] = 'pixel size and detail level only'
        correction = prompt_file.with_name(name+'-correction.txt')
        if correction.exists(): entry['correction_prompt'] = f'{category}/{correction.name}'
        refs = entry.get('reference',[])
        for ref in [refs] if isinstance(refs,str) else refs:
            assert (root/ref).is_file(), ref
        entries.append(entry)
    manifest[category] = entries
assert [len(manifest[k]) for k in sections] == [3,26,10,3]
manifest['notes'] = ['各-prompt.txtをそのまま内蔵image_genに渡して1枚ずつ生成。H09とT1は追加プロンプトで修正。','2026-10-27: おじさんの設定画・O01〜O16・V01〜V05・サムネ/ジャケット3枚の計25枚を細身・短髪・サル顔の新設定に更新。旧版はbackup/before-slim-monkey-revision/に保存。','キャラクター・スプライトは緑背景の原画像。緑抜き・コマ切り・粒度統一は後工程。','O05は3コマ目、O10・V04・V05は2コマ目でヘルメット前面の丸いライトが発光。','背景とサムネの生成サイズは厳密な16:9からわずかに異なるため、組み立て時に調整。ジャケットは1254pxの原画で、3000px化と文字・UIの重ね合わせは制作メモどおり仕上げ工程。']
(root/'assets-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

e=html.escape
css='*{box-sizing:border-box}body{margin:0;background:#101623;color:#ecf0f6;font-family:system-ui,"Yu Gothic",sans-serif}main{max-width:1320px;margin:auto;padding:36px 24px}h1{font-size:clamp(25px,4vw,42px)}header p,footer{color:#acb7ca;line-height:1.8}.badge,a{color:#ffc348}nav{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}nav a{padding:10px 16px;background:#233048;border-radius:8px;text-decoration:none}h2{margin-top:48px;border-bottom:1px solid #35425b;padding-bottom:14px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.characters{grid-template-columns:repeat(3,minmax(0,1fr))}article{background:#1c2537;border:1px solid #35425b;border-radius:12px;overflow:hidden;padding-bottom:18px}img{display:block;width:100%;height:auto;image-rendering:pixelated}.thumbnail img{image-rendering:auto}h3,article p,.prompt{margin-left:18px;margin-right:18px}h3{font-size:18px}article p,.prompt{font-size:13px}.filename{overflow-wrap:anywhere}footer{margin:40px 0;font-size:14px}@media(max-width:760px){.grid,.characters{grid-template-columns:1fr}main{padding:24px 16px}}'
parts=['<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>軽トラのおじさん｜素材一覧</title><style>'+css+'</style></head><body><main><header><span class="badge">MV ASSET COLLECTION · 2026.10.26</span><h1>軽トラのおじさん</h1><p>スーファミのレースゲーム風MV素材。設定画・アイコン3枚、動作26シート、背景10枚、イラストのサムネ・ジャケット3枚、合計42枚。画像をクリックすると原寸で開きます。</p><nav>']
for key,title in sections.items(): parts.append(f'<a href="#{key}">{title}</a>')
parts.append('<a href="制作メモ.md">制作メモ</a><a href="assets-manifest.json">マニフェスト</a></nav></header>')
parts.append('<p class="badge">2026.10.27 更新：おじさんを細身・短髪・サル顔に変更。関連25枚を差し替え。</p>')
for key,title in sections.items():
    parts.append(f'<section id="{key}"><h2>{title}｜{len(manifest[key])}枚</h2><div class="grid {key}">')
    for item in manifest[key]:
        file,label,prompt = map(e,[item['file'],item['label'],item['prompt']])
        desc = (f'{item["frames"]}コマ · 横並び · ' if 'frames' in item else '')+('緑背景 · ' if key in ['characters','sprites'] else '')+f'{item["width"]}×{item["height"]} px'
        parts.append(f'<article><a href="{file}" target="_blank" rel="noopener"><img src="{file}" alt="{label}" loading="lazy"></a><h3>{label}</h3><p>{desc}</p><a class="prompt" href="{prompt}">使用プロンプト</a>')
        if 'correction_prompt' in item: parts.append(f' · <a href="{e(item["correction_prompt"])}">修正プロンプト</a>')
        parts.append(f'<p class="filename">{file}</p></article>')
    parts.append('</div></section>')
parts.append('<footer>'+ '<br>'.join(map(e,manifest['notes'])) + '</footer></main></body></html>')
(root/'素材一覧.html').write_text('\n'.join(parts)+'\n',encoding='utf-8')
catalog = (root/'素材一覧.html').read_text(encoding='utf-8')
links = re.findall(r'(?:href|src)="([^"]+)"', catalog)
missing = [x for x in links if not x.startswith('#') and not (root/x).is_file()]
assert not missing, missing
assert catalog.count('<img ') == 42
line='- 2026-10-26: Codex内蔵image_genで素材42枚（設定画3・スプライト26・背景10・サムネ/ジャケット3）を指定プロンプト・参照画像から生成。H09の首45°とT1の審判ポーズを修正し、assets-manifest.json・素材一覧.htmlを作成。緑抜き・コマ切り・UI/文字入れ・ジャケット3000px化は仕上げ工程。'
line='- 2026-10-27: おじさんの新設定「細身・短髪・サル顔」に合わせ、設定画1枚・O系16枚・V系5枚・サムネ/ジャケット3枚の計25枚を内蔵image_genで再生成。T1の審判ポーズを調整し、素材一覧.html・assets-manifest.jsonを更新。旧版はbackup/before-slim-monkey-revision/に保存。'
if line not in memo:
    (root/'制作メモ.md').write_text(memo.rstrip()+'\n'+line+'\n',encoding='utf-8')
print(json.dumps({'total':42,'categories':{k:len(manifest[k]) for k in sections},'sprite_frames':sum(x['frames'] for x in manifest['sprites']),'png_verified':True,'catalog_images':catalog.count('<img '),'missing_links':missing,'memo_updated':line in (root/'制作メモ.md').read_text(encoding='utf-8')},ensure_ascii=False))
