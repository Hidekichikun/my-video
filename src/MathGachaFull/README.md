# MathGachaFull（数学講義 確率と統計 #1）

台本・字幕・音声の長さは `src/MathGacha/`、画面のコードはこのフォルダ。

## 作り直し・調整

| やりたいこと | 場所 |
|---|---|
| 音声を差し替えた（字幕・長さの再計算） | `node scripts/measure_mathgacha_audio.cjs` → `python scripts/mathgacha_guide_envelopes.py` |
| 行間・章間・クイズの間・クレジットの長さ | `src/MathGacha/data/chapters.ts` |
| BGMの曲・音量・07章オチ曲のタイミング | `Bgm.tsx`（`TRACKS` の gain、`OCHI.dipSec`）。曲は `public/music/mathgacha/`（元は `music/math用/`） |
| 字幕で黄色にする用語 | `Subtitle.tsx` の `TERMS` |
| 章ごとの画面 | `chapters/Ch00〜Ch07.tsx`（行IDの開始フレームで置く） |
| 3D（ガチャ・100人・カプセル・コイン・棒グラフ） | `three/` |

## 書き出し

- 確認用の静止画・短い動画：`node scripts/render_mathgacha_check.cjs still 00-02@0.5 ...` / `video <from> <to> <名前>`（出力は `out/mathgacha-check/`、使い捨て）
- 本編：`node scripts/render_mathgacha_check.cjs video 0 <最終フレーム> mathgacha-full`（3Dは WebGL が要るので gl=angle）。完成したら `mv/MathGacha/` へ。

## 決め打ち

- 100人のシミュレーションは当たり63人・ハズレ37人に固定（`three/hundred.ts`、seed固定）。
- ガチャ・ルナちゃんは架空。クレジットの VOICEVOX 表記は規約確認まで仮。
