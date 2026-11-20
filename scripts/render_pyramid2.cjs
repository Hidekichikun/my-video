// Render every narration midpoint, chapter titles, transitions and the full movie.
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { bundle } = require("@remotion/bundler");
const { enableTailwind } = require("@remotion/tailwind-v4");
const {
  selectComposition,
  getCompositions,
  renderStill,
  renderMedia,
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
const { GUIDE_WINDOWS } = require("../src/Pyramid2/data/guide-cues.ts");
const {
  SCENES,
  illustrationPath,
  sceneFor,
} = require("../src/Pyramid2/data/scenes.ts");
const { speechEnergy } = require("../src/Pyramid2/data/speech-energy.ts");
const root = path.resolve(__dirname, "..");
const pop = process.argv.includes("--pop");
const qa = path.join(
  root,
  pop ? "out/pyramid2-pop-check" : "out/pyramid2-check",
);
async function main() {
  fs.mkdirSync(qa, { recursive: true });
  const lines = TIMELINE.chapters.flatMap((c) => c.lines);
  if (lines.length !== 143 || lines.some((l) => !l.hasAudio))
    throw new Error("Expected 143 measured audio clips");
  for (const line of lines) {
    if (!fs.existsSync(path.join(root, "public", line.audio)))
      throw new Error(`Missing audio ${line.id}`);
    if (!speechEnergy[line.id]?.length)
      throw new Error(`Missing mouth energy ${line.id}`);
    sceneFor(line.id.slice(0, 2), Number(line.id.slice(3)));
  }
  for (const s of Object.values(SCENES).flat())
    if (
      s.file &&
      !fs.existsSync(path.join(root, "public", illustrationPath(s.file)))
    )
      throw new Error(`Missing image ${s.file}`);
  let cursor = 0;
  for (const cue of GUIDE_WINDOWS) {
    if (cue.from !== cursor) throw new Error(`Guide gap at ${cursor}`);
    cursor = cue.end;
  }
  if (cursor !== TIMELINE.totalFrames)
    throw new Error("Incomplete guide coverage");
  fs.writeFileSync(
    path.join(qa, "timeline.json"),
    JSON.stringify(
      { fps: 30, ...TIMELINE, guideWindows: GUIDE_WINDOWS },
      null,
      2,
    ),
  );
  console.log(
    `Validated ${lines.length} clips, ${TIMELINE.totalFrames} frames (${(TIMELINE.totalFrames / 30).toFixed(3)}s), continuous guide`,
  );
  let publicDir = path.join(root, "public");
  if (pop) {
    publicDir = path.join(root, "tmp/pyramid2-pop-public");
    const assets = new Set(lines.map((l) => l.audio));
    for (const scene of Object.values(SCENES).flat())
      if (scene.file) assets.add(illustrationPath(scene.file));
    for (const pose of ["neutral", "point", "wonder", "talk", "blink"])
      assets.add(`photo/pyramid-guide/${pose}.png`);
    assets.add("music/pyramid/find-you-again-inst.mp3");
    for (const asset of assets) {
      const dest = path.join(publicDir, asset),
        source = path.join(root, "public", asset);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      if (
        !fs.existsSync(dest) ||
        fs.statSync(dest).size !== fs.statSync(source).size
      )
        fs.copyFileSync(source, dest);
    }
    console.log(`Prepared ${assets.size} required media assets`);
  }
  const serveUrl = await bundle({
    publicDir,
    entryPoint: path.join(root, "src/Pyramid2Full/render-entry.tsx"),
    outDir: path.join(
      root,
      pop ? "tmp/pyramid2-pop-bundle" : "tmp/pyramid2-bundle",
    ),
    webpackOverride: enableTailwind,
  });
  const browser = await openBrowser("chrome");
  try {
    const compositions = await getCompositions(serveUrl, {
      puppeteerInstance: browser,
      timeoutInMilliseconds: 120000,
    });
    fs.writeFileSync(
      path.join(qa, "compositions.json"),
      JSON.stringify(
        compositions.map((c) => ({
          id: c.id,
          fps: c.fps,
          width: c.width,
          height: c.height,
          durationInFrames: c.durationInFrames,
        })),
        null,
        2,
      ),
    );
    const composition = await selectComposition({
      serveUrl,
      id: "Pyramid2Full",
      puppeteerInstance: browser,
      timeoutInMilliseconds: 120000,
    });
    if (!process.argv.includes("--render-only")) {
      const only = process.argv
        .find((a) => a.startsWith("--checks="))
        ?.slice(9)
        .split(",");
      const checks = [];
      const audits = [];
      const previousChecks =
        only && fs.existsSync(path.join(qa, "frames.json"))
          ? JSON.parse(fs.readFileSync(path.join(qa, "frames.json"), "utf8"))
          : [];
      const previousAudits =
        only && fs.existsSync(path.join(qa, "layout-audits.json"))
          ? JSON.parse(
              fs.readFileSync(path.join(qa, "layout-audits.json"), "utf8"),
            )
          : [];
      const onBrowserLog = (log) => {
        const marker = "PYRAMID2_AUDIT ";
        if (log.text?.startsWith(marker))
          audits.push(JSON.parse(log.text.slice(marker.length)));
      };
      for (const line of lines.filter((l) => !only || only.includes(l.id))) {
        const frame = line.from + Math.floor(line.durationInFrames / 2);
        const file = `${line.id}.png`;
        await renderStill({
          serveUrl,
          composition: {
            ...composition,
            props: { ...composition.props, audit: true },
          },
          frame,
          inputProps: { audit: true },
          onBrowserLog,
          output: path.join(qa, file),
          puppeteerInstance: browser,
          imageFormat: "png",
          timeoutInMilliseconds: 120000,
        });
        checks.push({ line: line.id, file, frame, subtitle: line.subtitle });
        console.log(`Checked ${line.id}`);
      }
      const extras = TIMELINE.chapters
        .filter((c) => c.titleFrames)
        .map((c) => ({ file: `${c.id}-title.png`, frame: c.from + 35 }));
      extras.push(
        { file: "credits.png", frame: TIMELINE.creditsFrom + 75 },
        { file: "blink.png", frame: 96 },
        {
          file: "mouth-closed.png",
          frame: lines[2].from + lines[2].durationInFrames + 10,
        },
      );
      for (const id of ["06-15", "08-11"]) {
        const line = lines.find((l) => l.id === id);
        extras.push({ file: `${id}-crossfade.png`, frame: line.from + 30 });
      }
      if (pop && only)
        for (const line of lines.filter((l) => only.includes(l.id)))
          extras.push({
            file: `${line.id}-pop-peak.png`,
            frame: line.from + 6,
          });
      for (const check of extras) {
        await renderStill({
          serveUrl,
          composition: {
            ...composition,
            props: { ...composition.props, audit: true },
          },
          frame: check.frame,
          inputProps: { audit: true },
          onBrowserLog,
          output: path.join(qa, check.file),
          puppeteerInstance: browser,
          imageFormat: "png",
          timeoutInMilliseconds: 120000,
        });
        checks.push(check);
      }
      fs.writeFileSync(
        path.join(qa, "frames.json"),
        JSON.stringify(
          [
            ...new Map(
              [...previousChecks, ...checks].map((c) => [c.file, c]),
            ).values(),
          ],
          null,
          2,
        ),
      );
      fs.writeFileSync(
        path.join(qa, "layout-audits.json"),
        JSON.stringify(
          [
            ...new Map(
              [...previousAudits, ...audits].map((a) => [a.frame, a]),
            ).values(),
          ],
          null,
          2,
        ),
      );
      const issues = audits.filter((a) => a.issues.length);
      console.log(
        `Layout audit: ${audits.length} frames, ${issues.length} with issues`,
      );
      if (issues.length)
        console.log(
          JSON.stringify(
            issues.map((a) => ({ line: a.line, issues: a.issues })),
            null,
            2,
          ),
        );
      if (audits.length < checks.length)
        throw new Error("Some layout audit results are missing");
      if (issues.length)
        throw new Error("Fix layout audit issues before rendering video");
    }
    if (process.argv.includes("--qa-only")) return;
    const preview = process.argv.includes("--preview");
    let lastLog = 0;
    await renderMedia({
      serveUrl,
      composition,
      puppeteerInstance: browser,
      codec: "h264",
      crf: 18,
      imageFormat: "jpeg",
      jpegQuality: 95,
      concurrency: 6,
      ...(preview ? { frameRange: [0, 1349] } : {}),
      outputLocation: path.join(
        root,
        pop
          ? preview
            ? "out/pyramid2-preview-pop.mp4"
            : "out/pyramid2-full-pop.mp4"
          : preview
            ? "out/pyramid2-preview.mp4"
            : "out/pyramid2-full.mp4",
      ),
      timeoutInMilliseconds: 120000,
      onProgress: ({ progress }) => {
        if (Date.now() - lastLog > 25000) {
          console.log(`Rendering ${Math.round(progress * 100)}%`);
          lastLog = Date.now();
        }
      },
    });
    console.log(
      preview
        ? `Saved out/pyramid2-preview${pop ? "-pop" : ""}.mp4`
        : `Saved out/pyramid2-full${pop ? "-pop" : ""}.mp4`,
    );
  } finally {
    await browser.close({ silent: true });
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
