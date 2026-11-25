"""ナレーションの音量を30fpsで測り、先生の口パク用エンベロープ（speech-energy.ts）を作る。

  python speech_envelopes.py --audio-dir public/audio/foo --out src/Foo/data/speech-energy.ts

16bit PCM の WAV が前提（VOICEVOXの書き出しはそのまま使える）。無音は0、口は音量で開閉する。
"""
import argparse
import array
import json
import math
import wave
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('--audio-dir', required=True)
ap.add_argument('--out', required=True)
args = ap.parse_args()

result = {}
for path in sorted(Path(args.audio_dir).glob('*.wav')):
    with wave.open(str(path)) as audio:
        if audio.getsampwidth() != 2:
            raise ValueError(f'Expected signed 16-bit PCM: {path}')
        channels, rate = audio.getnchannels(), audio.getframerate()
        samples = array.array('h', audio.readframes(audio.getnframes()))
    window = rate // 30 * channels
    energy = []
    for offset in range(0, len(samples), window):
        chunk = samples[offset:offset + window]
        energy.append(math.sqrt(sum(v * v for v in chunk) / max(1, len(chunk))))
    reference = max(100, sorted(energy)[int((len(energy) - 1) * 0.95)])
    result[path.stem] = [round(min(1, max(0, (v / reference - 0.07) / 0.93)), 2) for v in energy]

out = Path(args.out)
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(
    '// このファイルは speech_envelopes.py が自動生成する。直接編集しない。\n'
    'export const speechEnergy: Record<string, number[]> = ' + json.dumps(result, separators=(',', ':')) + ';\n',
    encoding='utf-8',
)
print(f'Measured {len(result)} clips, {sum(map(len, result.values()))} frames')
