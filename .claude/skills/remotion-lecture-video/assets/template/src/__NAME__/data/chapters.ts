// 章の名前と、行のあとに足す「間」の指定。台本の行ID（例 01-03）に合わせて書き換える。

export type ChapterMeta = {
  id: string;
  title: string;
  /** いまどこ？バッジ用の短い名前 */
  shortTitle: string;
};

export const CHAPTERS: ChapterMeta[] = [
  { id: "00", title: "オープニング", shortTitle: "オープニング" },
  // { id: "01", title: "…", shortTitle: "…" },
];

/** 行のあいだの無音（フレーム） */
export const LINE_GAP_FRAMES = 6;
/** 章のあいだの無音（章の最後の行のあと） */
export const CHAPTER_GAP_FRAMES = 20;
/** 動画の頭の余白（最初の行より前） */
export const LEAD_IN_FRAMES = 20;
/** 最後のクレジット（5秒） */
export const CREDITS_FRAMES = 150;

/** 行のあとに足す特別な間（セリフ無し）。例：クイズの考える間、演出の間 */
export const EXTRA_PAUSES: Record<string, { frames: number; holdSubtitle: boolean }> = {
  // "06-03": { frames: 75, holdSubtitle: true },
};
