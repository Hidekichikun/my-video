// 余事象のベン図。面積が割合どおり：全体（長方形）＝100%、灰色の円＝全部ハズレ 36.6%、円の外＝少なくとも1回当たる 63.4%。
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { POP, POP_HEADING, clamp, popScale } from "../theme";

export const BOARD = { x: 780, y: 120, w: 900, h: 440 };
const MISS = 0.366;
const R = Math.sqrt((MISS * BOARD.w * BOARD.h) / Math.PI);
const CX = 270;
const CY = BOARD.h / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Props = {
  /** 円が出る（ポンと） */
  circleAt?: number;
  /** 円を全体から引き抜く（引き算） */
  outAt?: number;
  /** 円が元の場所にもどる（余事象として見せなおす） */
  backAt?: number;
  /** 「全体 100%」の札 */
  tabAt?: number;
  /** 円を目立たせる（ふくらむ光） */
  pulse?: boolean;
  /** 円の中の文字 */
  circleLabel?: string[];
  /** 円の外の文字 */
  regionLabel?: string[];
  /** 63.4% を光らせる */
  glowRegion?: boolean;
  /** 円の外を黄色でなく白にする（円だけを見せたいとき） */
  plainRegion?: boolean;
};

const Label: React.FC<{ lines: string[]; x: number; y: number; big?: boolean }> = ({ lines, x, y, big }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      fontFamily: POP_HEADING,
      color: POP.ink,
      lineHeight: 1.25,
      whiteSpace: "nowrap",
    }}
  >
    {lines.map((l, i) => (
      <div key={i} style={{ fontSize: l.includes("%") ? 72 : lines.length > 1 ? 36 : big ? 64 : 40 }}>
        {l}
      </div>
    ))}
  </div>
);

export const Venn: React.FC<Props> = ({
  circleAt = 0,
  outAt,
  backAt,
  tabAt,
  pulse = false,
  circleLabel,
  regionLabel,
  glowRegion = false,
  plainRegion = false,
}) => {
  const f = useCurrentFrame();
  const pop = interpolate(f - circleAt, [0, 6, 10], [0.4, 1.1, 1], clamp);
  const out = outAt !== undefined ? easeOut(interpolate(f, [outAt, outAt + 20], [0, 1], clamp)) : 0;
  const back = backAt !== undefined ? interpolate(f - backAt, [0, 6, 10], [0, 1.12, 1], clamp) : 0;
  const returned = backAt !== undefined && f >= backAt;
  const placed = f >= circleAt && (outAt === undefined || f < outAt) && !returned;
  const flying = outAt !== undefined && f >= outAt && f < outAt + 20 && !returned;
  const gone = outAt !== undefined && f >= outAt + 20 && !returned;
  const circleVisible = placed || returned || flying;
  const glow = pulse ? 0.5 + 0.5 * Math.sin(f / 4) : 0;
  const regionGlow = glowRegion ? 0.5 + 0.5 * Math.sin(f / 5) : 0;

  // 引き抜かれる円（ななめ上へ飛んで消える）
  const circleScale = returned ? back : placed ? pop : 1 - out * 0.15;
  const circleX = flying ? CX - out * 90 : CX;
  const circleY = flying ? CY - out * 260 : CY;
  const circleOpacity = flying ? 1 - out : 1;
  const hole = flying || gone;

  return (
    <div style={{ position: "absolute", left: BOARD.x, top: BOARD.y, width: BOARD.w, height: BOARD.h }}>
      <svg width={BOARD.w} height={BOARD.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* 全体（長方形）＝少なくとも1回当たる */}
        <rect
          x={0}
          y={0}
          width={BOARD.w}
          height={BOARD.h}
          rx={26}
          fill={plainRegion ? POP.white : POP.yellow}
          stroke={POP.ink}
          strokeWidth={7}
          style={{ filter: regionGlow ? `drop-shadow(0 0 ${14 + regionGlow * 22}px ${POP.yellow})` : "none" }}
        />
        {/* 引いたあとの穴 */}
        {hole ? (
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill={POP.cream}
            stroke={POP.ink}
            strokeWidth={5}
            strokeDasharray="14 12"
          />
        ) : null}
        {/* 灰色の円＝全部ハズレ */}
        {circleVisible ? (
          <g
            transform={`translate(${circleX} ${circleY}) scale(${circleScale * (1 + glow * 0.04)})`}
            opacity={circleOpacity}
          >
            <circle
              r={R}
              fill="#C9C9D1"
              stroke={POP.ink}
              strokeWidth={7}
              style={{ filter: pulse ? `drop-shadow(0 0 ${10 + glow * 18}px ${POP.pink})` : "none" }}
            />
          </g>
        ) : null}
      </svg>

      {/* 文字 */}
      {circleLabel && circleVisible && !flying ? (
        <Label lines={circleLabel} x={CX} y={CY} />
      ) : null}
      {circleLabel && flying ? (
        <div style={{ opacity: 1 - out }}>
          <Label lines={["−" + (circleLabel[1] ?? "")]} x={circleX} y={circleY} />
        </div>
      ) : null}
      {regionLabel ? (
        <Label lines={regionLabel} x={circleAt > 1000 ? BOARD.w / 2 : CX + R + (BOARD.w - CX - R) / 2} y={CY} big={circleAt > 1000} />
      ) : null}

      {/* 全体 100% の札 */}
      {tabAt !== undefined && f >= tabAt ? (
        <div
          style={{
            position: "absolute",
            left: 24,
            top: -34,
            transform: `scale(${popScale(f - tabAt)}) rotate(-2deg)`,
            transformOrigin: "0 100%",
            background: POP.cream,
            border: `6px solid ${POP.ink}`,
            borderRadius: 18,
            boxShadow: `6px 6px 0 ${POP.ink}`,
            padding: "6px 22px",
            fontFamily: POP_HEADING,
            fontSize: 44,
            color: POP.ink,
          }}
        >
          全体 100%
        </div>
      ) : null}
    </div>
  );
};

/** くるっと裏返るボード（前＝当たるパターンだけ／裏＝円がある） */
export const FlipBoard: React.FC = () => {
  const f = useCurrentFrame();
  const rot = interpolate(f, [12, 34], [0, 180], clamp);
  const face: React.CSSProperties = {
    position: "absolute",
    left: BOARD.x,
    top: BOARD.y,
    width: BOARD.w,
    height: BOARD.h,
    backfaceVisibility: "hidden",
  };
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        perspective: 2200,
        perspectiveOrigin: `${BOARD.x + BOARD.w / 2}px ${BOARD.y + BOARD.h / 2}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transformOrigin: `${BOARD.x + BOARD.w / 2}px ${BOARD.y + BOARD.h / 2}px`,
          transform: `scale(${popScale(f)}) rotateY(${rot}deg)`,
        }}
      >
        <div style={face}>
          <div style={{ position: "absolute", inset: 0, left: -BOARD.x, top: -BOARD.y }}>
            <Venn circleAt={9999} regionLabel={["当たるパターン"]} />
          </div>
        </div>
        <div style={{ ...face, transform: "rotateY(180deg)" }}>
          <div style={{ position: "absolute", inset: 0, left: -BOARD.x, top: -BOARD.y }}>
            <Venn circleAt={0} pulse circleLabel={["一回も", "当たらない"]} regionLabel={["当たるパターン"]} />
          </div>
        </div>
      </div>
    </div>
  );
};
