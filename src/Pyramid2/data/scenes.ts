/** 行ごとの背景とガイドの共通指定。HANDOFF.md 8〜9章に対応。 */
export type Scene = {
  from: number;
  to: number;
  file?: string;
  background?: "night" | "sand";
  side: "left" | "right";
  width?: number;
  dim?: number;
  focus?: [number, number];
};
const art = (
  from: number,
  to: number,
  file: string,
  side: Scene["side"],
  extra: Partial<Scene> = {},
): Scene => ({ from, to, file, side, ...extra });
const plain = (
  from: number,
  to: number,
  background: Scene["background"] = "night",
): Scene => ({ from, to, background, side: "right", width: 220 });

export const SCENES: Record<string, Scene[]> = {
  "00": [
    art(1, 2, "00-dawn-offering", "left", { dim: 0.3, width: 180 }),
    art(3, 3, "00-dawn-offering", "left", { dim: 0.3, width: 220 }),
    art(4, 4, "00-dawn-offering", "left", { width: 220, focus: [0.22, 0.72] }),
    plain(5, 8),
  ],
  "01": [
    art(1, 2, "01-nile-fields", "right"),
    art(3, 5, "01-flood-season", "left"),
    art(6, 8, "01-bakery-brewery", "right"),
    art(9, 9, "01-linen-weaving", "left"),
    art(10, 12, "01-kohl-makeup", "right"),
    art(13, 15, "01-family-meal", "left"),
  ],
  "02": [
    art(1, 3, "01-king-gods", "right"),
    art(4, 5, "02-maat-order", "right"),
    plain(6, 7),
    art(8, 10, "02-king-horus", "left"),
    art(11, 12, "09-funeral", "right"),
  ],
  "03": [
    plain(1, 2),
    art(3, 5, "03-ka-offering", "right"),
    art(6, 8, "03-ka-offering", "right", { focus: [0.32, 0.65] }),
    plain(9, 12, "sand"),
    art(13, 15, "03-wrapped-body", "left"),
    plain(16, 17),
  ],
  "04": [
    plain(1, 3, "sand"),
    art(4, 7, "04-false-door", "right"),
    art(8, 10, "04-serdab", "left"),
    art(11, 14, "04-offering-list", "right"),
    art(15, 16, "04-mortuary-temple", "left"),
    plain(17, 17, "sand"),
  ],
  "05": [
    art(1, 1, "08-people-dawn", "right", { dim: 0.3 }),
    art(2, 5, "05-hemiunu", "right"),
    art(6, 9, "04-serdab", "left"),
    art(10, 11, "05-boat-stone", "right"),
    plain(12, 12, "sand"),
    art(13, 13, "05-merer-papyrus", "right"),
    art(14, 16, "05-scribe", "right"),
    art(17, 22, "05-hetepheres-furniture", "left"),
    art(23, 24, "05-empty-sarcophagus", "right"),
    art(25, 26, "08-people-dawn", "right", { dim: 0.3, width: 220 }),
  ],
  "06": [
    art(1, 1, "09-funeral", "right"),
    art(2, 6, "06-opening-mouth", "left"),
    art(7, 8, "06-boat-pit", "right"),
    art(9, 11, "09-solar-boat", "right"),
    art(12, 13, "01-nile-fields", "right"),
    art(14, 16, "06-sunset-west", "left"),
    art(17, 20, "04-horizon-sunrise", "right"),
  ],
  "07": [
    plain(1, 3, "sand"),
    art(4, 5, "07-ra", "right"),
    art(6, 7, "07-horus", "left"),
    art(8, 9, "07-anubis", "right"),
    art(10, 13, "07-bastet", "left"),
    plain(14, 14),
    plain(15, 15, "sand"),
  ],
  "08": [
    plain(1, 5),
    art(6, 10, "08-people-dawn", "right", { dim: 0.35 }),
    art(11, 11, "10-horizon", "right"),
    plain(12, 13),
  ],
};

export const REUSED_ART = new Set([
  "01-nile-fields",
  "01-king-gods",
  "05-merer-papyrus",
  "05-boat-stone",
  "09-solar-boat",
  "09-funeral",
  "04-horizon-sunrise",
  "10-horizon",
]);
export const illustrationPath = (file: string) =>
  `photo/${REUSED_ART.has(file) ? "pyramid-anime" : "pyramid2-anime"}/${file}.png`;
export const sceneFor = (chapter: string, line: number): Scene => {
  const scene = SCENES[chapter]?.find((s) => line >= s.from && line <= s.to);
  if (!scene) throw new Error(`画面指定がありません: ${chapter}-${line}`);
  return scene;
};
export const PART_OF_CHAPTER: Record<string, string> = {
  "00": "導入",
  "01": "暮らし",
  "02": "王",
  "03": "死後",
  "04": "墓",
  "05": "人々",
  "06": "葬送",
  "07": "神々",
  "08": "まとめ",
};

export const denseLine = (id: string) =>
  new Set([
    "00-01",
    "00-02",
    "00-03",
    "00-05",
    "00-06",
    "00-07",
    "00-08",
    "01-04",
    "01-05",
    "02-03",
    "02-06",
    "02-07",
    "03-08",
    "03-09",
    "03-10",
    "03-11",
    "03-12",
    "03-15",
    "03-16",
    "03-17",
    "04-01",
    "04-02",
    "04-03",
    "04-16",
    "04-17",
    "05-04",
    "05-05",
    "05-12",
    "05-15",
    "05-16",
    "05-20",
    "05-21",
    "05-22",
    "05-25",
    "05-26",
    "06-04",
    "06-05",
    "06-06",
    "06-10",
    "06-11",
    "06-20",
    "07-01",
    "07-02",
    "07-03",
    "07-14",
    "07-15",
    "08-02",
    "08-03",
    "08-04",
    "08-05",
    "08-07",
    "08-08",
    "08-09",
    "08-12",
    "08-13",
  ]).has(id);
