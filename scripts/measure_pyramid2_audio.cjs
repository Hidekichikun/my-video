// ナレーション音声（WAV）の長さを測って durations.ts に書き出す。
//
// 使い方（プロジェクトのルートで）:
//   node scripts/measure_pyramid2_audio.cjs
//
// WAVのヘッダーから、データ部分のバイト数 ÷ 1秒あたりのバイト数 で長さを求める。
// ffmpegは使わない。音声が無い行は missing として一覧に出す。

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const NARRATION = path.join(ROOT, "src/Pyramid2/data/narration.ts");
const OUT = path.join(ROOT, "src/Pyramid2/data/durations.ts");

const wavSeconds = (file) => {
  const buf = fs.readFileSync(file);
  if (
    buf.toString("ascii", 0, 4) !== "RIFF" ||
    buf.toString("ascii", 8, 12) !== "WAVE"
  ) {
    throw new Error(`WAVではありません: ${file}`);
  }
  let byteRate = null;
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === "fmt ") byteRate = buf.readUInt32LE(offset + 16);
    if (id === "data") {
      if (!byteRate)
        throw new Error(`fmtチャンクがdataより後にあります: ${file}`);
      const dataSize = Math.min(size, buf.length - offset - 8);
      return dataSize / byteRate;
    }
    offset += 8 + size + (size % 2);
  }
  throw new Error(`dataチャンクがありません: ${file}`);
};

const source = fs.readFileSync(NARRATION, "utf8");
const objectStart = source.indexOf(
  "{",
  source.indexOf("export const narration"),
);
const objectEnd = source.lastIndexOf("}") + 1;
let objectSource = source.slice(objectStart, objectEnd);
// Prettier may remove quotes from TypeScript object's identifier keys.
objectSource = objectSource
  .replace(/^(\s*)([A-Za-z_$][\w$]*):/gm, '$1"$2":')
  .replace(/,\s*([}\]])/g, "$1");
const narration = JSON.parse(objectSource);
const durations = {};
const missing = [];
let total = 0;

for (const chapter of narration.chapters) {
  let chapterTotal = 0;
  for (const line of chapter.lines) {
    const file = path.join(ROOT, "public", line.audio);
    if (!fs.existsSync(file)) {
      missing.push(line.id);
      continue;
    }
    const sec = Math.round(wavSeconds(file) * 1000) / 1000;
    durations[line.id] = sec;
    chapterTotal += sec;
  }
  total += chapterTotal;
  console.log(
    `${chapter.id} ${chapter.title}: ${chapterTotal.toFixed(1)}秒（目安${chapter.targetSec}秒）`,
  );
}

fs.writeFileSync(
  OUT,
  "// このファイルは scripts/measure_pyramid2_audio.cjs が自動生成する。直接編集しない。\n" +
    "// 行ID → 音声の長さ（秒）\n" +
    `export const durations: Record<string, number> = ${JSON.stringify(durations, null, 2)};\n`,
  "utf8",
);
console.log(`音声の合計: ${(total / 60).toFixed(1)}分（行間の間は含まない）`);
if (missing.length) {
  console.log(`音声が無い行 ${missing.length}件: ${missing.join(", ")}`);
  process.exitCode = 1;
}
