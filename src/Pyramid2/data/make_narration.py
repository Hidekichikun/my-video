"""readings_with_ids.tsv と screens.py から narration.ts を作り直す。
使い方（リポジトリのルートで）: python src/Pyramid2/data/make_narration.py
"""
import csv, json, sys
from pathlib import Path
here = Path(__file__).resolve().parent
sys.path.insert(0, str(here))
from screens import CHAPTERS, SCREENS
root = here.parents[2]
rows = list(csv.reader(open(root / "src/Pyramid2/voicevox/readings_with_ids.tsv", encoding="utf-8-sig"), delimiter="\t"))[1:]
assert set(SCREENS) == {r[1] for r in rows}, set(SCREENS) ^ {r[1] for r in rows}
chs = []
for cid, title, sec in CHAPTERS:
    lines = [{"id": r[1], "subtitle": r[3], "reading": r[2], "screen": SCREENS[r[1]], "audio": f"audio/pyramid2/{r[1]}.wav"} for r in rows if r[1].startswith(cid + "-")]
    chs.append({"id": cid, "title": title, "targetSec": sec, "lines": lines})
data = {"source": "src/Pyramid2/script.md", "voice": "VOICEVOX:暁記ミタマ", "chapters": chs}
(here / "narration.ts").write_text("// src/Pyramid2/voicevox/readings_with_ids.tsv と data/screens.py から作った。直接編集しない。\nimport type { Narration } from \"../../Pyramid/data/types\";\n\nexport const narration: Narration = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
print("lines", sum(len(c["lines"]) for c in chs))
