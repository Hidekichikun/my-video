"""BGMのmp3を実際に読み込んで、長さ(sec)と音の大きさをそろえる係数(gain)を出す。

  python measure_bgm.py --ref public/music/pyramid/find-you-again-inst.mp3 "music/math用/a.mp3" "music/math用/b.mp3"

- mp3の申告尺は当てにならないので、Remotion同梱の ffmpeg で8kHzのWAVに読み込み、サンプル数から測る。
- gain ＝ 基準曲のRMS ÷ その曲のRMS。Bgm.tsx の音量（ナレ中 0.15／間 0.27）にかけると、基準曲と同じ聴こえ方になる。
- システムに ffmpeg は無い。`npx remotion ffmpeg` を使う（Bash から実行すること）。
"""
import argparse
import array
import math
import subprocess
import tempfile
import wave
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument('files', nargs='+')
ap.add_argument('--ref', help='音の大きさの基準にする曲（前作のBGMなど）')
ap.add_argument('--ref-seconds', type=int, default=120, help='基準曲は頭から何秒を測るか')
args = ap.parse_args()


def decode(path, seconds=None):
    tmp = Path(tempfile.mkdtemp()) / 'x.wav'
    cmd = ['npx', 'remotion', 'ffmpeg', '-y', '-i', str(path)]
    if seconds:
        cmd += ['-t', str(seconds)]
    cmd += ['-ac', '1', '-ar', '8000', '-f', 'wav', str(tmp)]
    subprocess.run(cmd, check=True, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with wave.open(str(tmp)) as w:
        n, rate = w.getnframes(), w.getframerate()
        a = array.array('h', w.readframes(n))
    rms = math.sqrt(sum(v * v for v in a) / max(1, len(a)))
    return n / rate, rms


ref_rms = decode(args.ref, args.ref_seconds)[1] if args.ref else None
if ref_rms:
    print(f'基準 {args.ref}: RMS {ref_rms:.0f}')
for f in args.files:
    sec, rms = decode(f)
    gain = f'{ref_rms / rms:.3f}' if ref_rms else '-'
    print(f'{Path(f).name}\tsec={sec:.1f}\tRMS={rms:.0f}\tgain={gain}')
