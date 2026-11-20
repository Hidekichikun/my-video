# 引き継ぎ仕様書：エジプト予習動画 第2弾（本編の実装）

- 版：v1.0（2026-10-18）
- 作成：Claude（台本・データ・画面設計）
- 実装担当：Codex
- テーマ：ピラミッドは「なぜ」必要だった？ ― 暮らし・王・死後の世界（前作 `PyramidFull` の続編）

この仕様書は上から順に読めば実装できるように書いてある。書いていないことは勝手に決めず、12章「困ったとき」に従う。
**前作の `src/Pyramid/HANDOFF.md` と `src/PyramidFull/` が、そのまま見本になる。** 作り方・部品・見た目は前作に合わせる。

---

## 1. 作るもの

- Remotionのコンポジション `Pyramid2Full` を1本。1920×1080、30fps。
- 長さの見込み：声だけで 674.6秒（11分15秒）。行間・章タイトル・クレジットを足して約13分半。
- 中身：台本 `src/Pyramid2/script.md`。9章（00〜08）＋クレジット。
- 画風・字幕・章タイトル・解説キャラ・BGMの扱いは前作 `PyramidFull`（最終版 `out/pyramid-guide-fulltime.mp4`）と同じ。
- 章ごとの確認用に、フォルダ `Pyramid2-chapters` に `Pyramid2Ch00`〜`Pyramid2Ch08` も登録する（前作の `Pyramid-chapters` と同じ形）。

## 2. 絶対に守ること

1. **字幕を変えない。** 字幕は `src/Pyramid2/data/narration.ts` の `subtitle` をそのまま出す。言い回しの修正、数字の追加はしない。
2. **自動生成ファイルを手で編集しない。** `narration.ts` は `python src/Pyramid2/data/make_narration.py`、`durations.ts` は音声の計測スクリプトで作る。画面指示を直すときは `screens.py` を直して作り直す。
3. **尺を手で決めない。** 章・行のフレームは timeline（前作の `src/Pyramid/data/timeline.ts` と同じ計算）から取る。
4. **使う画像は8章の一覧にあるものだけ。** 実在の写真は使わない。ヒエログリフ・ヒエラティックの「本物風の文字」も作らない（5章の比較カードは日本語の文字だけ）。
5. **確度の札は前作の5種類だけ**（確定・有力・仮説・証拠なし・再現）。
6. **前作を壊さない。** `src/Pyramid/`、`src/PyramidFull/`、`src/PyramidPrevis/` のファイルは変更しない。必要なものは import するか、`src/Pyramid2Full/` にコピーして直す。`src/Root.tsx` には登録を足すだけ。
7. **調べ物をしない。** 史実の追加や修正はしない。疑問は12章の確認リストに書く。

## 3. ファイル構成

### 用意済み（Claudeが作成）

| パス | 中身 |
| --- | --- |
| `src/Pyramid2/script.md` | 台本（人が読む版）。タイトル案・説明欄・ショート候補もここ |
| `src/Pyramid2/data/narration.ts` | データ版（自動生成）。9章・143行。各行に `subtitle`・`reading`・`screen`・`audio` |
| `src/Pyramid2/data/screens.py` | 章の名前と、行ごとの画面指示（9章の表と同じ内容） |
| `src/Pyramid2/data/make_narration.py` | `narration.ts` を作り直すスクリプト |
| `src/Pyramid2/voicevox/readings_with_ids.tsv` | 番号・行ID・読み・字幕の表 |
| `src/Pyramid2/voicevox/pyramid2.vvproj` | VOICEVOXのプロジェクト（録り直し用） |
| `public/audio/pyramid2/{行ID}.wav` | 音声143本（`00-01.wav`〜`08-13.wav`）。24kHz・16bit |
| `voice/pyramid2/` | VOICEVOXの書き出しそのまま（字幕用txt付き）。元データとして残すだけ |
| `public/photo/pyramid2-anime/` | 新しいイラスト27枚（1536×864） |
| `public/photo/pyramid-anime/` | 前作のイラスト。8枚を使い回す |
| `public/photo/pyramid-guide/` | 解説キャラ5枚（neutral / talk / blink / point / wonder） |

### これから作る（Codexの担当）

```
src/Pyramid2/data/
  durations.ts         音声の長さ（計測スクリプトで自動生成）
  timeline.ts          前作の timeline.ts を narration だけ差し替えてコピー
  speech-energy.ts     口パク用（前作の scripts/pyramid_guide_envelopes.py を Pyramid2 向けに）
  guide-cues.ts        解説キャラの出る位置・大きさ・ポーズ
src/Pyramid2Full/
  index.tsx            Pyramid2Full 本体
  chapters/Ch00Intro.tsx 〜 Ch08Summary.tsx, Credits.tsx
  Guide.tsx, Bgm.tsx   前作のものをコピーして参照先を Pyramid2 に
scripts/
  measure_pyramid2_audio.cjs     前作の measure_pyramid_audio.cjs のコピー（入出力先だけ変更）
  pyramid2_guide_envelopes.py    前作の pyramid_guide_envelopes.py のコピー
```

- 共通部品は `src/PyramidPrevis/components` から import する（`Subtitle`、`ChapterTitle`、`Illustration`、`LabelTag`、`IconRow`、`NileMap`、`Checklist` など）。
- `Illustration` は `public/photo/pyramid/` を見る作りなら、包むかコピーして `pyramid2-anime/` と `pyramid-anime/` を読めるようにする（部品そのものは書き換えない）。
- 色とフォントは `src/PyramidPrevis/theme.ts` から。部の名前（`PART_OF_CHAPTER`）は前作用なので、Pyramid2用を `src/Pyramid2Full/` に作る（10章の表）。

## 4. 時間の組み立て

前作と同じ数値を使う：章タイトル75フレーム（00章は0）、行間 `LINE_GAP_FRAMES` 20、章の終わり45、クレジット180、字幕は声より10フレーム前から（`SUBTITLE_LEAD_FRAMES`）。
`index.tsx` の組み方も前作の `src/PyramidFull/index.tsx` と同じ（章は Sequence で並べ、音声と字幕は全体の時間で並べる）。

## 5. 音声

- 143本、そろっている。設定は全行同じ（暁記ミタマ ノーマル、話速1.15、音高0.01、抑揚1.5、前後の無音0.1秒）。
- 最初に計測スクリプトを動かして `durations.ts` を作る。「音声が無い行」が0件であることを確かめる。

## 6. BGM

- **前作と同じ曲を使う**（`public/music/pyramid/find-you-again-inst.mp3`、前作の `Bgm.tsx` の音量・フェードの付け方をそのまま）。シリーズで雰囲気をそろえるため。
- 曲の長さが足りなければ、前作と同じやり方でループかクロスフェードでつなぐ。
- 持ち主が別の曲にしたいと言ったら、そのファイルに差し替えるだけで済む作りにしておく。

## 7. 解説キャラ

- 前作の最終版と同じく、章タイトル・無音の区間・クレジットも含め全編に出す。口パク・まばたき・3ポーズも同じ。
- 左右どちらに立つかは、イラストごとに決めてある（8章の「キャラ」列）。イラストのその側が空けてある。
- 図やカードが多い画面では小さく（180〜260px）、背景だけの画面では大きく（〜440px）。
- ポーズの目安：札や図が出る行は `point`、確度の札（証拠なし・仮説）や「不思議なことに」の行は `wonder`、それ以外は `neutral`/`talk`。

## 8. イラスト一覧

| ファイル | 置き場所 | キャラ | 使う行 |
| --- | --- | --- | --- |
| 00-dawn-offering | pyramid2-anime | 左※ | 00-01〜00-04 |
| 01-nile-fields | pyramid-anime | 右 | 01-01〜01-02、06-12〜06-13 |
| 01-flood-season | pyramid2-anime | 左 | 01-03〜01-05 |
| 01-bakery-brewery | pyramid2-anime | 右 | 01-06〜01-08 |
| 01-linen-weaving | pyramid2-anime | 左 | 01-09 |
| 01-kohl-makeup | pyramid2-anime | 右 | 01-10〜01-12 |
| 01-family-meal | pyramid2-anime | 左 | 01-13〜01-15 |
| 01-king-gods | pyramid-anime | 右 | 02-01〜02-03 |
| 02-maat-order | pyramid2-anime | 右 | 02-04〜02-07 |
| 02-king-horus | pyramid2-anime | 左 | 02-08〜02-10 |
| 09-funeral | pyramid-anime | 右 | 02-11〜02-12、06-01 |
| 03-ka-offering | pyramid2-anime | 右 | 03-03〜03-08 |
| 03-wrapped-body | pyramid2-anime | 左 | 03-13〜03-15 |
| 04-false-door | pyramid2-anime | 右 | 04-04〜04-07 |
| 04-serdab | pyramid2-anime | 左 | 04-08〜04-10、05-06〜05-09 |
| 04-offering-list | pyramid2-anime | 右 | 04-11〜04-14 |
| 04-mortuary-temple | pyramid2-anime | 左 | 04-15〜04-16 |
| 08-people-dawn | pyramid2-anime | 右 | 05-01、05-25〜05-26、08-06〜08-10 |
| 05-hemiunu | pyramid2-anime | 右 | 05-02〜05-05 |
| 05-boat-stone | pyramid-anime | 右 | 05-10〜05-11 |
| 05-red-sea-port | pyramid2-anime | 左 | 予備（05-12の地図が作れないとき） |
| 05-merer-papyrus | pyramid-anime | 右 | 05-13 |
| 05-scribe | pyramid2-anime | 右 | 05-14、05-16 |
| 05-hetepheres-furniture | pyramid2-anime | 左 | 05-17〜05-22 |
| 05-empty-sarcophagus | pyramid2-anime | 右 | 05-23〜05-24 |
| 06-opening-mouth | pyramid2-anime | 左 | 06-02〜06-06 |
| 06-boat-pit | pyramid2-anime | 右 | 06-07〜06-08 |
| 09-solar-boat | pyramid-anime | 右 | 06-09〜06-11 |
| 06-sunset-west | pyramid2-anime | 左 | 06-14〜06-15 |
| 04-horizon-sunrise | pyramid-anime | 右 | 06-15〜06-20 |
| 07-ra | pyramid2-anime | 右 | 07-04〜07-05 |
| 07-horus | pyramid2-anime | 左 | 07-06〜07-07 |
| 07-anubis | pyramid2-anime | 右 | 07-08〜07-09 |
| 07-bastet | pyramid2-anime | 左 | 07-10〜07-13 |
| 10-horizon | pyramid-anime | 右 | 08-11 |

※00-dawn-offering は右を空けて作ったが、左右に札を出すので、キャラは00-03以降に小さく出す。
- 全部 `Illustration` でゆっくり寄る（前作と同じ `zoom` の幅）。札や図を重ねる行は `dim` 0.2〜0.3。
- 一覧に無い背景は `COLORS.night`（暗い）か `COLORS.sand`（明るい図）。

## 9. 章ごとの画面設計

各行の指示は `narration.ts` の `screen` にもある（中身は同じ）。空欄の行は直前の画面を続ける。
「札」は章ファイルの中で作る小さな文字ラベル（前作の章ファイルの札と同じ見た目）。「確度の札」は `LabelTag`。

| 章 | ファイル | 部 | 章タイトル |
| --- | --- | --- | --- |
| 00 | Ch00Intro.tsx | 導入 | （出さない） |
| 01 | Ch01Life.tsx | 暮らし | ナイルが作った暮らし |
| 02 | Ch02King.tsx | 王 | 王ってそもそも何者？ |
| 03 | Ch03Afterlife.tsx | 死後 | 人は死ぬとどうなる？ |
| 04 | Ch04Tomb.tsx | 墓 | お墓は「儀式を続ける装置」 |
| 05 | Ch05People.tsx | 人々 | 王を支えた人たち |
| 06 | Ch06Funeral.tsx | 葬送 | 葬送と太陽の船 |
| 07 | Ch07Gods.tsx | 神々 | 神々の役割 |
| 08 | Ch08Summary.tsx | まとめ | VRに持っていく3つの問い |

### 00 導入

| 行 | 指示 |
| --- | --- |
| 00-01 | `00-dawn-offering`（dim 0.3）。左に札「前回：どう造った？」 |
| 00-02 | 右に札「今回：なぜ造った？」が加わる |
| 00-03 | 札が消え、中央に問い「なぜ、死後のために？」（Shippori Mincho B1、96px） |
| 00-04 | 問いが消え、供物台（画面の左下）へゆっくり寄る |
| 00-05〜00-07 | `IconRow` 3つを1行に1つずつ：「ナイルの暮らし」「王という存在」「死後も生き続ける」 |
| 00-08 | 3つがそろって光る |

### 01 ナイルが作った暮らし

| 行 | 指示 |
| --- | --- |
| 01-01〜01-02 | `01-nile-fields` |
| 01-03 | `01-flood-season` |
| 01-04〜01-05 | 同じ絵（dim）に増水の目盛り図：縦の目盛りに「少なすぎ」「ちょうどいい」「多すぎ」。真ん中だけ緑、上下は赤み |
| 01-06〜01-08 | `01-bakery-brewery`。01-07で札「毎日の食事」「働いた人への配給」 |
| 01-09 | `01-linen-weaving`。札「亜麻 → リネン」 |
| 01-10〜01-12 | `01-kohl-makeup`。01-11で札「コール＝目元の化粧」、01-12で注記「※例は裕福な人の墓から」 |
| 01-13〜01-15 | `01-family-meal` |

### 02 王ってそもそも何者？

| 行 | 指示 |
| --- | --- |
| 02-01〜02-02 | `01-king-gods` |
| 02-03 | 同じ絵（dim）に三角形の図：上「神々」、中「王」、下「人々」。王から上下に線 |
| 02-04〜02-05 | `02-maat-order`。02-04で札「マアト」、02-05で「＝正しさ・秩序」を足す |
| 02-06〜02-07 | `IconRow` 3つ：「太陽が昇る」「川が増水する」「社会が乱れない」。02-07でその下に「＝王の役目」 |
| 02-08〜02-10 | `02-king-horus`。02-09で注記「カフラー王（クフの息子）の像をもとにした想像図」 |
| 02-11〜02-12 | `09-funeral` |

### 03 人は死ぬとどうなる？

| 行 | 指示 |
| --- | --- |
| 03-01〜03-02 | 背景 night。中央に「死んだあとも、存在は続く」（明朝） |
| 03-03〜03-05 | `03-ka-offering`。03-03で札「カー」、03-04で「＝生命を支える力」を足す |
| 03-06〜03-08 | 供物台へ寄る。03-08で矢印図「食べ物 → 生命の力」 |
| 03-09〜03-12 | 背景 sand に3枚カード：カー／バー／アク。03-09はカーだけ明るく、03-10でバー「その人らしさ・動く力」、03-11でアク「儀式を経た死後の姿」。03-12で下に注記「※細かい意味は時代で変わる」 |
| 03-13〜03-15 | `03-wrapped-body`。03-15で札「内臓を保存した箱（クフの母の墓）」（絵の右下の白い箱を指す） |
| 03-16〜03-17 | 背景 night。文字カード「後の時代：70日・脳を取り出す・動物頭の壺」。03-17で上に赤い斜線を引き「クフの時代にそのまま当てはめない」。**壺の絵は出さない** |

### 04 お墓は「儀式を続ける装置」

| 行 | 指示 |
| --- | --- |
| 04-01〜04-03 | 背景 sand。4枚カードの枠だけ（中は「？」） |
| 04-04〜04-07 | `04-false-door`。04-04で札「①偽扉」、04-06で「生者と死者の世界をつなぐ」 |
| 04-08〜04-10 | `04-serdab`。04-08で札「②セルダブ」、04-10で「像が存在を保つ」 |
| 04-11〜04-14 | `04-offering-list`。04-11で札「③供物リスト」、04-14で注記「※例はクフより少し後・第5王朝の墓」 |
| 04-15〜04-16 | `04-mortuary-temple`。04-16で配置図：河岸神殿 → 参道 → 葬祭殿 → ピラミッド（前作 `Ch09Afterlife.tsx` の配置図をまねてよい） |
| 04-17 | 背景 sand。4枚カード：「供物＝養う」「偽扉＝つなぐ」「像とセルダブ＝存在を保つ」「供物リスト＝永遠に届ける」。下に「ピラミッド＝儀式を続ける装置」 |

### 05 王を支えた人たち

| 行 | 指示 |
| --- | --- |
| 05-01 | `08-people-dawn`（dim 0.3） |
| 05-02〜05-05 | `05-hemiunu`。05-02で札「ヘミウヌ」、05-03で「クフの甥（と考えられる）」「建設の監督」、05-04で `LabelTag` 証拠なし「一人で全部を設計」、05-05で `LabelTag` 有力「建設の責任者の一人」 |
| 05-06〜05-09 | `04-serdab`。05-08で札「ヘミウヌの像はセルダブから」 |
| 05-10〜05-11 | `05-boat-stone`。札「メレル」 |
| 05-12 | `NileMap`（`view="egypt"`、`places` にトゥーラ・ギザ・`wadiElJarf`、`routes=[["tura","giza"]]`、`wadiElJarf` を強調）。札「2013年に発見」。地図が合わなければ `05-red-sea-port` で代える |
| 05-13 | `05-merer-papyrus` |
| 05-14〜05-16 | `05-scribe`。05-15で文字だけの比較カード「ヒエログリフ＝刻む・飾る文字」「ヒエラティック＝筆で速く書く文字」、05-16で `IconRow`「運ぶ」「受け取る」「記録する」 |
| 05-17〜05-22 | `05-hetepheres-furniture`。05-18で札「ヘテプヘレス1世（クフの母）」、05-20で `LabelTag` 再現「展示は記録をもとに復元」 |
| 05-23〜05-24 | `05-empty-sarcophagus`。05-24で札「理由は不明」 |
| 05-25〜05-26 | `08-people-dawn`（dim）＋`IconRow` 5つ：「監督」「運ぶ」「書き記す」「パンを焼く」「王の家族」 |

### 06 葬送と太陽の船

| 行 | 指示 |
| --- | --- |
| 06-01 | `09-funeral` |
| 06-02〜06-06 | `06-opening-mouth`。06-02で札「口開けの儀式」、06-04で `IconRow`「食べる」「見る」「呼吸する」、06-05で `LabelTag` 確定「古王国から確認」、06-06で注記「クフの葬儀の細かい手順は不明」 |
| 06-07〜06-08 | `06-boat-pit` |
| 06-09〜06-11 | `09-solar-boat`。06-10で `LabelTag` 仮説を2つ「葬送で使った」「死後の世界を旅する」 |
| 06-12〜06-13 | `01-nile-fields` |
| 06-14〜06-16 | `06-sunset-west` → 06-15で `04-horizon-sunrise` へ約2秒のクロスフェード（沈む → 昇る） |
| 06-17〜06-20 | `04-horizon-sunrise`。06-17で札「アケト・クフ」、06-18で「＝クフの地平線」、06-20で「Horizon of Khufu」 |

### 07 神々の役割

| 行 | 指示 |
| --- | --- |
| 07-01〜07-03 | 背景 sand に4柱のカード（07-ra／07-horus／07-anubis／07-bastet を角丸で縮小）。名前だけ添える |
| 07-04〜07-05 | `07-ra`。札「ラー＝太陽」 |
| 07-06〜07-07 | `07-horus`。札「ホルス＝王を守る」 |
| 07-08〜07-09 | `07-anubis`。札「アヌビス＝墓地・葬送」 |
| 07-10〜07-13 | `07-bastet`。07-10で札「バステト＝守る力」、07-12で注記「猫の像の多くは後の時代」 |
| 07-14 | 背景 night。文字カード「心臓の計量・死者の書＝クフよりずっと後」。**天秤や巻物の絵は出さない** |
| 07-15 | 4柱のカードに戻る |

### 08 まとめ：VRに持っていく3つの問い

| 行 | 指示 |
| --- | --- |
| 08-01 | 背景 night |
| 08-02〜08-05 | `Checklist`（または同じ見た目のリスト）で4項目を1行に1つずつ：「ナイルが暮らしと国を支えた」「王は神と人をつなぎ、秩序を守る」「死後も生きるには、食べ物と儀式が必要」「ピラミッド＝死後の生を支える装置」 |
| 08-06〜08-09 | `08-people-dawn`（dim 0.35）。08-07〜08-09で問いを1つずつ（明朝・大）：「① 何を支えるもの？」「② なぜここに？」「③ 何を願った？」 |
| 08-10 | 問いが消え、絵が明るくなる |
| 08-11 | `10-horizon` へクロスフェード |
| 08-12〜08-13 | 背景 night。前作の案内カード：「前回の動画」「【予習】クフの大ピラミッドは何がすごい？」（前作のサムネ画像は使わず、文字だけ） |

### クレジット

- 6秒。背景 night、中央に：
  - `VOICEVOX:暁記ミタマ`
  - 「参考：エジプト観光・考古省、Harvard Digital Giza、AERA、The Metropolitan Museum of Art、UCL Digital Egypt、IFAO ほか」
  - 「※イラストはAIで作った想像図です」
  - 「制作：my-video」

## 10. 部の名前（章タイトルの上の小さい文字）

| 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 導入 | 暮らし | 王 | 死後 | 墓 | 人々 | 葬送 | 神々 | まとめ |

## 11. 作業の手順と完成条件

1. 前作の `src/PyramidFull/index.tsx`、`lib.tsx`、`parts.tsx`、`Guide.tsx`、`Bgm.tsx`、章ファイル2つ（`Ch00Intro.tsx`、`Ch09Afterlife.tsx`）を読む。
2. データ：`durations.ts`、`timeline.ts`、口パク用データを作る。
3. 骨組み：`Pyramid2Full` と章ごとの登録。字幕と音声だけ並べてStudioで通して確認。
4. 章を00から順に作る。1章ごとに各行の途中を静止画で書き出して見る（`out/pyramid2-check/`）。
5. 解説キャラとBGMを入れる。
6. 書き出し：`out/pyramid2-full.mp4`。冒頭45秒のプレビュー `out/pyramid2-preview.mp4` も。

完成条件：

- [x] 143行すべての字幕が `narration.ts` と1文字も違わずに出る
- [x] 143本すべての音声が鳴り、字幕とずれない
- [x] 01〜08章の頭に章タイトルが出る
- [x] 8章の一覧の画像だけを使い、「イラスト未着」の枠が1つも出ない
- [x] 字幕と札・キャラが重ならない。上下左右80pxに字幕以外の文字が無い
- [x] クレジットの4行が出る
- [x] `npx tsc --noEmit` で新しいエラーが出ない（他の動画の既存エラー3件は無視）
- [x] 前作のフォルダのファイルを変更していない（`git status` で確認）

2026-10-18完了。詳細は `IMPLEMENTATION.md`。本編 `out/pyramid2-full.mp4`（13分31.733秒）、冒頭45秒 `out/pyramid2-preview.mp4`。前作は未追跡ファイルを含む75ファイルをSHA-256でも照合し、変更なし。

## 12. 困ったとき

- 仕様書に無いことを決める必要があるとき：いちばん簡単な方法で仮に作り、`// TODO(確認):` と理由を書き、下の確認リストに足す。
- 字幕や内容がおかしいと思ったとき：直さずに確認リストに書く。
- 部品の引数が足りないとき：部品を書き換えず、章ファイルで包む。

### 確認リスト（Codexが追記する）

| 日付 | 場所 | 内容 | 回答 |
| --- | --- | --- | --- |
| 2026-10-18 | 00-01〜00-02のガイド | 7章の「全編に出す」と8章注記の「00-03以降」が食い違うため、全編表示を優先。冒頭2行は札より上に180pxで仮配置。 | 確認待ち（実装済み） |
| 2026-10-18 | 06-14〜06-20の背景 | 8章表の重複範囲は9章の行指示を優先し、06-15から60フレームで夕景→日の出。06-17以降も日の出を継続。 | 確認待ち（実装済み） |
| 2026-10-18 | BGMの接続位置 | 続編の各章の長さが前作と異なるため、前作と同じ音源・音量・60fクロスフェードで、接続する章を自動選択。音源の215秒付近の無音を避け210秒までを使用。 | 確認待ち（実装済み） |
