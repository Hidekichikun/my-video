// ポップ路線の色・フォント（src/Pyramid2/POP_STYLE.md と同じルール）。
// 前作のファイルは変えず、ここにコピーして使う。

import { loadFont as loadDela } from "@remotion/google-fonts/DelaGothicOne";
import { loadFont as loadRounded } from "@remotion/google-fonts/MPLUSRounded1c";
import type { CSSProperties } from "react";
import { interpolate } from "remotion";

const dela = loadDela("normal", {
  weights: ["400"],
  ignoreTooManyRequestsWarning: true,
});
const rounded = loadRounded("normal", {
  weights: ["800"],
  ignoreTooManyRequestsWarning: true,
});
export const POP_HEADING = dela.fontFamily;
export const POP_BODY = rounded.fontFamily;
export const waitForPopFonts = () =>
  Promise.all([dela.waitUntilDone(), rounded.waitUntilDone()]);

export const POP = {
  ink: "#2B2B33",
  white: "#FFFFFF",
  yellow: "#FFE14D",
  cyan: "#3CC8F0",
  pink: "#FF4F8B",
  brown: "#9A6A3A",
  cream: "#FFF6E0",
  green: "#47C27A",
  red: "#F25C54",
} as const;

/** 3Dの色（指示書どおり） */
export const GACHA = {
  capsuleTop: "#6682A3",
  capsuleBottom: "#F3F6FA",
  gold: "#FFD54A",
  miss: "#B8B8C0",
  gem: "#3CC8F0",
} as const;

export type PopTone = "term" | "meaning" | "place" | "note" | "card" | "miss";
export const TONE_COLOR: Record<PopTone, string> = {
  term: POP.cyan,
  meaning: POP.yellow,
  place: POP.brown,
  note: POP.pink,
  card: POP.cream,
  miss: GACHA.miss,
};
export const TONE_TEXT: Record<PopTone, string> = {
  term: POP.ink,
  meaning: POP.ink,
  place: POP.white,
  note: POP.white,
  card: POP.ink,
  miss: POP.ink,
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** 札のバネ：0.6倍 → 1.08倍 → 1倍（約10フレーム） */
export const popScale = (frame: number, delay = 0) =>
  interpolate(frame - delay, [0, 6, 10], [0.6, 1.08, 1], clamp);

/** 白文字＋ink縁取り＋pinkの影（サムネと同じ） */
export const popOutline = (size = 110): CSSProperties => ({
  fontFamily: POP_HEADING,
  fontWeight: 400,
  fontSize: size,
  lineHeight: 1.4,
  color: POP.white,
  WebkitTextStroke: "12px " + POP.ink,
  paintOrder: "stroke",
  textShadow: "8px 8px 0 " + POP.pink,
});

export const FRAME_W = 1920;
export const FRAME_H = 1080;
