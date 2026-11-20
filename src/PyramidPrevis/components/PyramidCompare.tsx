import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  BENT_SHAPE,
  PYRAMIDS,
  type PyramidFact,
} from "../../Pyramid/data/facts";
import { COLORS, GOTHIC } from "../theme";

export type PyramidCompareProps = {
  /** 表示するピラミッドの key。省略すると全部 */
  visibleKeys?: string[];
  /** 金色で強調する key */
  highlightKey?: string;
  /** 下から伸びて登場させる key（その行で新しく加わるもの） */
  enterKey?: string;
  /** 下の部分を花崗岩の色にする（メンカウラー） */
  graniteKeys?: string[];
  /** 何番目から順に光らせるか。10-08 の「順に光る」用。frame ごとに1基ずつ */
  sweepEvery?: number;
  dark?: boolean;
};

const GROUND_Y = 780;
/** 縮尺（m → px）。全部同じ縮尺で描く */
const SCALE = 2.3;
/** 隣どうしの底辺を重ねる割合。重ねて並べ、頂上と名前が見えるようにする */
const OVERLAP = 0.42;

/** 全7基を並べたときの中心のx座標。表示する数に関係なく位置は固定 */
const CENTERS = (() => {
  const xs: number[] = [0];
  for (let i = 1; i < PYRAMIDS.length; i++) {
    const step =
      ((PYRAMIDS[i - 1].baseM + PYRAMIDS[i].baseM) / 2) * SCALE * (1 - OVERLAP);
    xs.push(xs[i - 1] + Math.max(step, 215));
  }
  const offset = 960 - (xs[0] + xs[xs.length - 1]) / 2;
  return xs.map((x) => x + offset);
})();

const shapePoints = (p: PyramidFact, x: number, grow: number) => {
  const w = p.baseM * SCALE;
  const h = p.heightM * SCALE * grow;
  const cx = x + w / 2;
  if (p.shape === "bent") {
    const lowerH = (BENT_SHAPE.lowerHeightM / p.heightM) * h;
    const inset =
      (BENT_SHAPE.lowerHeightM /
        Math.tan((BENT_SHAPE.lowerAngleDeg * Math.PI) / 180)) *
      SCALE *
      grow;
    return [
      [x, GROUND_Y],
      [x + inset, GROUND_Y - lowerH],
      [cx, GROUND_Y - h],
      [x + w - inset, GROUND_Y - lowerH],
      [x + w, GROUND_Y],
    ];
  }
  if (p.shape === "step") {
    // 6段。各段の半幅を下から順に狭める
    const tiers = 6;
    const hw = (i: number) => (w / 2) * (1 - (i / tiers) * 0.82);
    const left: number[][] = [];
    for (let i = 0; i < tiers; i++) {
      const y0 = GROUND_Y - (h * i) / tiers;
      const y1 = GROUND_Y - (h * (i + 1)) / tiers;
      left.push([cx - hw(i), y0], [cx - hw(i), y1]);
    }
    const right = left.map(([px, py]) => [2 * cx - px, py]).reverse();
    return [...left, ...right];
  }
  return [
    [x, GROUND_Y],
    [cx, GROUND_Y - h],
    [x + w, GROUND_Y],
  ];
};

/**
 * 歴代ピラミッドを同じ縮尺で並べる比較図（建設当時の高さ）。
 * 位置は常に全7基を並べたときの場所に固定し、表示するものだけ描く。
 */
export const PyramidCompare: React.FC<PyramidCompareProps> = ({
  visibleKeys,
  highlightKey,
  enterKey,
  graniteKeys = [],
  sweepEvery,
  dark = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ink = dark ? COLORS.limestone : COLORS.ink;
  const items = PYRAMIDS.map((p, i) => ({
    p,
    x: CENTERS[i] - (p.baseM * SCALE) / 2,
  }));
  const sweepIndex = sweepEvery ? Math.floor(frame / sweepEvery) : -1;
  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
    >
      <rect
        width={1920}
        height={1080}
        fill={dark ? COLORS.night : COLORS.sand}
      />
      <line
        x1={80}
        y1={GROUND_Y}
        x2={1840}
        y2={GROUND_Y}
        stroke={dark ? "#4A4F5C" : COLORS.line}
        strokeWidth={3}
      />
      <text
        x={80}
        y={140}
        style={{ fontFamily: GOTHIC, fontSize: 30, fontWeight: 500 }}
        fill={dark ? "#A8ADB8" : COLORS.muted}
      >
        建設当時の高さを同じ縮尺で比べた図
      </text>
      {/* 強調するものは最後に描いて、隣に隠れないようにする */}
      {[...items]
        .sort(
          (a, b) =>
            Number(a.p.key === highlightKey) - Number(b.p.key === highlightKey),
        )
        .map(({ p, x: px }) => {
          const i = PYRAMIDS.indexOf(p);
          if (visibleKeys && !visibleKeys.includes(p.key)) return null;
          const grow =
            p.key === enterKey
              ? spring({
                  frame,
                  fps,
                  config: { damping: 200 },
                  durationInFrames: 24,
                })
              : 1;
          const isHi = p.key === highlightKey || i === sweepIndex;
          const fill = isHi ? COLORS.gold : dark ? "#6B6456" : "#C8B48A";
          const pts = shapePoints(p, px, grow);
          const w = p.baseM * SCALE;
          const cx = px + w / 2;
          const topY = GROUND_Y - p.heightM * SCALE * grow;
          const granite = graniteKeys.includes(p.key);
          const gh = p.heightM * SCALE * 0.22;
          return (
            <g key={p.key}>
              <polygon
                points={pts.map((q) => q.join(",")).join(" ")}
                fill={fill}
                stroke={isHi ? "#8A6A22" : dark ? "#8A8272" : "#A8936A"}
                strokeWidth={2}
              />
              {granite ? (
                <polygon
                  points={`${px},${GROUND_Y} ${px + gh / Math.tan((51 * Math.PI) / 180)},${GROUND_Y - gh} ${px + w - gh / Math.tan((51 * Math.PI) / 180)},${GROUND_Y - gh} ${px + w},${GROUND_Y}`}
                  fill={COLORS.granite}
                />
              ) : null}
              <text
                x={cx}
                y={topY - 16}
                textAnchor="middle"
                fill={isHi ? COLORS.gold : ink}
                style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 30 }}
              >
                {`約${p.heightM}m`}
              </text>
              <text
                x={cx}
                y={GROUND_Y + 48}
                textAnchor="middle"
                fill={isHi ? COLORS.gold : ink}
                style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 32 }}
              >
                {p.label}
              </text>
              <text
                x={cx}
                y={GROUND_Y + 88}
                textAnchor="middle"
                fill={dark ? "#A8ADB8" : COLORS.muted}
                style={{ fontFamily: GOTHIC, fontWeight: 500, fontSize: 24 }}
              >
                {p.dynasty}
              </text>
            </g>
          );
        })}
    </svg>
  );
};
