import { loadFont as loadGothic } from "@remotion/google-fonts/ZenKakuGothicNew";
import { loadFont as loadMincho } from "@remotion/google-fonts/ShipporiMinchoB1";
import { interpolate } from "remotion";
import type { LABELS } from "../Pyramid/data/facts";

export const { fontFamily: GOTHIC } = loadGothic("normal", {
  weights: ["500", "700"],
  ignoreTooManyRequestsWarning: true,
});
export const { fontFamily: MINCHO } = loadMincho("normal", {
  weights: ["600", "800"],
  ignoreTooManyRequestsWarning: true,
});

export const COLORS = {
  night: "#14171E",
  sand: "#E6D9BC",
  limestone: "#F4F1E8",
  core: "#B58B5A",
  granite: "#9C3B2E",
  lapis: "#2F5597",
  gold: "#C9A04A",
  nile: "#3E7CA6",
  field: "#5E8C5A",
  ink: "#1B1E26",
  muted: "#6E6A60",
  line: "#B9AC8E",
} as const;

export type LabelKind = keyof typeof LABELS;

export const LABEL_COLORS: Record<LabelKind, string> = {
  confirmed: "#2F6B45",
  likely: "#2F5597",
  hypothesis: "#9A5B12",
  noEvidence: "#8E2F2F",
  reconstruction: "#6B4E8A",
};

/** 字幕と章タイトル以外の文字は、この内側に置く */
export const SAFE = 80;

/** 部品の登場アニメーション（Sequence の頭から数えたフレーム） */
export const fadeIn = (frame: number, duration = 12, delay = 0) =>
  interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const smooth = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

/** 章の部の名前（章タイトルの上に出す） */
export const PART_OF_CHAPTER: Record<string, string> = {
  "00": "導入",
  "01": "導入",
  "02": "積み上げ",
  "03": "積み上げ",
  "04": "頂点",
  "05": "頂点",
  "06": "頂点",
  "07": "その後",
  "08": "その後",
  "09": "意味",
  "10": "まとめ",
};
