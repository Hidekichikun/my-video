// 04 「そろそろ来る」はウソ（04-01〜04-15）
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Guide, usePoseTrack, type PoseName } from "../Guide";
import { CoinsScene, TenPullsScene } from "../three/PullsScene";
import { IconCircle, NowBadge, PopArrow, PopBackground, PopBadge, ResetArt } from "../parts";
import { POP, clamp, popScale } from "../theme";
import { BIG, SMALL, mixLayout, smallness, startOf, type ChapterProps } from "../lib";

const POSES: Record<number, PoseName> = {
  1: "phone-sparkle",
  3: "neutral",
  4: "think",
  5: "fired-up",
  8: "point",
  14: "think",
  15: "neutral",
};

const Seq: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Sequence from={at} layout="none">
    {children}
  </Sequence>
);

/** 先生の頭の上にちび先生がポンと出てツッコむ */
const Tsukkomi: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [70, 82], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 440,
        top: 10,
        width: 400,
        height: 400,
        opacity: out,
        transformOrigin: "50% 90%",
        transform: `translateY(${interpolate(f, [0, 6, 12], [60, -20, 0], clamp)}px) scale(${popScale(f)}) rotate(${Math.sin(f / 3) * 3}deg)`,
      }}
    >
      <Img src={staticFile("photo/math-guide/chibi-tsukkomi.png")} style={{ width: "100%", height: "100%" }} />
      <svg width={400} height={400} viewBox="0 0 400 400" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d="M 40 90 L 8 70 M 30 140 L -6 140 M 52 40 L 36 10" stroke={POP.ink} strokeWidth={8} strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const Ch04: React.FC<ChapterProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const s = (id: string) => startOf(chapter, id);
  const { pose, since } = usePoseTrack(chapter, POSES);

  const starts = [s("04-02"), s("04-03"), s("04-04"), s("04-04") + 23, s("04-04") + 46];
  const pullsEnd = s("04-07") - 4;
  const showPulls = frame >= s("04-02") - 4 && frame < pullsEnd + 2;
  const pullCount = starts.filter((a) => frame >= a).length;

  const coinStart = s("04-12") + 6;
  const coinEnd = s("04-12") + 150;
  const showCoins = frame >= s("04-11") - 4 && frame < s("04-14") - 4;

  const small = smallness(frame, [
    [s("04-02") - 8, s("04-07") - 6],
    [s("04-11") - 6, s("04-14") - 6],
  ]);
  const lay = mixLayout(BIG, SMALL, small);

  return (
    <AbsoluteFill>
      <PopBackground />
      <NowBadge id={chapter.id} title={chapter.shortTitle} />

      {/* 04-02〜06：10連 ×5 → 50連 ハズレ */}
      {showPulls ? <TenPullsScene starts={starts} end={pullsEnd} /> : null}
      {frame >= s("04-02") && frame < s("04-05") ? (
        <PopBadge tone="term" size={64} angle={-2} still style={{ position: "absolute", left: 690, top: 40 }}>
          {`10連 × ${pullCount}`}
        </PopBadge>
      ) : null}
      {frame >= s("04-05") && frame < pullsEnd ? (
        <Seq at={s("04-05")}>
          <PopBadge tone="miss" size={78} angle={-2} style={{ position: "absolute", left: 690, top: 30 }}>
            50連 ハズレ
          </PopBadge>
        </Seq>
      ) : null}

      {/* 04-07：ちび先生のツッコミ */}
      {frame >= s("04-07") && frame < s("04-07") + 84 ? (
        <Seq at={s("04-07")}>
          <Tsukkomi />
        </Seq>
      ) : null}

      {/* 04-08〜10：確率は毎回リセット・51回目も1% */}
      {frame >= s("04-08") && frame < s("04-11") ? (
        <>
          <Seq at={s("04-08")}>
            <PopBadge tone="term" size={72} angle={-2} style={{ position: "absolute", left: 700, top: 130 }}>
              確率は毎回リセット
            </PopBadge>
            <div style={{ position: "absolute", left: 1500, top: 70 }}>
              <IconCircle label="リセット" color={POP.green} size={230} delay={10}>
                <ResetArt size={165} />
              </IconCircle>
            </div>
          </Seq>
          {frame >= s("04-09") ? (
            <Seq at={s("04-09")}>
              <div style={{ position: "absolute", left: 700, top: 520, display: "flex", alignItems: "center", gap: 26 }}>
                <PopBadge tone="term" size={76} angle={-2}>
                  51回目
                </PopBadge>
                <PopArrow width={120} height={98} />
                <PopBadge tone="meaning" size={110} angle={2} delay={6}>
                  1%のまま
                </PopBadge>
              </div>
            </Seq>
          ) : null}
        </>
      ) : null}

      {/* 04-11〜13：コイン10回連続で表 → 次も 1/2 */}
      {showCoins ? (
        <CoinsScene start={coinStart} end={coinEnd} next={s("04-13")} />
      ) : null}
      {frame >= s("04-12") && frame < s("04-14") - 4 ? (
        <Seq at={s("04-12")}>
          <PopBadge tone="term" size={64} angle={-2} style={{ position: "absolute", left: 690, top: 40 }}>
            表が10回連続
          </PopBadge>
        </Seq>
      ) : null}
      {frame >= s("04-12") + 118 && frame < s("04-14") - 4 ? (
        <Seq at={s("04-12") + 118}>
          <div style={{ position: "absolute", left: 1210, top: 40, display: "flex", alignItems: "center", gap: 16 }}>
            <PopArrow width={90} height={74} />
            <PopBadge tone="meaning" size={72} angle={2}>
              次も 1/2
            </PopBadge>
          </div>
        </Seq>
      ) : null}
      {frame >= s("04-13") && frame < s("04-14") - 4 ? (
        <Seq at={s("04-13")}>
          <PopBadge tone="note" size={46} angle={-2} style={{ position: "absolute", left: 1000, top: 190 }}>
            前の結果は知らない
          </PopBadge>
        </Seq>
      ) : null}

      {/* 04-14〜15：ギャンブラーの誤謬 */}
      {frame >= s("04-14") && frame < s("04-15") ? (
        <>
          <Seq at={s("04-14") + 30}>
            <PopBadge tone="card" size={66} angle={-4} style={{ position: "absolute", left: 760, top: 180 }}>
              「流れが来てる！」
            </PopBadge>
          </Seq>
          <Seq at={s("04-14") + 80}>
            <PopBadge tone="card" size={66} angle={3} style={{ position: "absolute", left: 960, top: 360 }}>
              「そろそろ来る！」
            </PopBadge>
          </Seq>
          <Seq at={s("04-14") + 130}>
            <PopBadge tone="note" size={50} angle={-2} style={{ position: "absolute", left: 1140, top: 560 }}>
              人間の脳のくせ
            </PopBadge>
          </Seq>
        </>
      ) : null}
      {frame >= s("04-15") ? (
        <Seq at={s("04-15")}>
          <PopBadge tone="term" size={76} angle={-2} style={{ position: "absolute", left: 700, top: 130, padding: "30px 30px 14px" }}>
            ギャンブラーの
            <ruby>
              誤謬
              <rt style={{ fontSize: "0.4em", rubyAlign: "center" as never }}>ごびゅう</rt>
            </ruby>
          </PopBadge>
          <Seq at={10}>
            <div style={{ position: "absolute", left: 1100, top: 300, transform: "rotate(90deg)" }}>
              <PopArrow width={110} height={90} />
            </div>
          </Seq>
          <Seq at={18}>
            <PopBadge tone="meaning" size={56} angle={2} style={{ position: "absolute", left: 740, top: 450, whiteSpace: "normal", lineHeight: 1.45 }}>
              そろそろ来るはず、
              <br />
              という思いこみ
            </PopBadge>
          </Seq>
        </Seq>
      ) : null}

      <Guide chapter={chapter} pose={pose} since={since} x={lay.x} footY={lay.footY} height={lay.height} />
    </AbsoluteFill>
  );
};
