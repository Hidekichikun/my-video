// 05 何回まわせば安心？（05-01〜05-11）
import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Guide, usePoseTrack, type PoseName } from "../Guide";
import { BARS, BarScene, barTop, ceilingPoint } from "../three/BarScene";
import { IconCircle, LadderArt, NowBadge, PopArrow, PopBackground, PopBadge } from "../parts";
import { POP, clamp } from "../theme";
import { BIG, SMALL, mixLayout, smallness, startOf, type ChapterProps } from "../lib";

const POSES: Record<number, PoseName> = { 1: "neutral", 10: "point", 11: "neutral" };

const Seq: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Sequence from={at} layout="none">
    {children}
  </Sequence>
);

/** 画面の (x, y) の真上に札を置く（下端中央を合わせる） */
const Above: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -100%)" }}>{children}</div>
);

export const Ch05: React.FC<ChapterProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const s = (id: string) => startOf(chapter, id);
  const { pose, since } = usePoseTrack(chapter, POSES);

  const rise = [s("05-02") + 30, s("05-03") + 20, s("05-04") + 10, s("05-05") + 10];
  const showBars = frame >= s("05-02") - 4 && frame < s("05-07") + 8;
  const barOpacity = interpolate(frame, [s("05-07") - 8, s("05-07") + 6], [1, 0], clamp);

  const small = smallness(frame, [[s("05-02") - 8, s("05-07") - 6]]);
  const lay = mixLayout(BIG, SMALL, small);
  const labelFade = barOpacity;

  const tops = BARS.map((b, i) => barTop(i, b.pct));
  const ceil = ceilingPoint(-4.9);
  const ceilMid = ceilingPoint(-1.2);

  return (
    <AbsoluteFill>
      <PopBackground />
      <NowBadge id={chapter.id} title={chapter.shortTitle} />

      {/* 05-01：何回まわせば安心？ */}
      {frame < s("05-02") + 10 ? (
        <Seq at={s("05-01") + 10}>
          <PopBadge tone="meaning" size={92} angle={-2} style={{ position: "absolute", left: 700, top: 300 }}>
            何回まわせば安心？
          </PopBadge>
        </Seq>
      ) : null}

      {/* 05-02〜06：回数ごとの棒グラフ */}
      {showBars ? <BarScene rise={rise} ceiling={s("05-06")} opacity={barOpacity} /> : null}
      {showBars ? (
        <AbsoluteFill style={{ opacity: labelFade }}>
          {BARS.map((b, i) => (
            <Seq key={i} at={rise[i] + 14}>
              <Above x={tops[i].x} y={tops[i].y - 16}>
                <PopBadge tone={i === 1 ? "meaning" : "card"} size={34} angle={i % 2 ? 2 : -2}>
                  {`${b.times}回で ${b.pct}%`}
                </PopBadge>
              </Above>
            </Seq>
          ))}
          {frame >= s("05-06") ? (
            <>
              <Seq at={s("05-06") + 6}>
                <div style={{ position: "absolute", left: ceil.x - 130, top: ceil.y - 34 }}>
                  <PopBadge tone="note" size={44} angle={2}>
                    100%
                  </PopBadge>
                </div>
              </Seq>
              <Seq at={s("05-06") + 40}>
                <div style={{ position: "absolute", left: ceilMid.x - 240, top: ceil.y - 130 }}>
                  <PopBadge tone="card" size={44} angle={-2}>
                    何回まわしても届かない
                  </PopBadge>
                </div>
              </Seq>
            </>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* 05-07〜09：天井 ＝ 確率じゃなくて約束 */}
      {frame >= s("05-07") && frame < s("05-10") ? (
        <>
          <Seq at={s("05-07")}>
            <div style={{ position: "absolute", left: 720, top: 150 }}>
              <IconCircle label="天井" color="#3A5BA0" size={260}>
                <LadderArt size={190} />
              </IconCircle>
            </div>
          </Seq>
          {frame >= s("05-08") ? (
            <Seq at={s("05-08")}>
              <PopBadge tone="card" size={50} angle={2} style={{ position: "absolute", left: 1040, top: 240 }}>
                決まった回数で必ずもらえる
              </PopBadge>
            </Seq>
          ) : null}
          {frame >= s("05-09") ? (
            <Seq at={s("05-09")}>
              <div style={{ position: "absolute", left: 720, top: 560, display: "flex", alignItems: "center", gap: 22 }}>
                <PopBadge tone="term" size={70} angle={-2}>
                  天井
                </PopBadge>
                <PopArrow width={100} height={82} />
                <PopBadge tone="meaning" size={62} angle={2} delay={6}>
                  確率じゃなくて約束
                </PopBadge>
              </div>
            </Seq>
          ) : null}
        </>
      ) : null}

      {/* 05-10〜11：確認する・お財布と相談 */}
      {frame >= s("05-10") ? (
        <>
          <Seq at={s("05-10") + 20}>
            <PopBadge tone="card" size={62} angle={-2} style={{ position: "absolute", left: 740, top: 180 }}>
              <span style={{ color: POP.green }}>✔</span>&nbsp;天井はある？
            </PopBadge>
          </Seq>
          <Seq at={s("05-10") + 80}>
            <PopBadge tone="card" size={62} angle={2} style={{ position: "absolute", left: 800, top: 360 }}>
              <span style={{ color: POP.green }}>✔</span>&nbsp;何回目？
            </PopBadge>
          </Seq>
          {frame >= s("05-11") ? (
            <Seq at={s("05-11")}>
              <PopBadge tone="note" size={54} angle={-3} style={{ position: "absolute", left: 860, top: 560 }}>
                お財布と相談
              </PopBadge>
            </Seq>
          ) : null}
        </>
      ) : null}

      <Guide chapter={chapter} pose={pose} since={since} x={lay.x} footY={lay.footY} height={lay.height} />
    </AbsoluteFill>
  );
};
