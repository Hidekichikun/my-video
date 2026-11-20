const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { bundle } = require("@remotion/bundler");
const { enableTailwind } = require("@remotion/tailwind-v4");
const {
  selectComposition,
  renderStill,
  openBrowser,
} = require("@remotion/renderer");
require.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    filename,
  );
const { TIMELINE } = require("../src/Pyramid2/data/timeline.ts");
const root = path.resolve(__dirname, "..");
const out = path.join(root, "out/pyramid2-pop-sample");
const ids = ["00-03", "00-08", "01-title", "03-04", "03-16", "05-04"];
async function main() {
  fs.mkdirSync(out, { recursive: true });
  const serveUrl = await bundle({
    entryPoint: path.join(root, "src/Pyramid2Full/pop-sample-entry.tsx"),
    outDir: path.join(root, "tmp/pyramid2-pop-sample-bundle"),
    webpackOverride: enableTailwind,
  });
  const browser = await openBrowser("chrome");
  try {
    const composition = await selectComposition({
      serveUrl,
      id: "Pyramid2PopSamples",
      puppeteerInstance: browser,
      timeoutInMilliseconds: 120000,
    });
    const layouts = [],
      styles = [],
      checks = [];
    const onBrowserLog = (log) => {
      if (log.text.startsWith("PYRAMID2_AUDIT "))
        layouts.push(JSON.parse(log.text.slice("PYRAMID2_AUDIT ".length)));
      if (log.text.startsWith("POP_STYLE_AUDIT "))
        styles.push(JSON.parse(log.text.slice("POP_STYLE_AUDIT ".length)));
    };
    for (const id of ids) {
      const line = TIMELINE.chapters
        .flatMap((c) => c.lines)
        .find((l) => l.id === id);
      const frame =
        id === "01-title"
          ? TIMELINE.chapters[1].from + 35
          : id === "00-08"
            ? line.from + 8
            : line.from + Math.floor(line.durationInFrames / 2);
      await renderStill({
        serveUrl,
        composition: { ...composition, props: { sample: id, audit: true } },
        inputProps: { sample: id, audit: true },
        frame,
        output: path.join(out, id + ".png"),
        puppeteerInstance: browser,
        onBrowserLog,
        imageFormat: "png",
        timeoutInMilliseconds: 120000,
      });
      const audit = layouts.find((a) => a.frame === frame),
        style = styles.find((a) => a.frame === frame);
      if (!audit || !style) throw new Error("Missing sample audit: " + id);
      checks.push({
        id,
        frame,
        subtitle: line?.subtitle,
        layout: audit,
        style,
      });
      console.log(
        `Rendered ${id} at ${frame}: ${audit.issues.length} layout issues`,
      );
    }
    fs.writeFileSync(
      path.join(out, "checks.json"),
      JSON.stringify(checks, null, 2),
    );
    const problems = checks.filter(
      (c) =>
        c.layout.issues.length ||
        c.style.subtitleRows > 2 ||
        c.style.highlightCount > 1 ||
        !c.style.headingReady ||
        !c.style.bodyReady ||
        c.style.serifElements,
    );
    if (problems.length) throw new Error(JSON.stringify(problems, null, 2));
    console.log(
      "All 6 samples: subtitles unchanged; fonts loaded; <=2 subtitle rows; <=1 highlighted term; no layout issues.",
    );
  } finally {
    await browser.close({ silent: true });
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
