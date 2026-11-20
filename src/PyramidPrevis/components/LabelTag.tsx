import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { LABELS } from "../../Pyramid/data/facts";
import { GOTHIC, LABEL_COLORS, type LabelKind } from "../theme";

export type LabelTagProps = {
  kind: LabelKind;
  /** 札の前に出す言葉（例：「奴隷説」）。無ければ札だけ */
  subject?: string;
  /** 画面上の位置（左上の座標） */
  x: number;
  y: number;
  /** 何フレーム目に押すか */
  delay?: number;
  size?: number;
};

/** 確度の札（確定・有力・仮説・証拠なし・再現）。押されるように出る */
export const LabelTag: React.FC<LabelTagProps> = ({
  kind,
  subject,
  x,
  y,
  delay = 0,
  size = 1,
}) => {
  const frame = useCurrentFrame() - delay;
  const pop = interpolate(frame, [0, 6, 10], [1.6, 0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const color = LABEL_COLORS[kind];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 18 * size,
        fontFamily: GOTHIC,
        opacity,
      }}
    >
      {subject ? (
        <span
          style={{
            fontSize: 56 * size,
            fontWeight: 700,
            color: "#FFFFFF",
            WebkitTextStroke: "4px rgba(10,12,16,0.85)",
            paintOrder: "stroke",
          }}
        >
          {subject}
        </span>
      ) : null}
      <span
        style={{
          transform: `scale(${pop}) rotate(-4deg)`,
          fontSize: 36 * size,
          fontWeight: 700,
          color,
          background: "rgba(255,255,255,0.92)",
          border: `${4 * size}px solid ${color}`,
          borderRadius: 10 * size,
          padding: `${4 * size}px ${18 * size}px`,
          letterSpacing: "0.08em",
        }}
      >
        {LABELS[kind]}
      </span>
    </div>
  );
};
