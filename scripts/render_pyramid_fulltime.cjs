const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const {bundle} = require('@remotion/bundler');
const {enableTailwind} = require('@remotion/tailwind-v4');
const {selectComposition, renderStill, renderMedia, openBrowser} = require('@remotion/renderer');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
  }).outputText, filename);
};
const {TIMELINE} = require('../src/Pyramid/data/timeline.ts');
const {GUIDE_WINDOWS} = require('../src/Pyramid/data/guide-cues.ts');
const {speechEnergy} = require('../src/Pyramid/data/speech-energy.ts');
const {ILLUSTRATIONS, ILLUSTRATION_DIR} = require('../src/Pyramid/data/illustrations.ts');

async function main() {
  const root = path.resolve(__dirname, '..');
  const qa = path.join(root, 'out/pyramid-guide-fulltime-check');
  fs.mkdirSync(qa, {recursive: true});
  for (const illustration of ILLUSTRATIONS) {
    const file = path.join(root, 'public', ILLUSTRATION_DIR, illustration.file);
    if (!fs.existsSync(file)) throw new Error(`Missing illustration: ${file}`);
  }
  const serveUrl = await bundle({entryPoint: path.join(root, 'src/PyramidFull/render-entry.tsx'), outDir: path.join(root, 'tmp/pyramid-guide-fulltime-bundle'), webpackOverride: enableTailwind});
  const browser = await openBrowser('chrome');
  try {
  const composition = await selectComposition({serveUrl, id: 'PyramidFull', puppeteerInstance: browser, timeoutInMilliseconds: 120000});
  if (composition.durationInFrames !== TIMELINE.totalFrames) throw new Error('Timeline mismatch');
  const lines = TIMELINE.chapters.flatMap((chapter) => chapter.lines);
  const selected = process.argv.find(arg => arg.startsWith('--checks='))?.slice(9).split(',');
  const checks = selected && fs.existsSync(path.join(qa, 'frames.json')) ? JSON.parse(fs.readFileSync(path.join(qa, 'frames.json'), 'utf8')).checks.filter(item => !selected.includes(item.line)) : [];
  if (!process.argv.includes('--render-only')) {
    for (const cue of GUIDE_WINDOWS.filter(cue => !selected || selected.includes(cue.first))) {
      const line = lines.find((item) => item.id === cue.first);
      let local = 60;
      while (line && local < Math.min(line.durationInFrames - 12, 150) && ((speechEnergy[line.id]?.[local] ?? 0) < 0.2 || local % 7 >= 5)) local++;
      const frame = cue.from + Math.min(local, cue.end - cue.from - 1);
      const file = `${cue.first}-${cue.pose}.png`;
      await renderStill({serveUrl, composition, frame, output: path.join(qa, file), puppeteerInstance: browser, imageFormat: 'png', timeoutInMilliseconds: 120000});
      checks.push({file, line: cue.first, frame});
      console.log(`Checked ${file} at frame ${frame}`);
    }
    const extraLines = process.argv.find(arg => arg.startsWith('--extra-lines='))?.slice(14).split(',') || [];
    for (const id of extraLines) {
      const line = lines.find(item => item.id === id);
      const frame = line.from + Math.min(90, Math.floor(line.durationInFrames / 2));
      const file = `${id}-extra.png`;
      await renderStill({serveUrl, composition, frame, output: path.join(qa, file), puppeteerInstance: browser, imageFormat: 'png', timeoutInMilliseconds: 120000});
      checks.push({file, line: id, frame});
      console.log(`Checked ${file} at frame ${frame}`);
    }
    const cue = GUIDE_WINDOWS[0];
    const frame = 127 - 31;
    await renderStill({serveUrl, composition, frame, output: path.join(qa, 'blink.png'), puppeteerInstance: browser, imageFormat: 'png', timeoutInMilliseconds: 120000});
  }
  if (checks.length) fs.writeFileSync(path.join(qa, 'frames.json'), JSON.stringify({durationInFrames: composition.durationInFrames, fps: composition.fps, checks}, null, 2));
  if (process.argv.includes('--qa-only')) return;
  const range = process.argv.find(arg => arg.startsWith('--range='))?.slice(8).split(',').map(Number);
  let lastLog = 0;
  await renderMedia({serveUrl, composition, puppeteerInstance: browser, codec: 'h264', crf: 18,
    imageFormat: 'jpeg', jpegQuality: 95, concurrency: 8,
    ...(range ? {frameRange: range} : process.argv.includes('--preview') ? {frameRange: [0, 1199]} : {}),
    outputLocation: path.join(root, process.argv.includes('--preview') ? 'out/pyramid-guide-fulltime-preview.mp4' : 'out/pyramid-guide-fulltime.mp4'), timeoutInMilliseconds: 120000,
    onProgress: ({progress}) => {
      if (Date.now() - lastLog > 30000) { console.log(`Rendering ${Math.round(progress * 100)}%`); lastLog = Date.now(); }
    },
  });
  console.log(process.argv.includes('--preview') ? 'Saved out/pyramid-guide-fulltime-preview.mp4' : 'Saved out/pyramid-guide-fulltime.mp4');
  } finally { await browser.close({silent: true}); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
