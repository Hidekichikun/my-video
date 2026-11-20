// 章ファイルで使う道具。行IDで画面を置く場所を決める。

import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { LINE_GAP_FRAMES, type TimedChapter } from "../Pyramid/data/timeline";
import { COLORS, GOTHIC, MINCHO } from "../PyramidPrevis/theme";

export type ChapterProps = { chapter: TimedChapter };

const findLine = (chapter: TimedChapter, id: string) => {
  const line = chapter.lines.find((l) => l.id === id);
  if (!line) throw new Error(`章${chapter.id}に行${id}がありません`);
  return line;
};

/** 行 id が始まるフレーム（章の頭から） */
export const startOf = (chapter: TimedChapter, id: string) =>
  findLine(chapter, id).from - chapter.from;

/**
 * 行 fromId の始まりから行 toId の終わり（行間を含む）までの範囲（章の頭から）。
 * toId が章の最後の行なら、章の終わりの余白まで含める。
 */
export const span = (chapter: TimedChapter, fromId: string, toId = fromId) => {
  const a = findLine(chapter, fromId);
  const b = findLine(chapter, toId);
  const from = a.from - chapter.from;
  const isLast = chapter.lines[chapter.lines.length - 1].id === toId;
  const end = isLast
    ? chapter.durationInFrames
    : b.from - chapter.from + b.durationInFrames + LINE_GAP_FRAMES;
  return { from, durationInFrames: end - from };
};

/** 行 from〜to の間だけ中身を出す。中身のフレームは from の行の頭から0で始まる */
export const Seg: React.FC<{
  chapter: TimedChapter;
  from: string;
  to?: string;
  children: React.ReactNode;
}> = ({ chapter, from, to, children }) => (
  <Sequence {...span(chapter, from, to ?? from)} layout="none">
    <AbsoluteFill>{children}</AbsoluteFill>
  </Sequence>
);

/** Seg の中で、行 line が始まったら中身を出す */
export const AtLine: React.FC<{
  chapter: TimedChapter;
  seg: string;
  line: string;
  children: React.ReactNode;
}> = ({ chapter, seg, line, children }) => (
  <Sequence from={startOf(chapter, line) - startOf(chapter, seg)} layout="none">
    <AbsoluteFill>{children}</AbsoluteFill>
  </Sequence>
);

/** Seg の中で、今どの行を読んでいるか（seg の頭から数えたフレームを使う） */
export const useLineIn = (chapter: TimedChapter, seg: string) => {
  const frame = useCurrentFrame() + startOf(chapter, seg);
  let current = chapter.lines[0].id;
  for (const line of chapter.lines) {
    if (line.from - chapter.from <= frame) current = line.id;
  }
  return current;
};

/** 画面の上の方に出す見出し・注記 */
export const Caption: React.FC<{
  text: string;
  x?: number;
  y?: number;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  width?: number;
  mincho?: boolean;
  delay?: number;
}> = ({
  text,
  x = 960,
  y = 140,
  size = 56,
  color = COLORS.limestone,
  align = "center",
  width = 1400,
  mincho = false,
  delay = 0,
}) => {
  const f = useCurrentFrame() - delay;
  const o = Math.max(0, Math.min(1, f / 12));
  const left =
    align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: y,
        width,
        textAlign: align,
        fontFamily: mincho ? MINCHO : GOTHIC,
        fontWeight: mincho ? 800 : 700,
        fontSize: size,
        color,
        opacity: o,
        textShadow: "0 2px 10px rgba(0,0,0,0.55)",
      }}
    >
      {text}
    </div>
  );
};

/** 画面の一部を小窓で見せる（地図など）。中身は1920×1080で描かれたものを縮めて置く */
export const Inset: React.FC<{
  x: number;
  y: number;
  scale: number;
  children: React.ReactNode;
}> = ({ x, y, scale, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 1920 * scale,
      height: 1080 * scale,
      overflow: "hidden",
      border: `4px solid ${COLORS.limestone}`,
      borderRadius: 12,
    }}
  >
    <div
      style={{
        width: 1920,
        height: 1080,
        transform: `scale(${scale})`,
        transformOrigin: "0 0",
        position: "relative",
      }}
    >
      {children}
    </div>
  </div>
);

/** 左右2分割 */
export const Split: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  leftLabel?: string;
  rightLabel?: string;
}> = ({ left, right, leftLabel, rightLabel }) => (
  <AbsoluteFill style={{ background: COLORS.night }}>
    <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>{left}</AbsoluteFill>
    <AbsoluteFill style={{ clipPath: "inset(0 0 0 50%)" }}>
      {right}
    </AbsoluteFill>
    <div
      style={{
        position: "absolute",
        left: 958,
        top: 0,
        bottom: 0,
        width: 4,
        background: COLORS.gold,
      }}
    />
    {leftLabel ? (
      <Caption text={leftLabel} x={480} y={110} width={900} size={60} />
    ) : null}
    {rightLabel ? (
      <Caption text={rightLabel} x={1440} y={110} width={900} size={60} />
    ) : null}
  </AbsoluteFill>
);

/** 砂の色の背景 */
export const SandBackground: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(${COLORS.limestone} 0%, #EFE4CB 52%, #D9C9A3 52%, #CDBB92 100%)`,
    }}
  />
);
