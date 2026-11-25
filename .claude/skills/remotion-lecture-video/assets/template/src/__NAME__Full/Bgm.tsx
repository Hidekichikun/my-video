import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { ALL_LINES, FPS, TIMELINE } from "../__NAME__/data/timeline";

/**
 * BGM：曲を順に回し、ナレーション中は音量を下げる。
 * sec・gain は scripts/measure_bgm.py で測った値を入れる（mp3の申告尺は当てにならない）。
 * file は public/ からの相対パス。
 */
type Track = { file: string; sec: number; gain: number };
export const PLAYLIST: Track[] = [
  // { file: "music/__SLUG__/loop1.mp3", sec: 94.6, gain: 0.35 },
];

export const BGM_SETTINGS = {
  /** ナレーション中／行の間の音量（ピラミッド・MathGacha で調整した値。曲ごとの gain をかける） */
  ducked: 0.15,
  open: 0.27,
  ramp: 10,
  crossfade: 90,
  endFade: 60,
};

const SPEECH = ALL_LINES.map((l) => [l.from, l.from + l.durationInFrames] as const);
const duckAt = (f: number) => {
  let near = Infinity;
  for (const [a, b] of SPEECH) {
    if (f >= a && f <= b) return BGM_SETTINGS.ducked;
    near = Math.min(near, Math.abs(f - a), Math.abs(f - b));
  }
  return interpolate(near, [0, BGM_SETTINGS.ramp], [BGM_SETTINGS.ducked, BGM_SETTINGS.open], {
    extrapolateRight: "clamp",
  });
};

/** 特別な曲（オチなど）を鳴らす間だけ本編BGMを止めたいときは、ここに [from, to] を入れる */
export const QUIET_RANGES: [number, number][] = [];
const quietAt = (f: number) => {
  let v = 1;
  for (const [a, b] of QUIET_RANGES)
    v = Math.min(
      v,
      interpolate(f, [a - 20, a, b, b + 30], [1, 0, 0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
  return v;
};

const PARTS: { from: number; length: number; track: Track; first: boolean; last: boolean }[] = [];
if (PLAYLIST.length) {
  let cursor = 0;
  let i = 0;
  const total = TIMELINE.totalFrames;
  while (cursor < total) {
    const track = PLAYLIST[i % PLAYLIST.length];
    const natural = Math.round(track.sec * FPS);
    const last = cursor + natural >= total;
    PARTS.push({ from: cursor, length: last ? total - cursor : natural, track, first: i === 0, last });
    cursor += natural - BGM_SETTINGS.crossfade;
    i++;
  }
}

const Part: React.FC<(typeof PARTS)[number]> = ({ from, length, track, first, last }) => (
  <Sequence from={from} durationInFrames={length} layout="none">
    <Audio
      src={staticFile(track.file)}
      volume={(f) => {
        const fadeIn = first
          ? 1
          : interpolate(f, [0, BGM_SETTINGS.crossfade], [0, 1], { extrapolateRight: "clamp" });
        const fadeOut = interpolate(
          f,
          [length - (last ? BGM_SETTINGS.endFade : BGM_SETTINGS.crossfade), length],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return duckAt(from + f) * quietAt(from + f) * track.gain * fadeIn * fadeOut;
      }}
    />
  </Sequence>
);

export const __NAME__Bgm: React.FC = () => (
  <>
    {PARTS.map((p) => (
      <Part key={p.from} {...p} />
    ))}
  </>
);
