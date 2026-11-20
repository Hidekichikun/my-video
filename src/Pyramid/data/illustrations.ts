// イラストの一覧。アニメ調の素材は public/photo/pyramid-anime/ に置く。
// 元のCG素材は public/photo/pyramid/ に保存している。
// ファイルがまだ無いときは、Illustration 部品がこの説明を使ってプレースホルダーを出す。

export type IllustrationInfo = {
  file: string;
  description: string;
  /** 使う行（目安） */
  lines: string;
};

export const ILLUSTRATIONS: IllustrationInfo[] = [
  {
    file: "00-dawn-giza.png",
    description: "夜明けの砂漠に立つ大ピラミッド（遠景）",
    lines: "00-01〜00-02",
  },
  {
    file: "00-empty-pedestal.png",
    description: "空の台座（00-khufu-statue.png から像だけを消したもの）",
    lines: "00-03",
  },
  {
    file: "00-khufu-statue.png",
    description: "クフ王の小さな象牙の座像（イメージ）",
    lines: "00-04〜00-05",
  },
  {
    file: "01-nile-fields.png",
    description: "ナイル川沿いの黒い土と畑、働く人々",
    lines: "01-07〜01-08",
  },
  {
    file: "01-king-gods.png",
    description: "神々と人々の間に立つ王",
    lines: "01-09〜01-10",
  },
  {
    file: "04-giza-now.png",
    description: "現在の大ピラミッド（茶色い段々）",
    lines: "04-05〜04-06、04-09",
  },
  {
    file: "04-giza-then.png",
    description: "同じ構図で、白い化粧石に覆われた完成時の姿",
    lines: "04-07〜04-08",
  },
  {
    file: "04-horizon-sunrise.png",
    description: "地平線から昇る太陽とピラミッド",
    lines: "04-10",
  },
  {
    file: "05-workers-town.png",
    description: "労働者の町の俯瞰（パン工房、倉庫、長い建物）",
    lines: "05-03〜05-06",
  },
  {
    file: "05-merer-papyrus.png",
    description: "文字の書かれた古いパピルス",
    lines: "05-08〜05-09",
  },
  {
    file: "05-boat-stone.png",
    description: "白い石灰岩を積んでナイルを進む船",
    lines: "05-10〜05-11",
  },
  {
    file: "05-sledge-sand.png",
    description: "そりで石を引く人々と、前の砂に水をまく人",
    lines: "05-12〜05-13",
  },
  {
    file: "06-grand-gallery.png",
    description: "大回廊の内部。持ち送りの高い天井を見上げる",
    lines: "06-05〜06-06",
  },
  {
    file: "06-kings-chamber.png",
    description: "赤い花崗岩の王の間と、ふたのない石棺",
    lines: "06-09〜06-10",
  },
  {
    file: "06-crew-graffiti.png",
    description: "石に赤い顔料で書かれた作業班の落書き",
    lines: "06-12",
  },
  {
    file: "07-sphinx.png",
    description: "大スフィンクスと、背後のカフラーのピラミッド",
    lines: "07-05〜07-06",
  },
  {
    file: "08-pyramid-texts.png",
    description: "青い文字が壁一面に刻まれた埋葬室",
    lines: "08-04〜08-05",
  },
  {
    file: "08-valley-kings.png",
    description: "王家の谷と、自然のピラミッド形の山",
    lines: "08-09〜08-10",
  },
  {
    file: "08-tomb-light.png",
    description: "地下の墓の入口に光が差し込む",
    lines: "08-11",
  },
  {
    file: "09-solar-boat.png",
    description: "全長約43mの木造船（太陽の船）",
    lines: "09-06〜09-07",
  },
  {
    file: "09-funeral.png",
    description: "王の葬列のシルエット",
    lines: "09-08",
  },
  {
    file: "10-horizon.png",
    description: "地平線から昇る太陽と3つのピラミッド（建設当時の白い姿）",
    lines: "10-09",
  },
];

export const ILLUSTRATION_DIR = "photo/pyramid-anime";
