import React from "react";
import { AbsoluteFill } from "remotion";
import {
  IconRow,
  Illustration,
  LabelTag,
  NileMap,
  Pyramid3D,
  ZoomMap,
} from "../../PyramidPrevis/components";
import { COLORS } from "../../PyramidPrevis/theme";
import { AtLine, Caption, type ChapterProps, Seg, startOf } from "../lib";
import { RampTheories } from "../parts";

const JOBS = [
  { glyph: "石", label: "石工", group: 0 },
  { glyph: "船", label: "船乗り", group: 1 },
  { glyph: "測", label: "測量", group: 0 },
  { glyph: "記", label: "記録係", group: 2 },
  { glyph: "パ", label: "パン職人", group: 2 },
];

export const Ch05KhufuBuilders: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="05-01">
      <Illustration file="05-workers-town.png" zoom={[1.15, 1.05]} dim={0.15} />
    </Seg>
    <Seg chapter={chapter} from="05-02">
      <AbsoluteFill style={{ background: COLORS.night }} />
      <LabelTag
        kind="noEvidence"
        subject="「奴隷が造った」説"
        x={520}
        y={400}
        delay={25}
        size={1.3}
      />
    </Seg>
    <Seg chapter={chapter} from="05-03">
      <ZoomMap keyframes={[{ at: 0, view: "giza" }]} />
      <Caption
        text="労働者の町はスフィンクスの南"
        x={1400}
        y={120}
        width={900}
        color={COLORS.ink}
        size={44}
        delay={20}
      />
    </Seg>
    <Seg chapter={chapter} from="05-04">
      <Illustration file="05-workers-town.png" zoom={[1, 1.12]} />
    </Seg>
    <Seg chapter={chapter} from="05-05" to="05-06">
      <AbsoluteFill style={{ background: COLORS.sand }} />
      <IconRow
        items={JOBS}
        stagger={14}
        groupAt={startOf(chapter, "05-06") - startOf(chapter, "05-05")}
      />
      <AtLine chapter={chapter} seg="05-05" line="05-06">
        <Caption
          text="多くの専門家と、交代で働く作業班"
          y={140}
          color={COLORS.ink}
          size={48}
        />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="05-07">
      <NileMap
        view="egypt"
        places={["giza", "luxor", "aswan"]}
        highlight="giza"
        converge
      />
    </Seg>
    <Seg chapter={chapter} from="05-08">
      <NileMap
        view="memphis"
        places={["giza", "wadiElJarf"]}
        highlight="wadiElJarf"
      />
    </Seg>
    <Seg chapter={chapter} from="05-09">
      <Illustration
        file="05-merer-papyrus.png"
        zoom={[1.05, 1.15]}
        focus={[0.45, 0.6]}
      />
      <Caption
        text="メレルの日誌"
        x={1500}
        y={130}
        width={600}
        size={60}
        mincho
        delay={10}
      />
    </Seg>
    <Seg chapter={chapter} from="05-10">
      <Illustration
        file="05-boat-stone.png"
        zoom={[1, 1.1]}
        focus={[0.4, 0.5]}
      />
    </Seg>
    <Seg chapter={chapter} from="05-11">
      <NileMap
        view="memphis"
        places={["giza", "tura", "saqqara"]}
        highlight="giza"
        routes={[["tura", "giza"]]}
        showAncientBranch
      />
    </Seg>
    <Seg chapter={chapter} from="05-12" to="05-13">
      <Illustration
        file="05-sledge-sand.png"
        zoom={[1, 1.12]}
        focus={[0.6, 0.6]}
      />
      <AtLine chapter={chapter} seg="05-12" line="05-13">
        <LabelTag
          kind="confirmed"
          subject="湿った砂は引きやすい"
          x={120}
          y={120}
          delay={20}
        />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="05-14">
      <Pyramid3D
        shape="true"
        surface="now"
        build={0.72}
        azimuth={20}
        spin={1.5}
        elevation={3}
        distance={1.7}
        center={[960, 640]}
      />
    </Seg>
    <Seg chapter={chapter} from="05-15" to="05-16">
      <RampTheories
        tagsAt={startOf(chapter, "05-16") - startOf(chapter, "05-15")}
      />
    </Seg>
  </>
);
