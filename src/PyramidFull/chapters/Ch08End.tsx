import React from "react";
import {
  HistoryLine,
  Illustration,
  LabelTag,
  NileMap,
  Pyramid3D,
  PyramidCompare,
} from "../../PyramidPrevis/components";
import {
  AtLine,
  Caption,
  type ChapterProps,
  Seg,
  Split,
  useLineIn,
} from "../lib";

const Compare: React.FC<ChapterProps> = ({ chapter }) => {
  const line = useLineIn(chapter, "08-01");
  return (
    <PyramidCompare highlightKey={line === "08-03" ? "unas" : undefined} />
  );
};

const ToTut: React.FC<ChapterProps> = ({ chapter }) => {
  const line = useLineIn(chapter, "08-07");
  return line === "08-07" ? (
    <HistoryLine
      visibleKeys={["djoser", "khufu", "unas", "now"]}
      highlightKey="unas"
    />
  ) : (
    <HistoryLine
      visibleKeys={["khufu", "tut", "cleopatra", "now"]}
      highlightKey="tut"
      bracket={{ from: "khufu", to: "tut", label: "約1200年後" }}
    />
  );
};

export const Ch08End: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="08-01" to="08-03">
      <Compare chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="08-04" to="08-05">
      <Illustration file="08-pyramid-texts.png" zoom={[1, 1.12]} />
      <AtLine chapter={chapter} seg="08-04" line="08-05">
        <Caption text="ピラミッド・テキスト" y={130} size={80} mincho />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="08-06">
      <Split
        leftLabel="石の量"
        rightLabel="言葉と祈り"
        left={
          <Pyramid3D
            shape="true"
            surface="now"
            center={[480, 560]}
            distance={3.0}
            spin={2}
          />
        }
        right={
          <Illustration
            file="08-pyramid-texts.png"
            zoom={[1.1, 1.1]}
            focus={[0.7, 0.5]}
          />
        }
      />
    </Seg>
    <Seg chapter={chapter} from="08-07" to="08-08">
      <ToTut chapter={chapter} />
    </Seg>
    <Seg chapter={chapter} from="08-09">
      <NileMap
        view="egypt"
        places={["giza", "luxor"]}
        highlight="luxor"
        routes={[["giza", "luxor"]]}
      />
    </Seg>
    <Seg chapter={chapter} from="08-10">
      <Illustration
        file="08-valley-kings.png"
        zoom={[1, 1.1]}
        focus={[0.5, 0.35]}
      />
      <LabelTag
        kind="likely"
        subject="墓を隠すため"
        x={120}
        y={120}
        delay={30}
      />
    </Seg>
    <Seg chapter={chapter} from="08-11">
      <Illustration file="08-tomb-light.png" zoom={[1, 1.15]} />
    </Seg>
    <Seg chapter={chapter} from="08-12">
      <Split
        leftLabel="目立たせたクフ"
        rightLabel="隠したツタンカーメン"
        left={
          <Illustration
            file="04-giza-now.png"
            zoom={[1.1, 1.1]}
            focus={[0.5, 0.5]}
          />
        }
        right={
          <Illustration
            file="08-valley-kings.png"
            zoom={[1.1, 1.1]}
            focus={[0.5, 0.5]}
          />
        }
      />
    </Seg>
  </>
);
