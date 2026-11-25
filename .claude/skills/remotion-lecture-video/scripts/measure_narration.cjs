// 行ID付きの字幕TSV（番号／行ID／読み／字幕）と、行ごとのWAVから narration.ts を作る。
//
//   node measure_narration.cjs --tsv src/Foo/voicevox/readings_with_ids.tsv \
//        --audio-dir public/audio/foo --audio-url audio/foo --out src/Foo/data/narration.ts
//
// 字幕は TSV の「字幕」列（音声に合っているのは読みと字幕の列。台本の文とずれることがある）。
// 音声の長さは WAV ヘッダーのバイト数から求める（ffmpeg不要）。

const fs = require("fs");
const path = require("path");

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0 || !process.argv[i + 1]) throw new Error(`--${name} が必要です`);
  return process.argv[i + 1];
};
const TSV = path.resolve(arg("tsv"));
const AUDIO_DIR = path.resolve(arg("audio-dir"));
const AUDIO_URL = arg("audio-url").replace(/\/$/, "");
const OUT = path.resolve(arg("out"));

const wavSeconds = (file) => {
  const buf = fs.readFileSync(file);
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE")
    throw new Error(`WAVではありません: ${file}`);
  let byteRate = null;
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString("ascii", offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    if (id === "fmt ") byteRate = buf.readUInt32LE(offset + 16);
    if (id === "data") return Math.min(size, buf.length - offset - 8) / byteRate;
    offset += 8 + size + (size % 2);
  }
  throw new Error(`dataチャンクがありません: ${file}`);
};

const rows = fs
  .readFileSync(TSV, "utf8")
  .replace(/^﻿/, "")
  .split(/\r?\n/)
  .filter((l) => l.trim())
  .slice(1)
  .map((l) => l.split("\t"));

const lines = [];
const missing = [];
let total = 0;
for (const [, id, , subtitle] of rows) {
  const file = path.join(AUDIO_DIR, `${id}.wav`);
  if (!fs.existsSync(file)) {
    missing.push(id);
    continue;
  }
  const sec = Math.round(wavSeconds(file) * 1000) / 1000;
  total += sec;
  lines.push({ id, chapter: id.slice(0, 2), subtitle, audio: `${AUDIO_URL}/${id}.wav`, sec });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  "// このファイルは measure_narration.cjs が自動生成する。直接編集しない。\n" +
    "// 字幕は TSV の「字幕」列、sec は音声の長さ（秒）。\n" +
    "export type NarrationLine = {\n  id: string;\n  chapter: string;\n  subtitle: string;\n  audio: string;\n  sec: number;\n};\n" +
    `export const NARRATION: NarrationLine[] = ${JSON.stringify(lines, null, 2)};\n`,
  "utf8",
);
console.log(`${lines.length}行 / 声の合計 ${Math.floor(total / 60)}分${(total % 60).toFixed(1)}秒`);
if (missing.length) {
  console.log(`音声が無い行 ${missing.length}件: ${missing.join(", ")}`);
  process.exitCode = 1;
}
