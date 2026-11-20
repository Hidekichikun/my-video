import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { GOTHIC } from "../theme";

export type DimensionLineProps = {
  /** 始点と終点（画面の座標） */
  from: [number, number];
  to: [number, number];
  /** 数字の文字（例：「約146m」） */
  label: string;
  /** 文字を線のどちら側に出すか */
  side?: "left" | "right" | "above" | "below";
  delay?: number;
  color?: string;
};

/** 寸法線。線が伸びてから数字が出る */
export const DimensionLine: React.FC<DimensionLineProps> = ({
  from,
  to,
  label,
  side = "right",
  delay = 0,
  color = "#FFFFFF",
}) => {
  const frame = useCurrentFrame() - delay;
  const t = interpolate(frame, [0, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelOpacity = interpolate(frame, [12, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x2 = from[0] + (to[0] - from[0]) * t;
  const y2 = from[1] + (to[1] - from[1]) * t;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * 14;
  const ny = (dx / len) * 14;
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  const offset = {
    left: [-24, 0],
    right: [24, 0],
    above: [0, -24],
    below: [0, 24],
  }[side];
  const anchor = {
    left: "end",
    right: "start",
    above: "middle",
    below: "middle",
  }[side] as "end" | "start" | "middle";
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
    >
      <g stroke={color} strokeWidth={3} fill="none">
        <line x1={from[0]} y1={from[1]} x2={x2} y2={y2} />
        <line
          x1={from[0] - nx}
          y1={from[1] - ny}
          x2={from[0] + nx}
          y2={from[1] + ny}
        />
        {t >= 1 ? (
          <line
            x1={to[0] - nx}
            y1={to[1] - ny}
            x2={to[0] + nx}
            y2={to[1] + ny}
          />
        ) : null}
      </g>
      <text
        x={mx + offset[0]}
        y={my + offset[1] + (side === "above" ? 0 : 16)}
        textAnchor={anchor}
        fill={color}
        opacity={labelOpacity}
        style={{
          fontFamily: GOTHIC,
          fontWeight: 700,
          fontSize: 48,
          paintOrder: "stroke",
          stroke: "rgba(10,12,16,0.8)",
          strokeWidth: 6,
        }}
      >
        {label}
      </text>
    </svg>
  );
};
