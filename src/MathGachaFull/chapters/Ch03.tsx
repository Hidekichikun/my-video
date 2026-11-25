// 03 「全部ハズレ」から考える＝余事象（03-01〜03-19）
import React, { useMemo } from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Guide, usePoseTrack, type PoseName } from "../Guide";
import { StackScene } from "../three/StackScene";
import { NowBadge, PopArrow, PopBackground, PopBadge } from "../parts";
import { FlipBoard, Venn } from "./Venn";
import { POP, POP_BODY, POP_HEADING, clamp, popOutline, popScale } from "../theme";
import { BIG, SMALL, mixLayout, smallness, startOf, type ChapterProps } from "../lib";

const POSES: Record<number, PoseName> = { 1: "neutral", 4: "shock", 6: "neutral", 19: "point" };

const Seq: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Sequence from={at} layout="none">
    {children}
  </Sequence>
);

/* ---- 枝分かれの図（増えすぎてパンク） ---- */
const LEVELS = 6;
const TREE_X0 = 740;
const TREE_X1 = 1800;
const TREE_Y0 = 110;
const TREE_H = 700;
const nodePos = (level: number, j: number) => ({
  x: TREE_X0 + (level / LEVELS) * (TREE_X1 - TREE_X0),
  y: TREE_Y0 + ((j + 0.5) * TREE_H) / Math.pow(2, level),
});

const BranchTree: React.FC<{ boom: number }> = ({ boom }) => {
  const f = useCurrentFrame();
  const colors = [POP.pink, POP.cyan, POP.yellow];
  const nodes: React.ReactNode[] = [];
  const edges: React.ReactNode[] = [];
  for (let level = 0; level <= LEVELS; level++) {
    const count = Math.pow(2, level);
    const t0 = level * 22;
    for (let j = 0; j < count; j++) {
      const p = nodePos(level, j);
      const appear = interpolate(f - t0 - (j / count) * 14, [0, 5], [0, 1], clamp);
      if (appear <= 0) continue;
      if (level > 0) {
        const q = nodePos(level - 1, Math.floor(j / 2));
        edges.push(
          <line key={`e${level}-${j}`} x1={q.x} y1={q.y} x2={q.x + (p.x - q.x) * appear} y2={q.y + (p.y - q.y) * appear} stroke={POP.ink} strokeWidth={3} />,
        );
      }
      nodes.push(
        <circle
          key={`n${level}-${j}`}
          cx={p.x}
          cy={p.y}
          r={Math.max(4, 18 - level * 2.2) * appear}
          fill={colors[(level + j) % 3]}
          stroke={POP.ink}
          strokeWidth={2.5}
        />,
      );
    }
  }
  const k = interpolate(f, [boom, boom + 10], [0, 1], clamp);
  return (
    <svg
      width={1920}
      height={1080}
      style={{
        position: "absolute",
        inset: 0,
        opacity: 1 - k,
        transformOrigin: "1270px 460px",
        transform: `scale(${1 + k * 0.7}) rotate(${k * 6}deg)`,
      }}
    >
      {edges}
      {nodes}
    </svg>
  );
};

/** ぼわん！：星形の爆発 */
const Boom: React.FC = () => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 5, 14], [0.2, 1.25, 1.05], clamp);
  const o = interpolate(f, [0, 3, 40, 56], [0, 1, 1, 0], clamp);
  const pts = Array.from({ length: 32 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    const r = i % 2 ? 250 : 400;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(" ");
  return (
    <div style={{ position: "absolute", left: 1270 - 450, top: 460 - 450, width: 900, height: 900, opacity: o }}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{ transform: `scale(${s}) rotate(${f * 1.5}deg)` }}>
        <polygon points={pts} fill={POP.yellow} stroke={POP.ink} strokeWidth={10} strokeLinejoin="round" />
        <polygon points={pts} fill={POP.pink} transform="scale(0.62)" stroke={POP.ink} strokeWidth={10} strokeLinejoin="round" />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...popOutline(150),
          transform: `scale(${popScale(f, 2)}) rotate(-6deg)`,
        }}
      >
        ぼわん！
      </div>
    </div>
  );
};

/* ---- 公式の札（0.99の100乗は、この式に当てはめただけ） ---- */
const cardBox: React.CSSProperties = {
  position: "absolute",
  left: 40,
  width: 500,
  boxSizing: "border-box",
  background: POP.white,
  border: `6px solid ${POP.ink}`,
  borderRadius: 26,
  boxShadow: `8px 8px 0 ${POP.ink}`,
  padding: "34px 28px 22px",
  fontFamily: POP_BODY,
  fontWeight: 800,
  color: POP.ink,
  textAlign: "center",
};
const FormulaCard: React.FC<{ fade: number }> = ({ fade }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ ...cardBox, top: 132, transform: `scale(${popScale(f)}) rotate(-1.5deg)`, opacity: fade, padding: "30px 28px 16px" }}>
      <PopBadge tone="term" size={34} angle={-3} still style={{ position: "absolute", left: 18, top: -30, padding: "6px 18px" }}>
        公式
      </PopBadge>
      <div style={{ fontSize: 34 }}>全部ハズレ ＝</div>
      <div style={{ fontFamily: POP_HEADING, fontSize: 62, lineHeight: 1.3 }}>
        （1 − p）<sup style={{ fontSize: "0.6em" }}>n</sup>
      </div>
      <div style={{ fontSize: 28, lineHeight: 1.4 }}>p：当たる確率　n：回数</div>
    </div>
  );
};
const CalcCard: React.FC<{ fade: number }> = ({ fade }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ ...cardBox, top: 374, transform: `scale(${popScale(f)}) rotate(1.5deg)`, opacity: fade, padding: "28px 28px 12px" }}>
      <PopBadge tone="note" size={32} angle={2} still style={{ position: "absolute", left: 18, top: -28, padding: "6px 18px" }}>
        電卓なら
      </PopBadge>
      <div style={{ fontFamily: POP_HEADING, fontSize: 48, lineHeight: 1.3 }}>0.99 ^ 100</div>
    </div>
  );
};

/* ---- 0.99 のカウンター ---- */
const Counter: React.FC<{ k: number; fade: number }> = ({ k, fade }) => {
  const v = Math.pow(0.99, k);
  const text = k >= 100 ? "0.366" : k === 1 ? "0.99" : v.toFixed(3);
  const style: React.CSSProperties = { ...popOutline(96), lineHeight: 1.2, whiteSpace: "nowrap" };
  return (
    <div style={{ position: "absolute", left: 600, top: 60, width: 1200, textAlign: "center", opacity: fade, ...style }}>
      {k <= 0 ? null : k === 1 ? (
        <span>0.99</span>
      ) : k === 2 ? (
        <span>0.99 × 0.99</span>
      ) : (
        <>
          <span>0.99</span>
          <sup style={{ fontSize: "0.58em", position: "relative", top: "-0.2em" }}>{k}</sup>
          <span> ＝ </span>
          <span style={{ color: POP.yellow }}>{text}</span>
        </>
      )}
    </div>
  );
};

export const Ch03: React.FC<ChapterProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const s = (id: string) => startOf(chapter, id);
  const { pose, since } = usePoseTrack(chapter, POSES);

  // 積み上がる灰色カプセル：1個目→2個目→一気に100個
  const appearFrames = useMemo(() => {
    const a: number[] = [];
    const t0 = s("03-10") + 30;
    const t1 = s("03-11") + 45;
    for (let i = 0; i < 100; i++) {
      a.push(
        i === 0 ? s("03-08") : i === 1 ? s("03-09") : t0 + ((i - 2) / 97) * (t1 - t0),
      );
    }
    return a;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);
  const k = appearFrames.filter((a) => frame >= a).length;

  const small = smallness(frame, [[s("03-08") - 8, s("03-13") - 6]]);
  const lay = mixLayout(BIG, { ...SMALL, footY: 874, height: 410 }, small);
  const stackOpacity = interpolate(frame, [s("03-13") - 14, s("03-13") - 4], [1, 0], clamp);
  const counterFade = interpolate(frame, [s("03-12"), s("03-12") + 10], [1, 0], clamp) *
    interpolate(frame, [s("03-13") - 14, s("03-13") - 4], [1, 0], clamp);

  return (
    <AbsoluteFill>
      <PopBackground />
      <NowBadge id={chapter.id} title={chapter.shortTitle} />

      {/* 03-01：63%の出し方は？ */}
      {frame < s("03-02") + 10 ? (
        <Seq at={s("03-01") + 12}>
          <PopBadge tone="meaning" size={150} angle={-3} style={{ position: "absolute", left: 800, top: 250 }}>
            63%
          </PopBadge>
          <Seq at={18}>
            <PopBadge tone="note" size={130} angle={8} style={{ position: "absolute", left: 1240, top: 230, borderRadius: "50%", padding: "10px 46px" }}>
              ？
            </PopBadge>
          </Seq>
        </Seq>
      ) : null}

      {/* 03-02〜05：枝分かれが増えすぎてパンク */}
      {frame >= s("03-02") && frame < s("03-05") + 70 ? (
        <Seq at={s("03-02")}>
          <BranchTree boom={s("03-05") - s("03-02")} />
        </Seq>
      ) : null}
      {frame >= s("03-03") && frame < s("03-05") ? (
        <>
          <Seq at={s("03-03")}>
            <PopBadge tone="card" size={38} angle={-2} style={{ position: "absolute", left: 760, top: 150 }}>
              1回目で当たる
            </PopBadge>
          </Seq>
          <Seq at={s("03-03") + 38}>
            <PopBadge tone="card" size={38} angle={2} style={{ position: "absolute", left: 960, top: 300 }}>
              2回目で当たる
            </PopBadge>
          </Seq>
          <Seq at={s("03-03") + 76}>
            <PopBadge tone="card" size={38} angle={-2} style={{ position: "absolute", left: 1180, top: 450 }}>
              2回当たる
            </PopBadge>
          </Seq>
          <Seq at={s("03-03") + 110}>
            <PopBadge tone="card" size={38} angle={2} style={{ position: "absolute", left: 1330, top: 610 }}>
              3回当たる
            </PopBadge>
          </Seq>
        </>
      ) : null}
      {frame >= s("03-05") && frame < s("03-05") + 70 ? (
        <Seq at={s("03-05")}>
          <Boom />
        </Seq>
      ) : null}

      {/* 03-06〜07：画面が裏返る（当たるパターン → 一回も当たらないパターン）＝余事象の図 */}
      {frame >= s("03-06") && frame < s("03-08") ? (
        <Seq at={s("03-06")}>
          <FlipBoard />
        </Seq>
      ) : null}

      {/* 03-08〜12：灰色カプセルが積み上がる＋式 */}
      {frame >= s("03-08") - 4 && frame < s("03-13") ? (
        <>
          <StackScene appearFrames={appearFrames} opacity={stackOpacity} />
          <Counter k={k} fade={counterFade} />
        </>
      ) : null}
      {frame >= s("03-10") + 40 && frame < s("03-13") - 4 ? (
        <Seq at={s("03-10") + 40}>
          <FormulaCard fade={stackOpacity} />
        </Seq>
      ) : null}
      {frame >= s("03-11") && frame < s("03-13") - 4 ? (
        <Seq at={s("03-11")}>
          <CalcCard fade={stackOpacity} />
        </Seq>
      ) : null}
      {frame >= s("03-12") && frame < s("03-13") + 4 ? (
        <Seq at={s("03-12")}>
          <PopBadge tone="note" size={150} angle={-3} style={{ position: "absolute", left: 800, top: 70 }}>
            36.6%
          </PopBadge>
        </Seq>
      ) : null}

      {/* 03-13〜18：余事象のベン図（面積が割合どおり）。円＝全部ハズレ36.6%、外＝少なくとも1回63.4% */}
      {frame >= s("03-13") ? (
        <Seq at={s("03-13")}>
          <Venn
            circleAt={0}
            tabAt={s("03-14") - s("03-13")}
            outAt={s("03-15") - s("03-13")}
            backAt={s("03-17") - s("03-13")}
            circleLabel={["全部ハズレ", "36.6%"]}
            regionLabel={
              frame >= s("03-15") + 14 && frame < s("03-17")
                ? ["少なくとも", "1回当たる", "63.4%"]
                : frame >= s("03-17")
                  ? ["少なくとも", "1回当たる"]
                  : undefined
            }
            glowRegion={frame >= s("03-15") + 14 && frame < s("03-17")}
          />
        </Seq>
      ) : null}

      {/* 03-16：ルナちゃんが手を振る */}
      {frame >= s("03-16") && frame < s("03-17") + 20 ? (
        <Seq at={s("03-16")}>
          <LunaWave />
        </Seq>
      ) : null}

      {/* 03-17〜18：余事象＝円（反対側）を計算して、全体から引く */}
      {frame >= s("03-17") ? (
        <>
          <Seq at={s("03-17") + 4}>
            <PopBadge tone="term" size={64} angle={-3} style={{ position: "absolute", left: 830, top: 505 }}>
              余事象
            </PopBadge>
          </Seq>
          <Seq at={s("03-17") + 60}>
            <PopBadge tone="meaning" size={50} angle={2} style={{ position: "absolute", left: 780, top: 640 }}>
              反対側を計算して全体から引く
            </PopBadge>
          </Seq>
        </>
      ) : null}
      {frame >= s("03-18") ? (
        <Seq at={s("03-18")}>
          <div style={{ position: "absolute", left: 780, top: 760, display: "flex", alignItems: "center", gap: 22 }}>
            <PopBadge tone="term" size={54} angle={-2}>
              少なくとも1回
            </PopBadge>
            <PopArrow width={90} height={74} />
            <PopBadge tone="note" size={54} angle={2} delay={6}>
              1 − 全部ハズレ
            </PopBadge>
          </div>
        </Seq>
      ) : null}

      <Guide chapter={chapter} pose={pose} since={since} x={lay.x} footY={lay.footY} height={lay.height} />
    </AbsoluteFill>
  );
};

const LunaWave: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 1500,
        top: 570,
        width: 330,
        height: 330,
        transformOrigin: "50% 90%",
        transform: `scale(${popScale(f)}) rotate(${Math.sin(f / 4) * 7}deg)`,
      }}
    >
      <Img src={staticFile("photo/math-gacha/luna-chibi.png")} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};
