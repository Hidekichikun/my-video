// 章の名前と、行のあとに足す「間」の指定。

export type ChapterMeta = {
  id: string;
  title: string;
  /** いまどこ？バッジ用の短い名前 */
  shortTitle: string;
};

export const CHAPTERS: ChapterMeta[] = [
  { id: "00", title: "先生、ガチャ沼", shortTitle: "オープニング" },
  { id: "01", title: "1%ってどういう意味？", shortTitle: "1%の意味" },
  { id: "02", title: "100人の私に引かせてみた", shortTitle: "100人の私" },
  { id: "03", title: "「全部ハズレ」から考える", shortTitle: "余事象" },
  { id: "04", title: "「そろそろ来る」はウソ", shortTitle: "そろそろ来る？" },
  { id: "05", title: "何回まわせば安心？", shortTitle: "何回で安心？" },
  { id: "06", title: "思い出しクイズ", shortTitle: "クイズ" },
  { id: "07", title: "オチと次回予告", shortTitle: "オチ" },
];

/** 行のあいだの無音（フレーム） */
export const LINE_GAP_FRAMES = 6;
/** 章のあいだの無音（章の最後の行のあと） */
export const CHAPTER_GAP_FRAMES = 20;
/** 動画の頭の余白（最初の行より前） */
export const LEAD_IN_FRAMES = 20;
/** 最後のクレジット（5秒） */
export const CREDITS_FRAMES = 150;

/** 行のあとに足す特別な間（セリフ無し）。この間も字幕は holdSubtitle=true なら出しっぱなし */
export const EXTRA_PAUSES: Record<
  string,
  { frames: number; holdSubtitle: boolean }
> = {
  // クイズ：問いのあと 2.5秒（カウントダウン 3・2・1）
  "06-03": { frames: 75, holdSubtitle: true },
  "06-08": { frames: 75, holdSubtitle: true },
  // 100連のあと 4秒の演出（セリフ無し）
  "07-04": { frames: 120, holdSubtitle: false },
};
