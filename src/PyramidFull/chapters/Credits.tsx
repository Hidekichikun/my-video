import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CREDIT_VOICE, CREDIT_VOICE_ACTOR } from "../../Pyramid/data/facts";
import { COLORS, GOTHIC, MINCHO } from "../../PyramidPrevis/theme";

export const Credits: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        background: COLORS.night,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: 26,
        opacity: o,
      }}
    >
      <div
        style={{
          fontFamily: MINCHO,
          fontWeight: 800,
          fontSize: 60,
          color: COLORS.limestone,
        }}
      >
        {CREDIT_VOICE}
      </div>
      {CREDIT_VOICE_ACTOR ? (
        <div
          style={{ fontFamily: MINCHO, fontSize: 40, color: COLORS.limestone }}
        >{`声：${CREDIT_VOICE_ACTOR}`}</div>
      ) : null}
      <div
        style={{
          fontFamily: GOTHIC,
          fontSize: 30,
          color: "#A8ADB8",
          marginTop: 20,
        }}
      >
        参考：エジプト観光・考古省、Harvard Digital Giza、AERA ほか
      </div>
      <div style={{ fontFamily: GOTHIC, fontSize: 30, color: "#A8ADB8" }}>
        イラストはAIで作成した想像図です
      </div>
    </AbsoluteFill>
  );
};
