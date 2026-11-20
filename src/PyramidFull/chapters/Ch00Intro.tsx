import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KHUFU } from "../../Pyramid/data/facts";
import { DimensionLine, Illustration } from "../../PyramidPrevis/components";
import { COLORS, MINCHO } from "../../PyramidPrevis/theme";
import { AtLine, Caption, type ChapterProps, Seg } from "../lib";

/** 中身ごとゆっくり寄る。イラストと寸法線を一緒に拡大して、ずれないようにする */
const ZoomLayer: React.FC<{ zoom: [number, number]; children: React.ReactNode }> = ({
  zoom,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = interpolate(frame, [0, Math.max(1, durationInFrames)], zoom, {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${s})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 画面の左半分・右半分に、1枚のイラストを切り抜いて収める */
const HalfPanel: React.FC<{ side: "left" | "right"; children: React.ReactNode }> = ({
  side,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: side === "left" ? 0 : 960,
      width: 960,
      height: 1080,
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

const OpeningTitle: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: COLORS.night,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: MINCHO,
          fontWeight: 800,
          fontSize: 104,
          letterSpacing: "0.08em",
          color: COLORS.limestone,
          opacity: Math.min(1, f / 30),
        }}
      >
        ピラミッドを見る前に
      </div>
    </AbsoluteFill>
  );
};

export const Ch00Intro: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="00-01" to="00-02">
      <ZoomLayer zoom={[1, 1.12]}>
        <Illustration file="00-dawn-giza.png" zoom={[1, 1]} />
        <AtLine chapter={chapter} seg="00-01" line="00-02">
          {/* 手前の大ピラミッドの底辺（y≈615）から頂点（y≈198）まで */}
          <DimensionLine
            from={[470, 615]}
            to={[470, 198]}
            label="約146m"
            side="left"
          />
        </AtLine>
      </ZoomLayer>
    </Seg>
    <Seg chapter={chapter} from="00-03">
      {/* 次の行の像の絵と同じ構図。寄りの終わりを 00-04 の始まり（1.1）にそろえる */}
      <Illustration file="00-empty-pedestal.png" zoom={[1.0, 1.1]} />
    </Seg>
    <Seg chapter={chapter} from="00-04">
      <Illustration file="00-khufu-statue.png" zoom={[1.1, 1.22]} />
      <Caption
        text={`約${KHUFU.statueCm}cm`}
        x={1500}
        y={430}
        width={400}
        size={60}
        delay={20}
      />
    </Seg>
    <Seg chapter={chapter} from="00-05">
      <AbsoluteFill style={{ background: COLORS.night }}>
        <HalfPanel side="left">
          <Illustration file="00-dawn-giza.png" zoom={[1.0, 1.06]} />
        </HalfPanel>
        <HalfPanel side="right">
          <Illustration file="00-khufu-statue.png" zoom={[1.15, 1.22]} />
        </HalfPanel>
        <div
          style={{
            position: "absolute",
            left: 958,
            top: 0,
            bottom: 0,
            width: 4,
            background: COLORS.gold,
          }}
        />
      </AbsoluteFill>
    </Seg>
    <Seg chapter={chapter} from="00-06">
      <OpeningTitle />
    </Seg>
  </>
);
