// __NAME__ だけを登録した軽いエントリ（確認用の静止画・プレビュー・本編の書き出し用）。
// フォントや他作品を読まないので、src/index.ts より速い。
import React from "react";
import { Composition, registerRoot } from "remotion";
import { __NAME__Full, __NAME___FULL_DURATION } from "./index";

const Root: React.FC = () => (
  <Composition
    id="__NAME__Full"
    component={__NAME__Full}
    durationInFrames={Math.max(1, __NAME___FULL_DURATION)}
    fps={30}
    width={1920}
    height={1080}
  />
);
registerRoot(Root);
