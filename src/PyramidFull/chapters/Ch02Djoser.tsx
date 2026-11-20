import React from "react";
import { useCurrentFrame } from "remotion";
import { PYRAMIDS } from "../../Pyramid/data/facts";
import {
  Pyramid3D,
  PyramidCompare,
  ZoomMap,
} from "../../PyramidPrevis/components";
import { COLORS } from "../../PyramidPrevis/theme";
import { Caption, type ChapterProps, Inset, Seg } from "../lib";
import { ImhotepCard } from "../ImhotepCard";

const djoser = PYRAMIDS.find((p) => p.key === "djoser")!;

/** 02-03：マスタバが1段ずつ積み上がって6段になる */
const Stacking: React.FC = () => {
  const f = useCurrentFrame();
  const steps = Math.min(6, 1 + Math.floor(f / 18));
  return (
    <Pyramid3D
      shape="step"
      heightM={djoser.heightM}
      baseM={djoser.baseM}
      steps={steps}
      azimuth={30}
      spin={3}
      elevation={16}
      distance={2.6}
    />
  );
};

export const Ch02Djoser: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="02-01" to="02-02">
      <Pyramid3D
        shape="mastaba"
        heightM={djoser.heightM}
        baseM={djoser.baseM}
        azimuth={30}
        spin={2}
        elevation={16}
        distance={2.6}
      />
      <Caption
        text="マスタバ（平たい台の形の墓）"
        y={120}
        color={COLORS.ink}
        size={48}
        delay={40}
      />
    </Seg>
    <Seg chapter={chapter} from="02-03">
      <Stacking />
    </Seg>
    <Seg chapter={chapter} from="02-04">
      <Pyramid3D
        shape="step"
        heightM={djoser.heightM}
        baseM={djoser.baseM}
        azimuth={50}
        spin={3}
        elevation={14}
        distance={2.6}
        center={[800, 540]}
      />
      <Inset x={1240} y={90} scale={0.34}>
        <ZoomMap keyframes={[{ at: 0, view: "giza" }]} />
      </Inset>
      <Caption
        text="サッカラの階段ピラミッド"
        x={560}
        y={120}
        width={900}
        color={COLORS.ink}
        size={48}
        delay={10}
      />
    </Seg>
    <Seg chapter={chapter} from="02-05">
      <PyramidCompare visibleKeys={["djoser"]} enterKey="djoser" />
      <ImhotepCard />
    </Seg>
    <Seg chapter={chapter} from="02-06">
      <Pyramid3D
        shape="step"
        heightM={djoser.heightM}
        baseM={djoser.baseM}
        azimuth={80}
        spin={6}
        elevation={22}
        distance={2.4}
      />
    </Seg>
  </>
);
