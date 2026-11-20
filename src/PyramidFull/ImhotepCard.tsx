import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { GOTHIC } from "../PyramidPrevis/theme";

/** Actual museum photograph: a later, deified image, not a reconstruction of his face. */
export const ImhotepCard: React.FC<{ animate?: boolean }> = ({ animate = true }) => {
  const frame = useCurrentFrame();
  const opacity = animate ? Math.min(1, frame / 12) : 1;
  return (
    <div style={{ position: "absolute", left: 980, top: 230, width: 800, height: 620,
      boxSizing: "border-box", padding: 26, display: "flex", gap: 28,
      background: "#FFF8E9", border: "3px solid #B69A6B", borderRadius: 24,
      opacity, fontFamily: GOTHIC, color: "#42392F" }}>
      <div style={{ width: 320, flexShrink: 0 }}>
        <div style={{ position: "relative", width: 320, height: 490,
          overflow: "hidden", borderRadius: 14, background: "#DEDCD5" }}>
          <Img src={staticFile("photo/pyramid-imhotep/met-26.7.852.jpg")}
            style={{ position: "absolute", width: 540, height: 720, maxWidth: "none", left: -110, top: -125 }} />
        </div>
        <div style={{ fontSize: 20, lineHeight: 1.45, marginTop: 12, color: "#706759" }}>
          写真：メトロポリタン美術館<br />
          26.7.852a, b ／ Public Domain
        </div>
      </div>
      <div style={{ flex: 1, paddingTop: 14 }}>
        <div style={{ fontSize: 46, fontWeight: 700, whiteSpace: "nowrap" }}>イムホテプ</div>
        <div style={{ fontSize: 29, lineHeight: 1.65, marginTop: 20 }}>
          ジェセル王の建築を<br />担った高官
        </div>
        <div style={{ display: "inline-block", fontSize: 26, fontWeight: 700,
          color: "#386C68", background: "#E2EFE8", padding: "9px 14px", borderRadius: 10, marginTop: 32 }}>
          後世に作られた像
        </div>
        <div style={{ fontSize: 25, lineHeight: 1.6, marginTop: 15 }}>
          紀元前332〜30年<br />プトレマイオス朝時代
        </div>
        <div style={{ fontSize: 26, lineHeight: 1.65, marginTop: 25, color: "#706759" }}>
          生前の肖像ではなく、<br />神格化された姿です。
        </div>
      </div>
    </div>
  );
};
