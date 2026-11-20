import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { LABELS } from "../../Pyramid/data/facts";
import { illustrationPath } from "../../Pyramid2/data/scenes";
import { PART_OF_CHAPTER } from "../../Pyramid2/data/scenes";
import {
  POP,
  POP_BODY,
  POP_HEADING,
  POP_EVIDENCE,
  TONE_COLOR,
  popScale,
  popOutline,
  clamp,
  type PopTone,
  type PopLabelKind,
} from "../pop-theme";

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

export const PopBadge: React.FC<{
  children: React.ReactNode;
  tone?: PopTone;
  size?: number;
  angle?: number;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, tone = "term", size = 56, angle = -2, delay = 0, style }) => {
  const f = useCurrentFrame() - delay;
  return (
    <div
      data-pyramid2-overlay
      style={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        padding: "17px 27px",
        background: TONE_COLOR[tone],
        color: tone === "place" || tone === "note" ? POP.white : POP.ink,
        border: `6px solid ${POP.ink}`,
        borderRadius: 22,
        boxShadow: `8px 8px 0 ${POP.ink}`,
        fontFamily: POP_HEADING,
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.3,
        textAlign: "center",
        opacity: f < 0 ? 0 : 1,
        transform: `rotate(${angle}deg) scale(${popScale(f)})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
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

export const PopQuestion: React.FC<{
  text: string;
  top?: number;
  size?: number;
}> = ({ text, top = 335, size = 110 }) => {
  const f = useCurrentFrame();
  return (
    <div
      data-pyramid2-overlay
      style={{
        position: "absolute",
        left: 310,
        top,
        width: 1300,
        textAlign: "center",
        ...popOutline(size),
        opacity: Math.min(1, f / 4),
        transform: `translateY(${interpolate(f, [0, 6, 12], [35, -8, 0], clamp)}px)`,
      }}
    >
      {text}
    </div>
  );
};
export const PopMeaning: React.FC<{
  term: string;
  meaning: string;
  top?: number;
}> = ({ term, meaning, top = 265 }) => (
  <div
    style={{
      position: "absolute",
      left: 300,
      top,
      width: 1110,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 26,
    }}
  >
    <PopBadge tone="term" size={64} angle={-2}>
      {term}
    </PopBadge>
    <PopArrow />
    <PopBadge tone="meaning" size={56} angle={2} delay={6}>
      {meaning}
    </PopBadge>
  </div>
);

export const PopCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    data-pyramid2-overlay
    style={{
      background: POP.white,
      border: `6px solid ${POP.ink}`,
      borderRadius: 30,
      boxShadow: `10px 10px 0 ${POP.ink}`,
      padding: 36,
      boxSizing: "border-box",
      fontFamily: POP_BODY,
      fontWeight: 800,
      color: POP.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

const KIND_ICON: Record<PopLabelKind, string> = {
  confirmed: "✔",
  likely: "◎",
  hypothesis: "？",
  noEvidence: "✖",
  reconstruction: "✎",
};
export const PopEvidence: React.FC<{
  kind: PopLabelKind;
  subject: string;
  top?: number;
}> = ({ kind, subject, top = 285 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 310,
        top,
        width: 1240,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 28,
      }}
    >
      <PopBadge tone="card" size={56} angle={-1}>
        {subject}
      </PopBadge>
      <div
        data-pyramid2-overlay
        style={{
          background: POP_EVIDENCE[kind],
          color: POP.white,
          border: `6px solid ${POP.ink}`,
          borderRadius: 22,
          padding: "18px 25px",
          boxShadow: `8px 8px 0 ${POP.ink}`,
          fontFamily: POP_HEADING,
          fontSize: 46,
          lineHeight: 1.35,
          whiteSpace: "nowrap",
          opacity: frame < 6 ? 0 : 1,
          transform: `rotate(2deg) scale(${popScale(frame, 6)})`,
        }}
      >
        {KIND_ICON[kind]} {LABELS[kind]}
      </div>
    </div>
  );
};

export const PopLatePeriod: React.FC<{ strike?: boolean; text?: string }> = ({
  strike = true,
  text = "70日・脳を取り出す・動物頭の壺",
}) => {
  const frame = useCurrentFrame();
  const split = text.includes("＝")
    ? text.indexOf("＝")
    : text.indexOf("・動物頭");
  return (
    <>
      <PopCard
        style={{
          position: "absolute",
          left: 320,
          top: 300,
          width: 1240,
          padding: "66px 280px 30px 44px",
        }}
      >
        <div
          style={{
            fontFamily: POP_BODY,
            fontWeight: 800,
            fontSize: 64,
            lineHeight: 1.45,
          }}
        >
          {split > 0 ? (
            <>
              {text.slice(0, split)}
              <br />
              {text.slice(split)}
            </>
          ) : (
            text
          )}
        </div>
      </PopCard>
      <PopBadge
        tone="note"
        size={42}
        angle={-3}
        style={{
          position: "absolute",
          left: 355,
          top: 240,
          background: POP.red,
        }}
      >
        後の時代の話
      </PopBadge>
      {strike ? (
        <svg
          aria-label="後の時代を示す赤い×のハンコ"
          width={240}
          height={240}
          viewBox="0 0 240 240"
          style={{
            position: "absolute",
            left: 1320,
            top: 255,
            overflow: "visible",
            transform: `rotate(-12deg) scale(${popScale(frame, 6)})`,
            opacity: frame < 6 ? 0 : 0.95,
          }}
        >
          <circle
            cx={120}
            cy={120}
            r={111}
            fill={POP.white}
            stroke={POP.red}
            strokeWidth={12}
          />
          <path
            d="M 57 57 L 183 183 M 183 57 L 57 183"
            stroke={POP.red}
            strokeWidth={25}
            strokeLinecap="square"
          />
        </svg>
      ) : null}
    </>
  );
};

export type PopIconItem = { label: string; file?: string; word?: string };
export const PopIcons: React.FC<{
  items: PopIconItem[];
  revealAt?: number[];
  glowAt?: number;
}> = ({ items, revealAt, glowAt }) => {
  const frame = useCurrentFrame();
  const glow = glowAt !== undefined ? frame - glowAt : -1;
  const bounce =
    glow >= 0 ? interpolate(glow, [0, 6, 14, 22], [0, -22, 4, 0], clamp) : 0;
  const flash =
    glow >= 0 ? interpolate(glow, [0, 8, 20, 30], [0, 0.8, 0.5, 0], clamp) : 0;
  const gap = items.length === 3 ? 450 : 265;
  return (
    <>
      {items.map((item, i) => {
        const appear = frame - (revealAt?.[i] ?? i * 6);
        const x = 910 + (i - (items.length - 1) / 2) * gap;
        return (
          <div
            key={item.label}
            style={{
              position: "absolute",
              left: x - 210,
              top: 290 + bounce,
              width: 420,
              textAlign: "center",
              opacity: appear < 0 ? 0 : 1,
              transform: `scale(${popScale(appear)})`,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 220,
                height: 220,
                margin: "0 auto",
                border: `8px solid ${POP.ink}`,
                borderRadius: "50%",
                boxShadow: `8px 8px 0 ${POP.ink}`,
                overflow: "hidden",
                background: [POP.yellow, POP.cyan, POP.pink][i % 3],
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.file ? (
                <Img
                  src={staticFile(illustrationPath(item.file))}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span
                  data-pyramid2-overlay
                  style={{
                    fontFamily: POP_HEADING,
                    fontSize: 60,
                    color: POP.ink,
                  }}
                >
                  {item.word ?? item.label}
                </span>
              )}
              {flash > 0 ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(115deg, transparent 32%,${POP.white} 45%,transparent 60%)`,
                    opacity: flash,
                    transform: `translateX(${interpolate(glow, [0, 30], [-120, 120], clamp)}px)`,
                  }}
                />
              ) : null}
            </div>
            <PopBadge
              tone="meaning"
              size={items.length > 3 ? 34 : 48}
              angle={i % 2 === 0 ? -2 : 2}
              style={{
                marginTop: 34,
                padding: "14px 18px",
                maxWidth: 470,
                whiteSpace: "nowrap",
                transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
                opacity: 1,
              }}
            >
              {item.label}
            </PopBadge>
            {glow >= 0 && glow <= 30 ? (
              <svg
                width={330}
                height={270}
                style={{
                  position: "absolute",
                  left: 45,
                  top: -35,
                  pointerEvents: "none",
                  opacity: Math.max(0.25, flash),
                }}
                viewBox="0 0 330 270"
              >
                <path
                  d="M 40 10 L 47 30 L 67 37 L 47 44 L 40 64 L 33 44 L 13 37 L 33 30 Z M 290 170 L 297 190 L 317 197 L 297 204 L 290 224 L 283 204 L 263 197 L 283 190 Z"
                  fill={POP.white}
                  stroke={POP.ink}
                  strokeWidth={3}
                />
              </svg>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

export const PopChapterTitle: React.FC<{
  id: string;
  title: string;
  durationInFrames: number;
}> = ({ id, title, durationInFrames }) => {
  const frame = useCurrentFrame();
  const fade = interpolate(
    frame,
    [0, 4, durationInFrames - 4, durationInFrames],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill>
      <PopBackground />
      <div style={{ opacity: fade }}>
        <PopBadge
          tone="term"
          size={128}
          angle={-3}
          style={{
            position: "absolute",
            left: 135,
            top: 125,
            width: 220,
            height: 220,
            borderRadius: "50%",
          }}
        >
          {Number(id)}
        </PopBadge>
        <div
          style={{
            position: "absolute",
            left: 390,
            top: 290,
            width: 1140,
            textAlign: "center",
          }}
        >
          <PopBadge tone="note" size={42} angle={-2}>
            {PART_OF_CHAPTER[id]}
          </PopBadge>
        </div>
        <div
          data-pyramid2-overlay
          style={{
            position: "absolute",
            left: 200,
            top: 460,
            width: 1520,
            textAlign: "center",
            ...popOutline(110),
            transform: `translateY(${interpolate(frame, [0, 7, 14], [45, -9, 0], clamp)}px)`,
          }}
        >
          {title}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PopNowBadge: React.FC<{ id: string; side?: "left" | "right" }> = ({
  id,
  side = "left",
}) => (
  <PopBadge
    tone="term"
    size={36}
    angle={0}
    style={{
      position: "absolute",
      top: 40,
      ...(side === "left" ? { left: 40 } : { right: 40 }),
      padding: "44px 40px",
    }}
  >
    {`${["⓪", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"][Number(id)]} ${PART_OF_CHAPTER[id]}`}
  </PopBadge>
);
