// 原稿と音声の長さから、各章・各行が何フレーム目に始まるかを計算する。
// プレビズも本編もこの計算を使う。尺の決め方を変えるときはここだけを直す。

import { durations } from "./durations";
import { narration } from "./narration";
import type { NarrationChapter, NarrationLine } from "./types";

export const FPS = 30;

/** 章の頭に出す章タイトルの長さ（00章には出さない） */
export const CHAPTER_TITLE_FRAMES = 75;
/** 行と行の間の無音 */
export const LINE_GAP_FRAMES = 20;
/** 章の最後の行のあとに足す余白 */
export const CHAPTER_TAIL_FRAMES = 45;
/** 最後のクレジット */
export const CREDITS_FRAMES = 180;
/** 音声がまだ無い行は、字幕の文字数からこの速さで長さを見積もる（字/秒） */
export const ESTIMATE_CHARS_PER_SEC = 5.5;

export type TimedLine = NarrationLine & {
  from: number;
  durationInFrames: number;
  /** 音声ファイルがあり、長さを実測できた行か */
  hasAudio: boolean;
};

export type TimedChapter = Omit<NarrationChapter, "lines"> & {
  from: number;
  durationInFrames: number;
  /** 章タイトルを出すフレーム数（0なら出さない） */
  titleFrames: number;
  lines: TimedLine[];
};

export type Timeline = {
  chapters: TimedChapter[];
  creditsFrom: number;
  totalFrames: number;
};

const lineFrames = (
  line: NarrationLine,
): { frames: number; hasAudio: boolean } => {
  const sec = durations[line.id];
  if (sec !== undefined) {
    return { frames: Math.ceil(sec * FPS), hasAudio: true };
  }
  return {
    frames: Math.ceil((line.subtitle.length / ESTIMATE_CHARS_PER_SEC) * FPS),
    hasAudio: false,
  };
};

export const buildTimeline = (): Timeline => {
  let cursor = 0;
  const chapters: TimedChapter[] = narration.chapters.map((chapter) => {
    const chapterFrom = cursor;
    const titleFrames = chapter.id === "00" ? 0 : CHAPTER_TITLE_FRAMES;
    cursor += titleFrames;
    const lines: TimedLine[] = chapter.lines.map((line) => {
      const { frames, hasAudio } = lineFrames(line);
      const timed: TimedLine = {
        ...line,
        from: cursor,
        durationInFrames: frames,
        hasAudio,
      };
      cursor += frames + LINE_GAP_FRAMES;
      return timed;
    });
    cursor += CHAPTER_TAIL_FRAMES;
    return {
      ...chapter,
      from: chapterFrom,
      durationInFrames: cursor - chapterFrom,
      titleFrames,
      lines,
    };
  });
  const creditsFrom = cursor;
  return { chapters, creditsFrom, totalFrames: creditsFrom + CREDITS_FRAMES };
};

export const TIMELINE = buildTimeline();
