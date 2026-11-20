import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { MINCHO } from "../theme";

/** 声より何フレーム前から文字を出し始めるか。Sequence の開始もこの分だけ早める */
export const SUBTITLE_LEAD_FRAMES = 10;

export type SubtitleProps = {
  text: string;
  /** Sequence の長さ（リード分を含む）。最後の10フレームで消える */
  durationInFrames: number;
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OPEN = "「『（";
const CLOSE = "、。」』）！？";

/**
 * 字幕。明朝体で、1文字ずつ下からふわっと浮かび上がる（リリックモーション風）。
 * 画面の下をうすく暗くして、明るい絵の上でも読めるようにする。
 * Sequence は、声の開始より SUBTITLE_LEAD_FRAMES だけ前から置く。
 */
export const Subtitle: React.FC<SubtitleProps> = ({
  text,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  // 句読点や閉じかっこは前の文字と、開きかっこは次の文字とまとめて、行頭・行末に1文字だけ残らないようにする
  const chars: string[] = [];
  let pendingOpen = "";
  for (const c of Array.from(text)) {
    if (OPEN.includes(c)) {
      pendingOpen += c;
    } else if (CLOSE.includes(c) && chars.length > 0 && !pendingOpen) {
      chars[chars.length - 1] += c;
    } else {
      chars.push(pendingOpen + c);
      pendingOpen = "";
    }
  }
  if (pendingOpen) chars.push(pendingOpen);
  // 文字が出そろうまでの長さ。短い文は速く、長い文もだいたい1秒で出そろう
  const reveal = Math.min(34, Math.max(14, chars.length * 1.1));
  const step = reveal / Math.max(1, chars.length);
  const out = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [0, 1],
    clamp,
  );
  const band = interpolate(frame, [0, 10], [0, 1], clamp) * (1 - out);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          top: "auto",
          height: 330,
          background: "linear-gradient(rgba(8,10,14,0), rgba(8,10,14,0.62))",
          opacity: band,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 70,
        }}
      >
        <div
          style={{
            maxWidth: 1560,
            textAlign: "center",
            fontFamily: MINCHO,
            fontWeight: 600,
            fontSize: 50,
            lineHeight: 1.55,
            letterSpacing: "0.06em",
            color: "#FBF7EE",
            opacity: 1 - out,
            transform: `translateY(${-8 * out}px)`,
          }}
        >
          {chars.map((c, i) => {
            const t = interpolate(
              frame,
              [i * step, i * step + 12],
              [0, 1],
              clamp,
            );
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: t,
                  transform: `translateY(${(1 - t) * 14}px)`,
                  whiteSpace: "pre",
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
