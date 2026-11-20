"""Generate one VOICEVOX WAV per narration row for the Pyramid video.

Run from the repository root while the local VOICEVOX engine is running:
    python scripts/pyramid_export_voicevox.py

The text comes from each row's `reading` field in narration.ts; blank readings
already fall back to the corresponding subtitle in pyramid_script_to_json.py.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
NARRATION = ROOT / "src" / "Pyramid" / "data" / "narration.ts"
VOICE_NAME = "暁記ミタマ"  # VOICEVOX engine's official speaker name
STYLE_NAME = "ノーマル"


def request_json(url: str, *, method: str = "GET", body: dict | None = None) -> dict | list:
    payload = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"} if payload is not None else {}
    request = Request(url, data=payload, headers=headers, method=method)
    with urlopen(request, timeout=120) as response:
        return json.loads(response.read().decode("utf-8"))


def read_narration() -> dict:
    source = NARRATION.read_text(encoding="utf-8")
    marker = "export const narration: Narration = "
    if marker not in source:
        raise RuntimeError(f"Unexpected narration format: {NARRATION}")
    payload = source.split(marker, 1)[1].strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    # Prettier may remove quotes from identifier keys, leaving a valid
    # TypeScript object that needs a small normalization before JSON parsing.
    payload = re.sub(r"(?m)^(\s*)([A-Za-z_][A-Za-z0-9_]*):", r'\1"\2":', payload)
    payload = re.sub(r",(?=\s*[}\]])", "", payload)
    return json.loads(payload)


def find_speaker_id(engine_url: str) -> int:
    speakers = request_json(f"{engine_url}/speakers")
    speaker = next((item for item in speakers if item.get("name") == VOICE_NAME), None)
    if speaker is None:
        available = ", ".join(item.get("name", "?") for item in speakers)
        raise RuntimeError(f"{VOICE_NAME} is not available. Engine speakers: {available}")
    style = next((item for item in speaker.get("styles", []) if item.get("name") == STYLE_NAME), None)
    if style is None:
        raise RuntimeError(f"Style {STYLE_NAME} is not available for {VOICE_NAME}")
    return int(style["id"])


def synthesize(engine_url: str, speaker_id: int, text: str, args: argparse.Namespace) -> bytes:
    query_args = urlencode({"speaker": speaker_id, "text": text})
    query = request_json(
        f"{engine_url}/audio_query?{query_args}",
        method="POST",
    )
    query["speedScale"] = args.speed_scale
    query["pitchScale"] = args.pitch_scale
    query["intonationScale"] = args.intonation_scale
    query["prePhonemeLength"] = 0.1
    query["postPhonemeLength"] = 0.1

    payload = json.dumps(query, ensure_ascii=False).encode("utf-8")
    request = Request(
        f"{engine_url}/synthesis?speaker={speaker_id}",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=120) as response:
        wav = response.read()
    if len(wav) < 44 or wav[:4] != b"RIFF" or wav[8:12] != b"WAVE":
        raise RuntimeError("VOICEVOX returned data that is not a WAV file")
    return wav


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--engine-url", default="http://127.0.0.1:50021")
    parser.add_argument("--speed-scale", type=float, default=1.15)
    parser.add_argument("--pitch-scale", type=float, default=0.01)
    parser.add_argument("--intonation-scale", type=float, default=1.5)
    parser.add_argument("--overwrite", action="store_true", help="replace existing WAV files")
    args = parser.parse_args()

    data = read_narration()
    lines = [line for chapter in data["chapters"] for line in chapter["lines"]]
    if not lines:
        raise RuntimeError("No narration rows found")

    try:
        speaker_id = find_speaker_id(args.engine_url.rstrip("/"))
    except (HTTPError, URLError) as error:
        raise RuntimeError(
            f"VOICEVOX engine is unavailable at {args.engine_url}: {error}"
        ) from error

    print(
        f"{VOICE_NAME}（{STYLE_NAME}, style id {speaker_id}）: {len(lines)} rows; "
        f"speed={args.speed_scale}, pitch={args.pitch_scale}, "
        f"intonation={args.intonation_scale}"
    )

    written = 0
    skipped = 0
    for index, line in enumerate(lines, 1):
        line_id = line["id"]
        text = line.get("reading") or line["subtitle"]
        destination = ROOT / "public" / line["audio"]
        destination.parent.mkdir(parents=True, exist_ok=True)
        if destination.exists() and not args.overwrite:
            skipped += 1
            print(f"{index}/{len(lines)} {line_id}: existing WAV kept")
            continue
        try:
            wav = synthesize(args.engine_url.rstrip("/"), speaker_id, text, args)
        except (HTTPError, URLError) as error:
            raise RuntimeError(f"Failed on {line_id}: {error}") from error
        destination.write_bytes(wav)
        written += 1
        print(f"{index}/{len(lines)} {line_id}: {len(wav)} bytes")

    print(f"Done: wrote {written}, kept {skipped}, total {len(lines)}")


if __name__ == "__main__":
    main()
