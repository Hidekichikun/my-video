import React from "react";
import { PopLatePeriod } from "../pop/Parts";
import { Stage } from "../Stage";
import { type ChapterProps } from "../lib";
import { Gods, Heading, Note } from "../parts";
export const Ch07Gods: React.FC<ChapterProps> = ({ chapter }) => (
  <Stage chapter={chapter}>
    {(n) => (
      <>
        {n <= 3 || n === 15 ? <Gods /> : null}
        {n === 4 || n === 5 ? <Heading text="ラー＝太陽" /> : null}
        {n === 6 || n === 7 ? <Heading text="ホルス＝王を守る" /> : null}
        {n === 8 || n === 9 ? <Heading text="アヌビス＝墓地・葬送" /> : null}
        {n >= 10 && n <= 13 ? <Heading text="バステト＝守る力" /> : null}
        {n === 12 || n === 13 ? (
          <Note text="猫の像の多くは後の時代" top={345} />
        ) : null}
        {n === 14 ? (
          <PopLatePeriod text="心臓の計量・死者の書＝クフよりずっと後" />
        ) : null}
      </>
    )}
  </Stage>
);
