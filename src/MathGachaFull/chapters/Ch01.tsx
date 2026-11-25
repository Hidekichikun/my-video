// 01 1%ってどういう意味？（01-01〜01-11）
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Guide, usePoseTrack, type PoseName } from "../Guide";
import { WallScene, type WallTimes } from "../three/WallScene";
import { CapsuleArt, IconCircle, NowBadge, PopArrow, PopBackground, PopBadge } from "../parts";
import { POP, POP_HEADING, clamp, popScale } from "../theme";
import { BIG, SMALL, mixLayout, smallness, startOf, type ChapterProps } from "../lib";

const POSES: Record<number, PoseName> = { 1: "neutral", 3: "point", 4: "neutral" };

const Seq: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Sequence from={at} layout="none">
    {children}
  </Sequence>
);

export const Ch01: React.FC<ChapterProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const s = (id: string) => startOf(chapter, id);
  const { pose, since } = usePoseTrack(chapter, POSES);

  const wall: WallTimes = {
    appear: s("01-01") + 6,
    gold: s("01-02") + 34,
    again: s("01-05"),
    roll: s("01-05") + 40,
    shuffle: s("01-05") + 70,
  };
  const wall1 = frame < s("01-03") + 14;
  const wall2 = frame >= s("01-05") - 36 && frame < s("01-06") + 10;
  const wallOpacity = wall1
    ? interpolate(frame, [s("01-03"), s("01-03") + 14], [1, 0], clamp)
    : wall2
      ? interpolate(frame, [s("01-06") - 8, s("01-06") + 10], [1, 0], clamp)
      : 0;

  const small = smallness(frame, [
    [0, s("01-03") + 6],
    [s("01-05") - 20, s("01-06") + 10],
  ]);
  const lay = mixLayout(BIG, SMALL, small);

  return (
    <AbsoluteFill>
      <PopBackground />
      {wallOpacity > 0 ? <WallScene t={wall} opacity={wallOpacity} /> : null}
      <NowBadge id={chapter.id} title={chapter.shortTitle} />

      {/* 01-02：1% ＝ 100回に1回くらい */}
      {frame >= s("01-02") && frame < s("01-03") + 14 ? (
        <Seq at={s("01-02")}>
          <PopBadge tone="meaning" size={54} angle={-2} style={{ position: "absolute", left: 200, top: 250, whiteSpace: "normal", lineHeight: 1.4 }}>
            1% ＝
            <br />
            100回に1回くらい
          </PopBadge>
        </Seq>
      ) : null}

      {/* 01-03：ここが大事 */}
      {frame >= s("01-03") && frame < s("01-04") ? (
        <Seq at={s("01-03")}>
          <PopBadge tone="note" size={78} angle={-3} style={{ position: "absolute", left: 760, top: 300 }}>
            ここが大事！
          </PopBadge>
        </Seq>
      ) : null}

      {/* 01-03〜04：札を2つ並べる ≠ */}
      {frame >= s("01-04") && frame < s("01-05") - 6 ? (
        <>
          <Seq at={s("01-04")}>
            <PopBadge tone="term" size={64} angle={-2} style={{ position: "absolute", left: 800, top: 170 }}>
              100回に1回くらい
            </PopBadge>
          </Seq>
          <Seq at={s("01-04") + 62}>
            <NotEqual />
          </Seq>
          <Seq at={s("01-04") + 100}>
            <PopBadge tone="meaning" size={64} angle={2} style={{ position: "absolute", left: 800, top: 600 }}>
              100回で必ず1回
            </PopBadge>
          </Seq>
        </>
      ) : null}

      {/* 01-06〜07：当たり1% ／ ハズレ99% */}
      {frame >= s("01-06") && frame < s("01-08") ? (
        <>
          <Seq at={s("01-06")}>
            <PopBadge tone="meaning" size={84} angle={-2} style={{ position: "absolute", left: 760, top: 200 }}>
              当たり 1%
            </PopBadge>
          </Seq>
          <Seq at={s("01-06") + 28}>
            <PopBadge tone="miss" size={84} angle={2} style={{ position: "absolute", left: 760, top: 420 }}>
              ハズレ 99%
            </PopBadge>
          </Seq>
          <Seq at={s("01-06") + 14}>
            <div style={{ position: "absolute", left: 1450, top: 230 }}>
              <IconCircle label="ハズレ" color="#D8D8DE" size={250}>
                <CapsuleArt size={170} kind="miss" />
              </IconCircle>
            </div>
          </Seq>
        </>
      ) : null}

      {/* 01-08〜09：101回 → 101%？ */}
      {frame >= s("01-08") && frame < s("01-10") ? (
        <Seq at={s("01-08")}>
          <div style={{ position: "absolute", left: 700, top: 260, display: "flex", alignItems: "center", gap: 30 }}>
            <PopBadge tone="term" size={90} angle={-2}>
              101回
            </PopBadge>
            <PopArrow width={130} height={106} />
            <Seq at={14}>
              <PopBadge tone="note" size={96} angle={2}>
                101%？
              </PopBadge>
            </Seq>
          </div>
        </Seq>
      ) : null}

      {/* 01-10〜11：1% × 100 ＝ 100% に赤い×のハンコ */}
      {frame >= s("01-10") ? (
        <Seq at={s("01-10")}>
          <Formula />
          <Seq at={46}>
            <RedStamp />
          </Seq>
        </Seq>
      ) : null}

      <Guide chapter={chapter} pose={pose} since={since} x={lay.x} footY={lay.footY} height={lay.height} />
    </AbsoluteFill>
  );
};

const NotEqual: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 1020,
        top: 330,
        fontFamily: POP_HEADING,
        fontSize: 210,
        lineHeight: 1,
        color: POP.pink,
        WebkitTextStroke: `9px ${POP.ink}`,
        paintOrder: "stroke",
        transform: `scale(${popScale(f)}) rotate(${interpolate(f, [0, 8], [-25, 0], clamp)}deg)`,
      }}
    >
      ≠
    </div>
  );
};

const Formula: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 650,
      top: 330,
      width: 1200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
    }}
  >
    <PopBadge tone="meaning" size={96} angle={-3}>
      1%
    </PopBadge>
    <span style={{ fontFamily: POP_HEADING, fontSize: 84, color: POP.ink }}>×</span>
    <PopBadge tone="term" size={96} angle={2} delay={4}>
      100
    </PopBadge>
    <span style={{ fontFamily: POP_HEADING, fontSize: 84, color: POP.ink }}>＝</span>
    <PopBadge tone="note" size={112} angle={-2} delay={8}>
      100%
    </PopBadge>
  </div>
);

/** 赤い大きな×のハンコ（ポンと押される） */
const RedStamp: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 4, 8, 12], [2.6, 0.9, 1.06, 1], clamp);
  return (
    <svg
      width={560}
      height={560}
      viewBox="0 0 240 240"
      style={{
        position: "absolute",
        left: 970,
        top: 110,
        overflow: "visible",
        opacity: f < 0 ? 0 : 0.96,
        transform: `rotate(-12deg) scale(${s})`,
      }}
    >
      <circle cx={120} cy={120} r={111} fill="none" stroke={POP.red} strokeWidth={12} />
      <path d="M 57 57 L 183 183 M 183 57 L 57 183" stroke={POP.red} strokeWidth={18} strokeLinecap="square" opacity={0.92} />
    </svg>
  );
};
