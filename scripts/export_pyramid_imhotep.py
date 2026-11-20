"""Composite the verified museum card into the existing guide video; copy audio unchanged."""
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / 'tmp/imhotep-tools'))
import imageio_ffmpeg
ffmpeg = Path(imageio_ffmpeg.get_ffmpeg_exe())
timing = json.loads((root / 'out/pyramid-imhotep-check/timing.json').read_text())
start, end, fps = timing['from'], timing['end'], timing['fps']
card = root / 'out/pyramid-imhotep-check/card.png'
source = root / 'out/pyramid-guide.mp4'
output = root / 'out/pyramid-guide-imhotep.mp4'
filters = (
    f'[1:v]format=rgba,fade=t=in:st={start/fps}:d={12/fps}:alpha=1[card];'
    f"[0:v][card]overlay=0:0:enable='gte(t,{start/fps})*lt(t,{end/fps})':shortest=1:format=auto,format=yuv420p[v]"
)
subprocess.run([
    str(ffmpeg), '-hide_banner', '-v', 'warning', '-y', '-i', str(source),
    '-loop', '1', '-framerate', str(fps), '-i', str(card),
    '-filter_complex', filters, '-map', '[v]', '-map', '0:a:0',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-threads', '8',
    '-c:a', 'copy', '-movflags', '+faststart', '-progress', 'pipe:1', '-nostats',
    str(output),
], check=True)
preview = root / 'out/pyramid-imhotep-preview.mp4'
subprocess.run([
    str(ffmpeg), '-hide_banner', '-v', 'error', '-y', '-ss', str(start/fps - 1),
    '-i', str(output), '-t', str((end-start)/fps + 2),
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-c:a', 'aac',
    '-movflags', '+faststart', str(preview),
], check=True)
print(f'Saved {output.name} and {preview.name}', flush=True)
