import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BENT_SHAPE } from "../../Pyramid/data/facts";
import {
  NileMap,
  Pyramid3D,
  PyramidCompare,
} from "../../PyramidPrevis/components";
import { COLORS, MINCHO } from "../../PyramidPrevis/theme";
import {
  AtLine,
  Caption,
  type ChapterProps,
  SandBackground,
  Seg,
} from "../lib";
import { SneferuTrio } from "../parts";

const FamilyLine: React.FC = () => {
  const f = useCurrentFrame();
  const o = (d: number) =>
    interpolate(f, [d, d + 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const box = (text: string, d: number, gold = false) => (
    <div
      style={{
        opacity: o(d),
        fontFamily: MINCHO,
        fontWeight: 800,
        fontSize: 84,
        color: gold ? COLORS.gold : COLORS.limestone,
      }}
    >
      {text}
    </div>
  );
  return (
    <AbsoluteFill
      style={{
        background: COLORS.night,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 60,
        display: "flex",
      }}
    >
      {box("スネフェル", 0)}
      <div style={{ opacity: o(30), fontSize: 64, color: COLORS.limestone }}>
        →
      </div>
      {box("クフ", 40, true)}
      <div
        style={{
          position: "absolute",
          top: 640,
          opacity: o(50),
          fontFamily: MINCHO,
          fontSize: 40,
          color: "#A8ADB8",
        }}
      >
        父 と 子
      </div>
    </AbsoluteFill>
  );
};

/** 03-03：階段状の芯に、外側の石が足されていく */
const MeidumCasing: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const casing = interpolate(f, [15, durationInFrames - 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Pyramid3D
      shape="meidum"
      heightM={92}
      baseM={144}
      casing={casing}
      azimuth={30}
      spin={2}
      elevation={12}
      distance={2.4}
    />
  );
};

export const Ch03Sneferu: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="03-01">
      <FamilyLine />
    </Seg>
    <Seg chapter={chapter} from="03-02">
      <SneferuTrio />
    </Seg>
    <Seg chapter={chapter} from="03-03">
      <MeidumCasing />
      <Caption
        text="メイドゥムのピラミッド"
        y={110}
        color={COLORS.ink}
        size={48}
      />
    </Seg>
    <Seg chapter={chapter} from="03-04" to="03-05">
      <Pyramid3D
        shape="bent"
        heightM={105}
        baseM={189}
        azimuth={35}
        elevation={8}
        distance={1.8}
        center={[960, 500]}
      />
      <Caption text="屈折ピラミッド" y={110} color={COLORS.ink} size={48} />
      <AtLine chapter={chapter} seg="03-04" line="03-05">
        <Caption
          text={`約${BENT_SHAPE.lowerAngleDeg}度`}
          x={560}
          y={610}
          width={300}
          size={52}
          color={COLORS.ink}
        />
        <Caption
          text={`約${BENT_SHAPE.upperAngleDeg}度`}
          x={1320}
          y={300}
          width={300}
          size={52}
          color={COLORS.ink}
          delay={20}
        />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="03-06">
      <PyramidCompare
        visibleKeys={["djoser", "bent", "red"]}
        enterKey="red"
        highlightKey="red"
      />
    </Seg>
    <Seg chapter={chapter} from="03-07">
      <AbsoluteFill>
        <SandBackground />
        <NileMap
          view="memphis"
          places={["giza", "dahshur", "saqqara"]}
          highlight="giza"
          routes={[["dahshur", "giza"]]}
        />
      </AbsoluteFill>
    </Seg>
  </>
);
