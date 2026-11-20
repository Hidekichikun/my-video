import React from "react";
import { NileMap } from "./NileMap";
import { PopBadge } from "./Parts";
import { POP } from "../pop-theme";

// NileMapのmemphisビューと同じ緯度経度・投影。札だけを離して引出線で結ぶ。
const project = (lat: number, lon: number): [number, number] => {
  const cos = Math.cos((29.55 * Math.PI) / 180);
  const scale = Math.min(1240 / (2.4 * cos), 920 / 1.4);
  return [960 + (lon - 31.8) * cos * scale, 540 - (lat - 29.55) * scale];
};
const places = [
  {
    label: "ギザ",
    lat: 29.98,
    lon: 31.13,
    x: 350,
    y: 230,
    w: 240,
    end: [590, 285],
    color: POP.cyan,
  },
  {
    label: "トゥーラ",
    lat: 29.93,
    lon: 31.28,
    x: 800,
    y: 340,
    w: 290,
    end: [820, 365],
    color: POP.cyan,
  },
  {
    label: "ワディ・エル＝ジャルフ",
    lat: 29.02,
    lon: 32.64,
    x: 960,
    y: 650,
    w: 660,
    end: [1290, 745],
    color: POP.pink,
  },
];
export const PortMap: React.FC = () => (
  <>
    <div
      style={{ position: "absolute", inset: 0, clipPath: "inset(80px 0px)" }}
    >
      <NileMap view="memphis" places={[]} routes={[["tura", "giza"]]} />
    </div>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {places.map((p) => {
        const [x, y] = project(p.lat, p.lon);
        return (
          <g key={p.label}>
            <path
              d={`M ${x} ${y} L ${p.end[0]} ${p.end[1]}`}
              fill="none"
              stroke={POP.ink}
              strokeWidth={6}
            />
            <circle
              cx={x}
              cy={y}
              r={17}
              fill={p.color}
              stroke={POP.ink}
              strokeWidth={6}
            />
          </g>
        );
      })}
    </svg>
    {places.map((p, i) => (
      <PopBadge
        key={p.label}
        tone="place"
        size={p.label.length > 8 ? 44 : 56}
        delay={i * 6}
        style={{
          position: "absolute",
          left: p.x,
          top: p.y,
          width: p.w,
          padding: "16px 14px",
          whiteSpace: "nowrap",
        }}
      >
        {p.label}
      </PopBadge>
    ))}
    <PopBadge
      tone="meaning"
      size={48}
      style={{ position: "absolute", left: 840, top: 125 }}
    >
      2013年に発見
    </PopBadge>
  </>
);
