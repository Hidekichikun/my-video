import React from "react";
import { Stage } from "../Stage";
import { type ChapterProps } from "../lib";
import { Icons, Panel } from "../parts";
export const Ch00Intro: React.FC<ChapterProps> = ({ chapter }) => (
  <Stage chapter={chapter}>
    {(n) => (
      <>
        {n <= 2 ? (
          <>
            <Panel width={700} center={510} top={370}>
              前回：どう造った？
            </Panel>
            {n === 2 ? (
              <Panel width={700} center={1410} top={370}>
                今回：なぜ造った？
              </Panel>
            ) : null}
          </>
        ) : null}
        {n === 3 ? (
          <Panel mincho size={96} top={340} width={1440}>
            なぜ、死後のために？
          </Panel>
        ) : null}
        {n >= 5 ? (
          <Icons
            labels={["ナイルの暮らし", "王という存在", "死後も生き続ける"]}
            visibleCount={Math.min(3, n - 4)}
            glyphs={["川", "王", "生"]}
            glow={n === 8}
          />
        ) : null}
      </>
    )}
  </Stage>
);
