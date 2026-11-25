import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { ALL_LINES, FPS, TIMELINE } from "../MathGacha/data/timeline";
import { startOfLine } from "./lineFrames";

/**
 * 数学用BGM（music/math用/ → public/music/mathgacha/）。
 * 長さ・音量は実測（mp3の申告尺は当てにならない）。
 * gain は前作ピラミッドの曲と同じ聴こえ方になるよう、音の大きさをそろえた係数。
 */
type Track = { file: string; sec: number; gain: number };
export const TRACKS: Record<"loop1" | "loop2" | "simple" | "ochi", Track> = {
  loop1: { file: "music/mathgacha/loop1.mp3", sec: 94.6, gain: 0.347 },
  loop2: { file: "music/mathgacha/loop2.mp3", sec: 73.5, gain: 0.358 },
  simple: { file: "music/mathgacha/simple.mp3", sec: 58.9, gain: 0.385 },
  ochi: { file: "music/mathgacha/ochi.mp3", sec: 16.4, gain: 0.477 },
};
/** 本編で順番に回す曲 */
const PLAYLIST: (keyof typeof TRACKS)[] = ["loop1", "simple", "loop2"];

export const BGM_SETTINGS = {
  /** ナレーション中／行の間の音量（前作で調整した値。曲ごとの gain をかける） */
  ducked: 0.15,
  open: 0.27,
  ramp: 10,
  /** 曲と曲のつなぎ（重ねて溶かす） */
  crossfade: 90,
  endFade: 60,
};

/** 07章のオチ曲：曲のこの秒数（小さな間→ズコー）が、07-05「37%のほうでしたぁ」の頭に来るようにする。
 *  耳で聴いて決めた値ではなく、音量の谷から推定した仮の値。ずれていたら調整する。 */
export const OCHI = {
  dipSec: 7.5,
  playSec: 10.5,
  /** オチ曲の音量（gain をかける前） */
  level: 0.5,
  fadeIn: 8,
  fadeOut: 24,
};
const ochiFrom = Math.max(0, startOfLine("07-05") - Math.round(OCHI.dipSec * FPS) - 6);
const ochiLen = Math.round(OCHI.playSec * FPS);
/** 本編BGMを下げておく範囲（オチ曲の前後） */
const quietFrom = ochiFrom - 20;
const quietTo = ochiFrom + ochiLen + 12;

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
const quietAt = (f: number) =>
  interpolate(f, [quietFrom - 20, quietFrom, quietTo, quietTo + 30], [1, 0, 0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** 曲を順に並べる。曲の終わりのフェードに次の曲の頭を重ねる。 */
export const BGM_PARTS: { from: number; length: number; track: Track; first: boolean; last: boolean }[] = [];
{
  let cursor = 0;
  let i = 0;
  const total = TIMELINE.totalFrames;
  while (cursor < total) {
    const track = TRACKS[PLAYLIST[i % PLAYLIST.length]];
    const natural = Math.round(track.sec * FPS);
    const last = cursor + natural >= total;
    const length = last ? total - cursor : natural;
    BGM_PARTS.push({ from: cursor, length, track, first: i === 0, last });
    cursor += natural - BGM_SETTINGS.crossfade;
    i++;
  }
}

const Part: React.FC<(typeof BGM_PARTS)[number]> = ({ from, length, track, first, last }) => (
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

export const MathGachaBgm: React.FC = () => (
  <>
    {BGM_PARTS.map((part) => (
      <Part key={part.from} {...part} />
    ))}
    {/* 07章：100連のオチ曲 */}
    <Sequence from={ochiFrom} durationInFrames={ochiLen} layout="none">
      <Audio
        src={staticFile(TRACKS.ochi.file)}
        volume={(f) =>
          OCHI.level *
          TRACKS.ochi.gain *
          interpolate(f, [0, OCHI.fadeIn, ochiLen - OCHI.fadeOut, ochiLen], [0, 1, 1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
    </Sequence>
  </>
);
