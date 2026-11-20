import React from "react";
import { PYRAMIDS, SPHINX } from "../../Pyramid/data/facts";
import {
  Illustration,
  LabelTag,
  Pyramid3D,
  PyramidCompare,
} from "../../PyramidPrevis/components";
import { AtLine, Caption, type ChapterProps, Seg } from "../lib";
import { GizaPlan, GroundDifference } from "../parts";

const khafre = PYRAMIDS.find((p) => p.key === "khafre")!;
const upToKhafre = ["djoser", "bent", "red", "khufu", "khafre"];
const upToMenkaure = [...upToKhafre, "menkaure"];

export const Ch07KhafreMenkaure: React.FC<ChapterProps> = ({ chapter }) => (
  <>
    <Seg chapter={chapter} from="07-01">
      <GizaPlan />
    </Seg>
    <Seg chapter={chapter} from="07-02">
      <PyramidCompare
        visibleKeys={upToKhafre}
        enterKey="khafre"
        highlightKey="khafre"
      />
    </Seg>
    <Seg chapter={chapter} from="07-03">
      <GroundDifference />
    </Seg>
    <Seg chapter={chapter} from="07-04">
      <Pyramid3D
        shape="true"
        surface="now"
        heightM={khafre.heightM}
        baseM={khafre.baseM}
        whiteCapM={38}
        azimuth={25}
        spin={2}
        elevation={6}
        distance={1.9}
        center={[960, 600]}
      />
      <Caption
        text="頂上付近に残る白い化粧石"
        y={110}
        size={48}
        color="#1B1E26"
        delay={20}
      />
    </Seg>
    <Seg chapter={chapter} from="07-05" to="07-06">
      <Illustration file="07-sphinx.png" zoom={[1, 1.1]} focus={[0.5, 0.4]} />
      <Caption
        text={`大スフィンクス ／ 全長 約${SPHINX.lengthM}m`}
        y={110}
        size={52}
        delay={15}
      />
      <AtLine chapter={chapter} seg="07-05" line="07-06">
        <LabelTag
          kind="likely"
          subject="顔はカフラー王"
          x={120}
          y={220}
          delay={15}
        />
      </AtLine>
    </Seg>
    <Seg chapter={chapter} from="07-07">
      <PyramidCompare
        visibleKeys={upToMenkaure}
        enterKey="menkaure"
        highlightKey="menkaure"
      />
    </Seg>
    <Seg chapter={chapter} from="07-08">
      <PyramidCompare
        visibleKeys={upToMenkaure}
        highlightKey="menkaure"
        graniteKeys={["menkaure"]}
      />
    </Seg>
  </>
);
