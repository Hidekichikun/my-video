import React from "react";
import { Sequence } from "remotion";
import { KHUFU } from "../../Pyramid/data/facts";
import {
  CrossSection,
  Illustration,
  LabelTag,
  type SectionPart,
} from "../../PyramidPrevis/components";
import {
  AtLine,
  Caption,
  type ChapterProps,
  Seg,
  span,
  useLineIn,
} from "../lib";
import { MuonRain } from "../parts";

/** 06-01〜06-04：断面図の上で、入口から大回廊まで順に光らせる */
const Walk: React.FC<ChapterProps> = ({ chapter }) => {
  const line = useLineIn(chapter, "06-01");
  const map: Record<string, SectionPart[]> = {
    "06-01": [],
    "06-02": ["entrance"],
    "06-03": ["descending"],
  };
  return <CrossSection highlight={map[line] ?? []} />;
};

/** 06-04 の後半で大回廊に切り替える */
const AscendToGallery: React.FC<ChapterProps> = ({ chapter }) => {
  const { durationInFrames } = span(chapter, "06-04");
  const half = Math.round(durationInFrames * 0.5);
  return (
    <>
      <Sequence durationInFrames={half}>
        <CrossSection highlight={["ascending"]} />
      </Sequence>
      <Sequence from={half}>
        <CrossSection highlight={["grandGallery"]} />
      </Sequence>
    </>
  );
};

export const Ch06KhufuInterior: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="06-01" to="06-03">
      <Walk chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="06-04">
      <AscendToGallery chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="06-05" to="06-06">
      <Illustration
        file="06-grand-gallery.png"
        zoom={[1, 1.12]}
        focus={[0.5, 0.45]}
      />
      <Caption
        text={`長さ 約${KHUFU.grandGalleryLengthM}m ／ 高さ 約${KHUFU.grandGalleryHeightM}m`}
        y={110}
        size={52}
        delay={20}
      />
      <AtLine chapter={chapter} seg="06-05" line="06-06">
        <Caption text="持ち送り：壁が段々に内側へせり出す" y={200} size={40} />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="06-07" to="06-08">
      <CrossSection highlight={["queensChamber"]} />
      <AtLine chapter={chapter} seg="06-07" line="06-08">
        <LabelTag
          kind="noEvidence"
          subject="王妃の埋葬"
          x={1180}
          y={640}
          delay={15}
          size={0.9}
        />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="06-09" to="06-10">
      <Illustration
        file="06-kings-chamber.png"
        zoom={[1, 1.15]}
        focus={[0.5, 0.55]}
      />
      <Caption
        text="王の間"
        x={1600}
        y={120}
        width={400}
        size={64}
        mincho
        delay={10}
      />
    </Seg>
    <Seg chapter={chapter} from="06-11">
      <CrossSection highlight={["kingsChamber", "relieving"]} />
    </Seg>
    <Seg chapter={chapter} from="06-12">
      <Illustration
        file="06-crew-graffiti.png"
        zoom={[1.2, 1.3]}
        focus={[0.3, 0.4]}
      />
      <LabelTag
        kind="confirmed"
        subject="作業班の落書き"
        x={120}
        y={120}
        delay={25}
      />
    </Seg>
    <Seg chapter={chapter} from="06-13">
      <MuonRain />
    </Seg>
    <Seg chapter={chapter} from="06-14">
      <CrossSection highlight={["bigVoid"]} />
    </Seg>
    <Seg chapter={chapter} from="06-15">
      <CrossSection highlight={["northCorridor"]} />
    </Seg>
    <Seg chapter={chapter} from="06-16">
      <CrossSection highlight={["bigVoid", "northCorridor"]} />
      <Caption text="？" x={740} y={330} width={200} size={110} delay={15} />
      <Caption text="？" x={330} y={430} width={200} size={90} delay={25} />
    </Seg>
  </>
);
