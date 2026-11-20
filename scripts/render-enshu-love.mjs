import fs from 'node:fs/promises';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {getCompositions, openBrowser, renderMedia, renderStill} from '@remotion/renderer';

const root = process.cwd();
const output = path.join(root, 'output/enshu-love');          // work files: bundle, proofs
const finalDir = path.join(root, 'mv/円周ラブ');                  // finished videos + thumbnail
const requested = process.argv.slice(2);
const proofOnly = requested.includes('--proof');
const proofAll = requested.includes('--proof-all');
const sampleOnly = requested.includes('--sample');
const mainOnly = requested.includes('--main-only');
const extrasOnly = requested.includes('--extras-only');
const publicDir = path.join(output, extrasOnly ? 'render-public-extras' : 'render-public');
await fs.mkdir(path.join(publicDir, 'fonts'), {recursive: true});
await fs.mkdir(finalDir, {recursive: true});
await fs.cp(path.join(root, 'public/enshu-love'), path.join(publicDir, 'enshu-love'), {recursive: true});
await fs.copyFile(path.join(root, 'public/fonts/OtsutomeFont_Ver3_16.ttf'), path.join(publicDir, 'fonts/OtsutomeFont_Ver3_16.ttf'));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/EnshuLove/entry.tsx'), outDir: path.join(output, extrasOnly ? 'bundle-extras' : 'bundle'), publicDir});
const browser = await openBrowser('chrome');
try {
  const compositions = await getCompositions(serveUrl, {puppeteerInstance: browser});
  const full = compositions.find(c => c.id === 'EnshuLove');
  const timeline = JSON.parse(await fs.readFile(path.join(root, 'public/enshu-love/timeline.json'), 'utf8'));
  const previewShots = sampleOnly || extrasOnly ? [] : proofOnly ? timeline.shots.filter(s => s.id === 4 || s.id === 5) : timeline.shots;
  await fs.mkdir(path.join(output, 'proofs'), {recursive: true});
  for (const shot of previewShots) {
    const frame = Math.round((shot.start + Math.min(1, (shot.end-shot.start)/2)) * 30);
    const name = `shot-${String(shot.id).padStart(2, '0')}-${frame}.png`;
    await renderStill({composition: full, serveUrl, puppeteerInstance: browser, frame, output: path.join(output, 'proofs', name), imageFormat: 'png'});
    console.log(`Proof: ${name}`);
  }
  if (!sampleOnly && !extrasOnly && !proofOnly) {
    const equation = timeline.cues.find(c => c.text === '= r²');
    for (const [name, seconds] of [['equation', equation.start+.3], ['last-lyric', timeline.duration-.8], ['ending-equals', timeline.duration+1]]) {
      await renderStill({composition: full, serveUrl, puppeteerInstance: browser, frame: Math.round(seconds*30), output: path.join(output, `proofs/${name}.png`), imageFormat: 'png'});
    }
  }
  if (sampleOnly) {
    const equation = timeline.cues.find(c => c.text === '= r²');
    await renderStill({composition: full, serveUrl, puppeteerInstance: browser, frame: Math.round((equation.start+.3)*30), output: path.join(output, 'proofs/equation.png'), imageFormat: 'png'});
    await renderMedia({composition: full, serveUrl, puppeteerInstance: browser, codec: 'h264', crf: 20, concurrency: 2, frameRange: [1290, 1529], outputLocation: path.join(output, 'chorus-motion-check.mp4')});
    console.log('Chorus motion sample complete.');
  }
  else if (proofOnly || proofAll) process.exitCode = 0;
  else {
    if (!mainOnly) {
      const thumb = compositions.find(c => c.id === 'EnshuLoveThumbnail');
      await renderStill({composition: thumb, serveUrl, puppeteerInstance: browser, output: path.join(finalDir, '円周ラブ_thumbnail.png'), imageFormat: 'png'});
    }
    const suffix = timeline.syncMode === 'lrc' ? '' : '_仮同期';
    const names = {EnshuLove: `円周ラブ_MV${suffix}.mp4`, EnshuLoveShortChorus: `円周ラブ_short_chorus${suffix}.mp4`, EnshuLoveShortBreakdown: `円周ラブ_short_breakdown${suffix}.mp4`, EnshuLoveShortHype: `円周ラブ_short_hype${suffix}.mp4`};
    for (const composition of compositions.filter(c => names[c.id] && (!mainOnly || c.id === 'EnshuLove') && (!extrasOnly || c.id !== 'EnshuLove'))) {
      let last = -1;
      await renderMedia({composition, serveUrl, puppeteerInstance: browser, codec: 'h264', crf: 18, audioCodec: 'aac', concurrency: mainOnly ? 8 : 4, outputLocation: path.join(finalDir, names[composition.id]),
        onProgress: p => {const percent = Math.floor(p.progress*100/10)*10; if (percent !== last) {last=percent; console.log(`${composition.id}: ${percent}%`);}}});
      console.log(`Complete: ${names[composition.id]}`);
    }
  }
} finally {await browser.close({silent: true});}
