---
name: remotion-lecture-video
description: ヒデキさんの講義・解説動画（数学講義シリーズ MathGacha 型、ポップ路線・先生の立ち絵＋3D演出・VOICEVOX行ID音声）を Remotion で組み立てて書き出すワークフロー。台本・行ID付き音声・立ち絵ができたあとの「骨組み作成→音声の尺計測→章ごとの画面→静止画確認→BGM→本編書き出し→mv/へ納品」を担当。新しい講義動画を作る、章を足す・直す、字幕・間・BGM・3D・先生の口パクを調整する、全編を書き出し直す、というときに使う。企画・台本づくりは kyuni-explainer-video、ドット絵MVは shachiku-pixel-mv の担当。
---

# remotion-lecture-video

MathGacha（確率と統計 #1）で作った組み立て方を、次の講義動画に使い回すためのスキル。
前提の素材：`readings_with_ids.tsv`（番号／行ID／読み／字幕）、`voice/<作品>/<行ID>.wav`、先生の立ち絵、台本の【画】指示。

先に `references/gotchas.md` を読む（つまずきと決まりごと）。

## 手順

1. **骨組み**：`python .claude/skills/remotion-lecture-video/scripts/scaffold.py <Name> <slug>`
   `src/<Name>/data/`（章・間・尺）と `src/<Name>Full/`（字幕・札・先生・BGM・3D土台・render-entry）ができる。既存ファイルは上書きしない。
2. **素材を置く**：音声は `public/audio/<slug>/<行ID>.wav`、BGMは `public/music/<slug>/`、新しい絵は `public/photo/<slug>/`。立ち絵は共通（`public/photo/math-guide/`、詳細は `references/art-and-voice.md`）。
3. **章と間を書く**：`src/<Name>/data/chapters.ts` に章（ID・タイトル・短い名前）と `EXTRA_PAUSES`（クイズの間・演出の間）。
4. **尺を測る**（音声を差し替えたら毎回）：
   - `node .claude/skills/remotion-lecture-video/scripts/measure_narration.cjs --tsv <tsv> --audio-dir public/audio/<slug> --audio-url audio/<slug> --out src/<Name>/data/narration.ts`
   - `python .claude/skills/remotion-lecture-video/scripts/speech_envelopes.py --audio-dir public/audio/<slug> --out src/<Name>/data/speech-energy.ts`
5. **字幕の用語を決める**：`src/<Name>Full/Subtitle.tsx` の `TERMS`（黄色にする語。1行に最初の1つだけ）と `KEEP_PHRASES`。
6. **章の画面を作る**：`chapters/ChapterExample.tsx` をコピーして `Ch01.tsx`…。`index.tsx` の `VIEWS` に登録。画面づくりのパターンは `references/scene-patterns.md`（3D・図・カウントダウン・札の置き方）。
7. **まず最初の章を作って見せる**：静止画数枚＋冒頭プレビューをヒデキさんに見せ、OKが出てから全章へ。
8. **確認用の書き出し**（`render_check.cjs`、使い捨て）：
   `node .claude/skills/remotion-lecture-video/scripts/render_check.cjs still --entry src/<Name>Full/render-entry.tsx --comp <Name>Full --timeline src/<Name>/data/timeline.ts --out out/<slug>-check 00-02@0.5 03-10+30`
   章ごとに静止画を撮ってコンタクトシート（PIL）で見渡し、はみ出し・重なりを直す。動画は `video <from> <to> <名前>`、音声だけは `audio`。
9. **BGM**：`references/bgm.md`（曲の測り方・Sunoプロンプト・オチ曲の合わせ方）。
10. **本編の書き出し**：`render_check.cjs video … 0 <最終フレーム> <slug>-full`。完成したら `mv/<作品>/` に置き、古い版は `_archive/` へ。`out/…-check/` は消す（その中にいるシェルからは消せないので `cd` で出てから）。
11. **後片付け**：`Root.tsx` に `<Name>Full` と章別 `<Name>Ch00…` を登録（Folder は Explainer）、`CLAUDE.md` の作品対応表に行を足す、`src/<Name>Full/README.md` に調整場所をまとめる。

## 決まりごと（要点）

- 前作（Pyramid 系・MathGacha など）のファイルは変えない。コピーして使う。
- 確認は静止画 → 短いプレビュー → 全編の順。音と動きは私には聴けない・見られないので、「ヒデキさんの耳と目でまだ」と正直に伝える。
- 大きい動画（約30MB超）は `SendUserFile` で送れない。保存先のパスを伝える。
- 台本・字幕・札の言い回しはヒデキさんのチャンネル設定に従う（MathGacha は「Numi（ナミ）先生」「数学講師」「本日の講義」で確定）。
