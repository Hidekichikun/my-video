import React from "react";
import { Stage } from "../Stage";
import { type ChapterProps } from "../lib";
import { FloodScale, Heading, Note } from "../parts";
export const Ch01Life: React.FC<ChapterProps> = ({ chapter }) => (
  <Stage chapter={chapter}>
    {(n) => (
      <>
        {n === 4 || n === 5 ? <FloodScale /> : null}
        {n === 7 || n === 8 ? (
          <Heading text="毎日の食事　／　働いた人への配給" />
        ) : null}
        {n === 9 ? <Heading text="亜麻 → リネン" /> : null}
        {n >= 11 && n <= 12 ? <Heading text="コール＝目元の化粧" /> : null}
        {n === 12 ? <Note text="※例は裕福な人の墓から" top={335} /> : null}
      </>
    )}
  </Stage>
);
