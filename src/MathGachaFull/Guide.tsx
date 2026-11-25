import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { speechEnergy } from "../MathGacha/data/speech-energy";
import type { TimedChapter } from "../MathGacha/data/timeline";
import { POP, clamp } from "./theme";

/** 立ち絵（1024×1536）の置き方：不透明部分の中心x・足元yを測った値（ピクセル） */
const IMG_W = 1024;
const IMG_H = 1536;
const POSES = {
  neutral: { file: "neutral", cx: 500, bottom: 1453, talk: true },
  "phone-sparkle": { file: "phone-sparkle", cx: 509, bottom: 1475 },
  "fired-up": { file: "fired-up", cx: 478, bottom: 1488 },
  shock: { file: "shock", cx: 508, bottom: 1458 },
  think: { file: "think", cx: 494, bottom: 1453 },
  point: { file: "point", cx: 509, bottom: 1450 },
  despair: { file: "despair", cx: 512, bottom: 1451 },
  "back-look": { file: "back-look", cx: 511, bottom: 1447 },
} as const;
export type PoseName = keyof typeof POSES;
const REF_CX = 500;

const dir = (name: string) => staticFile(`photo/math-guide/${name}.png`);

/** 行番号→ポーズの表（指定のない行は直前を続ける）から、いまのポーズと切り替わりを返す */
export const usePoseTrack = (
  chapter: TimedChapter,
  table: Record<number, PoseName>,
) => {
  const frame = useCurrentFrame();
  let pose: PoseName = table[Number(chapter.lines[0].id.slice(3))] ?? "neutral";
  let since = 0;
  for (const line of chapter.lines) {
    const rel = line.from - chapter.from;
    if (rel > frame) break;
    const n = Number(line.id.slice(3));
    if (table[n] && table[n] !== pose) {
      pose = table[n];
      since = rel;
    } else if (table[n]) {
      pose = table[n];
    }
  }
  return { pose, since };
};

/** 章の中のいまのフレームで鳴っている声の音量（0〜1）。無音は0 */
export const useVolume = (chapter: TimedChapter) => {
  const frame = useCurrentFrame() + chapter.from;
  const line = chapter.lines.find(
    (l) => frame >= l.from && frame < l.from + l.durationInFrames,
  );
  return line ? (speechEnergy[line.id]?.[frame - line.from] ?? 0) : 0;
};

export type GuideProps = {
  chapter: TimedChapter;
  pose: PoseName;
  /** ポーズが切り替わった章内フレーム（切り替わりに小さく弾ませる） */
  since?: number;
  /** 足元の中心x・足元y・立ち絵の画像の高さ（px） */
  x: number;
  footY: number;
  height: number;
  /** 足元の影を出す */
  shadow?: boolean;
  opacity?: number;
};

/**
 * 先生（2D）。音量で口を切り替え、無音は閉じる。
 * 口パクは neutral のときだけ（mouth-closed/half/open を1枚ずつ切り替える）。
 * ほかのポーズは1枚絵のまま、声に合わせて小さく弾む・揺れる。
 */
export const Guide: React.FC<GuideProps> = ({
  chapter,
  pose,
  since = 0,
  x,
  footY,
  height,
  shadow = true,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const abs = frame + chapter.from;
  const volume = useVolume(chapter);
  const def = POSES[pose];
  const k = height / IMG_H;
  const width = IMG_W * k;
  const left = x - REF_CX * k - (def.cx - REF_CX) * k;
  const top = footY - def.bottom * k;
  const talking = "talk" in def && def.talk;

  const mouth =
    volume > 0.5 && (abs % 6 < 4 || volume > 0.8)
      ? "mouth-open"
      : volume > 0.13
        ? "mouth-half"
        : "mouth-closed";
  const blink = talking && (abs + 31) % 112 < 3;

  // ポーズ切り替えのポップ
  const pop = interpolate(frame - since, [0, 5, 10], [1.05, 0.985, 1], clamp);
  // 静止画ポーズは声で弾む・揺れる
  const bob = talking ? 0 : volume * Math.sin(abs * 0.95) * 7;
  const sway = talking ? 0 : volume * Math.sin(abs * 0.6) * 1.2;
  const breathe = Math.sin(abs / 26) * 1.6;
  const imgStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  };
  const shadowW = width * 0.46;
  return (
    <>
      {shadow ? (
        <div
          style={{
            position: "absolute",
            left: x - shadowW / 2,
            top: footY - shadowW * 0.07,
            width: shadowW,
            height: shadowW * 0.14,
            borderRadius: "50%",
            background: POP.ink,
            opacity: 0.16 * opacity,
          }}
        />
      ) : null}
      <div
        data-guide={pose}
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          opacity,
          transformOrigin: `${(def.cx / IMG_W) * 100}% ${(def.bottom / IMG_H) * 100}%`,
          transform: `translateY(${bob + breathe * 0.4}px) rotate(${sway}deg) scale(${pop})`,
          pointerEvents: "none",
        }}
      >
        <Img src={dir(talking ? mouth : def.file)} style={imgStyle} />
        {blink ? (
          <Img
            src={dir("blink")}
            style={{
              ...imgStyle,
              clipPath: "inset(13% 43.2% 82.4% 43.5%)",
            }}
          />
        ) : null}
      </div>
    </>
  );
};
