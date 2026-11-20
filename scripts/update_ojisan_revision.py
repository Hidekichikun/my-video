from pathlib import Path
import json, hashlib, struct, re, shutil

base = Path(__file__).resolve().parents[1] / 'mv' / '軽トラのおじさん'
backup = base / 'backup/before-chubby-snot-revision'
for name in ['assets-manifest.json', '素材一覧.html', '制作メモ.md']:
    if not (backup / name).exists():
        shutil.copy2(base / name, backup / name)
manifest = json.loads((base / 'assets-manifest.json').read_text(encoding='utf-8'))
targets = {'characters/ojisan.png'}
targets.update(p.relative_to(base).as_posix() for p in (base / 'sprites').glob('*.png') if re.match(r'^[OV]\d\d_', p.name))
targets.update('thumbnail/' + n + '.png' for n in ['T1_thumb_hero', 'T2_thumb_ojisan', 'J1_jacket_square'])
assert len(targets) == 25
html = (base / '素材一覧.html').read_text(encoding='utf-8')
changed = 0
for section in ['characters', 'sprites', 'backgrounds', 'thumbnail']:
    for item in manifest[section]:
        path = base / item['file']
        raw = path.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if item['file'] in targets:
            assert (backup / item['file']).is_file()
            assert hashlib.sha256((backup / item['file']).read_bytes()).hexdigest() == item['sha256'], item['file']
            assert digest != item['sha256'], item['file']
            width, height = struct.unpack('>II', raw[16:24])
            item.update(width=width, height=height, sha256=digest, updated='2026-10-29')
            pattern = r'(<article>.*?<p class="filename">' + re.escape(item['file']) + r'</p></article>)'
            html, count = re.subn(pattern, lambda m: re.sub(r'\d+×\d+ px', f'{width}×{height} px', m.group()), html, flags=re.S)
            assert count == 1
            changed += 1
        else:
            assert digest == item['sha256'], 'Untargeted source changed: ' + item['file']
assert changed == 25
for item in manifest['sprites']:
    if item['file'].startswith('sprites/V04_'):
        item['correction_prompt'] = 'sprites/V04_mirror_closeup-chubby-correction.txt'
for item in manifest['thumbnail']:
    if item['file'].endswith('T1_thumb_hero.png'):
        item['used_prompt'] = 'thumbnail/T1_thumb_hero-chubby-used-prompt.txt'
        item['correction_prompt'] = 'thumbnail/T1_thumb_hero-symbol-correction.txt'
    if item['file'].endswith('T2_thumb_ojisan.png'):
        item['correction_prompt'] = 'thumbnail/T2_thumb_ojisan-symbol-correction.txt'
manifest['updated'] = '2026-10-29'
manifest['status'] = 'revised source images ready; revised sprite extraction, MV rendering, thumbnail UI and jacket finishing pending'
manifest['character_revision'] = dict(character='ojisan', design='少しぽっちゃり・お腹ぽっこり・短髪・もっとサル顔（濃い眉骨、小さい寄り目、平たい鼻と大きい鼻の穴、大きく張り出す耳、前に出た口元）・片鼻から小さい透明〜水色の鼻水・白ヘルメット前面の丸いライト', updated_assets=25, backup='backup/before-chubby-snot-revision/')
manifest['notes'].append('2026-10-29: 内蔵image_genでおじさん関連25枚をぽっちゃり＋鼻水＋もっとサル顔に再生成。指定の各-prompt.txtを使用し、T1の審判ポーズは前回の修正を反映。V04の鼻水とサムネの文字風模様を追加修正（プロンプトを別途保存）。旧版25枚はbackup/before-chubby-snot-revision/。緑抜き・コマ切り・文字/UI・3000px化・MV再書き出しは後工程。')
(base / 'assets-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
html = html.replace('2026.10.27 更新：おじさんを細身・短髪・サル顔に変更。関連25枚を差し替え。', '2026.10.29 更新：おじさんをぽっちゃり＋鼻水＋もっとサル顔に変更。関連25枚を差し替え。旧版は backup/before-chubby-snot-revision/ に保存。')
(base / '素材一覧.html').write_text(html, encoding='utf-8')
memo = base / '制作メモ.md'
with memo.open('a', encoding='utf-8') as f:
    f.write('\n- 2026-10-29: Codex内蔵image_genでおじさん関連25枚（設定画1・O系16・V系5・サムネ/ジャケ3）を「ぽっちゃり＋鼻水＋もっとサル顔」で再生成し元のPNGを更新。T1審判ポーズ・V04鼻水・サムネの記号のみの装飾を確認。旧版はbackup/before-chubby-snot-revision/に保存、assets-manifest.json・素材一覧.html更新済み。緑抜き・MV再書き出し・文字/UI・ジャケ3000px化は仕上げ工程。\n')
print(json.dumps(dict(updated=changed, unchanged_verified=42-changed, backup_images=len(list(backup.rglob('*.png')))), ensure_ascii=False))
