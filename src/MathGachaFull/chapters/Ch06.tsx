// 06 思い出しクイズ（06-01〜06-10）
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Guide, usePoseTrack, type PoseName } from "../Guide";
import { CapsuleArt, GridArt, IconCircle, NowBadge, PopBackground, PopBadge, ResetArt } from "../parts";
import { GACHA, POP, POP_BODY, POP_HEADING, clamp, popOutline, popScale } from "../theme";
import { BIG, endOf, startOf, type ChapterProps } from "../lib";

const POSES: Record<number, PoseName> = { 1: "neutral", 4: "point", 6: "neutral", 9: "point" };

const Seq: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Sequence from={at} layout="none">
    {children}
  </Sequence>
);

const QuestionCard: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 700,
        top: 540,
        width: 1150,
        boxSizing: "border-box",
        background: POP.white,
        border: `6px solid ${POP.ink}`,
        borderRadius: 30,
        boxShadow: `10px 10px 0 ${POP.ink}`,
        padding: "30px 40px",
        fontFamily: POP_BODY,
        fontWeight: 800,
        fontSize: 54,
        lineHeight: 1.5,
        color: POP.ink,
        transform: `scale(${popScale(f)})`,
        opacity: f < 0 ? 0 : 1,
      }}
    >
      {text}
    </div>
  );
};

/** 3・2・1 のカウントダウン（間の 2.5 秒） */
const Countdown: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const step = frames / 3;
  const n = 3 - Math.min(2, Math.floor(f / step));
  const local = f - (3 - n) * step;
  return (
    <div
      style={{
        position: "absolute",
        left: 1480,
        top: 170,
        width: 260,
        height: 260,
        boxSizing: "border-box",
        borderRadius: "50%",
        background: POP.pink,
        border: `8px solid ${POP.ink}`,
        boxShadow: `8px 8px 0 ${POP.ink}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${interpolate(local, [0, 4, 8], [1.35, 0.95, 1], clamp)})`,
        ...popOutline(190),
        textShadow: "none",
        lineHeight: 1,
      }}
    >
      {n}
    </div>
  );
};

const Answer: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 190 }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 700,
        top: 190,
        width: 1150,
        textAlign: "center",
        fontFamily: POP_HEADING,
        fontSize: size,
        lineHeight: 1.2,
        color: POP.yellow,
        WebkitTextStroke: `16px ${POP.ink}`,
        paintOrder: "stroke",
        textShadow: `10px 10px 0 ${POP.pink}`,
        whiteSpace: "nowrap",
        transform: `scale(${interpolate(f, [0, 5, 9, 13], [2.4, 0.92, 1.06, 1], clamp)})`,
      }}
    >
      {children}
    </div>
  );
};

export const Ch06: React.FC<ChapterProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const s = (id: string) => startOf(chapter, id);
  const e = (id: string) => endOf(chapter, id);
  const { pose, since } = usePoseTrack(chapter, POSES);

  const cd1 = e("06-03") + 6;
  const cd2 = e("06-08") + 6;

  return (
    <AbsoluteFill>
      <PopBackground />
      <NowBadge id={chapter.id} title={chapter.shortTitle} />

      {/* 06-01：思い出しクイズ */}
      {frame < s("06-02") ? (
        <Seq at={s("06-01") + 4}>
          <PopBadge tone="meaning" size={120} angle={-3} style={{ position: "absolute", left: 740, top: 330 }}>
            思い出しクイズ
          </PopBadge>
        </Seq>
      ) : null}

      {/* 第1問（06-02〜03）→ 3・2・1 → 答え（06-04〜05） */}
      {frame >= s("06-02") && frame < s("06-04") ? (
        <>
          <Seq at={s("06-02")}>
            <PopBadge tone="note" size={104} angle={-3} style={{ position: "absolute", left: 720, top: 160 }}>
              第1問
            </PopBadge>
          </Seq>
          {frame < cd1 ? (
            <Seq at={s("06-02") + 10}>
              <div style={{ position: "absolute", left: 1450, top: 120 }}>
                <IconCircle label="1% × 100回" color={POP.cyan} size={250}>
                  <GridArt size={170} color={GACHA.gold} />
                </IconCircle>
              </div>
            </Seq>
          ) : null}
          {frame >= s("06-03") ? (
            <Seq at={s("06-03")}>
              <QuestionCard text="1%のガチャを100回まわしたとき、少なくとも1回当たる確率は、およそ何%？" />
            </Seq>
          ) : null}
          {frame >= cd1 && frame < s("06-04") ? (
            <Seq at={cd1}>
              <Countdown frames={s("06-04") - cd1} />
            </Seq>
          ) : null}
        </>
      ) : null}
      {frame >= s("06-04") && frame < s("06-06") ? (
        <>
          <Seq at={s("06-04")}>
            <PopBadge tone="term" size={60} angle={-3} style={{ position: "absolute", left: 720, top: 110 }}>
              正解
            </PopBadge>
            <Answer>約63%</Answer>
          </Seq>
          {frame >= s("06-05") ? (
            <Seq at={s("06-05")}>
              <div style={{ position: "absolute", left: 740, top: 560, display: "flex", alignItems: "center", gap: 20 }}>
                <PopBadge tone="card" size={74} angle={-2}>
                  1 − 0.366
                </PopBadge>
                <span style={{ fontFamily: POP_HEADING, fontSize: 70, color: POP.ink }}>＝</span>
                <PopBadge tone="meaning" size={74} angle={2} delay={6}>
                  0.634
                </PopBadge>
              </div>
            </Seq>
          ) : null}
        </>
      ) : null}

      {/* 第2問（06-06〜08）→ 3・2・1 → 答え（06-09〜10） */}
      {frame >= s("06-06") && frame < s("06-09") ? (
        <>
          <Seq at={s("06-06")}>
            <PopBadge tone="note" size={104} angle={-3} style={{ position: "absolute", left: 720, top: 160 }}>
              第2問
            </PopBadge>
          </Seq>
          {frame < cd2 ? (
            <Seq at={s("06-06") + 10}>
              <div style={{ position: "absolute", left: 1450, top: 120 }}>
                <IconCircle label="10回連続ハズレ" color="#D8D8DE" size={250}>
                  <div style={{ display: "flex", gap: 0 }}>
                    <CapsuleArt size={110} kind="miss" tilt={-30} />
                    <CapsuleArt size={110} kind="miss" tilt={20} />
                  </div>
                </IconCircle>
              </div>
            </Seq>
          ) : null}
          {frame >= s("06-07") ? (
            <Seq at={s("06-07")}>
              <QuestionCard text="1%のガチャで、10回連続ハズレました。次の1回で当たる確率は？" />
            </Seq>
          ) : null}
          {frame >= cd2 && frame < s("06-09") ? (
            <Seq at={cd2}>
              <Countdown frames={s("06-09") - cd2} />
            </Seq>
          ) : null}
        </>
      ) : null}
      {frame >= s("06-09") ? (
        <Seq at={s("06-09")}>
          <PopBadge tone="term" size={60} angle={-3} style={{ position: "absolute", left: 720, top: 110 }}>
            正解
          </PopBadge>
          <Answer size={170}>1%のまま</Answer>
          <Seq at={12}>
            <div style={{ position: "absolute", left: 1000, top: 560 }}>
              <IconCircle label="毎回リセット" color={POP.green} size={220}>
                <ResetArt size={150} />
              </IconCircle>
            </div>
          </Seq>
        </Seq>
      ) : null}

      <Guide chapter={chapter} pose={pose} since={since} x={BIG.x} footY={BIG.footY} height={BIG.height} />
    </AbsoluteFill>
  );
};
