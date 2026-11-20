import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { HISTORY_EVENTS } from "../../Pyramid/data/facts";
import { COLORS, GOTHIC } from "../theme";

type EventKey = (typeof HISTORY_EVENTS)[number]["key"];

export type HistoryLineProps = {
  /** 表示する出来事の key。省略すると全部 */
  visibleKeys?: EventKey[];
  highlightKey?: EventKey;
  /** 2つの出来事の間の長さを括弧で示す（例：クフ → ツタンカーメン「約1200年後」） */
  bracket?: { from: EventKey; to: EventKey; label: string };
  /** 線の下に並べる注記（例：「日本：縄文時代」） */
  notes?: string[];
  dark?: boolean;
};

const X0 = 160;
const X1 = 1760;
const Y = 500;
const YEAR0 = -2800;
const YEAR1 = 2100;

const xOf = (year: number) =>
  X0 + ((year - YEAR0) / (YEAR1 - YEAR0)) * (X1 - X0);
const yearText = (year: number) =>
  year < 0 ? `紀元前${-year}年ごろ` : `${year}年`;

/** 年表。紀元前2800年から現在までを同じ縮尺で1本の線に並べる */
export const HistoryLine: React.FC<HistoryLineProps> = ({
  visibleKeys,
  highlightKey,
  bracket,
  notes = [],
  dark = true,
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const text = dark ? COLORS.limestone : COLORS.ink;
  const sub = dark ? "#A8ADB8" : COLORS.muted;
  const events = HISTORY_EVENTS.filter(
    (e) => !visibleKeys || visibleKeys.includes(e.key),
  );
  const find = (k: EventKey) => HISTORY_EVENTS.find((e) => e.key === k);
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
        x1={X0}
        y1={Y}
        x2={X0 + (X1 - X0) * draw}
        y2={Y}
        stroke={sub}
        strokeWidth={4}
      />
      {[-2500, -2000, -1500, -1000, -500, 1, 500, 1000, 1500, 2000].map(
        (yr) => (
          <g key={yr} opacity={draw}>
            <line
              x1={xOf(yr)}
              y1={Y - 8}
              x2={xOf(yr)}
              y2={Y + 8}
              stroke={sub}
              strokeWidth={2}
            />
            <text
              x={xOf(yr)}
              y={Y + 40}
              textAnchor="middle"
              fill={sub}
              style={{ fontFamily: GOTHIC, fontSize: 22 }}
            >
              {yr < 0 ? `前${-yr}` : yr === 1 ? "紀元" : `${yr}`}
            </text>
          </g>
        ),
      )}
      {events.map((e, i) => {
        const x = xOf(e.year);
        const hi = e.key === highlightKey;
        const ly = Y - 90 - (i % 3) * 80;
        const anchor = x < 400 ? "start" : x > 1500 ? "end" : "middle";
        const tx = anchor === "start" ? x - 12 : anchor === "end" ? x + 12 : x;
        return (
          <g
            key={e.key}
            opacity={interpolate(frame, [6 + i * 4, 14 + i * 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          >
            <line
              x1={x}
              y1={Y}
              x2={x}
              y2={ly + 12}
              stroke={hi ? COLORS.gold : sub}
              strokeWidth={2}
            />
            <circle
              cx={x}
              cy={Y}
              r={hi ? 14 : 10}
              fill={hi ? COLORS.gold : text}
            />
            <text
              x={tx}
              y={ly - 30}
              textAnchor={anchor}
              fill={hi ? COLORS.gold : text}
              style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 30 }}
            >
              {e.label}
            </text>
            <text
              x={tx}
              y={ly}
              textAnchor={anchor}
              fill={sub}
              style={{ fontFamily: GOTHIC, fontSize: 22 }}
            >
              {yearText(e.year)}
            </text>
          </g>
        );
      })}
      {bracket
        ? (() => {
            const a = find(bracket.from);
            const b = find(bracket.to);
            if (!a || !b) return null;
            const t = interpolate(frame, [20, 40], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const xa = xOf(a.year);
            const xb = xa + (xOf(b.year) - xa) * t;
            return (
              <g>
                <path
                  d={`M${xa},${Y + 70} v20 H${xb} v-20`}
                  fill="none"
                  stroke={COLORS.gold}
                  strokeWidth={4}
                />
                <text
                  x={(xa + xOf(b.year)) / 2}
                  y={Y + 140}
                  textAnchor="middle"
                  fill={COLORS.gold}
                  opacity={t}
                  style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 40 }}
                >
                  {bracket.label}
                </text>
              </g>
            );
          })()
        : null}
      {notes.map((n, i) => (
        <text
          key={n}
          x={xOf(-2550)}
          y={Y + 130 + i * 56}
          fill={text}
          opacity={interpolate(frame, [10 + i * 10, 20 + i * 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
          style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 38 }}
        >
          {n}
        </text>
      ))}
    </svg>
  );
};
