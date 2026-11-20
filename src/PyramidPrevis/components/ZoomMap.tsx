import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  AFRICA,
  ASIA,
  EGYPT,
  EUROPE,
  ISLANDS,
  LAKE_VICTORIA,
  type LonLat,
  NILE_DAMIETTA,
  NILE_FULL,
  NILE_ROSETTA,
} from "../lib/geo";
import { COLORS, GOTHIC, smooth } from "../theme";

export type ZoomView = "africa" | "egypt" | "giza";

export type ZoomMapProps = {
  /**
   * どのフレームでどの範囲を映すか（Sequence の頭から数えたフレーム）。
   * 例：[{ at: 0, view: "africa" }, { at: 60, view: "africa" }, { at: 150, view: "egypt" }]
   * 同じ view を続けて書くと、その間は止まって見せる。
   */
  keyframes: { at: number; view: ZoomView }[];
  /** ナイル川沿いの緑の帯を出す（「暮らしを支えた川」を見せるとき） */
  showFertileBand?: boolean;
};

/** 各範囲のカメラ：中心の経度・緯度と、画面の縦に映す緯度の幅（度） */
const CAMERAS: Record<ZoomView, { lon: number; lat: number; span: number }> = {
  africa: { lon: 20, lat: 3, span: 84 },
  egypt: { lon: 30.3, lat: 26.9, span: 12.5 },
  giza: { lon: 31.2, lat: 29.93, span: 0.9 },
};
const LOG_MAX = Math.log(CAMERAS.africa.span);
const LOG_MIN = Math.log(CAMERAS.giza.span);

const WATER = "#AFC4CF";
const LAND = "#E6D9BC";
const OTHER_LAND = "#D6C8A6";

type Label = {
  text: string;
  at: LonLat;
  /** この範囲（縦に映す緯度の幅）のときだけ出す */
  span: [number, number];
  size?: number;
  dot?: boolean;
  gold?: boolean;
  anchor?: "start" | "middle" | "end";
  dx?: number;
  dy?: number;
  italic?: boolean;
};

const LABELS: Label[] = [
  { text: "アフリカ大陸", at: [18, 5], span: [30, 999], size: 64 },
  {
    text: "ヨーロッパ",
    at: [6, 41.5],
    span: [30, 999],
    size: 36,
    italic: true,
  },
  {
    text: "アラビア半島",
    at: [46, 22],
    span: [20, 999],
    size: 36,
    italic: true,
  },
  { text: "地中海", at: [18, 34.2], span: [8, 999], size: 36, italic: true },
  { text: "紅海", at: [37.4, 20.5], span: [6, 999], size: 34, italic: true },
  { text: "エジプト", at: [28.3, 26.2], span: [6, 999], size: 56, gold: true },
  {
    text: "ナイル川",
    at: [32.2, 27.4],
    span: [4, 22],
    size: 34,
    anchor: "start",
  },
  {
    text: "ルクソール",
    at: [32.64, 25.7],
    span: [4, 22],
    size: 30,
    dot: true,
    anchor: "start",
    dx: 18,
  },
  {
    text: "アスワン",
    at: [32.9, 24.09],
    span: [4, 22],
    size: 30,
    dot: true,
    anchor: "start",
    dx: 18,
  },
  {
    text: "ギザ",
    at: [31.13, 29.98],
    span: [0, 22],
    size: 44,
    dot: true,
    gold: true,
    anchor: "end",
    dx: -22,
  },
  {
    text: "カイロ（現在の首都）",
    at: [31.24, 30.05],
    span: [0, 3],
    size: 32,
    dot: true,
    anchor: "start",
    dx: 20,
    dy: -6,
  },
  {
    text: "サッカラ",
    at: [31.22, 29.87],
    span: [0, 3],
    size: 30,
    dot: true,
    anchor: "end",
    dx: -20,
  },
  {
    text: "ダハシュール",
    at: [31.21, 29.79],
    span: [0, 3],
    size: 30,
    dot: true,
    anchor: "end",
    dx: -20,
  },
  {
    text: "ナイル川",
    at: [31.3, 29.62],
    span: [0, 3],
    size: 32,
    anchor: "start",
  },
];

/** 範囲 [a, b] の中で1、外で0。境目はなめらかに切り替える */
const visible = (span: number, [a, b]: [number, number]) => {
  const inLow = interpolate(
    Math.log(span),
    [Math.log(Math.max(a, 0.01)) - 0.15, Math.log(Math.max(a, 0.01)) + 0.15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const inHigh = interpolate(
    Math.log(span),
    [Math.log(b) - 0.15, Math.log(b) + 0.15],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return a <= 0 ? inHigh : inLow * inHigh;
};

/** keyframes から、今のカメラを求める。中心は直線、幅は対数で補間する */
const cameraAt = (frame: number, keyframes: ZoomMapProps["keyframes"]) => {
  const ks = [...keyframes].sort((a, b) => a.at - b.at);
  if (frame <= ks[0].at) return CAMERAS[ks[0].view];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i];
    const b = ks[i + 1];
    if (frame <= b.at) {
      const t = smooth((frame - a.at) / Math.max(1, b.at - a.at));
      const A = CAMERAS[a.view];
      const B = CAMERAS[b.view];
      return {
        lon: A.lon + (B.lon - A.lon) * t,
        lat: A.lat + (B.lat - A.lat) * t,
        span: Math.exp(
          Math.log(A.span) + (Math.log(B.span) - Math.log(A.span)) * t,
        ),
      };
    }
  }
  return CAMERAS[ks[ks.length - 1].view];
};

/**
 * アフリカ大陸 → エジプト → ギザ のように、だんだん寄っていく地図（概略）。
 * 例：<ZoomMap keyframes={[{ at: 0, view: "africa" }, { at: 45, view: "africa" }, { at: 150, view: "egypt" }]} />
 */
export const ZoomMap: React.FC<ZoomMapProps> = ({
  keyframes,
  showFertileBand = false,
}) => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame, keyframes);
  const k = 1080 / cam.span;
  const cosLat = Math.cos((cam.lat * Math.PI) / 180);
  const P = ([lon, lat]: LonLat): [number, number] => [
    960 + (lon - cam.lon) * cosLat * k,
    470 - (lat - cam.lat) * k,
  ];
  const pts = (list: LonLat[]) =>
    list
      .map((p) =>
        P(p)
          .map((n) => n.toFixed(1))
          .join(","),
      )
      .join(" ");
  const path = (list: LonLat[]) =>
    list
      .map(
        (p, i) =>
          `${i ? "L" : "M"}${P(p)
            .map((n) => n.toFixed(1))
            .join(",")}`,
      )
      .join(" ");
  // 0：アフリカ全体 〜 1：ギザ周辺
  const z = (LOG_MAX - Math.log(cam.span)) / (LOG_MAX - LOG_MIN);
  const riverW = 2.5 + 16 * z * z;
  const band = showFertileBand ? visible(cam.span, [1.5, 30]) : 0;
  const egyptFill = visible(cam.span, [4, 999]);

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0 }}
    >
      <rect width={1920} height={1080} fill={WATER} />
      <polygon points={pts(EUROPE)} fill={OTHER_LAND} />
      <polygon points={pts(ASIA)} fill={OTHER_LAND} />
      {ISLANDS.map((isl, i) => (
        <polygon key={i} points={pts(isl)} fill={OTHER_LAND} />
      ))}
      <polygon points={pts(AFRICA)} fill={LAND} />
      <polygon
        points={pts(EGYPT)}
        fill={COLORS.gold}
        fillOpacity={0.35 * egyptFill}
        stroke={COLORS.gold}
        strokeOpacity={egyptFill}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <polygon points={pts(LAKE_VICTORIA)} fill={COLORS.nile} />
      {band > 0 ? (
        <path
          d={path(NILE_FULL)}
          stroke={COLORS.field}
          strokeOpacity={0.45 * band}
          strokeWidth={riverW * 5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : null}
      {[NILE_FULL, NILE_ROSETTA, NILE_DAMIETTA].map((r, i) => (
        <path
          key={i}
          d={path(r)}
          stroke={COLORS.nile}
          strokeWidth={riverW}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ))}
      {LABELS.map((l) => {
        const o = visible(cam.span, l.span);
        if (o <= 0.01) return null;
        const [x, y] = P(l.at);
        const anchor = l.anchor ?? "middle";
        return (
          <g key={`${l.text}-${l.at.join()}`} opacity={o}>
            {l.dot ? (
              <circle
                cx={x}
                cy={y}
                r={l.gold ? 12 : 8}
                fill={l.gold ? COLORS.gold : COLORS.ink}
                stroke="#FFFFFF"
                strokeWidth={3}
              />
            ) : null}
            <text
              x={x + (l.dx ?? 0)}
              y={y + (l.dy ?? 0) + (l.size ?? 32) * 0.35}
              textAnchor={anchor}
              fill={l.gold ? "#7A5A12" : l.italic ? "#4F6470" : COLORS.ink}
              style={{
                fontFamily: GOTHIC,
                fontWeight: 700,
                fontSize: l.size ?? 32,
                letterSpacing: l.italic ? "0.2em" : undefined,
                paintOrder: "stroke",
                stroke: l.italic ? WATER : LAND,
                strokeWidth: 8,
              }}
            >
              {l.text}
            </text>
          </g>
        );
      })}
      <text
        x={1840}
        y={1000}
        textAnchor="end"
        fill="#4F6470"
        style={{ fontFamily: GOTHIC, fontSize: 22 }}
      >
        概略図（国境は現在のもの）
      </text>
    </svg>
  );
};
