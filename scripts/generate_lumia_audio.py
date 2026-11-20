from __future__ import annotations

import math
import wave
from pathlib import Path

import numpy as np


SAMPLE_RATE = 48_000
DURATION = 90.0
SAMPLES = int(SAMPLE_RATE * DURATION)
ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "music" / "ルミアと始まりの海"
RNG = np.random.default_rng(20260803)


def stereo() -> np.ndarray:
    return np.zeros((SAMPLES, 2), dtype=np.float32)


def pan_mono(signal: np.ndarray, pan: float) -> np.ndarray:
    pan = float(np.clip(pan, -1.0, 1.0))
    angle = (pan + 1.0) * math.pi / 4.0
    return np.column_stack((signal * math.cos(angle), signal * math.sin(angle))).astype(
        np.float32
    )


def add(track: np.ndarray, start: float, signal: np.ndarray, pan: float = 0.0) -> None:
    start_sample = max(0, int(start * SAMPLE_RATE))
    if signal.ndim == 1:
        signal = pan_mono(signal, pan)
    end_sample = min(SAMPLES, start_sample + len(signal))
    if end_sample > start_sample:
        track[start_sample:end_sample] += signal[: end_sample - start_sample]


def envelope(length: int, attack: float, release: float) -> np.ndarray:
    env = np.ones(length, dtype=np.float32)
    attack_samples = min(length, max(1, int(attack * SAMPLE_RATE)))
    release_samples = min(length, max(1, int(release * SAMPLE_RATE)))
    env[:attack_samples] *= np.linspace(0.0, 1.0, attack_samples, dtype=np.float32)
    env[-release_samples:] *= np.linspace(1.0, 0.0, release_samples, dtype=np.float32)
    return env


def sine_tone(freq: float, duration: float, gain: float = 1.0) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count, dtype=np.float32) / SAMPLE_RATE
    return (np.sin(2 * np.pi * freq * t) * gain).astype(np.float32)


def pad(freqs: list[float], duration: float, gain: float = 0.12) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count, dtype=np.float32) / SAMPLE_RATE
    signal = np.zeros(count, dtype=np.float32)
    for index, freq in enumerate(freqs):
        detune = 1.0 + (index - len(freqs) / 2) * 0.0009
        signal += np.sin(2 * np.pi * freq * detune * t + index * 0.5)
        signal += 0.32 * np.sin(2 * np.pi * freq * 2.0 * t + index)
    signal /= max(1.0, len(freqs) * 1.2)
    slow_motion = 0.72 + 0.28 * np.sin(2 * np.pi * 0.085 * t + 0.4)
    return (signal * slow_motion * envelope(count, 1.8, 2.2) * gain).astype(np.float32)


def bell(freq: float, duration: float = 2.6, gain: float = 0.22) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count, dtype=np.float32) / SAMPLE_RATE
    body = (
        np.sin(2 * np.pi * freq * t)
        + 0.48 * np.sin(2 * np.pi * freq * 2.01 * t + 0.2)
        + 0.22 * np.sin(2 * np.pi * freq * 3.98 * t + 0.7)
        + 0.12 * np.sin(2 * np.pi * freq * 6.03 * t + 1.1)
    )
    return (body * np.exp(-2.2 * t) * gain).astype(np.float32)


def pluck(freq: float, duration: float = 0.55, gain: float = 0.1) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count, dtype=np.float32) / SAMPLE_RATE
    body = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t)
    return (body * np.exp(-8.5 * t) * gain).astype(np.float32)


def noise_burst(duration: float, gain: float = 0.1, decay: float = 7.0) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count, dtype=np.float32) / SAMPLE_RATE
    noise = RNG.normal(0.0, 1.0, count).astype(np.float32)
    return (noise * np.exp(-decay * t) * gain).astype(np.float32)


def low_random(duration: float, points_per_second: float = 10.0) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    points = max(4, int(duration * points_per_second))
    values = RNG.normal(0.0, 1.0, points).astype(np.float32)
    return np.interp(
        np.linspace(0.0, points - 1, count, dtype=np.float32),
        np.arange(points, dtype=np.float32),
        values,
    ).astype(np.float32)


def rising_wave(duration: float, gain: float = 0.25) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count, dtype=np.float32) / SAMPLE_RATE
    progress = t / duration
    phase = 2 * np.pi * (90 * t + 170 * progress**2 * duration / 2)
    shimmer = np.sin(phase) + 0.32 * np.sin(phase * 2.02)
    air = low_random(duration, 46.0)
    env = np.sin(np.pi * np.clip(progress, 0.0, 1.0)) ** 0.7
    return ((0.34 * shimmer + 0.66 * air) * env * gain).astype(np.float32)


def slide_whoosh(duration: float, gain: float = 0.2) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count, dtype=np.float32) / SAMPLE_RATE
    progress = t / duration
    wind = low_random(duration, 84.0)
    pulse = 0.65 + 0.35 * np.sin(2 * np.pi * (0.75 + 1.8 * progress) * t)
    return (wind * pulse * (0.25 + 0.75 * progress) * gain).astype(np.float32)


def splash(duration: float = 3.6, gain: float = 0.45) -> np.ndarray:
    count = int(duration * SAMPLE_RATE)
    t = np.arange(count, dtype=np.float32) / SAMPLE_RATE
    impact = RNG.normal(0.0, 1.0, count).astype(np.float32) * np.exp(-3.7 * t)
    rumble = np.sin(2 * np.pi * (62 - 18 * np.minimum(t, 1.0)) * t) * np.exp(-2.2 * t)
    tail = low_random(duration, 55.0) * np.exp(-0.8 * t)
    return ((0.56 * impact + 0.22 * rumble + 0.22 * tail) * gain).astype(np.float32)


def make_music() -> np.ndarray:
    music = stereo()
    chords = [
        [261.63, 329.63, 392.00, 493.88],
        [220.00, 261.63, 329.63, 392.00],
        [174.61, 220.00, 261.63, 329.63],
        [196.00, 246.94, 293.66, 392.00],
    ]
    for start in np.arange(0.0, DURATION, 8.0):
        chord_index = int(start // 8) % len(chords)
        gain = 0.10 if start < 18 else 0.135
        if 44 <= start < 52:
            gain = 0.025
        if start >= 56:
            gain = 0.16
        if start >= 80:
            gain = 0.105
        add(music, start, pad(chords[chord_index], 9.0, gain), pan=(-0.12 if chord_index % 2 else 0.12))

    motif = [659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 523.25, 587.33]
    beat = 60.0 / 96.0
    for start, end, gain in [(6.0, 44.0, 0.09), (52.0, 80.0, 0.12), (80.0, 87.0, 0.07)]:
        cursor = start
        index = 0
        while cursor < end:
            if index % 2 == 0 or start >= 52:
                add(music, cursor, pluck(motif[index % len(motif)], gain=gain), pan=(-0.4 + (index % 5) * 0.2))
            cursor += beat
            index += 1

    for time, freq, gain, pan in [
        (0.4, 1046.50, 0.19, -0.25),
        (2.0, 1318.51, 0.14, 0.25),
        (5.0, 1567.98, 0.13, 0.0),
        (17.6, 987.77, 0.13, -0.2),
        (29.4, 1174.66, 0.14, 0.2),
        (55.8, 783.99, 0.17, -0.25),
        (56.5, 987.77, 0.18, 0.25),
        (67.5, 1318.51, 0.19, 0.0),
        (80.2, 1046.50, 0.18, -0.3),
        (82.0, 1318.51, 0.16, 0.3),
        (84.0, 1567.98, 0.14, 0.0),
    ]:
        add(music, time, bell(freq, gain=gain), pan=pan)

    # Gentle pulse and shaker enter during the construction and slide sections.
    for start, end, level in [(30.0, 44.0, 0.035), (56.0, 80.0, 0.052)]:
        cursor = start
        beat_index = 0
        while cursor < end:
            kick_len = int(0.24 * SAMPLE_RATE)
            kt = np.arange(kick_len, dtype=np.float32) / SAMPLE_RATE
            kick = np.sin(2 * np.pi * (92 - 48 * kt) * kt) * np.exp(-15 * kt) * level
            add(music, cursor, kick, pan=0.0)
            add(music, cursor + beat / 2, noise_burst(0.13, level * 0.55, 22), pan=(0.5 if beat_index % 2 else -0.5))
            cursor += beat
            beat_index += 1
    return music


def make_ambience() -> np.ndarray:
    ambience = stereo()
    t = np.arange(SAMPLES, dtype=np.float32) / SAMPLE_RATE
    ocean = low_random(DURATION, 13.0)
    swell = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.092 * t + 0.8)) ** 2
    airy = RNG.normal(0.0, 1.0, SAMPLES).astype(np.float32) * 0.012
    base = (ocean * swell * 0.055 + airy).astype(np.float32)
    ambience[:, 0] = base
    ambience[:, 1] = np.roll(base, 911) * 0.94

    # Underwater ambience after the splash.
    underwater_count = int(10.0 * SAMPLE_RATE)
    ut = np.arange(underwater_count, dtype=np.float32) / SAMPLE_RATE
    underwater = (
        0.028 * np.sin(2 * np.pi * 52 * ut)
        + 0.020 * np.sin(2 * np.pi * 79 * ut + 0.6)
        + 0.012 * low_random(10.0, 8.0)
    ) * envelope(underwater_count, 0.8, 1.4)
    add(ambience, 80.0, underwater.astype(np.float32), pan=0.0)
    return ambience


def make_sfx() -> np.ndarray:
    sfx = stereo()
    # Title droplets.
    for index, time in enumerate([0.45, 1.15, 2.05, 3.2, 4.65]):
        add(sfx, time, bell(1200 + index * 145, 0.8, 0.10), pan=-0.6 + index * 0.3)

    # Sand sketch and shell construction details.
    sand = low_random(8.0, 95.0) * envelope(int(8.0 * SAMPLE_RATE), 0.35, 0.5) * 0.055
    add(sfx, 20.0, sand.astype(np.float32), pan=-0.2)
    for index, time in enumerate(np.arange(31.0, 43.5, 1.15)):
        freq = 820 + (index % 4) * 170
        add(sfx, float(time), bell(freq, 0.38, 0.075), pan=(-0.65 + (index % 5) * 0.32))

    # Comedic dry stop.
    add(sfx, 47.1, slide_whoosh(0.7, 0.08), pan=0.0)
    add(sfx, 47.75, sine_tone(210, 0.12, 0.12), pan=-0.1)
    add(sfx, 47.86, sine_tone(145, 0.34, 0.10) * envelope(int(0.34 * SAMPLE_RATE), 0.01, 0.3), pan=0.1)
    add(sfx, 49.0, bell(523.25, 1.2, 0.09), pan=0.0)

    # Wave activation, slide, and splash.
    add(sfx, 56.0, rising_wave(12.0, 0.24), pan=-0.15)
    add(sfx, 67.7, bell(1567.98, 2.3, 0.16), pan=0.2)
    add(sfx, 68.0, slide_whoosh(12.0, 0.20), pan=0.0)
    for index, time in enumerate(np.arange(69.0, 79.0, 1.0)):
        add(sfx, float(time), noise_burst(0.22, 0.042 + index * 0.002, 11), pan=-0.7 + (index % 6) * 0.28)
    add(sfx, 79.65, splash(4.1, 0.52), pan=0.0)
    add(sfx, 80.05, sine_tone(58, 2.2, 0.12) * envelope(int(2.2 * SAMPLE_RATE), 0.02, 1.9), pan=0.0)
    for index, time in enumerate([81.2, 82.0, 83.1, 84.25, 85.3]):
        add(sfx, time, bell(880 * (1.0 + index * 0.12), 2.3, 0.10), pan=-0.5 + index * 0.25)
    return sfx


def apply_fades(track: np.ndarray) -> np.ndarray:
    result = track.copy()
    intro = int(0.55 * SAMPLE_RATE)
    outro = int(2.2 * SAMPLE_RATE)
    result[:intro] *= np.linspace(0.0, 1.0, intro, dtype=np.float32)[:, None]
    result[-outro:] *= np.linspace(1.0, 0.0, outro, dtype=np.float32)[:, None]
    return result


def peak_normalize(track: np.ndarray, target_peak: float) -> np.ndarray:
    peak = float(np.max(np.abs(track)))
    if peak <= 1e-9:
        return track
    return track * (target_peak / peak)


def master_to_target(track: np.ndarray, target_rms_db: float = -17.0) -> np.ndarray:
    """Soft-limit the mix to a web-video loudness neighborhood without hard clipping."""
    target_rms = 10 ** (target_rms_db / 20.0)
    best = peak_normalize(track, 0.89)
    low, high = 0.4, 12.0
    for _ in range(24):
        drive = (low + high) / 2.0
        candidate = np.tanh(track * drive).astype(np.float32)
        candidate = peak_normalize(candidate, 0.89)
        rms = float(np.sqrt(np.mean(candidate**2)))
        best = candidate
        if rms < target_rms:
            low = drive
        else:
            high = drive
    return best


def write_wav(path: Path, track: np.ndarray) -> None:
    pcm = np.clip(track, -1.0, 1.0)
    pcm = (pcm * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(SAMPLE_RATE)
        output.writeframes(pcm.tobytes())


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    music = peak_normalize(make_music(), 0.72)
    ambience = peak_normalize(make_ambience(), 0.32)
    sfx = peak_normalize(make_sfx(), 0.88)

    # Duck music around the dry-stop joke and the large splash.
    duck = np.ones(SAMPLES, dtype=np.float32)
    for start, end, minimum in [(44.0, 51.0, 0.28), (78.8, 82.2, 0.42)]:
        left = int(start * SAMPLE_RATE)
        right = int(end * SAMPLE_RATE)
        middle = (left + right) // 2
        duck[left:middle] = np.linspace(1.0, minimum, middle - left, dtype=np.float32)
        duck[middle:right] = np.linspace(minimum, 1.0, right - middle, dtype=np.float32)

    final_mix = music * duck[:, None] * 0.72 + ambience * 0.72 + sfx * 0.88
    final_mix = apply_fades(final_mix)
    final_mix = master_to_target(final_mix, -17.0)

    write_wav(OUTPUT_DIR / "lumia-music.wav", music)
    write_wav(OUTPUT_DIR / "lumia-ambience.wav", ambience)
    write_wav(OUTPUT_DIR / "lumia-sfx.wav", sfx)
    write_wav(OUTPUT_DIR / "lumia-final-mix.wav", final_mix)

    final_rms = float(np.sqrt(np.mean(final_mix**2)))
    final_dbfs = 20 * math.log10(max(final_rms, 1e-9))
    final_peak = float(np.max(np.abs(final_mix)))
    print(f"Generated 4 stereo WAV files at {SAMPLE_RATE} Hz / {DURATION:.1f} s")
    print(f"Final RMS: {final_dbfs:.2f} dBFS; peak: {final_peak:.3f}")
    print(OUTPUT_DIR)


if __name__ == "__main__":
    main()
