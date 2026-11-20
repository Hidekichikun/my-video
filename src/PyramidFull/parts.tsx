// 複数の章で使う、部品に無い図。

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { LabelTag, Pyramid3D } from "../PyramidPrevis/components";
import { COLORS, GOTHIC, smooth } from "../PyramidPrevis/theme";
import { PYRAMIDS } from "../Pyramid/data/facts";
import { Caption, SandBackground } from "./lib";

const fade = (f: number, start: number, len = 14) =>
  interpolate(f, [start, start + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ---- ギザの配置図（真上から、北が上、概略） ----

type GizaItem = {
  key: string;
  label: string;
  x: number;
  y: number;
  size: number;
};
const GIZA: GizaItem[] = [
  { key: "khufu", label: "クフ", x: 0, y: 0, size: 230 },
  { key: "khafre", label: "カフラー", x: -230, y: -420, size: 215 },
  { key: "menkaure", label: "メンカウラー", x: -470, y: -840, size: 104 },
];

/**
 * ギザの配置図。showCount で何基目まで出すか、causeway で神殿と参道を出す。
 */
export const GizaPlan: React.FC<{
  showCount?: number;
  causeway?: boolean;
  highlight?: string;
}> = ({ showCount = 3, causeway = false, highlight }) => {
  const f = useCurrentFrame();
  const S = 0.72;
  const cx = 1060;
  const cy = 300;
  const P = (x: number, y: number) => [cx + x * S, cy - y * S] as const;
  const road = fade(f, 10, 40);
  return (
    <AbsoluteFill style={{ background: COLORS.sand }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {causeway ? (
          <g opacity={road}>
            {/* カフラー：葬祭殿 → 参道 → 河岸神殿（スフィンクスの横） */}
            <line
              x1={P(-230 + 120, -420)[0]}
              y1={P(0, -420)[1]}
              x2={P(250, -520)[0]}
              y2={P(0, -520)[1]}
              stroke={COLORS.gold}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <rect
              x={P(250, -490)[0]}
              y={P(0, -490)[1]}
              width={60 * S}
              height={60 * S}
              fill={COLORS.core}
            />
            <rect
              x={P(-230 + 115, -390)[0]}
              y={P(0, -390)[1]}
              width={40 * S}
              height={60 * S}
              fill={COLORS.core}
            />
            {/* クフ：葬祭殿 → 参道（東へ） */}
            <line
              x1={P(115, 0)[0]}
              y1={P(0, 0)[1]}
              x2={P(560, -180)[0]}
              y2={P(0, -180)[1]}
              stroke={COLORS.gold}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <rect
              x={P(115, 30)[0]}
              y={P(0, 30)[1]}
              width={40 * S}
              height={60 * S}
              fill={COLORS.core}
            />
            <text
              x={P(330, -560)[0]}
              y={P(0, -560)[1] + 44}
              fill={COLORS.ink}
              style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 28 }}
            >
              河岸神殿
            </text>
            <text
              x={P(300, -60)[0]}
              y={P(0, -60)[1]}
              fill={COLORS.ink}
              style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 28 }}
            >
              参道
            </text>
          </g>
        ) : null}
        {GIZA.slice(0, showCount).map((g, i) => {
          const [x, y] = P(g.x, g.y);
          const s = g.size * S;
          const o = fade(f, i * 12);
          const hi = g.key === highlight;
          return (
            <g key={g.key} opacity={o}>
              <polygon
                points={`${x - s / 2},${y - s / 2} ${x + s / 2},${y - s / 2} ${x + s / 2},${y + s / 2} ${x - s / 2},${y + s / 2}`}
                fill={hi ? COLORS.gold : "#C8B48A"}
                stroke="#8E7A55"
                strokeWidth={2}
              />
              <line
                x1={x - s / 2}
                y1={y - s / 2}
                x2={x + s / 2}
                y2={y + s / 2}
                stroke="#8E7A55"
                strokeWidth={1.5}
              />
              <line
                x1={x + s / 2}
                y1={y - s / 2}
                x2={x - s / 2}
                y2={y + s / 2}
                stroke="#8E7A55"
                strokeWidth={1.5}
              />
              <text
                x={x - s / 2 - 16}
                y={y + 12}
                textAnchor="end"
                fill={COLORS.ink}
                style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 36 }}
              >
                {g.label}
              </text>
            </g>
          );
        })}
        {showCount >= 3 ? (
          <g opacity={fade(f, 36)}>
            <ellipse
              cx={P(270, -500)[0]}
              cy={P(0, -500)[1]}
              rx={36 * S}
              ry={14 * S}
              fill={COLORS.core}
            />
            <text
              x={P(270, -500)[0] + 40}
              y={P(0, -500)[1] - 20}
              fill={COLORS.ink}
              style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 30 }}
            >
              スフィンクス
            </text>
          </g>
        ) : null}
        <g transform="translate(1720, 160)">
          <line
            x1={0}
            y1={40}
            x2={0}
            y2={-30}
            stroke={COLORS.ink}
            strokeWidth={3}
          />
          <polygon points="0,-44 -10,-24 10,-24" fill={COLORS.ink} />
          <text
            x={0}
            y={80}
            textAnchor="middle"
            fill={COLORS.ink}
            style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 30 }}
          >
            北
          </text>
        </g>
        <text
          x={1840}
          y={1000}
          textAnchor="end"
          fill={COLORS.muted}
          style={{ fontFamily: GOTHIC, fontSize: 22 }}
        >
          ギザの配置（真上から・概略）
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ---- 3つの坂の説（05-15〜05-16） ----

export const RampTheories: React.FC<{ tagsAt?: number }> = ({ tagsAt }) => {
  const f = useCurrentFrame();
  const panel = (i: number, title: string, draw: React.ReactNode) => (
    <g transform={`translate(${160 + i * 560}, 260)`} opacity={fade(f, i * 14)}>
      <rect width={480} height={430} rx={16} fill="rgba(255,255,255,0.55)" />
      {draw}
      <text
        x={240}
        y={400}
        textAnchor="middle"
        fill={COLORS.ink}
        style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 38 }}
      >
        {title}
      </text>
    </g>
  );
  const pyr = (
    <polygon
      points="120,330 240,90 360,330"
      fill="#C8B48A"
      stroke="#8E7A55"
      strokeWidth={2}
    />
  );
  return (
    <AbsoluteFill>
      <SandBackground />
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute" }}
      >
        {panel(
          0,
          "まっすぐな坂",
          <>
            {pyr}
            <polygon
              points="20,330 250,170 250,330"
              fill={COLORS.core}
              opacity={0.85}
            />
          </>,
        )}
        {panel(
          1,
          "ジグザグの坂",
          <>
            {pyr}
            <polyline
              points="360,330 200,280 330,230 230,180 290,140"
              fill="none"
              stroke={COLORS.core}
              strokeWidth={16}
              strokeLinejoin="round"
            />
          </>,
        )}
        {panel(
          2,
          "らせん状の坂",
          <>
            {pyr}
            <polyline
              points="120,330 360,300 150,270 330,220 185,190 290,150 230,120"
              fill="none"
              stroke={COLORS.core}
              strokeWidth={14}
              strokeLinejoin="round"
            />
          </>,
        )}
      </svg>
      {tagsAt !== undefined
        ? [0, 1, 2].map((i) => (
            <LabelTag
              key={i}
              kind="hypothesis"
              x={330 + i * 560}
              y={200}
              delay={tagsAt + i * 6}
            />
          ))
        : null}
    </AbsoluteFill>
  );
};

// ---- 地面の高さの違い（07-03） ----

export const GroundDifference: React.FC = () => {
  const f = useCurrentFrame();
  const t = smooth(f / 40);
  const S = 2.6;
  const g = 820;
  const khufu = PYRAMIDS.find((p) => p.key === "khufu")!;
  const khafre = PYRAMIDS.find((p) => p.key === "khafre")!;
  const lift = 10 * S * t; // カフラーの地面は約10m高い（概略）
  const tri = (cx: number, base: number, h: number, ground: number) =>
    `${cx - (base * S) / 2},${ground} ${cx},${ground - h * S} ${cx + (base * S) / 2},${ground}`;
  return (
    <AbsoluteFill>
      <SandBackground />
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute" }}
      >
        <polygon
          points={`0,${g} 900,${g} 1100,${g - lift} 1920,${g - lift} 1920,1080 0,1080`}
          fill="#CDBB92"
        />
        <polygon
          points={tri(560, khufu.baseM, khufu.heightM, g)}
          fill="#C8B48A"
          stroke="#8E7A55"
          strokeWidth={2}
        />
        <polygon
          points={tri(1400, khafre.baseM, khafre.heightM, g - lift)}
          fill={COLORS.gold}
          stroke="#8A6A22"
          strokeWidth={2}
        />
        <line
          x1={0}
          y1={g - khafre.heightM * S - lift}
          x2={1920}
          y2={g - khafre.heightM * S - lift}
          stroke={COLORS.ink}
          strokeDasharray="10 10"
          strokeWidth={2}
          opacity={t}
        />
        <text
          x={560}
          y={g + 60}
          textAnchor="middle"
          fill={COLORS.ink}
          style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 40 }}
        >
          クフ
        </text>
        <text
          x={1400}
          y={g - lift + 60}
          textAnchor="middle"
          fill={COLORS.ink}
          style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 40 }}
        >
          カフラー
        </text>
      </svg>
      <Caption
        text="カフラーは高い地面に建っている"
        y={110}
        color={COLORS.ink}
        size={48}
        delay={30}
      />
    </AbsoluteFill>
  );
};

// ---- 太陽が沈んで昇る（09-03） ----

export const SunCycle: React.FC = () => {
  const f = useCurrentFrame();
  const t = (f / 150) % 1;
  const angle = Math.PI * (1 - t * 2); // 西（右）から沈み、東（左）から昇る円の動き
  const x = 960 + Math.cos(angle) * 620;
  const y = 700 - Math.sin(angle) * 420;
  const below = y > 700;
  return (
    <AbsoluteFill
      style={{
        background: below ? "#1B2233" : "linear-gradient(#F2B872, #F6DDB0)",
      }}
    >
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute" }}
      >
        <circle
          cx={960}
          cy={700}
          r={620}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeDasharray="12 14"
          strokeWidth={3}
        />
        <circle cx={x} cy={y} r={46} fill="#FFD27A" />
        <rect x={0} y={700} width={1920} height={380} fill="#6B5A40" />
        <polygon points="760,700 960,500 1160,700" fill="#3A3226" />
        <text
          x={1600}
          y={760}
          fill="#F4F1E8"
          style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 36 }}
        >
          西へ沈む
        </text>
        <text
          x={320}
          y={760}
          textAnchor="end"
          fill="#F4F1E8"
          style={{ fontFamily: GOTHIC, fontWeight: 700, fontSize: 36 }}
        >
          東から昇る
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ---- ミューオンが降り注ぐ（06-13） ----

export const MuonRain: React.FC = () => {
  const f = useCurrentFrame();
  const dots = Array.from({ length: 60 }, (_, i) => {
    const seed = (i * 7919) % 997;
    const x = 200 + ((seed * 13) % 1520);
    const speed = 9 + (seed % 7);
    const y = ((seed * 3 + f * speed) % 1200) - 100;
    return { x, y, i };
  });
  return (
    <AbsoluteFill style={{ background: COLORS.night }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute" }}
      >
        <polygon
          points="476,760 960,145 1444,760"
          fill="#C8B48A"
          opacity={0.9}
        />
        <rect x={380} y={760} width={1160} height={120} fill="#2A2620" />
        {dots.map((d) => (
          <line
            key={d.i}
            x1={d.x}
            y1={d.y}
            x2={d.x - 6}
            y2={d.y - 36}
            stroke="#9FD4FF"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
      </svg>
      <Caption text="宇宙から降り注ぐ粒子「ミューオン」" y={60} size={48} />
      <Caption
        text="石を通り抜ける量から、中の空間を調べる"
        y={950}
        size={34}
        color="#A8ADB8"
        delay={40}
      />
    </AbsoluteFill>
  );
};

// ---- 古代世界の七不思議（10-07） ----

const WONDERS = [
  "ギザの大ピラミッド",
  "バビロンの空中庭園",
  "オリンピアのゼウス像",
  "エフェソスのアルテミス神殿",
  "ハリカルナッソスのマウソロス霊廟",
  "ロドス島の巨像",
  "アレクサンドリアの大灯台",
];

export const SevenWonders: React.FC<{ fadeAt: number }> = ({ fadeAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: COLORS.night,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Caption
        text="古代世界の七不思議"
        y={90}
        size={60}
        mincho
        color={COLORS.gold}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 40,
        }}
      >
        {WONDERS.map((w, i) => {
          const keep = i === 0;
          const out = keep ? 1 : 1 - fade(f, fadeAt + i * 6, 20) * 0.85;
          return (
            <div
              key={w}
              style={{
                fontFamily: GOTHIC,
                fontWeight: 700,
                fontSize: keep ? 52 : 42,
                color: keep ? COLORS.gold : COLORS.limestone,
                opacity: fade(f, i * 5) * out,
                textDecoration:
                  !keep && f > fadeAt + i * 6 + 20 ? "line-through" : undefined,
                textAlign: "center",
              }}
            >
              {w}
              {keep ? "　← 今も残る" : ""}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---- スネフェルの3つのピラミッド（03-02） ----

export const SneferuTrio: React.FC = () => (
  <AbsoluteFill>
    <SandBackground />
    {[
      { shape: "meidum" as const, label: "メイドゥム", x: 400, h: 92, b: 144 },
      {
        shape: "bent" as const,
        label: "屈折ピラミッド",
        x: 960,
        h: 105,
        b: 189,
      },
      {
        shape: "true" as const,
        label: "赤いピラミッド",
        x: 1520,
        h: 104,
        b: 220,
      },
    ].map((p) => (
      <React.Fragment key={p.label}>
        <Pyramid3D
          shape={p.shape}
          heightM={p.h}
          baseM={p.b}
          casing={0}
          center={[p.x, 560]}
          distance={6.5}
          elevation={10}
          azimuth={25}
          background={false}
        />
        <Caption
          text={p.label}
          x={p.x}
          y={760}
          width={500}
          size={40}
          color={COLORS.ink}
        />
      </React.Fragment>
    ))}
  </AbsoluteFill>
);
