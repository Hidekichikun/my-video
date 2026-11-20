import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  HistoryLine,
  IconRow,
  Illustration,
  NileMap,
  ZoomMap,
} from "../../PyramidPrevis/components";
import { AtLine, type ChapterProps, Seg, startOf, useLineIn } from "../lib";

/** 01-01〜01-03：年表に1つずつ足していく */
const Timeline: React.FC<ChapterProps> = ({ chapter }) => {
  const line = useLineIn(chapter, "01-01");
  return (
    <HistoryLine
      visibleKeys={line === "01-01" ? ["khufu"] : ["khufu", "now"]}
      highlightKey="khufu"
      notes={line === "01-03" ? ["日本：縄文時代", "エジプト：古王国"] : []}
    />
  );
};

/** 01-04〜01-06：アフリカ → エジプト → ギザ と寄り、01-06 でエジプト全体に戻す */
const ZoomScene: React.FC<ChapterProps> = ({ chapter }) => {
  const f = useCurrentFrame();
  const at = (id: string) => startOf(chapter, id) - startOf(chapter, "01-04");
  const toGiza = at("01-05");
  const back = at("01-06");
  return (
    <ZoomMap
      showFertileBand={f >= back}
      keyframes={[
        { at: 0, view: "africa" },
        { at: 40, view: "africa" },
        { at: Math.max(100, toGiza - 20), view: "egypt" },
        { at: toGiza + 10, view: "egypt" },
        { at: toGiza + 110, view: "giza" },
        { at: back, view: "giza" },
        { at: back + 60, view: "egypt" },
      ]}
    />
  );
};

export const Ch01Background: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="01-01" to="01-03">
      <Timeline chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="01-04" to="01-06">
      <ZoomScene chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="01-07" to="01-08">
      <Illustration file="01-nile-fields.png" zoom={[1, 1.1]} />
      <AtLine chapter={chapter} seg="01-07" line="01-08">
        <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)" }} />
        <IconRow
          dark
          y={600}
          stagger={10}
          items={[
            { glyph: "穀", label: "穀物" },
            { glyph: "倉", label: "倉庫" },
            { glyph: "パン", label: "パンとビール" },
            { glyph: "人", label: "人々へ" },
          ]}
        />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="01-09" to="01-10">
      <Illustration
        file="01-king-gods.png"
        zoom={[1.1, 1]}
        focus={[0.5, 0.4]}
      />
    </Seg>
    <Seg chapter={chapter} from="01-11">
      <NileMap
        view="egypt"
        places={["giza", "luxor", "aswan"]}
        highlight="giza"
        converge
      />
    </Seg>
  </>
);
