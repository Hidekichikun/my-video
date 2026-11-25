// 07 オチと次回予告（07-01〜07-13）
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Guide, usePoseTrack, type PoseName } from "../Guide";
import { CrowdScene, PullScene, pullCount } from "../three/FinaleScene";
import { NowBadge, PopArrow, PopBackground, PopBadge } from "../parts";
import { clamp, popOutline } from "../theme";
import { BIG, SMALL, endOf, mixLayout, smallness, startOf, type ChapterProps } from "../lib";

const POSES: Record<number, PoseName> = {
  1: "phone-sparkle",
  2: "fired-up",
  5: "despair",
  8: "think",
  10: "point",
  12: "neutral",
};

const Seq: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Sequence from={at} layout="none">
    {children}
  </Sequence>
);

const BigWord: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 170 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 700,
        top: 380,
        width: 1150,
        textAlign: "center",
        whiteSpace: "nowrap",
        ...popOutline(size),
        transform: `scale(${interpolate(f, [0, 5, 9, 13], [2.2, 0.92, 1.06, 1], clamp)})`,
      }}
    >
      {children}
    </div>
  );
};

export const Ch07: React.FC<ChapterProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const s = (id: string) => startOf(chapter, id);
  const e = (id: string) => endOf(chapter, id);
  const { pose, since } = usePoseTrack(chapter, POSES);

  // 07-04 のあとの4秒の演出（セリフ無し）
  const pullStart = e("07-04") + 6;
  const showPull = frame >= pullStart - 12 && frame < s("07-05") + 10;
  const pullOpacity = interpolate(frame, [s("07-05") + 2, s("07-05") + 10], [1, 0], clamp);
  const u = frame - pullStart;

  // 07-06〜07：ちび先生37人
  const showCrowd = frame >= s("07-06") - 2 && frame < s("07-08") + 10;
  const crowdOpacity = interpolate(frame, [s("07-08") - 4, s("07-08") + 10], [1, 0], clamp);

  const small = smallness(frame, [
    [s("07-03") - 8, s("07-05") + 4],
    [s("07-06") - 6, s("07-08") - 6],
  ]);
  const lay = mixLayout(BIG, SMALL, small);

  return (
    <AbsoluteFill>
      <PopBackground />
      <NowBadge id={chapter.id} title={chapter.shortTitle} />

      {/* 07-02：63%の私？ 37%の私？ */}
      {frame >= s("07-02") && frame < s("07-03") + 10 ? (
        <>
          <Seq at={s("07-02") + 8}>
            <PopBadge tone="meaning" size={96} angle={-3} style={{ position: "absolute", left: 740, top: 200 }}>
              63%の私？
            </PopBadge>
          </Seq>
          <Seq at={s("07-02") + 82}>
            <PopBadge tone="miss" size={96} angle={3} style={{ position: "absolute", left: 900, top: 420 }}>
              37%の私？
            </PopBadge>
          </Seq>
        </>
      ) : null}

      {/* 07-03〜04：いきます。100連！ */}
      {frame >= s("07-04") && frame < pullStart + 8 ? (
        <Seq at={s("07-04")}>
          <BigWord>100連！</BigWord>
        </Seq>
      ) : null}

      {/* 07-04 のあと：カプセルが次々開く → 最後の1個が金に光りかけて灰色 */}
      {showPull ? <PullScene start={pullStart} opacity={pullOpacity} /> : null}
      {showPull && u >= 0 ? (
        <AbsoluteFill style={{ opacity: pullOpacity }}>
          <div
            style={{
              position: "absolute",
              left: 700,
              top: 40,
              width: 1150,
              textAlign: "center",
              whiteSpace: "nowrap",
              ...popOutline(104),
            }}
          >
            {`${pullCount(u)}連目`}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 07-06〜07：おかえり */}
      {showCrowd ? <CrowdScene start={s("07-06")} opacity={crowdOpacity} /> : null}
      {frame >= s("07-06") && frame < s("07-08") + 10 ? (
        <Seq at={s("07-06") + 10}>
          <div style={{ opacity: crowdOpacity }}>
            <PopBadge tone="note" size={104} angle={-3} style={{ position: "absolute", left: 800, top: 40 }}>
              おかえり！
            </PopBadge>
          </div>
        </Seq>
      ) : null}

      {/* 07-08〜11：平均で何回で当たる？ → 次回予告 */}
      {frame >= s("07-09") ? (
        <Seq at={s("07-09")}>
          <PopBadge tone="meaning" size={72} angle={-2} style={{ position: "absolute", left: 720, top: 200 }}>
            平均で何回で当たる？
          </PopBadge>
        </Seq>
      ) : null}
      {frame >= s("07-10") ? (
        <Seq at={s("07-10")}>
          <div style={{ position: "absolute", left: 720, top: 470, display: "flex", alignItems: "center", gap: 22 }}>
            <PopBadge tone="term" size={70} angle={-3}>
              次回
            </PopBadge>
            <PopArrow width={100} height={82} />
            <Seq at={s("07-11") - s("07-10")}>
              <PopBadge tone="note" size={80} angle={2}>
                期待値（宝くじ）
              </PopBadge>
            </Seq>
          </div>
        </Seq>
      ) : null}

      <Guide chapter={chapter} pose={pose} since={since} x={lay.x} footY={lay.footY} height={lay.height} />
    </AbsoluteFill>
  );
};
