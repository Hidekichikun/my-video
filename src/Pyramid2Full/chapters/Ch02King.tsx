import React from "react";
import { Stage } from "../Stage";
import { type ChapterProps } from "../lib";
import { Heading, Icons, KingTriangle, Note } from "../parts";
export const Ch02King: React.FC<ChapterProps> = ({ chapter }) => (
  <Stage chapter={chapter}>
    {(n) => (
      <>
        {n === 3 ? <KingTriangle /> : null}
        {n === 4 || n === 5 ? (
          <Heading text={n === 4 ? "マアト" : "マアト＝正しさ・秩序"} />
        ) : null}
        {n === 6 || n === 7 ? (
          <>
            <Icons
              labels={["太陽が昇る", "川が増水する", "社会が乱れない"]}
              glyphs={["日", "川", "国"]}
            />
            {n === 7 ? <Heading text="＝王の役目" top={650} /> : null}
          </>
        ) : null}
        {n >= 9 && n <= 10 ? (
          <Note text="カフラー王（クフの息子）の像をもとにした想像図" />
        ) : null}
      </>
    )}
  </Stage>
);
