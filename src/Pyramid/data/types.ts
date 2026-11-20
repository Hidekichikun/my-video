export type NarrationLine = {
  /** 章-番号。音声ファイル名にもなる（例: "05-03"） */
  id: string;
  /** 画面に出す字幕。変更しない */
  subtitle: string;
  /** VOICEVOXに読ませる文 */
  reading: string;
  /** この行を読んでいる間の画面指示 */
  screen: string;
  /** public/ からの相対パス */
  audio: string;
};

export type NarrationChapter = {
  id: string;
  title: string;
  /** 原稿を書いたときの予想の秒数。実際の尺は音声で決まる */
  targetSec: number | null;
  lines: NarrationLine[];
};

export type Narration = {
  source: string;
  voice: string;
  chapters: NarrationChapter[];
};
