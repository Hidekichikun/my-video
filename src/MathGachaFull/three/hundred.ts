// 02章「100人の私」の決め打ちデータ。
// 当たり63人・ハズレ37人に固定（seed固定で毎回同じ並び・同じタイミング）。

import { mulberry32 } from "./toon";

export const GRID = 10;
export const N = GRID * GRID;
export const WINNERS = 63;
export const LOSERS = N - WINNERS;
/** カプセルが1個開くまでの周期（フレーム） */
export const CYCLE = 14;

export const SPACING_X = 1.12;
export const SPACING_Z = 1.0;

export type Person = {
  index: number;
  col: number;
  row: number; // 0=奥 → 9=手前
  x: number;
  z: number;
  win: boolean;
  /** 出てくる遅れ（0〜1） */
  appear: number;
  /** 結果が出る順番の乱数（0〜1） */
  rand: number;
  /** 当たり／ハズレの中での順位 */
  rank: number;
  /** ハズレだけ：集まる先（ハズレ37人のクラスター） */
  cluster?: { x: number; z: number };
  /** ジャンプ・体育座りのゆれの位相 */
  phase: number;
};

const build = (): Person[] => {
  const rng = mulberry32(20261121);
  // 当たりの人を決める（シャッフルして先頭63人）
  const order = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const winSet = new Set(order.slice(0, WINNERS));
  const people: Person[] = Array.from({ length: N }, (_, index) => {
    const col = index % GRID;
    const row = Math.floor(index / GRID);
    return {
      index,
      col,
      row,
      x: (col - (GRID - 1) / 2) * SPACING_X,
      z: (row - (GRID - 1) / 2) * SPACING_Z,
      win: winSet.has(index),
      appear: ((GRID - 1 - col) * 0.5 + (GRID - 1 - row)) / (GRID * 1.5),
      rand: rng(),
      rank: 0,
      phase: rng() * Math.PI * 2,
    };
  });
  // 当たり・ハズレそれぞれ、乱数の順に順位を付ける
  for (const win of [true, false]) {
    people
      .filter((p) => p.win === win)
      .sort((a, b) => a.rand - b.rand)
      .forEach((p, i) => (p.rank = i));
  }
  // ハズレ37人のクラスター位置（7・8・7・8・7人の5列）
  const rows = [7, 8, 7, 8, 7];
  const losers = people.filter((p) => !p.win).sort((a, b) => a.row - b.row || a.col - b.col);
  let k = 0;
  rows.forEach((count, r) => {
    for (let c = 0; c < count; c++) {
      const p = losers[k++];
      p.cluster = {
        x: (c - (count - 1) / 2) * 1.2,
        z: (r - 2) * 1.05,
      };
    }
  });
  return people;
};

export const PEOPLE = build();

export type HundredTimes = {
  /** 100人が出てき始める */
  appear: number;
  /** 一斉にまわし始める（よーい、スタート！） */
  start: number;
  /** 結果が出る：当たりが光り始める／ハズレのカプセルが止まる */
  revealFrom: number;
  revealTo: number;
  /** ハズレが体育座りになる */
  sadFrom: number;
  sadTo: number;
  /** ハズレ37人に寄る・当たりが退場する */
  focus: number;
};

/** 当たった人が光る・ジャンプに切り替わるフレーム */
export const winFrame = (p: Person, t: HundredTimes) =>
  t.revealFrom + (p.rank / (WINNERS - 1)) * (t.revealTo - t.revealFrom);
/** ハズレの最後のカプセルが開くフレーム */
export const loseStopFrame = (p: Person, t: HundredTimes) =>
  t.revealFrom + (0.15 + 0.7 * (p.rank / (LOSERS - 1))) * (t.revealTo - t.revealFrom) * 0.8;
/** 体育座りに切り替わるフレーム */
export const sadFrame = (p: Person, t: HundredTimes) =>
  t.sadFrom + (p.rank / (LOSERS - 1)) * (t.sadTo - t.sadFrom);

/** その時点で光っている（当たりが確定した）人数 */
export const winCount = (frame: number, t: HundredTimes) =>
  PEOPLE.filter((p) => p.win && frame >= winFrame(p, t)).length;
/** その時点で体育座りになっている人数 */
export const sadCount = (frame: number, t: HundredTimes) =>
  PEOPLE.filter((p) => !p.win && frame >= sadFrame(p, t)).length;
