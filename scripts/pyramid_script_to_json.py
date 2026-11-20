"""script.md（ナレーション原稿）を narration.ts に変換する。

使い方（プロジェクトのルートで）:
    python scripts/pyramid_script_to_json.py

原稿の表の1行が1行分のデータになる。IDは「章-番号」（例: 05-03）。
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "Pyramid" / "script.md"
OUT = ROOT / "src" / "Pyramid" / "data" / "narration.ts"

CHAPTER_RE = re.compile(r"^## (\d{2}) (.+)$")
TARGET_RE = re.compile(r"^目安 (\d+):(\d{2})$")
ROW_RE = re.compile(r"^\| (\d{2}-\d{2}) \|")


def main() -> None:
    chapters: list[dict] = []
    current: dict | None = None
    seen: set[str] = set()

    for n, raw in enumerate(SRC.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.rstrip()
        m = CHAPTER_RE.match(line)
        if m:
            current = {"id": m.group(1), "title": m.group(2), "targetSec": None, "lines": []}
            chapters.append(current)
            continue
        m = TARGET_RE.match(line)
        if m and current is not None:
            current["targetSec"] = int(m.group(1)) * 60 + int(m.group(2))
            continue
        if not ROW_RE.match(line):
            continue
        if current is None:
            sys.exit(f"{n}行目: 章見出しより前に行があります")
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) != 4:
            sys.exit(f"{n}行目: 列の数が4ではありません（{len(cells)}列）")
        line_id, subtitle, reading, screen = cells
        if not line_id.startswith(current["id"] + "-"):
            sys.exit(f"{n}行目: ID {line_id} が章 {current['id']} と合っていません")
        if line_id in seen:
            sys.exit(f"{n}行目: ID {line_id} が重複しています")
        seen.add(line_id)
        current["lines"].append(
            {
                "id": line_id,
                "subtitle": subtitle,
                "reading": reading or subtitle,
                "screen": screen,
                "audio": f"audio/pyramid/{line_id}.wav",
            }
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    data = {"source": "src/Pyramid/script.md", "voice": "VOICEVOX:暁記ミタマ", "chapters": chapters}
    body = json.dumps(data, ensure_ascii=False, indent=2)
    OUT.write_text(
        "// このファイルは scripts/pyramid_script_to_json.py が script.md から自動生成する。直接編集しない。\n"
        'import type { Narration } from "./types";\n\n'
        f"export const narration: Narration = {body};\n",
        encoding="utf-8",
    )

    total_chars = 0
    for ch in chapters:
        chars = sum(len(l["subtitle"]) for l in ch["lines"])
        total_chars += chars
        print(f"{ch['id']} {ch['title']}: {len(ch['lines'])}行 {chars}字 目安{ch['targetSec']}秒")
    print(f"合計: {len(seen)}行 {total_chars}字 → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
