"""Create a 45-second preview and validate the actual exported MP4 streams."""
from pathlib import Path
import json
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
POP='--pop' in sys.argv
QA=ROOT/('out/pyramid2-pop-check' if POP else 'out/pyramid2-check')
FULL=ROOT/('out/pyramid2-full-pop.mp4' if POP else 'out/pyramid2-full.mp4')
PREVIEW=ROOT/('out/pyramid2-preview-pop.mp4' if POP else 'out/pyramid2-preview.mp4')
timeline=json.loads((QA/'timeline.json').read_text(encoding='utf-8'))

def run(args):
    result=subprocess.run(args,cwd=ROOT,capture_output=True,text=True,encoding='utf-8',errors='replace')
    if result.returncode:
        raise RuntimeError(result.stderr[-6000:])
    return result

def probe(path):
    return json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)]).stdout)

def validate(path,frames):
    info=probe(path)
    video=next(s for s in info['streams'] if s['codec_type']=='video')
    audio=next(s for s in info['streams'] if s['codec_type']=='audio')
    assert video['codec_name']=='h264'
    assert audio['codec_name']=='aac'
    assert (video['width'],video['height'])==(1920,1080)
    assert video['r_frame_rate']=='30/1'
    assert int(video['nb_frames'])==frames
    assert abs(float(video['duration'])-frames/30)<0.034
    assert abs(float(audio['duration'])-frames/30)<0.1
    result=run(['ffmpeg','-v','error','-threads','4','-i',str(path),'-f','null','-'])
    (QA/(path.stem+'-decode.log')).write_text(result.stderr,encoding='utf-8')
    assert not result.stderr.strip(),result.stderr
    return {'path':str(path),'bytes':path.stat().st_size,'video':video,'audio':audio,'decodedWithoutErrors':True}

print('Validating full movie...',flush=True)
full=validate(FULL,timeline['totalFrames'])
print('Creating exact 45-second preview...',flush=True)
run(['ffmpeg','-hide_banner','-v','error','-y','-i',str(FULL),'-t','45','-frames:v','1350','-c:v','libx264','-preset','fast','-crf','18','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',str(PREVIEW)])
preview=validate(PREVIEW,1350)
checks=[('media-intro.png',8),('media-people.png',timeline['chapters'][5]['from']/30+30),('media-credits.png',timeline['creditsFrom']/30+3)]
if '--fix1' in sys.argv:
    for id in ['03-12','05-12','08-05']:
        line=next(l for c in timeline['chapters'] for l in c['lines'] if l['id']==id)
        checks.append((f'media-fix1-{id}.png',(line['from']+line['durationInFrames']//2)/30))
if '--fix2' in sys.argv:
    for id in ['06-20', '08-06']:
        line=next(l for c in timeline['chapters'] for l in c['lines'] if l['id']==id)
        checks.append((f'media-fix2-{id}.png',(line['from']+line['durationInFrames']//2)/30))
    checks.append(('media-fix2-08-title.png',(timeline['chapters'][8]['from']+35)/30))
for name,sec in checks:
    run(['ffmpeg','-hide_banner','-v','error','-y','-ss',str(sec),'-i',str(FULL),'-frames:v','1','-update','1',str(QA/name)])
report={'full':full,'preview':preview,'extractedFrames':checks}
if POP:
    def audio_hash(path):
        return run(['ffmpeg','-v','error','-i',str(path),'-map','0:a:0','-vn','-c:a','pcm_s16le','-f','hash','-hash','sha256','-']).stdout.strip()
    original_audio=audio_hash(ROOT/'out/pyramid2-full.mp4')
    pop_audio=audio_hash(FULL)
    report['audioPcmMatchesOriginal'] = original_audio == pop_audio
    report['audioPcmSha256'] = pop_audio
    if '--fix2' in sys.argv:
        # POP_FIX_2 intentionally replaces two narration WAVs and rebuilds timing.
        assert not report['audioPcmMatchesOriginal'], 'Expected updated narration audio'
        report['audioChangedForFix2'] = True
    else:
        assert report['audioPcmMatchesOriginal'], 'Decoded audio differs from the preserved original movie'

(QA/'media-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
if POP:
    print('Verified pop movie and preview. Complete audio/video decode: no errors.',flush=True)
    sys.exit(0)
record=ROOT/'src/Pyramid2/IMPLEMENTATION.md'
old='本編と冒頭45秒プレビューを書き出し中。完了後にMP4の映像・音声・フレーム数を確認して追記する。'
new='本編 `out/pyramid2-full.mp4` と冒頭45秒 `out/pyramid2-preview.mp4` の書き出し完了。両方1920×1080・30fps・H.264/AAC。本編24,352フレーム、プレビュー1,350フレームを確認。両ファイルの映像・音声を全編デコードしてエラーなし。詳細は `out/pyramid2-check/media-verification.json`。完成MP4から冒頭・中盤・クレジットの3場面も抽出。'
record.write_text(record.read_text(encoding='utf-8').replace(old,new),encoding='utf-8')
print('Verified full movie and preview. Complete audio/video decode: no errors.',flush=True)
