// 確認用の静止画・短い動画・音声、および本編の書き出し（Remotion Node API）。3Dは gl=angle で描く。
//
//   共通の引数:  --entry src/FooFull/render-entry.tsx  --comp FooFull  --timeline src/Foo/data/timeline.ts  --out out/foo-check
//   静止画:      node render_check.cjs still <共通> 00-02@0.5 03-10+30 ...
//                （行ID@割合＝その行の声の長さのどこか／行ID+N＝行の頭からNフレーム目）
//   動画:        node render_check.cjs video <共通> <開始フレーム> <終了フレーム> <名前>
//   音声だけ:    node render_check.cjs audio <共通> <開始フレーム> <終了フレーム> <名前>
//
// 確認用は使い捨て（out/…-check/）。本編は video 0 <最終フレーム> を実行し、完成したら mv/<作品>/ へ移す。

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const ts = require("typescript");
const { bundle } = require("@remotion/bundler");
const { enableTailwind } = require("@remotion/tailwind-v4");
const { selectComposition, renderStill, renderMedia, openBrowser } = require("@remotion/renderer");

const argv = process.argv.slice(2);
const mode = argv.shift();
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  if (i < 0) {
    if (def === undefined) throw new Error(`--${name} が必要です`);
    return def;
  }
  return argv.splice(i, 2)[1];
};
const ENTRY = opt("entry");
const COMP = opt("comp");
const TIMELINE = opt("timeline");
const OUT = opt("out", "out/check");
const rest = argv;

require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText,
    filename,
  );
const root = process.cwd();
const { ALL_LINES } = require(path.resolve(root, TIMELINE));
const out = path.resolve(root, OUT);
const CHROMIUM = { gl: "angle" };

const resolveFrame = (spec) => {
  const m = spec.match(/^(\d\d-\d\d)(?:@([\d.]+)|\+(\d+))?$/);
  if (!m) throw new Error(`指定が読めません: ${spec}`);
  const line = ALL_LINES.find((l) => l.id === m[1]);
  if (!line) throw new Error(`行がありません: ${m[1]}`);
  if (m[3] !== undefined) return line.from + Number(m[3]);
  return line.from + Math.floor(line.durationInFrames * Number(m[2] ?? 0.5));
};

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const serveUrl = await bundle({
    entryPoint: path.resolve(root, ENTRY),
    outDir: path.join(os.tmpdir(), `${COMP}-check-bundle`),
    webpackOverride: enableTailwind,
  });
  const browser = await openBrowser("chrome", { chromiumOptions: CHROMIUM });
  try {
    const composition = await selectComposition({
      serveUrl,
      id: COMP,
      puppeteerInstance: browser,
      chromiumOptions: CHROMIUM,
      timeoutInMilliseconds: 120000,
    });
    if (mode === "still") {
      for (const spec of rest) {
        const frame = resolveFrame(spec);
        const file = path.join(out, `still-${spec.replace(/[@+]/g, "_")}.png`);
        await renderStill({
          serveUrl,
          composition,
          frame,
          output: file,
          imageFormat: "png",
          puppeteerInstance: browser,
          chromiumOptions: CHROMIUM,
          timeoutInMilliseconds: 120000,
        });
        console.log(`still ${spec} → frame ${frame} → ${file}`);
      }
    } else if (mode === "video" || mode === "audio") {
      const [from, to, name] = rest;
      const file = path.join(out, `${name}.${mode === "audio" ? "mp3" : "mp4"}`);
      await renderMedia({
        serveUrl,
        composition,
        codec: mode === "audio" ? "mp3" : "h264",
        outputLocation: file,
        frameRange: [Number(from), Number(to)],
        puppeteerInstance: browser,
        chromiumOptions: CHROMIUM,
        timeoutInMilliseconds: 120000,
        onProgress: ({ renderedFrames }) => {
          if (renderedFrames % 60 === 0) process.stdout.write(`\r${renderedFrames} frames`);
        },
      });
      console.log(`\n${mode} → ${file}`);
    } else {
      console.log("使い方: still <行ID@割合>... | video|audio <from> <to> <名前>（共通: --entry --comp --timeline --out）");
    }
  } finally {
    await browser.close({ silent: true });
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
