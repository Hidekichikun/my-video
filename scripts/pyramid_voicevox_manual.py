"""VOICEVOXを手で操作してナレーションを作るための補助。

1) 読み込み用のテキストを作る（プロジェクトのルートで）:
    python scripts/pyramid_voicevox_manual.py text
   → src/Pyramid/voicevox/readings.txt   （1行＝1セリフ。VOICEVOXの「テキスト読み込み」用）
   → src/Pyramid/voicevox/readings_with_ids.tsv（行IDとの対応表。確認用）

2) VOICEVOXで全部書き出したWAVを、行IDの名前で取り込む:
    python scripts/pyramid_voicevox_manual.py import <書き出したフォルダ>
   ファイル名の先頭の番号（連番）の順に並べ、原稿の行の順に 00-01.wav, 00-02.wav … と名前を付けて
   public/audio/pyramid/ にコピーする。すでにあるファイルは --overwrite を付けたときだけ上書きする。
   最後に scripts/measure_pyramid_audio.cjs を実行して長さを測る。
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NARRATION = ROOT / "src" / "Pyramid" / "data" / "narration.ts"
OUT_DIR = ROOT / "src" / "Pyramid" / "voicevox"
AUDIO_DIR = ROOT / "public" / "audio" / "pyramid"


def read_lines() -> list[dict]:
    source = NARRATION.read_text(encoding="utf-8")
    marker = "export const narration: Narration = "
    payload = source.split(marker, 1)[1].strip().rstrip(";")
    # Prettier がキーの引用符を外していても読めるようにする
    payload = re.sub(r"(?m)^(\s*)([A-Za-z_][A-Za-z0-9_]*):", r'\1"\2":', payload)
    payload = re.sub(r",(?=\s*[}\]])", "", payload)
    data = json.loads(payload)
    return [line for chapter in data["chapters"] for line in chapter["lines"]]


def make_text() -> None:
    lines = read_lines()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    readings = [line.get("reading") or line["subtitle"] for line in lines]
    (OUT_DIR / "readings.txt").write_text("\n".join(readings) + "\n", encoding="utf-8")
    rows = ["番号\t行ID\t読み\t字幕"]
    for i, (line, reading) in enumerate(zip(lines, readings), 1):
        rows.append(f"{i}\t{line['id']}\t{reading}\t{line['subtitle']}")
    (OUT_DIR / "readings_with_ids.tsv").write_text("\n".join(rows) + "\n", encoding="utf-8-sig")
    print(f"{len(lines)}行 → {OUT_DIR / 'readings.txt'}")


def leading_number(path: Path) -> int:
    m = re.match(r"\D*(\d+)", path.stem)
    if not m:
        sys.exit(f"ファイル名の先頭に番号がありません: {path.name}")
    return int(m.group(1))


def import_wavs(folder: Path, overwrite: bool) -> None:
    lines = read_lines()
    wavs = sorted(folder.glob("*.wav"), key=leading_number)
    if len(wavs) != len(lines):
        sys.exit(f"WAVの数が合いません：フォルダに{len(wavs)}本、原稿は{len(lines)}行")
    numbers = [leading_number(w) for w in wavs]
    if len(set(numbers)) != len(numbers):
        sys.exit("ファイル名の番号が重複しています。書き出しのファイル名に連番が入っているか確かめてください")
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    existing = [line["id"] for line in lines if (AUDIO_DIR / f"{line['id']}.wav").exists()]
    if existing and not overwrite:
        sys.exit(f"public/audio/pyramid/ にすでに{len(existing)}本あります。上書きするなら --overwrite を付けてください")
    for wav, line in zip(wavs, lines):
        shutil.copyfile(wav, AUDIO_DIR / f"{line['id']}.wav")
    print(f"{len(wavs)}本を取り込みました（先頭：{wavs[0].name} → {lines[0]['id']}.wav、"
          f"最後：{wavs[-1].name} → {lines[-1]['id']}.wav）")
    subprocess.run(["node", str(ROOT / "scripts" / "measure_pyramid_audio.cjs")], check=False)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("text", help="読み込み用のテキストを作る")
    imp = sub.add_parser("import", help="書き出したWAVを取り込む")
    imp.add_argument("folder", type=Path)
    imp.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()
    if args.command == "text":
        make_text()
    else:
        import_wavs(args.folder, args.overwrite)


if __name__ == "__main__":
    main()
