import { ALL_LINES } from "../MathGacha/data/timeline";

/** 行 id の声が始まる動画全体のフレーム */
export const startOfLine = (id: string) => {
  const line = ALL_LINES.find((l) => l.id === id);
  if (!line) throw new Error(`行がありません: ${id}`);
  return line.from;
};
