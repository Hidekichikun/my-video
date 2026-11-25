import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  GACHA,
  POP,
  POP_BODY,
  POP_HEADING,
  TONE_COLOR,
  TONE_TEXT,
  clamp,
  popOutline,
  popScale,
  type PopTone,
} from "./theme";

/** クリーム＋うすい水玉。暗い背景は使わない。 */
export const PopBackground: React.FC = () => (
  <AbsoluteFill style={{ background: POP.cream }}>
    <AbsoluteFill
      style={{
        opacity: 0.06,
        backgroundImage: `radial-gradient(${POP.ink} 3px, transparent 3px)`,
        backgroundSize: "38px 38px",
      }}
    />
  </AbsoluteFill>
);

/** 札：角丸22・枠ink6・ぼかし無しの影・少し傾ける・バネで出る */
export const PopBadge: React.FC<{
  children: React.ReactNode;
  tone?: PopTone;
  size?: number;
  angle?: number;
  delay?: number;
  /** バネを使わず出しっぱなしにする */
  still?: boolean;
  style?: React.CSSProperties;
}> = ({
  children,
  tone = "term",
  size = 56,
  angle = -2,
  delay = 0,
  still = false,
  style,
}) => {
  const f = useCurrentFrame() - delay;
  return (
    <div
      data-overlay
      style={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        padding: "17px 27px",
        background: TONE_COLOR[tone],
        color: TONE_TEXT[tone],
        border: `6px solid ${POP.ink}`,
        borderRadius: 22,
        boxShadow: `8px 8px 0 ${POP.ink}`,
        fontFamily: POP_HEADING,
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.3,
        textAlign: "center",
        whiteSpace: "nowrap",
        opacity: still ? 1 : f < 0 ? 0 : 1,
        transform: `rotate(${angle}deg) scale(${still ? 1 : popScale(f)})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** pink の太い矢印（サムネと同じ形） */
export const PopArrow: React.FC<{ width?: number; height?: number }> = ({
  width = 110,
  height = 90,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 120 100"
    style={{ flexShrink: 0, overflow: "visible" }}
  >
    <path
      d="M 5 30 H 66 V 7 L 114 50 L 66 93 V 70 H 5 Z"
      fill={POP.pink}
      stroke={POP.ink}
      strokeWidth={6}
      strokeLinejoin="round"
    />
  </svg>
);

/** 中央に出す大きな文字（タイトル・問い） */
export const PopTitle: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 110, style }) => {
  const f = useCurrentFrame();
  return (
    <div
      data-overlay
      style={{
        position: "absolute",
        textAlign: "center",
        whiteSpace: "nowrap",
        ...popOutline(size),
        opacity: Math.min(1, f / 4),
        transform: `translateY(${interpolate(f, [0, 6, 12], [35, -8, 0], clamp)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 左上の「いまどこ？」バッジ：「② 100人の私」 */
const CIRCLED = ["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦"];
export const NowBadge: React.FC<{
  id: string;
  title: string;
  side?: "left" | "right";
}> = ({ id, title, side = "left" }) => (
  <PopBadge
    tone="term"
    size={30}
    angle={0}
    still
    style={{
      position: "absolute",
      top: 40,
      ...(side === "left" ? { left: 40 } : { right: 40 }),
      padding: "12px 22px",
    }}
  >
    {`${CIRCLED[Number(id)]} ${title}`}
  </PopBadge>
);

/* ------------------------------------------------------------------ */
/* アイコン（2D）                                                      */
/* ------------------------------------------------------------------ */

/** 丸い枠にアイコンを入れ、下に札で名前を付ける */
export const IconCircle: React.FC<{
  label: string;
  color?: string;
  size?: number;
  delay?: number;
  children: React.ReactNode;
}> = ({ label, color = POP.yellow, size = 220, delay = 0, children }) => {
  const f = useCurrentFrame() - delay;
  return (
    <div
      style={{
        width: size,
        textAlign: "center",
        opacity: f < 0 ? 0 : 1,
        transform: `scale(${popScale(f)})`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          boxSizing: "border-box",
          border: `8px solid ${POP.ink}`,
          borderRadius: "50%",
          boxShadow: `8px 8px 0 ${POP.ink}`,
          background: color,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
      {label ? (
        <PopBadge
          tone="meaning"
          size={Math.round(size * 0.2)}
          angle={-2}
          still
          style={{ marginTop: 22, padding: "10px 18px" }}
        >
          {label}
        </PopBadge>
      ) : null}
    </div>
  );
};

/** カプセル1個のイラスト（ink縁取り）。gold なら金色に光る */
export const CapsuleArt: React.FC<{
  size?: number;
  kind?: "gold" | "miss" | "blue";
  tilt?: number;
}> = ({ size = 120, kind = "blue", tilt = -20 }) => {
  const top =
    kind === "gold" ? GACHA.gold : kind === "miss" ? GACHA.miss : GACHA.capsuleTop;
  const bottom = kind === "miss" ? "#DADAE0" : GACHA.capsuleBottom;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible" }}>
      <g transform={`rotate(${tilt} 60 60)`}>
        <clipPath id={`cap-${kind}`}>
          <circle cx={60} cy={60} r={46} />
        </clipPath>
        <circle cx={60} cy={60} r={46} fill={bottom} />
        <rect x={10} y={10} width={100} height={50} fill={top} clipPath={`url(#cap-${kind})`} />
        <circle cx={60} cy={60} r={46} fill="none" stroke={POP.ink} strokeWidth={6} />
        <path d="M 14 60 H 106" stroke={POP.ink} strokeWidth={6} />
        <ellipse cx={42} cy={38} rx={9} ry={5} fill={POP.white} opacity={0.75} transform="rotate(-35 42 38)" />
      </g>
      {kind === "gold" ? (
        <path
          d="M 100 12 L 104 24 L 116 28 L 104 32 L 100 44 L 96 32 L 84 28 L 96 24 Z"
          fill={POP.white}
          stroke={POP.ink}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
};

/** 石（ジェム）のイラスト */
export const GemArt: React.FC<{ size?: number; color?: string }> = ({
  size = 44,
  color = GACHA.gem,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ overflow: "visible" }}>
    <path
      d="M 14 6 H 34 L 44 18 L 24 44 L 4 18 Z"
      fill={color}
      stroke={POP.ink}
      strokeWidth={3.5}
      strokeLinejoin="round"
    />
    <path d="M 4 18 H 44 M 14 6 L 19 18 L 24 44 M 34 6 L 29 18 L 24 44" fill="none" stroke={POP.ink} strokeWidth={2.2} strokeLinejoin="round" />
    <path d="M 16 9 L 13 15" stroke={POP.white} strokeWidth={3} strokeLinecap="round" />
  </svg>
);

/** 10×10 のマス（100連アイコン） */
export const GridArt: React.FC<{ size?: number; color?: string }> = ({
  size = 150,
  color = GACHA.capsuleTop,
}) => {
  const cell = size / 10;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: 100 }, (_, i) => (
        <circle
          key={i}
          cx={(i % 10) * cell + cell / 2}
          cy={Math.floor(i / 10) * cell + cell / 2}
          r={cell * 0.42}
          fill={color}
          stroke={POP.ink}
          strokeWidth={1.2}
        />
      ))}
    </svg>
  );
};

export const bodyText = (size = 40): React.CSSProperties => ({
  fontFamily: POP_BODY,
  fontWeight: 800,
  fontSize: size,
  color: POP.ink,
});

/* ------------------------------------------------------------------ */
/* キーワードのアイコン（2D）                                           */
/* ------------------------------------------------------------------ */

/** リセットボタン（確率は毎回リセット） */
export const ResetArt: React.FC<{ size?: number }> = ({ size = 130 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible" }}>
    <circle cx={60} cy={60} r={46} fill={POP.white} stroke={POP.ink} strokeWidth={6} />
    <path
      d="M 82 44 A 28 28 0 1 0 88 66"
      fill="none"
      stroke={POP.green}
      strokeWidth={13}
      strokeLinecap="round"
    />
    <path d="M 86 22 L 88 50 L 62 46 Z" fill={POP.green} stroke={POP.ink} strokeWidth={4} strokeLinejoin="round" />
  </svg>
);

/** 余事象：灰色カプセルの山＋ひっくり返る矢印 */
export const FlipArt: React.FC<{ size?: number }> = ({ size = 130 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible" }}>
    <circle cx={46} cy={78} r={15} fill="#DADAE0" stroke={POP.ink} strokeWidth={4} />
    <circle cx={74} cy={78} r={15} fill="#DADAE0" stroke={POP.ink} strokeWidth={4} />
    <circle cx={60} cy={56} r={15} fill="#DADAE0" stroke={POP.ink} strokeWidth={4} />
    <path d="M 24 40 A 40 40 0 0 1 96 36" fill="none" stroke={POP.pink} strokeWidth={10} strokeLinecap="round" />
    <path d="M 100 20 L 100 48 L 74 38 Z" fill={POP.pink} stroke={POP.ink} strokeWidth={4} strokeLinejoin="round" />
  </svg>
);

/** 天井に手が届くハシゴ */
export const LadderArt: React.FC<{ size?: number }> = ({ size = 130 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={{ overflow: "visible" }}>
    <rect x={8} y={10} width={104} height={12} fill={POP.ink} />
    <path d="M 20 22 L 14 10 M 44 22 L 38 10 M 68 22 L 62 10 M 92 22 L 86 10" stroke={POP.white} strokeWidth={3} />
    <path d="M 46 108 L 52 30 M 74 108 L 68 30" stroke={POP.white} strokeWidth={9} strokeLinecap="round" />
    <path d="M 46 108 L 52 30 M 74 108 L 68 30" stroke={POP.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
    {[44, 62, 80, 98].map((y) => (
      <path key={y} d={`M ${50 - (y - 30) * 0.05} ${y} H ${70 + (y - 30) * 0.05}`} stroke={POP.white} strokeWidth={7} strokeLinecap="round" />
    ))}
    <circle cx={60} cy={30} r={10} fill={POP.yellow} stroke={POP.ink} strokeWidth={4} />
  </svg>
);
