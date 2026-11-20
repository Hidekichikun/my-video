import React from "react";
import { Stage } from "../Stage";
import { type ChapterProps } from "../lib";
import { Heading, Note, TemplePlan, TombCards } from "../parts";
export const Ch04Tomb: React.FC<ChapterProps> = ({ chapter }) => (
  <Stage chapter={chapter}>
    {(n) => (
      <>
        {n <= 3 ? <TombCards /> : null}
        {n >= 4 && n <= 7 ? (
          <>
            <Heading text="①偽扉" />
            {n >= 6 ? (
              <Heading text="生者と死者の世界をつなぐ" top={345} size={48} />
            ) : null}
          </>
        ) : null}
        {n >= 8 && n <= 10 ? (
          <>
            <Heading text="②セルダブ" />
            {n === 10 ? <Heading text="像が存在を保つ" top={345} /> : null}
          </>
        ) : null}
        {n >= 11 && n <= 14 ? (
          <>
            <Heading text="③供物リスト" />
            {n === 14 ? (
              <Note text="※例はクフより少し後・第5王朝の墓" top={355} />
            ) : null}
          </>
        ) : null}
        {n === 16 ? <TemplePlan /> : null}
        {n === 17 ? (
          <>
            <TombCards reveal />
            <Heading text="ピラミッド＝儀式を続ける装置" top={720} size={52} />
          </>
        ) : null}
      </>
    )}
  </Stage>
);
