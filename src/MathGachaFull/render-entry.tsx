// MathGacha だけを登録した軽いエントリ（確認用の静止画・プレビューの書き出し用）。
// 本番の書き出しは src/index.ts（Root.tsx 経由）でも同じ MathGachaFull を使う。
import React from "react";
import { Composition, registerRoot } from "remotion";
import { MathGachaFull, MATHGACHA_FULL_DURATION } from "./index";

const Root: React.FC = () => (
  <Composition
    id="MathGachaFull"
    component={MathGachaFull}
    durationInFrames={MATHGACHA_FULL_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
);
registerRoot(Root);
