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
/** 前作の確度ラベルの5色・意味を維持する。 */
export const POP_EVIDENCE = {
  confirmed: "#2F6B45",
  likely: "#2F5597",
  hypothesis: "#9A5B12",
  noEvidence: "#8E2F2F",
  reconstruction: "#6B4E8A",
} as const;
export type PopLabelKind = keyof typeof POP_EVIDENCE;
export type PopTone = "term" | "meaning" | "place" | "note" | "card";
export const TONE_COLOR: Record<PopTone, string> = {
  term: POP.cyan,
  meaning: POP.yellow,
  place: POP.brown,
  note: POP.pink,
  card: POP.cream,
};
export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const popScale = (frame: number, delay = 0) =>
  interpolate(frame - delay, [0, 6, 10], [0.6, 1.08, 1], clamp);
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
