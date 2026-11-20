import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import {
  CrossSection,
  Illustration,
  PyramidCompare,
} from "../../PyramidPrevis/components";
import { COLORS } from "../../PyramidPrevis/theme";
import { Caption, type ChapterProps, Seg, span, useLineIn } from "../lib";
import { SevenWonders } from "../parts";

const CompareKhufu: React.FC<ChapterProps> = ({ chapter }) => {
  const line = useLineIn(chapter, "10-01");
  return (
    <PyramidCompare
      dark
      highlightKey={line === "10-02" ? "khufu" : undefined}
    />
  );
};

/** 10-04〜10-05：左にほかのピラミッド、右にクフの断面を並べる */
const SectionCompare: React.FC<ChapterProps> = ({ chapter }) => {
  const line = useLineIn(chapter, "10-04");
  return (
    <>
      <AbsoluteFill style={{ background: COLORS.night }} />
      <CrossSection
        variant="typical"
        highlight={line === "10-04" ? ["kingsChamber"] : []}
        center={500}
        pxPerM={2.6}
        background={false}
        showLabels={false}
        caption={false}
      />
      <CrossSection
        highlight={line === "10-05" ? ["kingsChamber"] : []}
        center={1420}
        pxPerM={2.6}
        background={false}
        showLabels={false}
        caption={false}
      />
      <Caption text="ほかのピラミッド" x={500} y={790} width={600} size={44} />
      <Caption
        text="クフ"
        x={1420}
        y={790}
        width={600}
        size={44}
        color={COLORS.gold}
      />
    </>
  );
};

/** 10-06：大回廊 → 王の間 → 5段の空間 を順に光らせる */
const ThreeParts: React.FC<ChapterProps> = ({ chapter }) => {
  const { durationInFrames } = span(chapter, "10-06");
  const third = Math.round(durationInFrames / 3);
  return (
    <>
      <Sequence durationInFrames={third}>
        <CrossSection highlight={["grandGallery"]} />
      </Sequence>
      <Sequence from={third} durationInFrames={third}>
        <CrossSection highlight={["grandGallery", "kingsChamber"]} />
      </Sequence>
      <Sequence from={third * 2}>
        <CrossSection
          highlight={["grandGallery", "kingsChamber", "relieving"]}
        />
      </Sequence>
    </>
  );
};

export const Ch10KhufuUnique: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="10-01" to="10-02">
      <CompareKhufu chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="10-03">
      <CrossSection />
      <Caption text="本当に特別なのは、内側" y={110} size={52} delay={15} />
    </Seg>
    <Seg chapter={chapter} from="10-04" to="10-05">
      <SectionCompare chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="10-06">
      <ThreeParts chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="10-07">
      <SevenWonders
        fadeAt={Math.round(span(chapter, "10-07").durationInFrames * 0.35)}
      />
    </Seg>
    <Seg chapter={chapter} from="10-08">
      <PyramidCompare
        dark
        sweepEvery={Math.max(
          12,
          Math.floor(span(chapter, "10-08").durationInFrames / 8),
        )}
      />
    </Seg>
    <Seg chapter={chapter} from="10-09">
      <Illustration file="10-horizon.png" zoom={[1, 1.12]} />
      <Caption text="クフの地平線" y={150} size={96} mincho delay={20} />
    </Seg>
  </>
);
