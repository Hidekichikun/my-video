import React from "react";
import { Stage } from "../Stage";
import { type ChapterProps } from "../lib";
import { Evidence, Heading, Icons, Note } from "../parts";
export const Ch06Funeral: React.FC<ChapterProps> = ({ chapter }) => (
  <Stage chapter={chapter}>
    {(n) => (
      <>
        {n >= 2 && n <= 6 ? (
          <Heading text="口開けの儀式" top={120} size={52} />
        ) : null}
        {n === 4 ? (
          <Icons
            labels={["食べる", "見る", "呼吸する"]}
            glyphs={["口", "目", "息"]}
          />
        ) : null}
        {n >= 5 && n <= 6 ? (
          <Evidence kind="confirmed" subject="古王国から確認" y={320} />
        ) : null}
        {n === 6 ? (
          <Note text="クフの葬儀の細かい手順は不明" top={470} />
        ) : null}
        {n === 10 || n === 11 ? (
          <>
            <Evidence kind="hypothesis" subject="葬送で使った" y={180} />
            <Evidence kind="hypothesis" subject="死後の世界を旅する" y={315} />
          </>
        ) : null}
        {n >= 17 ? (
          <Heading
            text={n === 17 ? "アケト・クフ" : "アケト・クフ＝クフの地平線"}
            top={150}
            size={56}
          />
        ) : null}
        {n === 20 ? (
          <Heading text="Horizon of Khufu" top={315} size={64} />
        ) : null}
      </>
    )}
  </Stage>
);
