import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KHUFU } from "../../Pyramid/data/facts";
import {
  DimensionLine,
  Illustration,
  Pyramid3D,
  PyramidCompare,
} from "../../PyramidPrevis/components";
import { COLORS, GOTHIC } from "../../PyramidPrevis/theme";
import { AtLine, Caption, type ChapterProps, Seg, span } from "../lib";

const missingTop = KHUFU.heightOriginalM - KHUFU.heightNowM;

/** 04-02：寸法を見せてから、途中で比較図へ切り替える */
const ScaleThenCompare: React.FC<ChapterProps> = ({ chapter }) => {
  const { durationInFrames } = span(chapter, "04-02");
  const switchAt = Math.round(durationInFrames * 0.6);
  return (
    <>
      <Sequence durationInFrames={switchAt}>
        <Pyramid3D
          shape="true"
          surface="now"
          missingTopM={missingTop}
          azimuth={0}
          elevation={5}
          distance={2.0}
          center={[960, 560]}
        />
        <DimensionLine
          from={[1420, 790]}
          to={[1420, 320]}
          label="約146.5m"
          side="right"
          delay={8}
        />
        <DimensionLine
          from={[500, 830]}
          to={[1420, 830]}
          label="約230m"
          side="below"
          delay={40}
        />
      </Sequence>
      <Sequence from={switchAt}>
        <PyramidCompare
          visibleKeys={["djoser", "bent", "red", "khufu"]}
          enterKey="khufu"
          highlightKey="khufu"
        />
      </Sequence>
    </>
  );
};

/** 04-03：石のブロックが下から積み上がる */
const Building: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const build = interpolate(f, [0, durationInFrames - 15], [0.05, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <Pyramid3D
      shape="true"
      surface="now"
      build={build}
      azimuth={30}
      spin={3}
      elevation={18}
      distance={2.3}
    />
  );
};

/** 04-04：真上から見た正方形と方位 */
const TopView: React.FC = () => (
  <>
    <Pyramid3D
      shape="true"
      surface="then"
      azimuth={0}
      elevation={88}
      distance={2.1}
      center={[960, 500]}
    />
    {[
      { t: "北", x: 960, y: 70 },
      { t: "南", x: 960, y: 850 },
      { t: "西", x: 470, y: 460 },
      { t: "東", x: 1450, y: 460 },
    ].map((d) => (
      <div
        key={d.t}
        style={{
          position: "absolute",
          left: d.x - 40,
          top: d.y,
          width: 80,
          textAlign: "center",
          fontFamily: GOTHIC,
          fontWeight: 700,
          fontSize: 56,
          color: COLORS.ink,
        }}
      >
        {d.t}
      </div>
    ))}
  </>
);

/** 04-07：今の姿から完成時の姿へ、左から右へワイプ */
const WipeToThen: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = interpolate(f, [10, 60], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Illustration file="04-giza-now.png" zoom={[1.02, 1.02]} />
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
        <Illustration file="04-giza-then.png" zoom={[1.02, 1.06]} />
      </AbsoluteFill>
      {wipe > 0 && wipe < 100 ? (
        <div
          style={{
            position: "absolute",
            left: `${wipe}%`,
            top: 0,
            bottom: 0,
            width: 4,
            background: COLORS.gold,
          }}
        />
      ) : null}
    </>
  );
};

/** 04-09：完成時の姿から今の姿へ戻す */
const WipeToNow: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = interpolate(f, [5, 45], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Illustration file="04-giza-now.png" zoom={[1.02, 1.08]} />
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
        <Illustration file="04-giza-then.png" zoom={[1.02, 1.02]} />
      </AbsoluteFill>
      <Caption
        text={`今の高さ 約${KHUFU.heightNowM}m`}
        x={1440}
        y={140}
        width={700}
        size={56}
        delay={50}
      />
    </>
  );
};

export const Ch04KhufuScale: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="04-01">
      <Pyramid3D
        shape="true"
        surface="now"
        missingTopM={missingTop}
        azimuth={20}
        spin={1.5}
        elevation={3}
        distance={1.6}
        center={[960, 600]}
      />
    </Seg>
    <Seg chapter={chapter} from="04-02">
      <ScaleThenCompare chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="04-03">
      <Building />
    </Seg>
    <Seg chapter={chapter} from="04-04">
      <TopView />
    </Seg>
    <Seg chapter={chapter} from="04-05" to="04-06">
      <Illustration
        file="04-giza-now.png"
        zoom={[1, 1.3]}
        focus={[0.4, 0.55]}
      />
    </Seg>
    <Seg chapter={chapter} from="04-07" to="04-08">
      <WipeToThen />
      <AtLine chapter={chapter} seg="04-07" line="04-08">
        <Caption
          text="完成時の姿（想像図）"
          x={1500}
          y={130}
          width={700}
          size={44}
        />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="04-09">
      <WipeToNow />
    </Seg>
    <Seg chapter={chapter} from="04-10">
      <Illustration file="04-horizon-sunrise.png" zoom={[1, 1.1]} />
      <Caption
        text="アケト・クフ ＝ クフの地平線"
        y={420}
        size={72}
        mincho
        delay={40}
      />
    </Seg>
  </>
);
