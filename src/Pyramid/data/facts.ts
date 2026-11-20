// 画面に出す数字はすべてここから取る。値は research/ と RESEARCH.html で確かめた概数。
// 実装側で数字を変えたり、ここに無い数字を画面に足したりしない。

export type PyramidFact = {
  key: string;
  /** 比較図の下に出す名前 */
  label: string;
  king: string;
  dynasty: string;
  site: string;
  /** 建設当時の高さ（m） */
  heightM: number;
  /** 底辺の一辺（m） */
  baseM: number;
  /** 比較図での形 */
  shape: "step" | "bent" | "true";
  /** 比較図が出てくる章。この章以降で表示する */
  appearsInChapter: string;
};

/** 比較図に左から並べる順（時代順） */
export const PYRAMIDS: PyramidFact[] = [
  {
    key: "djoser",
    label: "ジェセル",
    king: "ジェセル王",
    dynasty: "第3王朝",
    site: "サッカラ",
    heightM: 62,
    baseM: 121,
    shape: "step",
    appearsInChapter: "02",
  },
  {
    key: "bent",
    label: "屈折",
    king: "スネフェル王",
    dynasty: "第4王朝",
    site: "ダハシュール",
    heightM: 105,
    baseM: 189,
    shape: "bent",
    appearsInChapter: "03",
  },
  {
    key: "red",
    label: "赤",
    king: "スネフェル王",
    dynasty: "第4王朝",
    site: "ダハシュール",
    heightM: 104,
    baseM: 220,
    shape: "true",
    appearsInChapter: "03",
  },
  {
    key: "khufu",
    label: "クフ",
    king: "クフ王",
    dynasty: "第4王朝",
    site: "ギザ",
    heightM: 146.5,
    baseM: 230.3,
    shape: "true",
    appearsInChapter: "04",
  },
  {
    key: "khafre",
    label: "カフラー",
    king: "カフラー王",
    dynasty: "第4王朝",
    site: "ギザ",
    heightM: 143.5,
    baseM: 215,
    shape: "true",
    appearsInChapter: "07",
  },
  {
    key: "menkaure",
    label: "メンカウラー",
    king: "メンカウラー王",
    dynasty: "第4王朝",
    site: "ギザ",
    heightM: 65,
    baseM: 103,
    shape: "true",
    appearsInChapter: "07",
  },
  {
    key: "unas",
    label: "ウナス",
    king: "ウナス王",
    dynasty: "第5王朝",
    site: "サッカラ",
    heightM: 43,
    baseM: 58,
    shape: "true",
    appearsInChapter: "08",
  },
];

/** 屈折ピラミッドの形：下の部分の高さ（m）と角度 */
export const BENT_SHAPE = {
  lowerHeightM: 47,
  lowerAngleDeg: 54,
  upperAngleDeg: 43,
};

export const KHUFU = {
  heightOriginalM: 146.5,
  heightNowM: 138,
  baseM: 230.3,
  statueCm: 7.5,
  entranceHeightM: 17,
  descendingAngleDeg: 26,
  grandGalleryLengthM: 47,
  grandGalleryHeightM: 8.5,
  relievingChambers: 5,
  bigVoidMinLengthM: 30,
  bigVoidYear: 2017,
  northCorridorLengthM: 9,
  northCorridorYear: 2023,
  solarBoatLengthM: 43,
};

export const SPHINX = { lengthM: 73, heightM: 20 };

/** 年表。year は紀元前をマイナスで表す概数 */
export const HISTORY_EVENTS = [
  { key: "djoser", label: "ジェセル王 階段ピラミッド", year: -2650 },
  { key: "khufu", label: "クフ王 大ピラミッド", year: -2550 },
  { key: "unas", label: "ウナス王 ピラミッド・テキスト", year: -2350 },
  { key: "tut", label: "ツタンカーメン 王家の谷", year: -1330 },
  { key: "cleopatra", label: "クレオパトラ7世", year: -40 },
  { key: "now", label: "現在", year: 2026 },
] as const;

/** 確度ラベル。画面の札はこの5種類だけを使う */
export const LABELS = {
  confirmed: "確定",
  likely: "有力",
  hypothesis: "仮説",
  noEvidence: "証拠なし",
  reconstruction: "再現",
} as const;

/** 地図に出す地名 */
export const PLACES = [
  { key: "giza", label: "ギザ" },
  { key: "saqqara", label: "サッカラ" },
  { key: "dahshur", label: "ダハシュール" },
  { key: "meidum", label: "メイドゥム" },
  { key: "tura", label: "トゥーラ" },
  { key: "wadiElJarf", label: "ワディ・エル＝ジャルフ" },
  { key: "luxor", label: "ルクソール（王家の谷）" },
  { key: "aswan", label: "アスワン" },
] as const;

/** クレジット。最後に必ず出す（キャラクターの利用規約による） */
export const CREDIT_VOICE = "VOICEVOX:暁記ミタマ";
/** 声優名。規約で必要と分かったら入れる。空なら出さない */
export const CREDIT_VOICE_ACTOR = "";
