import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { PLACES } from "../../Pyramid/data/facts";
import { POP, POP_HEADING } from "../pop-theme";
const GOTHIC = POP_HEADING;
const COLORS = {
  sand: POP.cream,
  nile: POP.cyan,
  field: POP.yellow,
  ink: POP.ink,
  gold: POP.pink,
  lapis: POP.pink,
  muted: POP.ink,
};

type PlaceKey = (typeof PLACES)[number]["key"];

export type NileMapProps = {
  /** "egypt"：エジプト全体。"memphis"：ギザ周辺と紅海沿岸 */
  view?: "egypt" | "memphis";
  /** 表示する地名。省略するとその地図に入るもの全部 */
  places?: PlaceKey[];
  highlight?: PlaceKey;
  /** 線を伸ばして描くルート（例：[["tura", "giza"]]） */
  routes?: [PlaceKey, PlaceKey][];
  /** 当時ギザの近くまで延びていたナイルの支流（概略）を描く */
  showAncientBranch?: boolean;
  /** 各地からギザへ集まる矢印 */
  converge?: boolean;
};

// 緯度・経度（概略）
const COORDS: Record<PlaceKey, [number, number]> = {
  giza: [29.98, 31.13],
  saqqara: [29.87, 31.22],
  dahshur: [29.79, 31.21],
  meidum: [29.39, 31.16],
  tura: [29.93, 31.28],
  wadiElJarf: [29.02, 32.64],
  luxor: [25.74, 32.6],
  aswan: [24.09, 32.9],
};

const NILE: [number, number][] = [
  [24.09, 32.9],
  [24.47, 32.93],
  [24.98, 32.87],
  [25.29, 32.55],
  [25.7, 32.64],
  [26.16, 32.72],
  [26.05, 32.24],
  [26.56, 31.69],
  [27.18, 31.18],
  [28.1, 30.75],
  [29.07, 31.1],
  [29.6, 31.25],
  [29.93, 31.24],
  [30.04, 31.23],
  [30.2, 31.12],
];
const ROSETTA: [number, number][] = [
  [30.2, 31.12],
  [30.7, 30.8],
  [31.4, 30.4],
];
const DAMIETTA: [number, number][] = [
  [30.2, 31.12],
  [30.8, 31.4],
  [31.42, 31.81],
];
const RED_SEA: [number, number][] = [
  [29.97, 32.55],
  [29.5, 32.4],
  [29.02, 32.64],
  [28.3, 33.0],
  [27.25, 33.8],
  [26.7, 33.94],
  [26.1, 34.28],
  [25.07, 34.9],
  [24.0, 35.5],
];
const MED: [number, number][] = [
  [31.2, 29.3],
  [31.2, 29.9],
  [31.45, 30.4],
  [31.5, 31.8],
  [31.27, 32.3],
  [31.1, 33.5],
];
/** 当時の支流（ギザ近くへ延びる概略） */
const ANCIENT_BRANCH: [number, number][] = [
  [29.6, 31.25],
  [29.8, 31.18],
  [29.95, 31.15],
  [29.99, 31.14],
];

/** 地名の文字を点のどちら側に出すか：[東側か, 縦のずれ(px)] */
const LABEL_SIDE: Record<PlaceKey, [boolean, number]> = {
  giza: [false, 4],
  saqqara: [false, 30],
  dahshur: [false, 34],
  meidum: [false, 10],
  tura: [true, -6],
  wadiElJarf: [false, -18],
  luxor: [true, 10],
  aswan: [true, 10],
};

const VIEWS = {
  egypt: { lat: [24.0, 31.6], lon: [29.2, 35.6], box: [360, 70, 1560, 850] },
  memphis: {
    lat: [28.85, 30.25],
    lon: [30.6, 33.0],
    box: [340, 80, 1580, 1000],
  },
} as const;

const inView = (v: keyof typeof VIEWS, [la, lo]: [number, number]) => {
  const V = VIEWS[v];
  return la >= V.lat[0] && la <= V.lat[1] && lo >= V.lon[0] && lo <= V.lon[1];
};

/** ナイル沿いの地図（概略）。縮尺・位置は目安 */
export const NileMap: React.FC<NileMapProps> = ({
  view = "egypt",
  places,
  highlight,
  routes = [],
  showAncientBranch = false,
  converge = false,
}) => {
  const frame = useCurrentFrame();
  const V = VIEWS[view];
  const [bx0, by0, bx1, by1] = V.box;
  const midLat = ((V.lat[0] + V.lat[1]) / 2) * (Math.PI / 180);
  const sx = (bx1 - bx0) / ((V.lon[1] - V.lon[0]) * Math.cos(midLat));
  const sy = (by1 - by0) / (V.lat[1] - V.lat[0]);
  const s = Math.min(sx, sy);
  const cx = (bx0 + bx1) / 2;
  const cy = (by0 + by1) / 2;
  const clat = (V.lat[0] + V.lat[1]) / 2;
  const clon = (V.lon[0] + V.lon[1]) / 2;
  const P = ([la, lo]: [number, number]): [number, number] => [
    cx + (lo - clon) * Math.cos(midLat) * s,
    cy - (la - clat) * s,
  ];
  const path = (pts: [number, number][]) =>
    pts
      .map(
        (p, i) =>
          `${i ? "L" : "M"}${P(p)
            .map((n) => n.toFixed(1))
            .join(",")}`,
      )
      .join(" ");
  const shown = (places ?? (PLACES.map((p) => p.key) as PlaceKey[])).filter(
    (k) => inView(view, COORDS[k]),
  );
  const draw = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const riverWidth = view === "egypt" ? 7 : 12;
  const giza = P(COORDS.giza);
  const sources: [number, number][] = [
    [27.2, 31.2],
    [25.7, 32.6],
    [24.1, 32.9],
    [29.02, 32.64],
    [30.9, 31.2],
  ];

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
    >
      <rect width={1920} height={1080} fill={COLORS.sand} />
      <path
        d={path(RED_SEA)}
        stroke={COLORS.nile}
        strokeWidth={6}
        fill="none"
        opacity={0.6}
      />
      <path
        d={path(MED)}
        stroke={COLORS.nile}
        strokeWidth={6}
        fill="none"
        opacity={0.6}
      />
      {/* 川沿いの緑の帯 */}
      <path
        d={path(NILE)}
        stroke={COLORS.field}
        strokeWidth={riverWidth * 5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.35}
      />
      {[NILE, ROSETTA, DAMIETTA].map((r, i) => (
        <path
          key={i}
          d={path(r)}
          stroke={COLORS.nile}
          strokeWidth={riverWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
      {showAncientBranch ? (
        <path
          d={path(ANCIENT_BRANCH)}
          stroke={COLORS.nile}
          strokeWidth={riverWidth * 0.7}
          strokeDasharray="14 10"
          fill="none"
          opacity={draw}
        />
      ) : null}
      {converge
        ? sources.map((src, i) => {
            const a = P(src);
            const t = interpolate(frame, [10 + i * 4, 40 + i * 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const b: [number, number] = [
              a[0] + (giza[0] - a[0]) * t * 0.92,
              a[1] + (giza[1] - a[1]) * t * 0.92,
            ];
            return (
              <line
                key={i}
                x1={a[0]}
                y1={a[1]}
                x2={b[0]}
                y2={b[1]}
                stroke={COLORS.lapis}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.85}
              />
            );
          })
        : null}
      {routes.map(([from, to], i) => {
        const a = P(COORDS[from]);
        const b = P(COORDS[to]);
        const t = interpolate(frame, [10 + i * 10, 45 + i * 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <line
            key={`${from}-${to}`}
            x1={a[0]}
            y1={a[1]}
            x2={a[0] + (b[0] - a[0]) * t}
            y2={a[1] + (b[1] - a[1]) * t}
            stroke={COLORS.gold}
            strokeWidth={7}
            strokeDasharray="2 14"
            strokeLinecap="round"
          />
        );
      })}
      {shown.map((k, i) => {
        const [x, y] = P(COORDS[k]);
        const hi = k === highlight;
        const label = PLACES.find((p) => p.key === k)?.label ?? k;
        const [east, dy] = LABEL_SIDE[k];
        return (
          <g
            key={k}
            opacity={interpolate(frame, [i * 3, i * 3 + 10], [0, 1], {
              extrapolateRight: "clamp",
            })}
          >
            <circle
              cx={x}
              cy={y}
              r={hi ? 14 : 9}
              fill={hi ? COLORS.gold : COLORS.ink}
              stroke="#FFFFFF"
              strokeWidth={6}
            />
            <text
              x={x + (east ? 22 : -22)}
              y={y + dy}
              textAnchor={east ? "start" : "end"}
              fill={hi ? "#7A5A12" : COLORS.ink}
              style={{
                fontFamily: GOTHIC,
                fontWeight: 400,
                fontSize: hi ? 40 : 32,
                paintOrder: "stroke",
                stroke: COLORS.sand,
                strokeWidth: 6,
              }}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
