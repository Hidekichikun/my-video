import React from "react";
import {
  AbsoluteFill,
  getStaticFiles,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ILLUSTRATION_DIR,
  ILLUSTRATIONS,
} from "../../Pyramid/data/illustrations";
import { COLORS, GOTHIC } from "../theme";
import { Atmosphere } from "./Atmosphere";

export type IllustrationProps = {
  /** ILLUSTRATIONS の file（例："04-giza-now.png"） */
  file: string;
  /** 寄る動き：最初と最後の拡大率 */
  zoom?: [number, number];
  /** 寄る中心（0〜1）。[0.5, 0.5] で中央 */
  focus?: [number, number];
  /** 暗くする量（0〜1）。上に文字を重ねるときに使う */
  dim?: number;
};

const exists = (name: string) => getStaticFiles().some((f) => f.name === name);

/**
 * イラストを画面いっぱいに出す。どんな横長の画像でも切り抜いて埋める。
 * ファイルが無いときは、ファイル名と内容を書いたプレースホルダーを出す。
 */
export const Illustration: React.FC<IllustrationProps> = ({
  file,
  zoom = [1.0, 1.08],
  focus = [0.5, 0.5],
  dim = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, Math.max(1, durationInFrames)], zoom, {
    extrapolateRight: "clamp",
  });
  const path = `${ILLUSTRATION_DIR}/${file}`;
  const info = ILLUSTRATIONS.find((i) => i.file === file);
  const origin = `${focus[0] * 100}% ${focus[1] * 100}%`;

  if (!exists(path)) {
    return (
      <AbsoluteFill
        style={{
          background: "#2A2E38",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AbsoluteFill
          style={{
            transform: `scale(${s})`,
            transformOrigin: origin,
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 24px, transparent 24px 48px)",
          }}
        />
        <div
          style={{
            border: `3px dashed ${COLORS.gold}`,
            borderRadius: 16,
            padding: "40px 64px",
            maxWidth: 1300,
            textAlign: "center",
            fontFamily: GOTHIC,
          }}
        >
          <div
            style={{
              color: COLORS.gold,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            イラスト未着
          </div>
          <div
            style={{
              color: COLORS.limestone,
              fontSize: 52,
              fontWeight: 700,
              marginTop: 12,
            }}
          >
            {info?.description ?? file}
          </div>
          <div style={{ color: "#A8ADB8", fontSize: 28, marginTop: 16 }}>
            public/{path}
          </div>
        </div>
        {dim > 0 ? (
          <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />
        ) : null}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: COLORS.night }}>
      <Img
        src={staticFile(path)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${s})`,
          transformOrigin: origin,
        }}
      />
      <Atmosphere file={file} />
      {dim > 0 ? (
        <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />
      ) : null}
    </AbsoluteFill>
  );
};
