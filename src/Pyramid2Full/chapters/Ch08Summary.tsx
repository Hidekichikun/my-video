import React from "react";
import { Stage } from "../Stage";
import { type ChapterProps } from "../lib";
import { Panel, SummaryChecklist, PreviousVideo } from "../parts";
export const Ch08Summary: React.FC<ChapterProps> = ({ chapter }) => (
  <Stage chapter={chapter}>
    {(n) => (
      <>
        {n >= 2 && n <= 5 ? <SummaryChecklist count={n - 1} /> : null}
        {n >= 7 && n <= 9 ? (
          <Panel mincho top={330} size={80} width={1390}>
            {["① 何を支えるもの？", "② なぜここに？", "③ 何を願った？"][n - 7]}
          </Panel>
        ) : null}
        {n >= 12 ? <PreviousVideo /> : null}
      </>
    )}
  </Stage>
);
