import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { POP, POP_BODY, POP_HEADING } from "../pop-theme";
import { PopBackground } from "../pop/Parts";
export const Credits: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: POP.cream,
        color: POP.ink,
        fontFamily: POP_BODY,
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        opacity: Math.min(1, frame / 20),
      }}
    >
      <PopBackground />
      <div
        data-pyramid2-overlay
        style={{
          position: "relative",
          fontFamily: POP_HEADING,
          fontSize: 60,
          fontWeight: 400,
        }}
      >
        VOICEVOX:暁記ミタマ
      </div>
      <div
        data-pyramid2-overlay
        style={{
          position: "relative",
          fontSize: 23,
          width: 1480,
          textAlign: "center",
          lineHeight: 1.8,
        }}
      >
        参考：エジプト観光・考古省、Harvard Digital Giza、AERA、The Metropolitan
        Museum of Art、UCL Digital Egypt、IFAO ほか
      </div>
      <div data-pyramid2-overlay style={{ position: "relative", fontSize: 32 }}>
        ※イラストはAIで作った想像図です
      </div>
      <div data-pyramid2-overlay style={{ position: "relative", fontSize: 32 }}>
        制作：my-video
      </div>
    </AbsoluteFill>
  );
};
