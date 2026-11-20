# Pyramid2Full

古代エジプト予習動画・第2弾。HANDOFF.mdの9章とクレジットを1920×1080・30fpsで実装。
143本の実測音声から24,275フレーム（13分29.167秒）を計算する。

## Studio

- 全体：`Pyramid2Full`
- 章別：`Pyramid2-chapters` → `Pyramid2Ch00`〜`Pyramid2Ch08`

## 再生成と書き出し

```powershell
node scripts/measure_pyramid2_audio.cjs
python scripts/pyramid2_guide_envelopes.py
node scripts/render_pyramid2.cjs --pop --qa-only
node scripts/verify_pyramid2.cjs --pop --fix2
python scripts/pyramid2_contact_sheets.py --pop
node scripts/render_pyramid2.cjs --pop --render-only --preview
node scripts/render_pyramid2.cjs --pop --render-only
```

`render_pyramid2.cjs --pop` は、全143行の途中・章タイトル8場面・クレジット・口の閉じた間・まばたき・クロスフェードを静止画で確認し、字幕の一致と文字の安全域・重なりを実測してから本編を書き出す。
部分確認は `--pop --qa-only --checks=05-12,05-20` のように行IDで指定できる。

- ポップ版本編：`out/pyramid2-full-pop.mp4`
- 元の本編（保存済み）：`out/pyramid2-full.mp4`
- ポップ版の冒頭45秒：`out/pyramid2-preview-pop.mp4`
- ポップ版の静止画・章別コンタクトシート・検証記録：`out/pyramid2-pop-check/`

## 修正箇所

### POP_FIX_1（2026-10-19）

- クレジットは `VOICEVOX:暁記ミタマ` を使用。旧表記は実装内に残っていない（修正指示書にのみ記載）。
- 後世の話の本文を64pxに拡大し、文字に合わせてカードを詰めた。右上に直径240pxの赤い×のハンコ。
- まとめは本文56pxと緑の✔丸バッジ。前回の動画はpinkの札と64px・2行の題名。
- カー／バー／アクは中央の大きなカードと64pxの名前・48pxの説明。4枚カードと神々は中央の2×2配置に拡大し、札は44〜56px。
- `pop/PortMap.tsx`：ギザ・トゥーラ・ワディ・エル＝ジャルフを大きな地図と44〜56pxの札で表示。実際の地点と引出線で結び、地名の重なりを解消。小さな概略図表示を削除。
- 現在の章の札を36pxに、増水の「ちょうどいい」をgreenに変更。
- 字幕の文字は維持し、日本語の語境界と句読点で改行。固有名詞と「死んだあと」「ホライゾン・オブ・クフ」は途中で切らない。
- 前のポップ版は `out/pyramid2-full-pop-v1.mp4` に改名して保存。今回開始時の保護対象ハッシュは `out/pyramid2-pop-fix1-preserved-hashes.json`。



- `src/Pyramid2/data/scenes.ts`：行範囲ごとの背景・キャラの側・基本サイズ。
- `src/Pyramid2/data/guide-cues.ts`：全編のガイド位置・ポーズ。音声RMSで口パク、連続した周期でまばたき。
- `chapters/`：章ごとの札・カード・図解。
- `Bgm.tsx`：音源、使える曲の区間、音量とクロスフェード。前作と同じ曲・設定を使用。
- `Stage.tsx`：背景のゆっくりした寄りとクロスフェード。
- `pop-theme.ts` と `pop/`：POP_STYLE.md用の新しい配色・フォント・字幕・バッジ・文字カード・章タイトル・イラスト入りアイコン。見本の承認後、全9章・章別コンポジションとクレジットに反映。

字幕は `narration.ts` の `subtitle` を直接表示する。`narration.ts`・`durations.ts`・`speech-energy.ts` は手で編集しない。
前作の3フォルダは変更せず、共通部品・フォント・色のみimportしている。

仕様内の食い違いに対する仮実装は `src/Pyramid2/HANDOFF.md` 末尾の確認リストに記載。

## ポップ版

`src/Pyramid2/POP_STYLE.md` 10章の手順に従い、先に次の6場面を作成：00-03、00-08、01章タイトル、03-04、03-16、05-04。

```powershell
node scripts/render_pyramid2_pop_samples.cjs
```

画像と検証記録は `out/pyramid2-pop-sample/`。入口は `pop-sample-entry.tsx`。
2026-10-18、持ち主から「内容と方針はそのまま、絵の方向性をこのまま進める」と承認を受け、`Pyramid2Full` と章別コンポジションの見た目を更新。
音声・字幕の文章・タイムライン・ガイドの位置と口パク・BGMは維持。元の `out/pyramid2-full.mp4` も保存。
字幕は文字を変えず最大2行に分ける。2行でも幅を超える長文だけの横幅補正は、本編反映時の確認対象。


### ポップ版の修正箇所と検証

- `index.tsx`：フォントの読込待ち、ポップ版字幕・章タイトルを本編と章別に適用。
- `Stage.tsx`：絵のない背景をcream＋水玉へ変更し、左上／右上に現在の章を表示。行の開始に合わせて札が弾む。
- `parts.tsx`：全章の札・意味をつなぐ矢印・確度ラベル・白いカード・イラスト入りの丸・三角図・増水の目盛り・配置図・まとめ。
- `pop/NileMap.tsx`：地理とルートを維持したローカル版。太い線とポップ配色・見出し書体へ変更。
- `chapters/Ch07Gods.tsx`：後世の話を赤い札と×で表示。クレジットも明るい背景と丸ゴシックに統一。
- `LayoutAudit.tsx`：字幕の一致、2行以内、フォント読込、安全領域、キャラ・字幕・他の文字との重なりを確認。

```powershell
node scripts/render_pyramid2.cjs --pop --qa-only
node scripts/verify_pyramid2.cjs --pop --fix2
python scripts/pyramid2_contact_sheets.py --pop
node scripts/render_pyramid2.cjs --pop --render-only
python scripts/verify_pyramid2_media.py --pop --fix2
```

出力：`out/pyramid2-full-pop.mp4`、冒頭45秒 `out/pyramid2-preview-pop.mp4`。検証画像・記録：`out/pyramid2-pop-check/`。
既存の検証画像・元のMP4とは別のファイルに保存する。長い字幕の幅補正値も各場面のDOM検証に記録する。


2026-10-18：ポップ版本編・45秒プレビューの書き出し完了。全164場面のDOM検証は問題0件。映像・音声の全編デコードもエラーなし。元動画とのPCM音声ハッシュは完全一致。実装と検証の詳細は `POP_IMPLEMENTATION.md`。


2026-10-19：POP_FIX_1の修正版を書き出し完了。旧版は `out/pyramid2-full-pop-v1.mp4` に保存。最終160フレームの配置検査と字幕143本の一致を確認。完成MP4・45秒プレビューを全編デコードしてエラーなし。音声のPCMハッシュは元動画と一致。詳細は `POP_FIX_1_IMPLEMENTATION.md`。


## POP_FIX_2（2026-10-19）

差し替え済みの06-20・08-06の音声を再計測し、口パクを再生成。章タイトル・現在の章の札も更新済みの原稿を使用。06-20の「アケト・クフ → クフの地平線」「Horizon of Khufu」は維持。旧版は `out/pyramid2-full-pop-v2.mp4` に保存済み。

### 説明欄用チャプター（章タイトル開始）

| 章 | 開始秒 | 説明欄用 |
| --- | ---: | --- |
| 00 | 0.000 | 00:00 導入：ピラミッドは「なぜ」必要だった？ |
| 01 | 40.733 | 00:40 ナイルが作った暮らし |
| 02 | 126.267 | 02:06 王ってそもそも何者？ |
| 03 | 200.933 | 03:20 人は死ぬとどうなる？ |
| 04 | 307.567 | 05:07 お墓は「儀式を続ける装置」 |
| 05 | 396.933 | 06:36 王を支えた人たち |
| 06 | 547.933 | 09:07 葬送と太陽の船 |
| 07 | 658.933 | 10:58 神々の役割 |
| 08 | 731.833 | 12:11 まとめ：ピラミッドを見る3つの問い |

開始秒は30fpsのフレーム位置から計算。説明欄用の時刻は秒未満を切り捨て。

2026-10-19：POP_FIX_2の本編と45秒プレビューの再書き出し完了。字幕143本の一致・全156場面の配置検査は問題0件。完成MP4とプレビューの映像・音声を全編デコードしてエラーなし。詳細は `POP_FIX_2_IMPLEMENTATION.md`。
