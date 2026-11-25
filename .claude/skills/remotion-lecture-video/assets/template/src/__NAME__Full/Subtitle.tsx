import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { POP, POP_BODY, clamp } from "./theme";

/** 字幕で黄色にする用語。1行で最初の1つだけ。 */
export const TERMS = [
  "1%",
  "99%",
  "余事象",
  "ギャンブラーの誤謬",
  "天井",
  "確率",
  "100連",
  "63%",
  "37%",
];

const isDigit = (c: string | undefined) => !!c && /[0-9.]/.test(c);

/** 数字の途中（101% の 1% など）にはマッチさせない */
export const firstTerm = (text: string) => {
  const hits: { term: string; index: number }[] = [];
  for (const term of TERMS) {
    for (let at = text.indexOf(term); at >= 0; at = text.indexOf(term, at + 1)) {
      const startsWithDigit = /^[0-9]/.test(term);
      if (startsWithDigit && isDigit(text[at - 1])) continue;
      hits.push({ term, index: at });
      break;
    }
  }
  return hits.sort((a, b) => a.index - b.index || b.term.length - a.term.length)[0];
};

type WordSegment = { segment: string; index: number };
const Segmenter = (
  Intl as unknown as {
    Segmenter: new (
      locale: string,
      options: { granularity: "word" },
    ) => { segment: (text: string) => Iterable<WordSegment> };
  }
).Segmenter;
const wordSegmenter = new Segmenter("ja", { granularity: "word" });
const KEEP_PHRASES = [...TERMS, "数学講師", "ルナちゃん", "余事象", "ハズレ"];

/** 文字を変えず、語の境界・意味の切れ目で最大2行に分ける。 */
export const subtitleLines = (
  text: string,
  measure: (text: string) => number,
) => {
  if (measure(text) <= 1576) return [text];
  const boundaries = new Set(
    Array.from(wordSegmenter.segment(text), (s) => s.index + s.segment.length),
  );
  const protectedCuts = new Set<number>();
  for (const phrase of KEEP_PHRASES)
    for (
      let at = text.indexOf(phrase);
      at >= 0;
      at = text.indexOf(phrase, at + 1)
    )
      for (let i = at + 1; i < at + phrase.length; i++) protectedCuts.add(i);
  // 数字と % の間・小数点の途中では切らない
  for (let i = 1; i < text.length; i++)
    if (/[0-9.%]/.test(text[i]) && /[0-9.]/.test(text[i - 1]))
      protectedCuts.add(i);
  let best = 1,
    score = Infinity;
  for (let i = 1; i < text.length; i++) {
    if (
      !boundaries.has(i) ||
      protectedCuts.has(i) ||
      /[、。，．！？）」』】・ぁぃぅぇぉゃゅょっー…]/.test(text[i]) ||
      /[（「『【・]/.test(text[i - 1])
    )
      continue;
    const a = measure(text.slice(0, i)),
      b = measure(text.slice(i)),
      max = Math.max(a, b);
    const bonus = /[、。！？]/.test(text[i - 1])
      ? 320
      : /[はがをにでとものへ]/.test(text[i - 1])
        ? 55
        : 0;
    const candidate =
      max + Math.abs(a - b) * 0.08 + Math.max(0, max - 1576) * 10 - bonus;
    if (candidate < score) {
      score = candidate;
      best = i;
    }
  }
  if (!Number.isFinite(score)) return [text];
  return [text.slice(0, best), text.slice(best)];
};

export const PopSubtitle: React.FC<{
  text: string;
  durationInFrames: number;
}> = ({ text, durationInFrames }) => {
  const frame = useCurrentFrame();
  const layout = useMemo(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    context.font = `800 52px "${POP_BODY}"`;
    const measure = (s: string) => context.measureText(s).width;
    const rows = subtitleLines(text, measure);
    const width = Math.max(...rows.map(measure));
    return { rows, width, scale: Math.min(1, 1576 / width) };
  }, [text]);
  const match = firstTerm(text);
  const enter = interpolate(frame, [0, 4], [0, 1], clamp);
  const exit = interpolate(
    frame,
    [durationInFrames - 4, durationInFrames],
    [0, 1],
    clamp,
  );
  let offset = 0;
  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", opacity: enter * (1 - exit) }}
    >
      <div
        data-pop-subtitle-lines={layout.rows.length}
        data-pop-subtitle-scale={layout.scale}
        style={{
          position: "absolute",
          left: 160,
          bottom: 64,
          width: 1600,
          textAlign: "center",
          fontFamily: POP_BODY,
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.4,
          color: POP.white,
          WebkitTextStroke: `10px ${POP.ink}`,
          paintOrder: "stroke",
          textShadow: `0 4px 0 ${POP.ink}`,
          transform: `translateY(${12 * (1 - enter) + 12 * exit}px)`,
        }}
      >
        {layout.rows.map((row, i) => {
          const start = offset;
          offset += row.length;
          const a = match ? Math.max(0, match.index - start) : row.length;
          const b = match
            ? Math.min(row.length, match.index + match.term.length - start)
            : 0;
          const highlight = match && a < b && a < row.length && b > 0;
          return (
            <div
              key={i}
              style={{
                width: layout.scale < 1 ? layout.width : 1576,
                marginLeft: layout.scale < 1 ? (1600 - layout.width) / 2 : 12,
                transform: `scaleX(${layout.scale})`,
                transformOrigin: "center",
                whiteSpace: "pre",
              }}
            >
              {highlight ? (
                <>
                  {row.slice(0, a)}
                  <span data-pop-highlight style={{ color: POP.yellow }}>
                    {row.slice(a, b)}
                  </span>
                  {row.slice(b)}
                </>
              ) : (
                row
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
