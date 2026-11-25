// 最後のクレジット（5秒）
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PopBackground } from "../parts";
import { POP, POP_BODY, POP_HEADING, clamp } from "../theme";

const LINES = [
  "ナレーション：VOICEVOX:もち子(cv 明日葉よもぎ)", // 正式表記は規約ページで要確認。決まるまで仮
  "※登場するガチャ・キャラクターは架空のものです",
  "※イラストはAIで作った画像です",
  "※動画の制作には、Codex と Claude Code を使っています",
];

export const Credits: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <PopBackground />
      <div
        style={{
          position: "absolute",
          left: 160,
          top: 190,
          width: 1600,
          textAlign: "center",
          fontFamily: POP_HEADING,
          fontSize: 76,
          color: POP.white,
          WebkitTextStroke: `10px ${POP.ink}`,
          paintOrder: "stroke",
          textShadow: `6px 6px 0 ${POP.pink}`,
          opacity: interpolate(f, [0, 8], [0, 1], clamp),
        }}
      >
        ご視聴ありがとうございました
      </div>
      <div
        style={{
          position: "absolute",
          left: 220,
          top: 400,
          width: 1480,
          boxSizing: "border-box",
          background: POP.white,
          border: `6px solid ${POP.ink}`,
          borderRadius: 30,
          boxShadow: `10px 10px 0 ${POP.ink}`,
          padding: "34px 44px",
          fontFamily: POP_BODY,
          fontWeight: 800,
          fontSize: 40,
          lineHeight: 1.75,
          color: POP.ink,
          opacity: interpolate(f, [6, 16], [0, 1], clamp),
        }}
      >
        {LINES.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
