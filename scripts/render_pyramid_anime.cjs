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
const {ILLUSTRATIONS, ILLUSTRATION_DIR} = require('../src/Pyramid/data/illustrations.ts');

async function main() {
  const root = path.resolve(__dirname, '..');
  const qa = path.join(root, 'out/pyramid-anime-check');
  fs.mkdirSync(qa, {recursive: true});
  for (const illustration of ILLUSTRATIONS) {
    const file = path.join(root, 'public', ILLUSTRATION_DIR, illustration.file);
    if (!fs.existsSync(file)) throw new Error(`Missing illustration: ${file}`);
  }
  const serveUrl = await bundle({entryPoint: path.join(root, 'src/PyramidFull/render-entry.tsx'), outDir: path.join(root, 'tmp/pyramid-anime-bundle'), webpackOverride: enableTailwind});
  const browser = await openBrowser('chrome');
  try {
  const composition = await selectComposition({serveUrl, id: 'PyramidFull', puppeteerInstance: browser, timeoutInMilliseconds: 120000});
  if (composition.durationInFrames !== TIMELINE.totalFrames) throw new Error('Timeline mismatch');
  const lines = TIMELINE.chapters.flatMap((chapter) => chapter.lines);
  const selected = process.argv.find((arg) => arg.startsWith('--checks='))?.slice(9).split(',');
  const overrides = {'05-workers-town.png': '05-04', '05-merer-papyrus.png': '05-09', '08-valley-kings.png': '08-10'};
  const checkList = process.argv.includes('--render-only') ? [] : ILLUSTRATIONS.filter((item) => !selected || selected.includes(item.file));
  const checks = selected && fs.existsSync(path.join(qa, 'frames.json')) ? JSON.parse(fs.readFileSync(path.join(qa, 'frames.json'), 'utf8')).checks.filter((item) => !selected.includes(item.file)) : [];
  for (const illustration of checkList) {
    const id = overrides[illustration.file] || illustration.lines.match(/\d{2}-\d{2}/)[0];
    const line = lines.find((item) => item.id === id);
    const frame = line.from + Math.min(90, Math.floor(line.durationInFrames / 2));
    const output = path.join(qa, illustration.file);
    await renderStill({serveUrl, composition, frame, output, puppeteerInstance: browser, imageFormat: 'png', timeoutInMilliseconds: 120000});
    checks.push({file: illustration.file, line: id, frame});
    console.log(`Checked ${illustration.file} at frame ${frame}`);
  }
  if (checks.length) fs.writeFileSync(path.join(qa, 'frames.json'), JSON.stringify({durationInFrames: composition.durationInFrames, fps: composition.fps, checks}, null, 2));
  if (process.argv.includes('--qa-only')) return;
  let lastLog = 0;
  await renderMedia({serveUrl, composition, puppeteerInstance: browser, codec: 'h264', crf: 18,
    imageFormat: 'jpeg', jpegQuality: 95, concurrency: 8,
    outputLocation: path.join(root, 'out/pyramid-anime.mp4'), timeoutInMilliseconds: 120000,
    onProgress: ({progress}) => {
      if (Date.now() - lastLog > 30000) { console.log(`Rendering ${Math.round(progress * 100)}%`); lastLog = Date.now(); }
    },
  });
  console.log('Saved out/pyramid-anime.mp4');
  } finally { await browser.close({silent: true}); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
