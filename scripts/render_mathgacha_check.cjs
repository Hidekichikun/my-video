// MathGacha：確認用の静止画（と短いプレビュー動画）を書き出す。使い捨て（out/mathgacha-check/）。
//
// 静止画:  node scripts/render_mathgacha_check.cjs still 00-02@0.5 02-05@0.3 ...
//          行ID@割合（その行の声の長さのうちどこか。0〜1）。@の代わりに +30 でフレームを足せる（00-07+10）
// 動画:    node scripts/render_mathgacha_check.cjs video <開始フレーム> <終了フレーム> <名前> [Composition]
//
// 3Dは WebGL が要るので、書き出しは gl=angle で行う。

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const ts = require("typescript");
const { bundle } = require("@remotion/bundler");
const { enableTailwind } = require("@remotion/tailwind-v4");
const {
  selectComposition,
  renderStill,
  renderMedia,
  openBrowser,
} = require("@remotion/renderer");

require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText,
    filename,
  );
const { ALL_LINES } = require("../src/MathGacha/data/timeline.ts");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "out/mathgacha-check");
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
  const [mode, ...rest] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const serveUrl = await bundle({
    entryPoint: path.join(root, "src/MathGachaFull/render-entry.tsx"),
    outDir: path.join(os.tmpdir(), "mathgacha-check-bundle"),
    webpackOverride: enableTailwind,
  });
  const browser = await openBrowser("chrome", { chromiumOptions: CHROMIUM });
  try {
    if (mode === "still") {
      const composition = await selectComposition({
        serveUrl,
        id: "MathGachaFull",
        puppeteerInstance: browser,
        chromiumOptions: CHROMIUM,
        timeoutInMilliseconds: 120000,
      });
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
      const [from, to, name, id = "MathGachaFull"] = rest;
      const composition = await selectComposition({
        serveUrl,
        id,
        puppeteerInstance: browser,
        chromiumOptions: CHROMIUM,
        timeoutInMilliseconds: 120000,
      });
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
      console.log(`\nvideo → ${file}`);
    } else {
      console.log("使い方: still <行ID@割合>... | video <from> <to> <名前>");
    }
  } finally {
    await browser.close({ silent: true });
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
