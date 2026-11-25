// 章ファイルで使う道具。行IDで画面を置く場所を決める。
import { interpolate } from "remotion";
import type { TimedChapter } from "../MathGacha/data/timeline";
import { clamp } from "./theme";

export type ChapterProps = { chapter: TimedChapter };

const findLine = (chapter: TimedChapter, id: string) => {
  const line = chapter.lines.find((l) => l.id === id);
  if (!line) throw new Error(`章${chapter.id}に行${id}がありません`);
  return line;
};

/** 行 id が始まるフレーム（章の頭から） */
export const startOf = (chapter: TimedChapter, id: string) =>
  findLine(chapter, id).from - chapter.from;

/** 行 id の声が終わるフレーム（章の頭から） */
export const endOf = (chapter: TimedChapter, id: string) => {
  const l = findLine(chapter, id);
  return l.from - chapter.from + l.durationInFrames;
};

/** 行 id の長さ（フレーム） */
export const lenOf = (chapter: TimedChapter, id: string) =>
  findLine(chapter, id).durationInFrames;

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** frame が a〜b の間で 0→1 */
export const ramp = (frame: number, a: number, b: number) =>
  interpolate(frame, [a, b], [0, 1], clamp);

/** frame が a〜b の間だけ true */
export const within = (frame: number, a: number, b: number) =>
  frame >= a && frame < b;

/** 先生の置き方：大きく左／小さく左下 */
export type TeacherLayout = { x: number; footY: number; height: number };
export const BIG: TeacherLayout = { x: 330, footY: 885, height: 900 };
export const SMALL: TeacherLayout = { x: 190, footY: 860, height: 440 };
export const mixLayout = (a: TeacherLayout, b: TeacherLayout, k: number): TeacherLayout => ({
  x: a.x + (b.x - a.x) * k,
  footY: a.footY + (b.footY - a.footY) * k,
  height: a.height + (b.height - a.height) * k,
});
/** frame が小さい先生の区間に入っているかを、なめらかに 0〜1 で返す */
export const smallness = (
  frame: number,
  windows: [number, number][],
  blend = 12,
) => {
  let k = 0;
  for (const [a, b] of windows) {
    const v = Math.min(
      interpolate(frame, [a, a + blend], [0, 1], clamp),
      interpolate(frame, [b - blend, b], [1, 0], clamp),
    );
    k = Math.max(k, v);
  }
  return k;
};
