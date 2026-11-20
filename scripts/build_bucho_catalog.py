from pathlib import Path
import json, re, struct, html

ROOT = Path(__file__).resolve().parents[1] / 'mv' / '部長ここは地上です'
LABELS = {
 'bucho':'部長・全身設定画','somu':'総務部・全身設定画','trouble_icons':'トラブルアイコン8個',
 'D01_idle':'部長・胸を張って待機','D02_ganimata_walk':'部長・ガニ股歩行','D03_chest_thump':'部長・胸ドン',
 'D04_never_said':'部長・俺は言ってねぇぞ','D05_float':'部長・浮き上がる','D06_point_shout':'部長・指さし号令',
 'D07_fix_machine':'部長・機械修理','D08_souka':'部長・そうか','D09_eye_to_eye':'部長・目線を合わせる',
 'D10_fly':'部長・空を飛ぶ','D11_rush':'部長・突進','D12_walk_away':'部長・去っていく','D13_question':'部長・質問',
 'H05_pull_down':'主人公・引きずり下ろす','H06_tsukkomi_point':'主人公・ツッコミ','H07_extinguisher':'主人公・消火器',
 'G01_papers':'総務部・書類を出す','G02_sigh':'総務部・ため息','S10_no_helmet':'新人・ノーヘル','S11_helmet_on':'新人・ヘルメット着用',
 'B1_factory_gate':'朝の工場正門','B2_factory_floor':'工場メインステージ','B3_office_somu':'総務部の事務所',
 'B4_meeting_room':'会議室','B5_trouble_floor':'トラブルだらけの工場','B6_sky_rooftops':'工場の屋根と青空',
 'B7_boss_warning':'赤黒いボス部屋','B8_machine_line':'機械が並ぶライン','B9_sunset_road':'夕方の工場前の道',
 'T1_thumb_hero':'サムネ第1候補・主人公と浮く部長','T2_thumb_bucho':'サムネ第2候補・まかせろ部長','J1_jacket_square':'正方形ジャケット'
}
HERO = '../社長ここは地球です/characters/hero.png'
BG = '../課長ここは会社ですよ/backgrounds/B2_kacho_desk.png'
THUMBS = ['../課長ここは会社ですよ/サムネ_課長ここは会社です_イラスト版.png','../社長ここは地球です/サムネ案_イラスト×ゲームUI.png','characters/bucho.png']

def main():
    manifest = dict(date='2026-10-19', generator='built-in image_gen', status='generated source images; sprite extraction and MV assembly pending')
    sections = []
    total = 0
    for group, title in [('characters','キャラクター・アイコン'),('sprites','動作スプライト'),('backgrounds','背景'),('thumbnail','サムネ・ジャケット（イラスト）')]:
        entries, cards = [], []
        for prompt in sorted((ROOT/group).glob('*-prompt.txt')):
            name = prompt.name.removesuffix('-prompt.txt')
            path = prompt.with_name(name+'.png')
            if not path.exists():
                raise FileNotFoundError(path)
            with path.open('rb') as f:
                head = f.read(24)
            assert head[:8] == b'\x89PNG\r\n\x1a\n', path
            width, height = struct.unpack('>II', head[16:24])
            entry = dict(file=f'{group}/{name}.png',prompt=f'{group}/{prompt.name}',label=LABELS[name],width=width,height=height)
            correction = prompt.with_name(name+'-correction.txt')
            correction_link = ''
            if correction.exists():
                entry['correction_prompt'] = f'{group}/{correction.name}'
                entry['correction_references'] = ([entry['file'],'characters/bucho.png'] if group == 'thumbnail' else ['backgrounds/B2_factory_floor.png',BG] if name.startswith('B5_') else [entry['file'],BG])
                correction_link = f' · <a href="{html.escape(entry["correction_prompt"])}">構図修正プロンプト</a>'
            refs = []
            if group == 'sprites':
                entry['frames'] = int(re.search(r'EXACTLY (\d+) animation frames', prompt.read_text(encoding='utf-8')).group(1))
                char, ref = {'D':('bucho','characters/bucho.png'),'G':('somu','characters/somu.png'),'H':('hero',HERO),'S':('shinjin','../ウェルカムトゥザ社畜/characters/shinjin.png')}[name[0]]
                entry.update(character=char,reference=ref)
                refs = [ref]
            elif group == 'characters' and name != 'trouble_icons':
                refs = [HERO]
                entry['reference'] = HERO
            elif group == 'backgrounds':
                refs = [BG]
                entry['reference'] = BG
            elif group == 'thumbnail':
                refs = THUMBS
                entry['references'] = refs
            for ref in refs:
                assert (ROOT/ref).exists(), ref
            entries.append(entry)
            detail = f'{width}×{height} px'
            if group in ('characters','sprites'):
                detail = '緑背景 · ' + detail
            if 'frames' in entry:
                detail = f'{entry["frames"]}コマ · 横並び · ' + detail
            esc = html.escape
            cards.append(f'<article><a href="{esc(entry["file"])}" target="_blank" rel="noopener"><img src="{esc(entry["file"])}" alt="{esc(entry["label"])}" loading="lazy"></a><h3>{esc(entry["label"])}</h3><p>{detail}</p><a class="prompt" href="{esc(entry["prompt"])}">使用プロンプト</a>{correction_link}<p class="filename">{esc(entry["file"])}</p></article>')
        manifest[group] = entries
        total += len(entries)
        sections.append(f'<section id="{group}"><h2>{title}｜{len(entries)}枚</h2><div class="grid {group}">{"".join(cards)}</div></section>')
    assert total == 35, total
    (ROOT/'assets-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n',encoding='utf-8')
    previous = (ROOT.parent/'ウェルカムトゥザ社畜'/'素材一覧.html').read_text(encoding='utf-8')
    css = re.search(r'<style>(.*?)</style>',previous,re.S).group(1)
    page = f'''<!doctype html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>部長、ここは地上です！｜素材一覧</title><style>{css}</style></head>
<body><main><header><span class="badge">MV ASSET COLLECTION · 2026.10.19</span><h1>部長、ここは地上です！</h1><p>スーファミ横スクロールアクション風の素材一覧。設定画・アイコン3枚、動作20シート、背景9枚、イラストのサムネ・ジャケット3枚、合計35枚。画像をクリックすると原寸で開きます。</p><nav><a href="#characters">キャラクター・アイコン</a><a href="#sprites">動作スプライト</a><a href="#backgrounds">背景</a><a href="#thumbnail">サムネ・ジャケット</a><a href="制作メモ.md">制作メモ</a><a href="assets-manifest.json">マニフェスト</a></nav></header>
{''.join(sections)}
<footer>内蔵 image_gen で各プロンプトファイルをそのまま使用して1枚ずつ生成し、指定の参照画像を添付。確認後、B5は工場フロアに、B6は工場のはるか上の空に構図を修正。サムネ類の文字らしい描き込み、T1のヘルメットを持つ手、ジャケットの足首を引く手と下部の明るさを調整。修正プロンプトは各カードとマニフェストから確認できます。部長は素頭でヘルメットを着用しません。キャラ・動作シートは緑背景の原画像で、緑抜き・コマ切りは行っていません。MV編集時に粒度とコマ位置、背景の厳密な16:9比率を揃えます。サムネのUI・タイトル重ね合わせ、ジャケットの3000px化は後工程です。</footer></main></body></html>'''
    (ROOT/'素材一覧.html').write_text(page,encoding='utf-8')
    print(json.dumps({'total':total,'groups':{g:len(manifest[g]) for g in ['characters','sprites','backgrounds','thumbnail']}},ensure_ascii=False))

if __name__ == '__main__':
    main()
