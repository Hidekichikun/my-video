import React from "react";
import { AbsoluteFill } from "remotion";
import { KHUFU } from "../../Pyramid/data/facts";
import {
  IconRow,
  Illustration,
  LabelTag,
} from "../../PyramidPrevis/components";
import { COLORS } from "../../PyramidPrevis/theme";
import { AtLine, Caption, type ChapterProps, Seg } from "../lib";
import { GizaPlan, SunCycle } from "../parts";

export const Ch09Afterlife: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="09-01" to="09-02">
      <Illustration file="00-dawn-giza.png" zoom={[1.12, 1]} dim={0.25} />
    </Seg>
    <Seg chapter={chapter} from="09-03">
      <SunCycle />
    </Seg>
    <Seg chapter={chapter} from="09-04">
      <AbsoluteFill style={{ background: COLORS.night }} />
      <IconRow
        dark
        stagger={20}
        items={[
          { glyph: "カー", label: "生命の力" },
          { glyph: "バー", label: "自由に動く魂" },
        ]}
      />
    </Seg>
    <Seg chapter={chapter} from="09-05">
      <AbsoluteFill style={{ background: COLORS.night }} />
      <IconRow
        dark
        stagger={16}
        items={[
          { glyph: "体", label: "体を保つ" },
          { glyph: "名", label: "名前を残す" },
          { glyph: "供", label: "供え物を続ける" },
        ]}
      />
    </Seg>
    <Seg chapter={chapter} from="09-06" to="09-07">
      <Illustration
        file="09-solar-boat.png"
        zoom={[1, 1.1]}
        focus={[0.35, 0.5]}
      />
      <Caption
        text={`全長 約${KHUFU.solarBoatLengthM}m の木の船`}
        y={110}
        size={52}
        delay={15}
      />
      <AtLine chapter={chapter} seg="09-06" line="09-07">
        <LabelTag
          kind="hypothesis"
          subject="王の遺体を運んだ船"
          x={120}
          y={220}
          delay={10}
        />
        <LabelTag
          kind="hypothesis"
          subject="太陽の神と空を旅する船"
          x={120}
          y={330}
          delay={40}
        />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="09-08">
      <Illustration file="09-funeral.png" zoom={[1, 1.1]} />
      <LabelTag
        kind="likely"
        subject="神殿 → 参道 → ピラミッド"
        x={120}
        y={120}
        delay={30}
      />
    </Seg>
    <Seg chapter={chapter} from="09-09">
      <GizaPlan causeway />
    </Seg>
  </>
);
