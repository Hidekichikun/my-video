# 部長MV: 寸劇入りの音源を作る → public/music/bucho-chijo-mv.wav (+ .json)
# 「そうか」(〜2:35.12) の直後 CUT_IN で曲を止めて寸劇 SKIT 秒 → CUT_OUT（「オイ！」の直前）から再開
import json, os, subprocess, glob
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR = 48000
SRC = os.path.join(ROOT, 'music', '部長、ここは地上です！_そうかの後ストップ2拍.mp3')
VOICE = os.path.join(ROOT, 'voice', '部長ここは地上です')
OUT = os.path.join(ROOT, 'public', 'music', 'bucho-chijo-mv.wav')
CUT_IN, CUT_OUT, SKIT, POST = 155.6, 155.93, 19.8, 3.0
PAD = 0.8  # 「そうか」のあとの間（曲の無音 2:35.12〜2:35.6 ＋ この PAD 秒 → 約1.3秒）

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).reshape(-1, 2).astype(np.float32) / 32768

song = load(SRC)
SONG_LEN = len(song) / SR
rms_song = float(np.sqrt(np.mean(song[int(60 * SR):int(120 * SR)] ** 2)))

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

# ---- 効果音（チップチューン風・自作） ----
pishi = env(square(2093, 0.06, 0.25), 0.001, 0.04) + env(noise(0.08, 1) * 0.5, 0.001, 0.06)[:int(0.06 * SR)]
jingle = np.concatenate([notes([72, 76, 79, 84], 0.09), env(square(1046.5, 0.45, 0.25), 0.002, 0.35)])
status_up = notes([67, 71, 74, 79, 83, 86], 0.05, 0.25)
buzz = np.concatenate([env(square(98, 0.16), 0.002, 0.03), np.zeros(int(0.06 * SR), np.float32), env(square(92, 0.45), 0.002, 0.1)])
sigh_n = smooth(noise(0.7, 2), 18); sigh = sigh_n * np.linspace(1, 0, len(sigh_n)) ** 1.5 * np.linspace(0.3, 1, len(sigh_n)) ** 0.2
def step_(seed):
    tt = t_(0.18); thump = np.sin(2 * np.pi * (70 - 40 * tt / 0.18) * tt) * np.exp(-tt * 22)
    return (thump + env(noise(0.18, seed), 0.001, 0.15) * np.exp(-tt * 60) * 0.4).astype(np.float32)
inh = noise(1.0, 3); inh = inh - smooth(inh, 6)  # かすれた高い音
inhale = inh * np.linspace(0, 1, len(inh)) ** 1.2 * np.concatenate([np.ones(int(0.85 * SR)), np.linspace(1, 0, int(0.15 * SR))])
blip = lambda: env(square(1318.5, 0.03, 0.25), 0.001, 0.02)

# ---- ボイス ----
def voice(num):
    f = glob.glob(os.path.join(VOICE, f'{num:03d}_*.wav'))[0]
    v = load(f).mean(1)
    rms = float(np.sqrt(np.mean(v[np.abs(v) > 0.01] ** 2)))
    return v * (rms_song * 1.15 / max(rms, 1e-4))

V = rms_song * 1.0
put(pishi, 0.0, V * 2.2)
put(jingle, 0.15, V * 1.2)
put(voice(13), 1.2)            # 総務部「部長、来週の安全パトロールですが…」
put(voice(14), 6.6)            # 部長「俺が言っといてやる」（かぶせる）
put(status_up, 9.0, V * 1.3)   # ぶちょうの たのもしさが 10 あがった！
put(voice(15), 10.0, pan=-0.15)  # 主人公「それ、先月も言ってましたよね」
put(voice(16), 13.0)           # 部長「俺は言ってねぇぞ」
put(buzz, 15.6, V * 1.4)       # しかし きおくは なかった……
put(sigh, 16.6, V * 1.6)       # 総務部 ためいき
put(voice(17), 17.3)           # 部長「よし！」
for i, at in enumerate([17.9, 18.25, 18.6, 18.95]):
    put(step_(10 + i), at, V * 3.0)
put(inhale, 19.0, V * 1.1)     # スーッ
# 文字送りのピッ（メッセージが出るところ）
for at in [1.2, 6.6, 9.0, 10.0, 13.0, 15.6, 17.3, 17.8]:
    put(blip(), at, V * 0.5)

mix = np.concatenate([
    song[:int(CUT_IN * SR)],
    np.zeros((int(PAD * SR), 2), np.float32),
    skit,
    song[int(CUT_OUT * SR):],
    np.zeros((int(POST * SR), 2), np.float32),
])
# つなぎ目のプチッ防止
for pos in [int(CUT_IN * SR), int((CUT_IN + PAD + SKIT) * SR)]:
    n = 240; mix[pos - n:pos] *= np.linspace(1, 0, n)[:, None]
peak = np.abs(mix).max()
if peak > 0.99: mix *= 0.99 / peak
with open(OUT, 'wb') as fh:
    import wave
    w = wave.open(fh, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
total = len(mix) / SR
meta = {'cutIn': CUT_IN, 'pad': PAD, 'cutOut': CUT_OUT, 'skit': SKIT, 'post': POST, 'songLen': round(SONG_LEN, 3), 'total': round(total, 3)}
json.dump(meta, open(OUT.replace('.wav', '.json'), 'w'))
print(meta, 'peak', round(float(peak), 3), 'rms_song', round(rms_song, 3))
