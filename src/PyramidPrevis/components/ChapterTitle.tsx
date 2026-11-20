import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, GOTHIC, MINCHO } from "../theme";

export type ChapterTitleProps = {
  /** 部の名前（導入・積み上げ・頂点・その後・意味・まとめ） */
  part: string;
  title: string;
  /** 表示する長さ（フレーム） */
  durationInFrames: number;
};

/** 章の頭に出す章タイトル。背景ごと画面を覆う */
export const ChapterTitle: React.FC<ChapterTitleProps> = ({
  part,
  title,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 8, durationInFrames - 8, durationInFrames],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const rise = interpolate(frame, [0, 14], [18, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: COLORS.night,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${rise}px)`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            fontFamily: GOTHIC,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: "0.3em",
            color: COLORS.gold,
          }}
        >
          {part}
        </div>
        <div
          style={{
            width: 80,
            height: 2,
            background: COLORS.gold,
            margin: "0 auto",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            fontFamily: MINCHO,
            fontWeight: 800,
            fontSize: 84,
            color: COLORS.limestone,
            lineHeight: 1.25,
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};
