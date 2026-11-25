// 行の音声の長さから、各行・各章が何フレーム目に始まるかを計算する。
// 尺の決め方を変えるときは chapters.ts の定数かここだけを直す。

import { NARRATION, type NarrationLine } from "./narration";
import {
  CHAPTERS,
  CHAPTER_GAP_FRAMES,
  CREDITS_FRAMES,
  EXTRA_PAUSES,
  LEAD_IN_FRAMES,
  LINE_GAP_FRAMES,
  type ChapterMeta,
} from "./chapters";

export const FPS = 30;
export { LINE_GAP_FRAMES, CREDITS_FRAMES };

export type TimedLine = NarrationLine & {
  from: number;
  durationInFrames: number;
  /** 字幕を出しておく長さ（声の長さ＋行間＋特別な間） */
  subtitleFrames: number;
  /** この行のあとの特別な間（0なら無し） */
  pauseFrames: number;
};

export type TimedChapter = ChapterMeta & {
  from: number;
  durationInFrames: number;
  lines: TimedLine[];
};

export type Timeline = {
  chapters: TimedChapter[];
  creditsFrom: number;
  totalFrames: number;
};

export const buildTimeline = (): Timeline => {
  let cursor = LEAD_IN_FRAMES;
  const chapters: TimedChapter[] = CHAPTERS.map((meta, ci) => {
    const chapterFrom = ci === 0 ? 0 : cursor;
    const lines: TimedLine[] = NARRATION.filter((l) => l.chapter === meta.id).map(
      (line) => {
        const frames = Math.ceil(line.sec * FPS);
        const pause = EXTRA_PAUSES[line.id];
        const pauseFrames = pause?.frames ?? 0;
        const timed: TimedLine = {
          ...line,
          from: cursor,
          durationInFrames: frames,
          pauseFrames,
          subtitleFrames:
            frames + LINE_GAP_FRAMES + (pause?.holdSubtitle ? pauseFrames : 0),
        };
        cursor += frames + LINE_GAP_FRAMES + pauseFrames;
        return timed;
      },
    );
    cursor += CHAPTER_GAP_FRAMES - LINE_GAP_FRAMES;
    return {
      ...meta,
      from: chapterFrom,
      durationInFrames: cursor - chapterFrom,
      lines,
    };
  });
  const creditsFrom = cursor;
  return { chapters, creditsFrom, totalFrames: creditsFrom + CREDITS_FRAMES };
};

export const TIMELINE = buildTimeline();
export const ALL_LINES = TIMELINE.chapters.flatMap((c) => c.lines);
