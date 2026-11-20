# 軽トラのおじさんMV: 寸劇入りの音源を作る → public/music/keitora-ojisan-mv.wav (+ .json)
# Rap Bridge の最後のウッキー！のあと、Verse4「俺は 肩書きで…」の直前 CUT で曲をテープストップ
# → 寸劇 SKIT 秒 → CUT から再開。確認用に寸劇まわりだけの mp3 も書き出す
import json, os, subprocess, glob, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SR = 48000
SRC = os.path.join(ROOT, 'music', '軽トラのおじさん.wav')
VOICE = os.path.join(ROOT, 'voice', '軽トラのおじさん')
OUT = os.path.join(ROOT, 'public', 'music', 'keitora-ojisan-mv.wav')
PREVIEW = os.path.join(ROOT, 'mv', '軽トラのおじさん', '寸劇プレビュー.mp3')
CUT = 201.0          # Verse4 の歌い出し（201.14）の直前。ここから再開
TAPE = 0.8           # テープストップの長さ（元の曲 CUT-TAPE/2 〜 CUT を使う）
SKIT = 20.6
POST = 3.0

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float32) / 32768

song = load(SRC)
SONG_LEN = len(song) / SR
rms_song = float(np.sqrt(np.mean(song[int(60 * SR):int(120 * SR)] ** 2)))

# ---- テープストップ（速さ 1 → 0） ----
n_out = int(TAPE * SR)
speed = np.linspace(1, 0, n_out) ** 1.3
pos = int((CUT - TAPE / 2) * SR) + np.cumsum(speed) * (int(TAPE / 2 * SR) / speed.sum())
idx = np.clip(pos.astype(int), 0, len(song) - 1)
tape = song[idx] * np.linspace(1, 0.2, n_out)[:, None]
tape_start = int((CUT - TAPE / 2) * SR)

skit = np.zeros((int(SKIT * SR), 2), np.float32)
def put(sig, at, gain=1.0, pan=0.0):
    if sig.ndim == 1: sig = np.stack([sig, sig], -1)
    sig = sig * gain * np.array([1 - max(0, pan), 1 + min(0, pan)], np.float32)
    i = int(at * SR); j = min(len(skit), i + len(sig))
    skit[i:j] += sig[:j - i]

def t_(d): return np.arange(int(d * SR)) / SR
def square(f, d, duty=0.5): return np.where((t_(d) * f) % 1 < duty, 1.0, -1.0).astype(np.float32)
def env(sig, a=0.005, r=0.05):
    n = len(sig); e = np.ones(n, np.float32)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na); e[n - nr:] *= np.linspace(1, 0, nr)
    return sig * e
def noise(d, seed=0): return np.random.default_rng(seed).uniform(-1, 1, int(d * SR)).astype(np.float32)
def smooth(sig, k): return np.convolve(sig, np.ones(k) / k, 'same').astype(np.float32)
def notes(seq, dur, duty=0.5):
    return np.concatenate([env(square(440 * 2 ** ((m - 69) / 12), dur, duty), 0.002, 0.02) for m in seq])
def sweep(f0, f1, d, duty=0.5):
    tt = t_(d); f = np.linspace(f0, f1, len(tt)); ph = np.cumsum(f) / SR
    return env(np.where(ph % 1 < duty, 1.0, -1.0).astype(np.float32), 0.002, 0.05)

# ---- 効果音（チップチューン風・自作） ----
pit_jingle = np.concatenate([notes([76, 79, 76, 79], 0.07, 0.25), notes([84], 0.12), env(square(1318.5, 0.4, 0.25), 0.002, 0.3)])
get_item = notes([72, 76, 79, 84, 88], 0.06, 0.25)
buzz = np.concatenate([env(square(98, 0.16), 0.002, 0.03), np.zeros(int(0.06 * SR), np.float32), env(square(92, 0.45), 0.002, 0.1)])
def door():
    tt = t_(0.25)
    click = env(noise(0.04, 7), 0.001, 0.03)
    thud = (np.sin(2 * np.pi * 110 * tt) * np.exp(-tt * 25)).astype(np.float32)
    out = np.zeros(int(0.35 * SR), np.float32); out[:len(click)] += click * 0.6; out[int(0.08 * SR):int(0.08 * SR) + len(thud)] += thud
    return out
def step_(seed):
    tt = t_(0.14); thump = np.sin(2 * np.pi * (90 - 40 * tt / 0.14) * tt) * np.exp(-tt * 30)
    return (thump + env(noise(0.14, seed), 0.001, 0.12) * np.exp(-tt * 70) * 0.3).astype(np.float32)
tone_up = sweep(330, 1320, 0.35, 0.25)           # 声が1トーン上がる（ピュイッ）
tone_up2 = sweep(440, 1760, 0.3, 0.25)
blip = lambda: env(square(1318.5, 0.03, 0.25), 0.001, 0.02)
pika = np.concatenate([notes([96, 100, 103], 0.04, 0.125), env(square(2093, 0.3, 0.125), 0.002, 0.25)])

# ---- ボイス ----
def voice(num):
    f = glob.glob(os.path.join(VOICE, f'{num:03d}_*.wav'))[0]
    v = load(f).mean(1)
    rms = float(np.sqrt(np.mean(v[np.abs(v) > 0.01] ** 2)))
    return v * (rms_song * 1.15 / max(rms, 1e-4))

V = rms_song
put(pit_jingle, 0.1, V * 1.2)          # ― ピットイン ―『かちょうの いす』
put(voice(18), 1.0)                    # おじさん「うん、この椅子、俺のほうが似合うな」
put(get_item, 5.2, V * 1.2)            # おじさんは かちょうの いすを てにいれた！
put(voice(19), 5.7, pan=-0.15)         # 主人公「課長、あした退院だそうです」
put(buzz, 9.6, V * 1.4)                # しかし きこえて いない！
put(door(), 10.4, V * 2.5)             # ガチャ
for i, at in enumerate([10.8, 11.1, 11.4]):
    put(step_(20 + i), at, V * 2.0, pan=0.3)   # 部長の足音（右から）
put(voice(20), 11.7)                   # おじさん「部長！おつかれさまですっ！」
put(tone_up, 13.5, V * 1.0)            # おじさんの こえが 1トーン あがった！
put(voice(21), 13.9, pan=0.2)          # 部長「おう！絶好調か！」
put(voice(22), 16.2)                   # おじさん「はいっ！絶好調でありますっ！」
put(tone_up2, 18.6, V * 1.0)
put(pika, 18.7, V * 0.8)               # ヘルメット ピカッ
put(voice(23), 18.9, pan=-0.15)        # 主人公「声、高っ」
for at in [0.1, 1.0, 5.2, 5.7, 9.6, 10.4, 11.7, 13.5, 13.9, 16.2, 18.9]:
    put(blip(), at, V * 0.5)           # 文字送りのピッ

mix = np.concatenate([
    song[:tape_start],
    tape,
    skit,
    song[int(CUT * SR):],
    np.zeros((int(POST * SR), 2), np.float32),
])
p = tape_start + len(tape) + len(skit)   # 再開のつなぎ目
n = 240; mix[p:p + n] *= np.linspace(0, 1, n)[:, None]
peak = float(np.abs(mix).max())
if peak > 0.99: mix *= 0.99 / peak
def write_wav(path, data):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(data, -1, 1) * 32767).astype(np.int16).tobytes())
os.makedirs(os.path.dirname(OUT), exist_ok=True)
write_wav(OUT, mix)
total = len(mix) / SR
# 曲の時間 → MVの時間: t < CUT-TAPE/2 はそのまま。t >= CUT は + (TAPE + SKIT - TAPE/2)
meta = {'cut': CUT, 'tape': TAPE, 'tapeStart': CUT - TAPE / 2, 'skitStart': CUT - TAPE / 2 + TAPE, 'skit': SKIT,
        'shiftAfterCut': round(TAPE / 2 + SKIT, 3), 'post': POST, 'songLen': round(SONG_LEN, 3), 'total': round(total, 3)}
json.dump(meta, open(OUT.replace('.wav', '.json'), 'w'), indent=1)
# 確認用: 3:10 から寸劇明けの 10 秒後まで
a = int(190.0 * SR); b = int((CUT + TAPE / 2 + SKIT + 10) * SR)
import tempfile
tmp = os.path.join(tempfile.gettempdir(), 'keitora_preview_tmp.wav'); write_wav(tmp, mix[a:b])
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-b:a', '192k', PREVIEW], check=True)
os.remove(tmp)
print(meta, 'peak', round(peak, 3))
