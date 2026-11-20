"""Measure narration energy at 30 fps for silent-gap-aware mouth animation."""
import array
import json
import math
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
result = {}
for path in sorted((ROOT / 'public/audio/pyramid').glob('*.wav')):
    with wave.open(str(path)) as audio:
        if audio.getsampwidth() != 2:
            raise ValueError(f'Expected signed 16-bit PCM: {path}')
        channels, rate = audio.getnchannels(), audio.getframerate()
        samples = array.array('h', audio.readframes(audio.getnframes()))
    window = rate // 30 * channels
    energy = []
    for offset in range(0, len(samples), window):
        chunk = samples[offset:offset + window]
        energy.append(math.sqrt(sum(value * value for value in chunk) / max(1, len(chunk))))
    reference = max(100, sorted(energy)[int((len(energy) - 1) * 0.95)])
    result[path.stem] = [round(min(1, max(0, (value / reference - 0.07) / 0.93)), 2) for value in energy]
output = ROOT / 'src/Pyramid/data/speech-energy.ts'
output.write_text('export const speechEnergy: Record<string, number[]> = ' + json.dumps(result, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'Measured {len(result)} narration clips, {sum(map(len, result.values()))} frames')
