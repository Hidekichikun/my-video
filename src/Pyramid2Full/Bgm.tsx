import React from "react";
import { Audio, interpolate, Sequence, staticFile } from "remotion";
import { FPS, TIMELINE } from "../Pyramid2/data/timeline";

/** 別の曲へ差し替える場合は、音源と使える区間をここで指定する。 */
export const BGM_SOURCE = "music/pyramid/find-you-again-inst.mp3";
export const BGM_SETTINGS = {
  restartSec: 38,
  usableEndSec: 210,
  crossfade: 60,
  ducked: 0.15,
  open: 0.27,
  endFade: 60,
  ramp: 10,
};
const SPEECH = TIMELINE.chapters
  .flatMap((c) => c.lines)
  .map((l) => [l.from, l.from + l.durationInFrames] as const);
const duckAt = (f: number) => {
  let near = Infinity;
  for (const [a, b] of SPEECH) {
    if (f >= a && f <= b) return BGM_SETTINGS.ducked;
    near = Math.min(near, Math.abs(f - a), Math.abs(f - b));
  }
  return interpolate(
    near,
    [0, BGM_SETTINGS.ramp],
    [BGM_SETTINGS.ducked, BGM_SETTINGS.open],
    { extrapolateRight: "clamp" },
  );
};
/** 章タイトルの無音75f内で60fクロスフェード。元音源の215秒付近の無音は使わない。 */
export const BGM_PARTS: { from: number; to: number; startSec: number }[] = [];
let cursor = 0;
while (cursor < TIMELINE.totalFrames) {
  const startSec = cursor === 0 ? 0 : BGM_SETTINGS.restartSec;
  const limit =
    cursor +
    (BGM_SETTINGS.usableEndSec - startSec) * FPS -
    BGM_SETTINGS.crossfade;
  // TODO(確認): 続編の章の長さに合わせ、接続する章だけ自動選択する。
  const candidates = TIMELINE.chapters
    .map((c) => c.from)
    .filter((f) => f > cursor && f <= limit);
  const to =
    TIMELINE.totalFrames <= limit
      ? TIMELINE.totalFrames
      : candidates[candidates.length - 1];
  if (!to)
    throw new Error(
      "BGMの使用区間より長い章があります。音源区間を確認してください。",
    );
  BGM_PARTS.push({ from: cursor, to, startSec });
  cursor = to;
}
const InstPart: React.FC<{
  from: number;
  to: number;
  startSec: number;
  first: boolean;
  last: boolean;
}> = ({ from, to, startSec, first, last }) => {
  const length = to - from + (last ? 0 : BGM_SETTINGS.crossfade);
  return (
    <Sequence from={from} durationInFrames={length} layout="none">
      <Audio
        src={staticFile(BGM_SOURCE)}
        trimBefore={startSec * FPS}
        volume={(f) => {
          const fadeIn = first
            ? 1
            : interpolate(f, [0, BGM_SETTINGS.crossfade], [0, 1], {
                extrapolateRight: "clamp",
              });
          const fadeOut = interpolate(
            f,
            [
              length - (last ? BGM_SETTINGS.endFade : BGM_SETTINGS.crossfade),
              length,
            ],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return duckAt(from + f) * fadeIn * fadeOut;
        }}
      />
    </Sequence>
  );
};
export const Pyramid2Bgm: React.FC = () => (
  <>
    {BGM_PARTS.map((part, i) => (
      <InstPart
        key={part.from}
        {...part}
        first={i === 0}
        last={i === BGM_PARTS.length - 1}
      />
    ))}
  </>
);
