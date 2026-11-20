import json,subprocess,sys
n=sys.argv[1]; C=json.load(open(f'_work/{n}.json',encoding='utf-8')); import numpy as np; BT=np.array(C['beat_times']) if 'beat_times' in C else None; SPB=60/C['bpm']; DUR=(float(BT[C['beats']]-C['start']) if BT is not None else C['beats']*SPB)+C.get('enddur',3.5)
segs=sys.argv[2:]; open(f'_work/{n}_list.txt','w').write(''.join(f"file '{s}'\n" for s in segs))
fi=C.get('fadein',0.03)
r=subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i',f'_work/{n}_list.txt','-ss',f"{C['start']:.3f}",'-t',f'{DUR:.3f}','-i','../'+C['audio'],
 '-map','0:v','-map','1:a','-c:v','copy','-af',f'afade=t=in:d={fi}:curve=qsin,afade=t=out:st={DUR-2.8:.2f}:d=2.8','-c:a','aac','-b:a','256k','-shortest','-movflags','+faststart',C['out']])
print('mux',r.returncode)
