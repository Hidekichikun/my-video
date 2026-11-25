"""新しい講義・解説動画の骨組みを src/ に作る（assets/template をコピーして名前を置き換える）。

  python scaffold.py <Name> <slug> [--root <プロジェクトのルート>]
  例: python scaffold.py Expectation expectation

作るもの:
  src/<Name>/data/      chapters.ts（章・間）、timeline.ts、narration.ts / speech-energy.ts（空。測定スクリプトが上書き）
  src/<Name>Full/       theme・字幕・札・先生(口パク)・BGM・3D土台・章の見本・render-entry・index
置き換え: __NAME__ → <Name>（英数字のキャメルケース）、__SLUG__ → <slug>（小文字・ハイフン）
既にあるファイルは上書きしない。
"""
import argparse
import re
import shutil
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('name')
ap.add_argument('slug')
ap.add_argument('--root', default='.')
args = ap.parse_args()

if not re.fullmatch(r'[A-Z][A-Za-z0-9]*', args.name):
    raise SystemExit('Name は英大文字始まりの英数字にする（例: Expectation）')
if not re.fullmatch(r'[a-z0-9][a-z0-9-]*', args.slug):
    raise SystemExit('slug は小文字・数字・ハイフンにする（例: expectation）')

template = Path(__file__).resolve().parent.parent / 'assets' / 'template'
root = Path(args.root).resolve()
made, skipped = [], []
for src in sorted(template.rglob('*')):
    if src.is_dir():
        continue
    rel = src.relative_to(template)
    dest = root / Path(*[p.replace('__NAME__', args.name).replace('__SLUG__', args.slug) for p in rel.parts])
    if dest.exists():
        skipped.append(dest)
        continue
    dest.parent.mkdir(parents=True, exist_ok=True)
    text = src.read_text(encoding='utf-8').replace('__NAME__', args.name).replace('__SLUG__', args.slug)
    dest.write_text(text, encoding='utf-8')
    made.append(dest)

for p in made:
    print('作成', p.relative_to(root))
for p in skipped:
    print('既にある（そのまま）', p.relative_to(root))
