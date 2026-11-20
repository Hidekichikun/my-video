import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { WorldView } from "./index";

export const SHOTS = [
  { start: 0, end: 7, title: "若宮大路を歩く", scene: "town" },
  { start: 7, end: 17, title: "商人と農民のいる街", scene: "town" },
  { start: 17, end: 27, title: "幕府周辺・武士の仕事", scene: "warrior" },
  { start: 27, end: 35, title: "路地の暮らし", scene: "life" },
  { start: 35, end: 43, title: "寺と信仰をたずねて", scene: "map" },
  { start: 43, end: 55, title: "建長寺・臨済禅の修行", scene: "temple" },
  { start: 55, end: 60, title: "まずは、おなかから", scene: "temple" },
];
const lines: [number, number, string, string][] = [
  [1.5, 5.8, "旅人", "ここが、武士の都かあ。"],
  [7.7, 10.3, "旅人", "これは、何ですか？"],
  [10.5, 14.2, "商人", "干した魚。旅のお供にどうだい？"],
  [14.3, 16.6, "旅人", "あとで、ひとつください！"],
  [17.7, 20.5, "旅人", "刀を持って……今日は戦？"],
  [20.7, 24.5, "武士", "いや、今日は御所の警固だ。"],
  [24.7, 26.7, "旅人", "都を守る仕事もあるんだね。"],
  [27.6, 31, "暮らし", "水を運び、火で煮炊き。"],
  [31.3, 34.6, "旅人", "おっと、荷物が通ります！"],
  [43.8, 47, "旅人", "このお寺では、何をするの？"],
  [47.2, 51.2, "僧", "ここでは、坐禅をして修行します。"],
  [51.5, 54.7, "旅人", "ぼくも、心を静かに……。"],
  [56.4, 59.5, "旅人", "先に、ごはんだった……。"],
];

const FaithMap: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = Math.max(0, Math.min(1, frame / 200));
  return (
    <AbsoluteFill style={{ background: "#eae5d5" }}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">
        <path d="M0 820 Q400 780 820 850 L1100 1080 H0Z" fill="#b5cbd0" />
        <path
          d="M180 650 L130 330 L340 130 L740 80 L1080 160 L1190 400 L1040 700"
          fill="none"
          stroke="#b8c3a6"
          strokeWidth="150"
          strokeLinejoin="round"
        />
        <path
          d="M710 840 L710 400 L685 280 L580 150"
          stroke="#f9f3e4"
          strokeWidth="44"
          fill="none"
        />
        <path
          d="M360 565 L990 565 M430 550 L430 380 L685 380"
          stroke="#f9f3e4"
          strokeWidth="22"
          fill="none"
        />
        <path
          d="M710 660 L710 410 L580 150"
          stroke="#a05e43"
          strokeWidth="7"
          fill="none"
          strokeDasharray="12 12"
          strokeDashoffset={1 - progress}
        />
        {[
          [710, 660],
          [710, 400],
          [430, 380],
          [580, 150],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="13"
              fill={i === 3 ? "#a05e43" : "#536e60"}
            />
          </g>
        ))}
        <g
          fill="#374f45"
          fontFamily="Yu Gothic, Meiryo, sans-serif"
          fontSize="29"
          fontWeight="600"
        >
          <text x="745" y="690">
            商いの街
          </text>
          <text x="750" y="406">
            鶴岡八幡宮
          </text>
          <text x="285" y="365">
            寿福寺
          </text>
          <text x="620" y="160">
            建長寺
          </text>
          <text x="745" y="530" fontSize="23">
            若宮大路
          </text>
          <text x="170" y="870" fill="#56747c">
            由比ヶ浜
          </text>
        </g>
        <circle
          cx={710 - 130 * Math.max(0, (progress - 0.5) * 2)}
          cy={660 - 510 * progress}
          r="10"
          fill="#a05e43"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 1190,
          top: 260,
          width: 620,
          padding: 36,
          background: "#fbf7eb",
          borderLeft: "5px solid #a05e43",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 3, color: "#907453" }}>
          鎌倉に広がる信仰
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, marginTop: 22 }}>
          禅・念仏・法華経の教え
        </div>
        <div style={{ fontSize: 27, lineHeight: 1.85, marginTop: 22 }}>
          新しい教えも、以前からの仏教も。
          <br />
          さまざまな信仰が交わる街。
        </div>
        <div style={{ fontSize: 28, marginTop: 30, color: "#9b583e" }}>
          今回は、建長寺へ。
        </div>
      </div>
      <div
        style={{ position: "absolute", bottom: 140, left: 90, fontSize: 24 }}
      >
        位置関係の概略図 ／ 距離・移動時間は省略
      </div>
    </AbsoluteFill>
  );
};

export const KamakuraFull: React.FC = () => {
  const frame = useCurrentFrame(),
    t = frame / 30;
  const shotIndex = SHOTS.findIndex((s) => t >= s.start && t < s.end),
    shot = SHOTS[Math.max(0, shotIndex)];
  const local = frame - shot.start * 30;
  const worldFrame =
    shotIndex === 0
      ? (local * 150) / 210
      : shotIndex === 1
        ? 150 + local
        : shot.scene === "temple"
          ? frame - 43 * 30
          : local;
  const line = lines.find((l) => t >= l[0] && t < l[1]);
  return (
    <AbsoluteFill
      style={{
        fontFamily: '"Yu Gothic", "Meiryo", sans-serif',
        color: "#33463e",
        background: "#eae5d5",
      }}
    >
      <Audio src={staticFile("audio/kamakura-full.wav")} />
      {shot.scene === "map" ? (
        <FaithMap frame={local} />
      ) : (
        <WorldView frame={worldFrame} scene={shot.scene} />
      )}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 45,
          background: "#f8f4e8ed",
          padding: "18px 26px",
          borderLeft: "5px solid #a05e43",
        }}
      >
        <div style={{ fontSize: 18, letterSpacing: 4, color: "#797d6d" }}>
          KAMAKURA / PREVIS 02
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, marginTop: 4 }}>
          棒人間、鎌倉を歩く。
        </div>
        <div style={{ fontSize: 22, marginTop: 5 }}>
          1260年代 ｜ {shot.title}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 64,
          top: 54,
          fontSize: 20,
          background: "#f8f4e8df",
          padding: "12px 18px",
        }}
      >
        街・建物は仮配置 ／ 会話は創作
      </div>
      {shot.scene === "temple" && (
        <div
          style={{
            position: "absolute",
            right: 64,
            top: 130,
            background: "#f8f4e8ef",
            padding: "18px 25px",
            fontSize: 25,
            lineHeight: 1.7,
          }}
        >
          建長寺
          <br />
          <span style={{ fontSize: 21 }}>1253年創建 ・ 臨済宗</span>
        </div>
      )}
      {t >= 55 && t < 56.3 && (
        <div
          style={{
            position: "absolute",
            left: 1130,
            top: 555,
            fontSize: 48,
            color: "#9b583e",
            transform: `rotate(${Math.sin(local * 0.15) * 5}deg)`,
          }}
        >
          ぐぅ〜……
        </div>
      )}
      {line && (
        <div
          style={{
            position: "absolute",
            bottom: 116,
            left: "50%",
            transform: "translateX(-50%)",
            minWidth: 900,
            textAlign: "center",
            background: "#fcf8ecef",
            border: "2px solid #bfb79f",
            borderRadius: 18,
            padding: "18px 36px 22px",
          }}
        >
          <div
            style={{
              fontSize: 21,
              fontWeight: 700,
              color: line[2] === "旅人" ? "#9b583e" : "#416f6b",
              marginBottom: 6,
            }}
          >
            {line[2]}
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, whiteSpace: "nowrap" }}>
            {line[3]}
          </div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 35,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 20,
          color: "#4f5b50",
        }}
      >
        <span>鎌倉散策 ／ 60秒プレビズ</span>
        <span>
          {String(shotIndex + 1).padStart(2, "0")} / 07{" "}
          {String(Math.floor(t)).padStart(2, "0")} :{" "}
          {String(frame % 30).padStart(2, "0")} / 60s
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          height: 5,
          width: `${(frame / 1799) * 100}%`,
          background: "#a05e43",
        }}
      />
    </AbsoluteFill>
  );
};
