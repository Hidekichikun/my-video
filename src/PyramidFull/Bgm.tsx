// BGM：「I'll find you again」の曲のみの版（歌なし）。
// 5分19秒しかないので、章の切れ目で3回に分けてつなぎ、クレジットの終わりで消していく。
// 曲の位置（秒）は、mp3をデコードして測った実際の長さに合わせている。

import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { FPS, TIMELINE } from "../Pyramid/data/timeline";

const INST = "music/pyramid/find-you-again-inst.mp3";

/** 曲のつなぎ目のクロスフェード。章タイトル（75フレーム・声なし）の中に収める */
const XF = 60;
/** ナレーション中の音量と、行の間・章タイトルでの音量 */
const DUCKED = 0.15;
const OPEN = 0.27;
/** 最後に音を消していく長さ */
const END_FADE = 60;
/** 音量を上げ下げする速さ */
const RAMP = 10;

const chapterFrom = (id: string) => {
  const c = TIMELINE.chapters.find((ch) => ch.id === id);
  if (!c) throw new Error(`章${id}がありません`);
  return c.from;
};

const SPEECH = TIMELINE.chapters
  .flatMap((c) => c.lines)
  .map((l) => [l.from, l.from + l.durationInFrames] as const);

/** 全体のフレーム f での、ナレーションに合わせた音量 */
const duckAt = (f: number) => {
  let near = Infinity;
  for (const [a, b] of SPEECH) {
    if (f >= a && f <= b) return DUCKED;
    near = Math.min(near, Math.abs(f - a), Math.abs(f - b));
  }
  return interpolate(near, [0, RAMP], [DUCKED, OPEN], {
    extrapolateRight: "clamp",
  });
};

/** 曲のみの版を流す3つの区間。[動画の開始, 動画の終了, 曲の開始（秒）] */
const INST_PARTS: [number, number, number][] = [
  // 章00〜04：曲の頭から
  [0, chapterFrom("05"), 0],
  // 章05〜07：曲の38秒（静かになる所）から
  [chapterFrom("05"), chapterFrom("08"), 38],
  // 章08〜クレジット：曲の10秒から。215秒の無音の手前で終わる
  [chapterFrom("08"), TIMELINE.totalFrames, 10],
];

const InstPart: React.FC<{
  from: number;
  to: number;
  startSec: number;
  first: boolean;
  last: boolean;
}> = ({ from, to, startSec, first, last }) => {
  // 最後の区間は動画の終わりちょうどで消し切る。それ以外は次の区間と XF だけ重ねる
  const length = last ? to - from : to - from + XF;
  const fadeLength = last ? END_FADE : XF;
  return (
    <Sequence from={from} durationInFrames={length} layout="none">
      <Audio
        src={staticFile(INST)}
        trimBefore={Math.round(startSec * FPS)}
        volume={(f) => {
          const fadeIn = first
            ? 1
            : interpolate(f, [0, XF], [0, 1], { extrapolateRight: "clamp" });
          const fadeOut = interpolate(f, [length - fadeLength, length], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return duckAt(from + f) * fadeIn * fadeOut;
        }}
      />
    </Sequence>
  );
};

export const PyramidBgm: React.FC = () => (
  <>
    {INST_PARTS.map(([from, to, startSec], i) => (
      <InstPart
        key={i}
        from={from}
        to={to}
        startSec={startSec}
        first={i === 0}
        last={i === INST_PARTS.length - 1}
      />
    ))}
  </>
);
