// 00 オープニング「先生、ガチャ沼」（00-01〜00-13）
import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Guide, usePoseTrack, type PoseName } from "../Guide";
import { GachaMachine } from "../three/GachaMachine";
import { ToonLights } from "../three/toon";
import {
  CapsuleArt,
  GemArt,
  IconCircle,
  PopBackground,
  PopBadge,
  PopTitle,
} from "../parts";
import { GACHA, POP, POP_HEADING, clamp, popScale } from "../theme";
import { easeOut, startOf, endOf, type ChapterProps } from "../lib";

const POSES: Record<number, PoseName> = {
  1: "neutral",
  4: "phone-sparkle",
  8: "fired-up",
  9: "shock",
  10: "think",
  13: "point",
};

/* ---- 背景の3Dガチャマシン ---- */
const MachineBackdrop: React.FC<{ opacity: number; frozen: boolean; crank: number }> = ({
  opacity,
  frozen,
  crank,
}) => (
  <AbsoluteFill style={{ opacity }}>
    <ThreeCanvas
      width={1920}
      height={1080}
      flat
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      camera={{ fov: 30, position: [0, 1.6, 10.5], near: 0.1, far: 60 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ToonLights />
      <group position={[3.5, -0.55, 0]} scale={0.66}>
        <GachaMachine frozen={frozen} crank={crank} yaw={-0.25} />
      </group>
    </ThreeCanvas>
  </AbsoluteFill>
);

/* ---- きらきら ---- */
const Sparkle: React.FC<{ x: number; y: number; size: number; phase: number }> = ({
  x,
  y,
  size,
  phase,
}) => {
  const f = useCurrentFrame();
  const s = 0.55 + 0.45 * Math.abs(Math.sin((f + phase) / 7));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${s}) rotate(${(f + phase) * 2}deg)`,
        overflow: "visible",
      }}
    >
      <path
        d="M 20 1 L 25 15 L 39 20 L 25 25 L 20 39 L 15 25 L 1 20 L 15 15 Z"
        fill={POP.yellow}
        stroke={POP.ink}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ---- 放射状の効果線 ---- */
const SpeedLines: React.FC<{ cx: number; cy: number; progress: number }> = ({
  cx,
  cy,
  progress,
}) => {
  const lines = 44;
  const inner = 520 - 120 * progress;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: lines }, (_, i) => {
        const a = (i / lines) * Math.PI * 2 + (i % 3) * 0.02;
        const w = 0.028 + ((i * 7) % 5) * 0.008;
        const r2 = 1700;
        const r1 = inner + ((i * 37) % 5) * 28;
        const p = (r: number, da: number) =>
          `${cx + Math.cos(a + da) * r},${cy + Math.sin(a + da) * r}`;
        return (
          <polygon
            key={i}
            points={`${p(r1, 0)} ${p(r2, -w)} ${p(r2, w)}`}
            fill={POP.ink}
            opacity={0.9}
          />
        );
      })}
    </svg>
  );
};

/* ---- 名前札（ルビ付き） ---- */
const NameTag: React.FC = () => (
  <PopBadge
    tone="term"
    size={64}
    angle={-3}
    style={{ position: "absolute", left: 700, top: 250, padding: "30px 34px 14px" }}
  >
    <ruby style={{ rubyAlign: "center", rubyPosition: "over" } as React.CSSProperties}>
      Numi
      <rt style={{ fontSize: "0.42em", rubyAlign: "center" as never }}>ナミ</rt>
    </ruby>
    先生
  </PopBadge>
);

/* ---- スマホの「ガチャを引く」ボタンと指 ---- */
const GachaButton: React.FC<{ press: number; stuck: boolean; pop: number }> = ({
  press,
  stuck,
  pop,
}) => (
  <div
    style={{
      position: "absolute",
      left: 760,
      top: 400,
      width: 560,
      height: 170,
      boxSizing: "border-box",
      borderRadius: 85,
      border: `6px solid ${POP.ink}`,
      background: POP.pink,
      boxShadow: stuck || press > 0.5 ? `2px 2px 0 ${POP.ink}` : `10px 10px 0 ${POP.ink}`,
      transform: `translate(${press * 6}px, ${press * 8}px) scale(${pop})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: POP_HEADING,
      fontSize: 70,
      color: POP.white,
      WebkitTextStroke: `8px ${POP.ink}`,
      paintOrder: "stroke",
      whiteSpace: "nowrap",
    }}
  >
    ガチャを引く！
  </div>
);

const Finger: React.FC<{ x: number; y: number; angle?: number }> = ({ x, y, angle = -18 }) => (
  <svg
    width={150}
    height={190}
    viewBox="0 0 150 190"
    style={{ position: "absolute", left: x, top: y, transform: `rotate(${angle}deg)`, overflow: "visible" }}
  >
    <path
      d="M 52 14 Q 52 2 66 2 Q 80 2 80 14 V 78 H 84 Q 88 64 100 66 Q 112 68 110 82 Q 124 78 130 92 Q 142 98 138 116 L 130 150 Q 126 176 104 182 H 66 Q 48 182 40 164 L 18 112 Q 12 98 26 94 Q 38 92 46 104 L 52 114 Z"
      fill={POP.white}
      stroke={POP.ink}
      strokeWidth={6}
      strokeLinejoin="round"
    />
  </svg>
);

export const Ch00: React.FC<ChapterProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const s = (id: string) => startOf(chapter, id);
  const e = (id: string) => endOf(chapter, id);
  const { pose, since } = usePoseTrack(chapter, POSES);

  // 背景マシンの濃さ
  const machineOpacity = interpolate(
    frame,
    [0, 24, s("00-04"), s("00-04") + 14, s("00-08"), s("00-08") + 12, s("00-12"), s("00-12") + 12],
    [0, 0.8, 0.8, 0.45, 0.45, 0.6, 0.6, 0.3],
    clamp,
  );
  const frozen = frame >= s("00-09") && frame < s("00-10");

  // ルナちゃん（00-04〜05）
  const lunaIn = easeOut(interpolate(frame - s("00-04"), [0, 16], [0, 1], clamp));
  const lunaOut = easeOut(interpolate(frame - s("00-06"), [0, 12], [0, 1], clamp));
  const lunaShow = frame >= s("00-04") && frame < s("00-06") + 12;

  // 石の山：16・15・…・9個の8段で100個
  const gems: { x: number; y: number; order: number }[] = [];
  {
    let n = 0;
    for (let r = 0; r < 8; r++) {
      const count = 16 - r;
      for (let c = 0; c < count; c++) {
        gems.push({
          x: 1060 + (c - (count - 1) / 2) * 49,
          y: 790 - r * 42,
          order: n++,
        });
      }
    }
  }
  const g0 = s("00-06");
  const gSpan = Math.max(30, e("00-06") - g0 - 24);
  const gemVisible = frame >= g0 && frame < s("00-09") + 4;
  const gemFade = interpolate(frame, [s("00-08"), s("00-08") + 10], [1, 0], clamp);

  // 00-07：ドーン
  const dStart = s("00-07");
  const dF = frame - dStart;
  const dScale = interpolate(dF, [0, 5, 9, 14], [2.6, 0.92, 1.05, 1], clamp);
  const shake = dF >= 4 && dF < 16 ? Math.sin(dF * 3.1) * (16 - dF) * 0.9 : 0;
  const flash = interpolate(dF, [3, 5, 14], [0, 0.85, 0], clamp);
  const formulaGone = interpolate(frame, [s("00-08"), s("00-08") + 8], [1, 0], clamp);

  // 00-08：指がボタンへ → 00-09 でピタッと止まる
  const bStart = s("00-08");
  const fingerT = easeOut(interpolate(frame, [bStart + 6, e("00-08") - 4], [0, 1], clamp));
  const fx = interpolate(fingerT, [0, 1], [1640, 1192]);
  const fy = interpolate(fingerT, [0, 1], [120, 470]);
  const press = frame >= bStart + 6 ? fingerT * 0.45 : 0;
  const stopped = frame >= s("00-09");
  const buttonShow = frame >= bStart && frame < s("00-10") + 6;
  const buttonFade = interpolate(frame, [s("00-10"), s("00-10") + 6], [1, 0], clamp);
  const lines = interpolate(frame, [s("00-09"), s("00-09") + 6], [0, 1], clamp);
  const linesGone = interpolate(frame, [s("00-10") - 6, s("00-10")], [1, 0], clamp);
  const crank = fingerT * 0.4;

  return (
    <AbsoluteFill>
      <PopBackground />
      <MachineBackdrop opacity={machineOpacity} frozen={frozen} crank={crank} />

      {/* ルナちゃん（架空の★5） */}
      {lunaShow ? (
        <AbsoluteFill
          style={{
            transform: `translateX(${(1 - lunaIn) * 520 + lunaOut * 640}px)`,
            opacity: lunaIn * (1 - lunaOut),
          }}
        >
          <Img
            src={staticFile("photo/math-gacha/luna-splash.png")}
            style={{ position: "absolute", left: 1194, top: 85, width: 573, height: 860 }}
          />
          <Sparkle x={1150} y={150} size={70} phase={0} />
          <Sparkle x={1730} y={260} size={56} phase={9} />
          <Sparkle x={1250} y={700} size={48} phase={17} />
          <Sparkle x={1680} y={640} size={62} phase={5} />
        </AbsoluteFill>
      ) : null}

      {frame >= s("00-02") && frame < s("00-04") ? (
        <AbsoluteFill style={{ opacity: interpolate(frame, [s("00-04") - 6, s("00-04")], [1, 0], clamp) }}>
          <Seq at={s("00-02")}>
            <NameTag />
          </Seq>
        </AbsoluteFill>
      ) : null}

      {frame >= s("00-04") && frame < s("00-06") + 6 ? (
        <AbsoluteFill style={{ opacity: interpolate(frame, [s("00-06") - 2, s("00-06") + 6], [1, 0], clamp) }}>
          <Seq at={s("00-04")}>
            <PopBadge tone="meaning" size={62} angle={-3} style={{ position: "absolute", left: 700, top: 170 }}>
              ★5 ルナちゃん
            </PopBadge>
          </Seq>
          <Seq at={s("00-05")}>
            <PopBadge tone="note" size={78} angle={2} style={{ position: "absolute", left: 700, top: 340 }}>
              排出率 1%
            </PopBadge>
            <div style={{ position: "absolute", left: 850, top: 520 }}>
              <IconCircle label="1%" color={POP.yellow} size={210} delay={6}>
                <CapsuleArt size={150} kind="gold" />
              </IconCircle>
            </div>
          </Seq>
        </AbsoluteFill>
      ) : null}

      {/* 石100個分 */}
      {gemVisible ? (
        <AbsoluteFill style={{ opacity: gemFade }}>
          {gems.map((g) => {
            const t0 = g0 + (g.order / 100) * gSpan;
            const d = frame - t0;
            if (d < 0) return null;
            const y = interpolate(d, [0, 9, 13, 16], [-140, 0, -16, 0], clamp);
            return (
              <div key={g.order} style={{ position: "absolute", left: g.x - 22, top: g.y + y }}>
                <GemArt size={46} color={g.order % 7 === 0 ? POP.pink : g.order % 5 === 0 ? POP.yellow : GACHA.gem} />
              </div>
            );
          })}
          {frame < s("00-07") ? (
            <Seq at={g0 + 10}>
              <PopBadge tone="term" size={52} angle={-3} style={{ position: "absolute", left: 720, top: 300 }}>
                石 100連分
              </PopBadge>
            </Seq>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* 00-07：1% × 100 ＝ 100%！ */}
      {frame >= dStart && frame < s("00-08") + 8 ? (
        <AbsoluteFill style={{ opacity: formulaGone }}>
          <AbsoluteFill style={{ background: POP.white, opacity: flash }} />
          <div
            style={{
              position: "absolute",
              left: 590,
              top: 170,
              width: 1260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              transform: `translate(${shake}px, ${-shake * 0.5}px) scale(${dScale})`,
            }}
          >
            <PopBadge tone="meaning" size={96} angle={-3} still>
              1%
            </PopBadge>
            <span style={{ fontFamily: POP_HEADING, fontSize: 84, color: POP.ink }}>×</span>
            <PopBadge tone="term" size={96} angle={2} still>
              100
            </PopBadge>
            <span style={{ fontFamily: POP_HEADING, fontSize: 84, color: POP.ink }}>＝</span>
            <PopBadge tone="note" size={112} angle={-2} still>
              100%！
            </PopBadge>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 00-08〜09：ガチャボタンと指、ピタッ！ */}
      {buttonShow ? (
        <AbsoluteFill style={{ opacity: buttonFade }}>
          <GachaButton
            press={stopped ? 0.45 : press}
            stuck={stopped}
            pop={popScale(frame - bStart)}
          />
          <Finger x={stopped ? 1192 : fx} y={stopped ? 470 : fy} />
        </AbsoluteFill>
      ) : null}
      {frame >= s("00-09") - 1 && frame < s("00-10") ? (
        <AbsoluteFill style={{ opacity: lines * linesGone }}>
          <SpeedLines cx={1040} cy={485} progress={lines} />
        </AbsoluteFill>
      ) : null}
      {frame >= s("00-10") && frame < s("00-12") ? (
        <>
          <Seq at={s("00-10")}>
            <PopBadge tone="note" size={92} angle={-8} style={{ position: "absolute", left: 560, top: 90, borderRadius: "50%", padding: "10px 40px" }}>
              ？
            </PopBadge>
          </Seq>
          <Seq at={s("00-10") + 8}>
            <PopBadge tone="meaning" size={70} angle={6} style={{ position: "absolute", left: 700, top: 230 }}>
              数学講師
            </PopBadge>
          </Seq>
        </>
      ) : null}

      {/* 00-12：タイトル */}
      {frame >= s("00-12") ? (
        <Seq at={s("00-12")}>
          <PopTitle size={118} style={{ left: 650, top: 200, width: 1220 }}>
            1%のガチャ、
            <br />
            100回引けば当たる？
          </PopTitle>
        </Seq>
      ) : null}

      <Guide chapter={chapter} pose={pose} since={since} x={330} footY={885} height={900} />
    </AbsoluteFill>
  );
};

/** at フレームから、中身のフレームを0にして出す */
const Seq: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Sequence from={at} layout="none">
    {children}
  </Sequence>
);
