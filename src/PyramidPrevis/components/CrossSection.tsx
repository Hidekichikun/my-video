import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, GOTHIC } from "../theme";

export type SectionPart =
  | "entrance"
  | "descending"
  | "subterranean"
  | "ascending"
  | "grandGallery"
  | "queensChamber"
  | "kingsChamber"
  | "relieving"
  | "bigVoid"
  | "northCorridor";

export type CrossSectionProps = {
  /** 光らせる部分。複数可 */
  highlight?: SectionPart[];
  /** 光らせた部分の名前を出すか */
  showLabels?: boolean;
  /** "khufu"：大ピラミッド。"typical"：部屋が地下・土台近くにある一般的なピラミッド（比較用） */
  variant?: "khufu" | "typical";
  /** 描く位置と大きさ。既定は画面中央 */
  center?: number;
  pxPerM?: number;
  /** 背景を描くか */
  background?: boolean;
  /** 右上の説明文を出すか */
  caption?: boolean;
};

// 大ピラミッドを南北に切った断面（概略）。単位はm。x：中心から南が正、y：地面から上が正。北は画面の左。
const H = 146.5;
const HALF = 115.15;
const faceX = (y: number, north: boolean) =>
  (north ? -1 : 1) * HALF * (1 - y / H);

type Shape =
  | { kind: "line"; pts: [number, number][]; width: number }
  | { kind: "poly"; pts: [number, number][] };

const DESC_TOP: [number, number] = [faceX(17, true) + 1.5, 17];
const DESC_BOTTOM: [number, number] = [-7.5, -30];
const JUNCTION: [number, number] = [-76.7, 4.5];
const ASC_TOP: [number, number] = [-41.7, 21.6];
const GALLERY_TOP: [number, number] = [0.3, 42.1];

const PARTS: Record<
  SectionPart,
  {
    label: string;
    shapes: Shape[];
    anchor: [number, number];
    labelAt: [number, number];
  }
> = {
  entrance: {
    label: "本来の入口",
    shapes: [
      {
        kind: "poly",
        pts: [
          [DESC_TOP[0] - 2, 15.5],
          [DESC_TOP[0] + 1, 15.5],
          [DESC_TOP[0] + 1, 19],
          [DESC_TOP[0] - 2, 19],
        ],
      },
    ],
    anchor: [DESC_TOP[0] - 1, 18],
    labelAt: [-127, 40],
  },
  descending: {
    label: "下降通路",
    shapes: [
      { kind: "line", pts: [DESC_TOP, DESC_BOTTOM, [0, -30]], width: 1.6 },
    ],
    anchor: [-40, -13],
    labelAt: [-127, -22],
  },
  subterranean: {
    label: "地下の間",
    shapes: [
      {
        kind: "poly",
        pts: [
          [0, -31],
          [8, -31],
          [8, -26],
          [0, -26],
        ],
      },
    ],
    anchor: [8, -28],
    labelAt: [140, -32],
  },
  ascending: {
    label: "上昇通路",
    shapes: [{ kind: "line", pts: [JUNCTION, ASC_TOP], width: 1.6 }],
    anchor: [-60, 13],
    labelAt: [-127, 8],
  },
  grandGallery: {
    label: "大回廊",
    shapes: [
      {
        kind: "poly",
        pts: [
          ASC_TOP,
          GALLERY_TOP,
          [GALLERY_TOP[0], GALLERY_TOP[1] + 8.6],
          [ASC_TOP[0], ASC_TOP[1] + 8.6],
        ],
      },
    ],
    anchor: [-25, 36],
    labelAt: [-127, 70],
  },
  queensChamber: {
    label: "王妃の間",
    shapes: [
      { kind: "line", pts: [ASC_TOP, [-2.6, 21.6]], width: 1.2 },
      {
        kind: "poly",
        pts: [
          [-2.6, 21.6],
          [2.6, 21.6],
          [2.6, 26],
          [0, 28],
          [-2.6, 26],
        ],
      },
    ],
    anchor: [2.6, 24],
    labelAt: [140, 18],
  },
  kingsChamber: {
    label: "王の間",
    shapes: [
      {
        kind: "poly",
        pts: [
          [0.3, 43],
          [8.5, 43],
          [8.5, 46.5],
          [0.3, 46.5],
        ],
      },
      {
        kind: "poly",
        pts: [
          [8.5, 43],
          [13.7, 43],
          [13.7, 48.8],
          [8.5, 48.8],
        ],
      },
    ],
    anchor: [13.7, 46],
    labelAt: [140, 50],
  },
  relieving: {
    label: "5段の空間",
    shapes: [
      ...[0, 1, 2, 3, 4].map(
        (i): Shape => ({
          kind: "poly",
          pts: [
            [8.5, 50 + i * 3.2],
            [13.7, 50 + i * 3.2],
            [13.7, 51.6 + i * 3.2],
            [8.5, 51.6 + i * 3.2],
          ],
        }),
      ),
      {
        kind: "poly",
        pts: [
          [7.5, 66],
          [14.7, 66],
          [11.1, 69.5],
        ],
      },
    ],
    anchor: [14.7, 60],
    labelAt: [140, 78],
  },
  bigVoid: {
    label: "2017年の空間",
    shapes: [
      {
        kind: "poly",
        pts: [
          [-37, 42],
          [-7, 56.6],
          [-7, 64],
          [-37, 49.4],
        ],
      },
    ],
    anchor: [-22, 57],
    labelAt: [-127, 100],
  },
  northCorridor: {
    label: "2023年の空間",
    shapes: [
      {
        kind: "poly",
        pts: [
          [DESC_TOP[0] + 1, 24],
          [DESC_TOP[0] + 10, 24],
          [DESC_TOP[0] + 10, 26],
          [DESC_TOP[0] + 1, 26],
        ],
      },
    ],
    anchor: [DESC_TOP[0] + 5, 26],
    labelAt: [-127, 128],
  },
};

/** 他のピラミッドの一般的な断面（部屋が地下・土台近く） */
const TYPICAL: Shape[] = [
  {
    kind: "line",
    pts: [
      [faceX(12, true) + 1.5, 12],
      [-12, -18],
      [0, -18],
    ],
    width: 1.6,
  },
  {
    kind: "poly",
    pts: [
      [0, -21],
      [10, -21],
      [10, -15],
      [0, -15],
    ],
  },
];

const DRAW_ORDER: SectionPart[] = [
  "descending",
  "subterranean",
  "ascending",
  "queensChamber",
  "grandGallery",
  "kingsChamber",
  "relieving",
  "entrance",
  "northCorridor",
  "bigVoid",
];

/**
 * 大ピラミッドの断面図（南北方向、北が左）。highlight で部屋や通路を光らせる。
 * 例：<CrossSection highlight={["grandGallery"]} />
 */
export const CrossSection: React.FC<CrossSectionProps> = ({
  highlight = [],
  showLabels = true,
  variant = "khufu",
  center = 960,
  pxPerM = 4.2,
  background = true,
  caption = true,
}) => {
  const frame = useCurrentFrame();
  const baseY = 700;
  const P = ([x, y]: [number, number]) =>
    [center + x * pxPerM, baseY - y * pxPerM] as [number, number];
  const pts = (list: [number, number][]) =>
    list
      .map((p) =>
        P(p)
          .map((n) => n.toFixed(1))
          .join(","),
      )
      .join(" ");
  const glow = 0.75 + 0.25 * Math.sin(frame / 6);
  const appear = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const drawShape = (s: Shape, color: string, key: string, dashed = false) =>
    s.kind === "line" ? (
      <polyline
        key={key}
        points={pts(s.pts)}
        fill="none"
        stroke={color}
        strokeWidth={Math.max(3, s.width * pxPerM)}
        strokeLinejoin="round"
      />
    ) : (
      <polygon
        key={key}
        points={pts(s.pts)}
        fill={color}
        stroke={dashed ? color : "none"}
        strokeDasharray={dashed ? "8 6" : undefined}
        fillOpacity={dashed ? 0.35 : 1}
      />
    );
  const muted = "#6B6456";

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
    >
      {background ? (
        <rect width={1920} height={1080} fill={COLORS.night} />
      ) : null}
      <g opacity={appear}>
        {/* 地面と岩盤 */}
        <rect
          x={P([-HALF - 40, 0])[0]}
          y={baseY}
          width={(HALF * 2 + 80) * pxPerM}
          height={40 * pxPerM}
          fill="#2A2620"
        />
        <line
          x1={P([-HALF - 40, 0])[0]}
          y1={baseY}
          x2={P([HALF + 40, 0])[0]}
          y2={baseY}
          stroke="#8A7D63"
          strokeWidth={3}
        />
        {/* ピラミッドの輪郭 */}
        <polygon
          points={pts([
            [-HALF, 0],
            [0, H],
            [HALF, 0],
          ])}
          fill="#C8B48A"
          stroke="#E6D9BC"
          strokeWidth={3}
        />
        {variant === "typical"
          ? TYPICAL.map((s, i) =>
              drawShape(s, highlight.length ? COLORS.gold : muted, `t${i}`),
            )
          : DRAW_ORDER.map((part) => {
              const hi = highlight.includes(part);
              const dashed = part === "bigVoid" || part === "northCorridor";
              if (dashed && !hi) return null;
              const color = hi
                ? COLORS.gold
                : part === "kingsChamber" || part === "relieving"
                  ? COLORS.granite
                  : muted;
              return (
                <g key={part} opacity={hi ? glow : 1}>
                  {PARTS[part].shapes.map((s, i) =>
                    drawShape(s, color, `${part}${i}`, dashed),
                  )}
                </g>
              );
            })}
      </g>
      {/* 方位 */}
      <text
        x={P([-HALF, 0])[0] - 10}
        y={baseY + 60}
        textAnchor="end"
        fill={COLORS.limestone}
        style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 34 }}
      >
        北
      </text>
      <text
        x={P([HALF, 0])[0] + 10}
        y={baseY + 60}
        fill={COLORS.limestone}
        style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 34 }}
      >
        南
      </text>
      {showLabels && variant === "khufu"
        ? highlight.map((part) => {
            const info = PARTS[part];
            const a = P(info.anchor);
            const left = info.labelAt[0] < 0;
            const lx = P([info.labelAt[0], 0])[0];
            const ly = P([0, info.labelAt[1]])[1];
            return (
              <g key={`label-${part}`}>
                <polyline
                  points={`${a[0]},${a[1]} ${lx + (left ? 12 : -12)},${ly - 12} ${lx},${ly - 12}`}
                  fill="none"
                  stroke={COLORS.gold}
                  strokeWidth={2.5}
                />
                <text
                  x={lx + (left ? -10 : 10)}
                  y={ly}
                  textAnchor={left ? "end" : "start"}
                  fill={COLORS.gold}
                  style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 40 }}
                >
                  {info.label}
                </text>
              </g>
            );
          })
        : null}
      {caption ? (
        <text
          x={1840}
          y={140}
          textAnchor="end"
          fill="#A8ADB8"
          style={{ fontFamily: GOTHIC, fontSize: 24 }}
        >
          {variant === "khufu"
            ? "大ピラミッドの断面（南北方向・概略）"
            : "一般的なピラミッドの断面（概略）"}
        </text>
      ) : null}
    </svg>
  );
};
