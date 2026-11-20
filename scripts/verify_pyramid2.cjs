const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ts = require('typescript');
const assert = require('node:assert/strict');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText, filename);
const root = path.resolve(__dirname, '..');
const pop = process.argv.includes('--pop');
const fix2 = process.argv.includes('--fix2');
const fix1 = process.argv.includes('--fix1') || fix2;
const qa = path.join(root, pop ? 'out/pyramid2-pop-check' : 'out/pyramid2-check');
const originalQa = path.join(root, 'out/pyramid2-check');
const {TIMELINE,FPS,LINE_GAP_FRAMES,CHAPTER_TAIL_FRAMES,CHAPTER_TITLE_FRAMES,CREDITS_FRAMES} = require('../src/Pyramid2/data/timeline.ts');
const {narration} = require('../src/Pyramid2/data/narration.ts');
const {speechEnergy} = require('../src/Pyramid2/data/speech-energy.ts');
const {GUIDE_WINDOWS} = require('../src/Pyramid2/data/guide-cues.ts');
const {BGM_PARTS,BGM_SETTINGS} = require('../src/Pyramid2Full/Bgm.tsx');
const {SCENES,illustrationPath} = require('../src/Pyramid2/data/scenes.ts');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
const readJson = file => JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const originalLines = narration.chapters.flatMap(c=>c.lines);
const lines = TIMELINE.chapters.flatMap(c=>c.lines);
assert.equal(lines.length,143);
assert.equal(TIMELINE.chapters.length,9);
assert.deepEqual(lines.map(l=>l.subtitle),originalLines.map(l=>l.subtitle));
let cursor=0, voiceSec=0;
for (const chapter of TIMELINE.chapters){
  assert.equal(chapter.from,cursor);
  assert.equal(chapter.titleFrames,chapter.id==='00'?0:CHAPTER_TITLE_FRAMES);
  cursor+=chapter.titleFrames;
  for(const line of chapter.lines){
    assert(line.hasAudio);
    assert.equal(line.from,cursor);
    const buf=fs.readFileSync(path.join(root,'public',line.audio));
    let offset=12,byteRate,bytes;
    while(offset+8<=buf.length){
      const id=buf.toString('ascii',offset,offset+4),size=buf.readUInt32LE(offset+4);
      if(id==='fmt '){assert.equal(buf.readUInt16LE(offset+8),1);assert([1,2].includes(buf.readUInt16LE(offset+10)));assert.equal(buf.readUInt32LE(offset+12),24000);assert.equal(buf.readUInt16LE(offset+22),16);byteRate=buf.readUInt32LE(offset+16);}
      if(id==='data')bytes=Math.min(size,buf.length-offset-8);
      offset+=8+size+(size%2);
    }
    assert(byteRate&&bytes);
    const duration=bytes/byteRate;voiceSec+=duration;
    assert.equal(line.durationInFrames,Math.ceil(Math.round(duration*1000)/1000*FPS));
    assert(speechEnergy[line.id].some(v=>v>0.13),`Silent clip ${line.id}`);
    cursor+=line.durationInFrames+LINE_GAP_FRAMES;
  }
  cursor+=CHAPTER_TAIL_FRAMES;
  assert.equal(cursor,chapter.from+chapter.durationInFrames);
  for(let n=1;n<=chapter.lines.length;n++)assert.equal(SCENES[chapter.id].filter(s=>n>=s.from&&n<=s.to).length,1);
}
assert.equal(cursor,TIMELINE.creditsFrom);
assert.equal(cursor+CREDITS_FRAMES,TIMELINE.totalFrames);
cursor=0;
for(const cue of GUIDE_WINDOWS){assert.equal(cue.from,cursor);assert(cue.end>cue.from);assert(cue.top>=0&&cue.top+cue.width*1.5<=750);cursor=cue.end;}
assert.equal(cursor,TIMELINE.totalFrames);
cursor=0;
for(const [i,part] of BGM_PARTS.entries()){
  assert.equal(part.from,cursor);
  assert(part.startSec+(part.to-part.from+(i===BGM_PARTS.length-1?0:BGM_SETTINGS.crossfade))/FPS<=BGM_SETTINGS.usableEndSec);
  if(part.from>0)assert(TIMELINE.chapters.some(c=>c.from===part.from));
  cursor=part.to;
}
assert.equal(cursor,TIMELINE.totalFrames);
for(const scene of Object.values(SCENES).flat())if(scene.file)assert(fs.existsSync(path.join(root,'public',illustrationPath(scene.file))));
if(pop) for(const entry of readJson(path.join(root,fix2 ? 'out/pyramid2-pop-fix2-preserved-hashes.json' : fix1 ? 'out/pyramid2-pop-fix1-preserved-hashes.json' : 'out/pyramid2-pop-preserved-hashes.json')).filter(e=>!fix2 || !/([\\/]data[\\/](durations|speech-energy)\.ts|[\\/]Pyramid2Full[\\/]README\.md)$/.test(e.Path))) assert.equal(hash(entry.Path),entry.Hash,`Protected content modified: ${entry.Path}`);
let previousFiles=0;
for(const entry of (fix1 ? readJson(path.join(root,'out/pyramid2-pop-fix1-preserved-hashes.json')).filter(e=>/[\\/]src[\\/](Pyramid|PyramidFull|PyramidPrevis)[\\/]/.test(e.Path)) : readJson(path.join(originalQa,'previous-files-before.json')))){assert.equal(hash(entry.Path),entry.Hash,`Previous video modified: ${entry.Path}`);previousFiles++;}
for(const entry of (fix1 ? [] : readJson(path.join(originalQa,'source-before.json'))))assert.equal(hash(entry.Path),entry.Hash,`Source modified: ${entry.Path}`);
const rootBefore=fs.readFileSync(path.join(originalQa,'Root-before.tsx.txt'),'utf8').replace(/\r\n/g,'\n');
const rootAfter=fs.readFileSync(path.join(root,'src/Root.tsx'),'utf8').replace(/\r\n/g,'\n')
  .replace(/^import \{ Pyramid2Chapter, Pyramid2Full, PYRAMID2_CHAPTERS, PYRAMID2_FULL_DURATION \} from "\.\/Pyramid2Full";\n/m,'')
  .replace(/      <Composition id="Pyramid2Full"[^\n]*\n      <Folder name="Pyramid2-chapters">[\s\S]*?      <\/Folder>\n\n/,'');
assert.equal(rootAfter,rootBefore,'Root.tsx must contain only the Pyramid2 additions');
let audited=0;
if(!process.argv.includes('--structure-only')&&fs.existsSync(path.join(qa,'layout-audits.json'))){
  const audits=readJson(path.join(qa,'layout-audits.json'));
  for(const line of lines){
    const frame=line.from+Math.floor(line.durationInFrames/2);
    const audit=audits.find(a=>a.frame===frame);
    assert(audit,`Missing DOM audit ${line.id}`);
    assert.equal(audit.line,line.id);assert.equal(audit.subtitle,line.subtitle);assert.deepEqual(audit.issues,[],line.id);if(pop){assert(audit.fontsReady);assert(audit.subtitleRows<=2);if(fix1)assert.equal(audit.subtitleBreaks.join(''),line.subtitle);}audited++;
  }
}
if(fix1){const audits=readJson(path.join(qa,'layout-audits.json'));assert(audits.some(a=>a.credit===true),'Corrected voice credit missing');assert.equal(narration.voice,'VOICEVOX:暁記ミタマ');}
const report={lines:lines.length,chapters:TIMELINE.chapters.length,voiceSec,totalFrames:TIMELINE.totalFrames,totalSec:TIMELINE.totalFrames/FPS,guideWindows:GUIDE_WINDOWS.length,bgmParts:BGM_PARTS,previousFilesUnchanged:previousFiles,domAudits:audited};
fs.writeFileSync(path.join(qa,'verification.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
