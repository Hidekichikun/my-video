# 引き継ぎ仕様書：ピラミッド予習動画（本編の実装）

- 版：v1.0（2026-09-25）。プレビズ完成に合わせて確定した。
- 作成：Claude Opus 5.5
- 実装担当：Codex（LUNA）
- 完成期限：**2026-10-03**（予備日 10-04〜10-05）

この仕様書は、上から順に読めば実装できるように書いてある。書いていないことは勝手に決めず、「困ったとき」の節に従うこと。

---

> **2026-09-25 更新：本編はOpusが実装済み。** `src/PyramidFull/`（章ごとに `chapters/Ch00Intro.tsx` 〜 `Ch10KhufuUnique.tsx`）。
> Studioでは `PyramidFull`（全体）と、フォルダ `Pyramid-chapters` の `PyramidCh00` 〜 `PyramidCh10`（1章ずつ）で確かめられる。
> 字幕は明朝体で1文字ずつ浮かび上がる形に変更し、声より10フレーム前から出す（`SUBTITLE_LEAD_FRAMES`）。
> この仕様書は、今後の修正を別のAIに頼むときの説明書として残す。

## 1. 作るもの

- Remotionのコンポジション `PyramidFull` を1本作る。
- 1920×1080、30fps、約12分。ナレーション音声＋字幕付きの解説動画。**ゆっくり落ち着いた速さ**にする（行間・章の間を長めに取ってある）。
- VRを観るときの注意点や案内は入れない（持ち主の希望）。
- 内容：名古屋のVR体験「Horizon of Khufu」に行く前の予習。歴代の王とピラミッドをたどり、クフの大ピラミッドの特徴をまとめる。
- 見る人：自分（このリポジトリの持ち主）。

## 2. 絶対に守ること

1. **字幕と数字を変えない。** 字幕は `src/Pyramid/data/narration.ts` の `subtitle` をそのまま出す。画面に出す数字は `src/Pyramid/data/facts.ts` からだけ取る。言い回しの修正、数字の丸め直し、ここに無い数字の追加はしない。例外は、9章の表で表示の文字（例：「約146m」「約230m」）を指定している場合だけで、そのときは指定どおりに出す。
2. **自動生成ファイルを手で編集しない。** `narration.ts` と `durations.ts` はスクリプトで作る（5章）。
3. **尺を手で決めない。** 各章・各行の開始フレームと長さは `src/Pyramid/data/timeline.ts` の `TIMELINE` を使う。フレーム数を直接書かない。
4. **確度の札は5種類だけ。** `facts.ts` の `LABELS`（確定・有力・仮説・証拠なし・再現）以外の札を作らない。
5. **実在の写真・他人の画像を使わない。** 使う画像は 8章のイラスト一覧にあるファイルだけ。無いときはプレースホルダーを出す。
6. **既存のコンポジションを壊さない。** `src/Root.tsx` には `PyramidFull` の登録を1つ足すだけにする。他のフォルダのファイルは触らない。
7. **調べ物をしない。** 史実の追加や修正はしない。疑問があれば 11章の「確認リスト」に書いて残す。

## 3. ファイル構成

### 用意済み（Opusが作成。読むだけ）

| パス | 中身 |
| --- | --- |
| `src/Pyramid/script.md` | ナレーション原稿。人が読む版 |
| `src/Pyramid/data/narration.ts` | 原稿のデータ版（自動生成）。章と行の配列 |
| `src/Pyramid/data/durations.ts` | 行ごとの音声の長さ（自動生成）。音声が届くまでは空 |
| `src/Pyramid/data/timeline.ts` | 章・行の開始フレームと長さを計算する。`TIMELINE` を使う |
| `src/Pyramid/data/facts.ts` | 画面に出す数字、地名、年表、確度ラベル |
| `src/Pyramid/data/types.ts` | 型定義 |
| `src/Pyramid/data/illustrations.ts` | イラストのファイル名と内容の一覧（8章） |
| `scripts/pyramid_script_to_json.py` | `script.md` → `narration.ts` |
| `scripts/measure_pyramid_audio.cjs` | 音声の長さを測って `durations.ts` を作る |
| `src/PyramidPrevis/index.tsx` | プレビズ（コンポジション `PyramidPrevis`、約1分半）。部品の使い方の見本 |
| `src/PyramidPrevis/components/` | 共通部品（7章） |
| `src/PyramidPrevis/theme.ts` | 色（`COLORS`）、札の色、フォント（`GOTHIC`、`MINCHO`） |
| `src/PyramidPrevis/lib/three.ts` | 簡易3Dの計算（`Pyramid3D` が使う） |

### これから作る（LUNAの担当）

```
src/PyramidFull/
  index.tsx            PyramidFull 本体。章を Sequence で並べる
  chapters/
    Ch00Intro.tsx       00章
    Ch01Background.tsx  01章
    …                   章ごとに1ファイル（Ch02〜Ch10）
    Credits.tsx         クレジット
```

- 章ファイルの名前は `Ch{章ID}{英語名}.tsx`。英語名は 9章の表を参照。
- 共通部品は `src/PyramidPrevis/components`（`index.ts`）から import して使う。コピーしない。
- 色とフォントは `src/PyramidPrevis/theme.ts` から import する。色の値を直接書かない。
- **まずStudioで `PyramidPacing` と `PyramidPrevis` を再生し、`src/PyramidPrevis/Pacing.tsx` と `index.tsx` を読むこと。**
  - `Pacing.tsx` は、00章と01章を本編と同じ時間の組み立てで作った**章ファイルの見本**。`span()` と `startOf()` で行の範囲に合わせて画面を置く書き方を、全章でまねる。00章と01章はここからそのまま移してよい。
  - `index.tsx`（ダイジェスト）は、各部品の使い方の見本。

## 4. 時間の組み立て

`TIMELINE` の中身：

- `chapters[i].from` / `durationInFrames`：章の開始と長さ
- `chapters[i].titleFrames`：章の頭に章タイトルを出すフレーム数（00章は0）
- `chapters[i].lines[j].from` / `durationInFrames`：行の開始と長さ（動画全体でのフレーム）
- `chapters[i].lines[j].hasAudio`：音声が実測済みか
- `creditsFrom` / `totalFrames`：クレジットの開始と動画全体の長さ

実装のしかた：

```tsx
// index.tsx の骨組み（例）
<AbsoluteFill>
  {TIMELINE.chapters.map((ch) => (
    <Sequence key={ch.id} from={ch.from} durationInFrames={ch.durationInFrames}>
      <ChapterView chapter={ch} />   {/* 章IDで Ch00Intro などに振り分ける */}
    </Sequence>
  ))}
  <Sequence from={TIMELINE.creditsFrom}><Credits /></Sequence>
  {/* 行ごとの音声と字幕は、章とは別に全体の時間で並べる */}
  {allLines.map((line) => (
    <Sequence key={line.id} from={line.from} durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}>
      {line.hasAudio ? <Audio src={staticFile(line.audio)} /> : null}
      <Subtitle text={line.subtitle} durationInFrames={line.durationInFrames + LINE_GAP_FRAMES} />
    </Sequence>
  ))}
</AbsoluteFill>
```

- `Sequence` の中では `useCurrentFrame()` が0から始まる。章の中で行の時刻を使うときは `line.from - chapter.from` に直す。
- `Root.tsx` への登録は `durationInFrames={TIMELINE.totalFrames}`、`fps={30}`、`width={1920}`、`height={1080}`。
- `Audio` と `staticFile` は `remotion` から import する（既存の `src/Lumia` と同じ）。

## 5. 音声

- 音声は持ち主がVOICEVOXで作る。LUNAは音声を作らない。
- 置き場所：`public/audio/pyramid/{行ID}.wav`（例：`public/audio/pyramid/05-03.wav`）。110本。
- 届いたら、プロジェクトのルートで次を実行する。

```bash
node scripts/measure_pyramid_audio.cjs
```

- `durations.ts` が更新され、`TIMELINE` が実測の長さで計算し直される。
- 「音声が無い行」と表示されたら、その行IDを持ち主に伝える。音声が無い行は文字数から長さを見積もるので、そのままでも動画は動く。
- 原稿を直したときは、先に次を実行する（原稿の修正はOpusか持ち主が行う）。

```bash
python scripts/pyramid_script_to_json.py
```

### 音声の書き出し条件（VOICEVOXで作る人向け）

| 項目 | 内容 |
| --- | --- |
| 話者 | 暁記ミタマ |
| 読ませる文 | `narration.ts` の各行の `reading`（字幕と違う行がある。数字をかなや漢数字にしてある） |
| 形式 | WAV、VOICEVOXの標準出力のまま（24kHz、モノラル、16bit） |
| ファイル名 | `{行ID}.wav`（例：`00-01.wav`）。1行＝1ファイル |
| 速度・高さ | 話速 1.15、音高 0.01、抑揚 1.5。全行で同じ設定を使う |
| 前後の無音 | 開始・終了の無音は 0.1秒 に設定（行間の間は動画側で入れる） |
| クレジット | 動画の最後に `VOICEVOX:暁記ミタマ` を出す（実装側で対応）。声優名が必要な場合は `CREDIT_VOICE_ACTOR` に入れる |

読み間違えやすい語（ユーザー辞書への登録を推奨）：

| 語 | 読み |
| --- | --- |
| 持ち送り | もちおくり |
| 大回廊 | だいかいろう |
| 花崗岩 | かこうがん |
| 石灰岩 | せっかいがん |
| 王妃の間 | おうひのま |
| 埋葬室 | まいそうしつ |
| 盗掘 | とうくつ |
| 碑文 | ひぶん |
| 象牙 | ぞうげ |
| 四角錐 | しかくすい |
| 石工 | いしく |
| 一代 | いちだい |
| 紅海 | こうかい |
| 供え物 | そなえもの |
| 呪文 | じゅもん |
| 葬列 | そうれつ |
| アケト・クフ | アケト・クフ（「ト」で切らずに続けて） |
| メンカウラー | メンカウラー |
| ワディ・エル＝ジャルフ | ワディ・エル・ジャルフ |

## 6. 画面の共通デザイン

### 色

| 名前 | 値 | 使いどころ |
| --- | --- | --- |
| night | `#14171E` | 背景（夜・内部） |
| sand | `#E6D9BC` | 背景（砂漠・図） |
| limestone | `#F4F1E8` | 完成時のピラミッド、明るい文字 |
| core | `#B58B5A` | 現在のピラミッドの茶色 |
| granite | `#9C3B2E` | 花崗岩（王の間、メンカウラーの下部） |
| lapis | `#2F5597` | 強調、光らせる部分、ナイル以外の線 |
| gold | `#C9A04A` | クフだけの強調 |
| nile | `#3E7CA6` | ナイル川 |
| field | `#5E8C5A` | 畑・緑 |
| ink | `#1B1E26` | 図の文字 |

確度の札の色：確定 `#2F6B45`、有力 `#2F5597`、仮説 `#9A5B12`、証拠なし `#8E2F2F`、再現 `#6B4E8A`。

### 文字

- 字幕・本文：Zen Kaku Gothic New（`@remotion/google-fonts/ZenKakuGothicNew`）
- 章タイトル・大きな数字：Shippori Mincho B1（`@remotion/google-fonts/ShipporiMinchoB1`）

### 字幕

- 画面下、下端から 64px。横幅は最大 1600px で中央ぞろえ。
- 44px、太さ 700、色 `#FFFFFF`。背景に半透明の黒い帯（`rgba(12,14,20,0.72)`、角丸12px）。
- `Subtitle` 部品がこの見た目で作ってある。自分で字幕を作らない。
- 最大2行。行の開始から終了（`durationInFrames + LINE_GAP_FRAMES`）まで出したままにする。フェードは入り 4フレーム、出 4フレーム。

### 章タイトル

- 章の頭 `titleFrames`（75フレーム）の間、`ChapterTitle` 部品で出す。
- 上に小さく部の名前（導入・積み上げ・頂点・その後・意味・まとめ）、下に大きく章の名前。
- 部の名前は 9章の表の「部」列。章の名前は `narration.ts` の `title` のうち「：」より後ろ（無ければ全体）。

### 安全領域

- 上下左右 80px には、字幕と章タイトル以外の文字を置かない。

## 7. 共通部品

`src/PyramidPrevis/components/` にある。どれも1920×1080の画面全体に重ねて描く（`position: absolute`）。
登場のアニメーションは、置いた `Sequence` の頭（フレーム0）から自動で始まる。行が変わったら、新しい `Sequence` に置き直すか、引数を変える。

| 部品 | 役目 | 引数 |
| --- | --- | --- |
| `Subtitle` | 字幕 | `text`, `durationInFrames` |
| `ChapterTitle` | 章タイトル（背景ごと画面を覆う） | `part`, `title`, `durationInFrames` |
| `Illustration` | イラストを画面いっぱいに出す。ゆっくり寄る。ファイルが無いときは「イラスト未着」の枠 | `file`, `zoom`（例 `[1, 1.08]`）, `focus`, `dim`（上に文字を重ねるとき 0.2〜0.3） |
| `Pyramid3D` | 簡易3Dのピラミッド（背景付き） | `shape`（`"mastaba"`／`"step"`／`"meidum"`／`"bent"`／`"true"`）, `heightM`, `baseM`, `surface`（`"now"`／`"then"`）, `build`（0〜1で積み上げ途中）, `steps`（step の段数）, `casing`（meidum の外側）, `missingTopM`, `whiteCapM`, `graniteLowerM`, `azimuth`, `spin`（毎秒の回転角）, `elevation`, `distance`, `center`, `background` |
| `PyramidCompare` | 歴代ピラミッドを同じ縮尺で重ねて並べる比較図（背景付き） | `visibleKeys`, `highlightKey`, `enterKey`（その行で加わるもの。下から伸びる）, `graniteKeys`, `sweepEvery`（何フレームごとに1基ずつ光らせるか）, `dark` |
| `CrossSection` | 大ピラミッドの断面図（北が左）。部屋や通路を光らせ、名前を出す | `highlight`（下の一覧の配列）, `showLabels`, `variant`（`"khufu"`／`"typical"`）, `center`, `pxPerM`, `background`, `caption` |
| `ZoomMap` | アフリカ大陸 → エジプト → ギザ と寄っていく地図（概略、背景付き） | `keyframes`（`{ at, view }` の配列。view は `"africa"`／`"egypt"`／`"giza"`）, `showFertileBand` |
| `NileMap` | ナイル沿いの地図（概略、背景付き） | `view`（`"egypt"`／`"memphis"`）, `places`, `highlight`, `routes`（例 `[["tura","giza"]]`）, `showAncientBranch`, `converge` |
| `HistoryLine` | 年表（紀元前2800年〜現在、背景付き） | `visibleKeys`, `highlightKey`, `bracket`（例 `{ from: "khufu", to: "tut", label: "約1200年後" }`）, `notes`, `dark` |
| `DimensionLine` | 寸法線と数字 | `from`, `to`（画面の座標）, `label`, `side`, `delay`, `color` |
| `LabelTag` | 確度の札。押されるように出る | `kind`（`confirmed`／`likely`／`hypothesis`／`noEvidence`／`reconstruction`）, `subject`, `x`, `y`, `delay`, `size` |
| `IconRow` | 丸いアイコンを1つずつ並べる | `items`（`{ glyph, label, group? }` の配列）, `stagger`, `groupAt`, `y`, `dark` |
| `Checklist` | チェックリスト（背景付き）。今は使わない | `items`, `checkedCount`, `checkedAt`, `title` |

- `CrossSection` の `highlight` に使える名前：`entrance`（本来の入口）、`descending`（下降通路）、`subterranean`（地下の間）、`ascending`（上昇通路）、`grandGallery`（大回廊）、`queensChamber`（王妃の間）、`kingsChamber`（王の間）、`relieving`（5段の空間）、`bigVoid`（2017年の空間）、`northCorridor`（2023年の空間）。
- `bigVoid` と `northCorridor` は、`highlight` に入れたときだけ点線で描かれる（形が確定していないため）。
- `Pyramid3D` の実寸は `facts.ts` の `PYRAMIDS` から渡す（例：`heightM={PYRAMIDS[3].heightM}`）。クフの現在の姿は `missingTopM={KHUFU.heightOriginalM - KHUFU.heightNowM}`。
- 「背景付き」の部品は、自分で背景を塗る。重ねるときは上に置く部品の `background={false}` を使う。
- 部品に無い図（ギザの配置図、坂道の3つの説、左右2分割など）は、章ファイルの中でSVGやdivで作ってよい。色は `COLORS` から取る。

## 8. イラスト一覧

- 持ち主が作って `public/photo/pyramid/` に置く。形式はPNG、横長（1920×1080でなくてよい。`Illustration` が画面に合わせて切り抜く）。
- プロンプトは `src/Pyramid/ILLUSTRATION_PROMPTS.md`。
- 実装は、ファイルがあれば表示、無ければ `Illustration` のプレースホルダー（ファイル名と内容を書いた枠）を出す。**イラストが届く前でも実装は止めない。**
- 同じ構図の2枚（`04-giza-now` と `04-giza-then`）は、ワイプで切り替えるので、カメラ位置と画角をそろえて作る。

| ファイル名 | 内容 | 使う行 |
| --- | --- | --- |
| `00-dawn-giza.png` | 夜明けの砂漠に立つ大ピラミッド（遠景） | 00-01〜00-02 |
| `00-khufu-statue.png` | クフ王の小さな象牙の座像（イメージ。実物の写真は使わない） | 00-04〜00-05 |
| `01-nile-fields.png` | ナイル川沿いの黒い土と畑、働く人々 | 01-07〜01-08 |
| `01-king-gods.png` | 神々と人々の間に立つ王 | 01-09〜01-10 |
| `04-giza-now.png` | 現在の大ピラミッド（茶色い段々）。正面やや斜め | 04-05〜04-06、04-09 |
| `04-giza-then.png` | 同じ構図で、白い化粧石に覆われた完成時の姿 | 04-07〜04-08 |
| `04-horizon-sunrise.png` | 地平線から昇る太陽とピラミッド | 04-10 |
| `05-workers-town.png` | 労働者の町の俯瞰（パン工房、倉庫、長い建物） | 05-03〜05-06 |
| `05-merer-papyrus.png` | 文字の書かれた古いパピルス | 05-08〜05-09 |
| `05-boat-stone.png` | 白い石灰岩を積んでナイルを進む船 | 05-10〜05-11 |
| `05-sledge-sand.png` | そりで石を引く人々と、前の砂に水をまく人 | 05-12〜05-13 |
| `06-grand-gallery.png` | 大回廊の内部。持ち送りの高い天井を見上げる | 06-05〜06-06 |
| `06-kings-chamber.png` | 赤い花崗岩の王の間と、ふたのない石棺 | 06-09〜06-10 |
| `06-crew-graffiti.png` | 石に赤い顔料で書かれた作業班の落書き | 06-12 |
| `07-sphinx.png` | 大スフィンクスと、背後のカフラーのピラミッド | 07-05〜07-06 |
| `08-pyramid-texts.png` | 青い文字が壁一面に刻まれた埋葬室 | 08-04〜08-05 |
| `08-valley-kings.png` | 王家の谷と、自然のピラミッド形の山 | 08-09〜08-10 |
| `08-tomb-light.png` | 地下の墓の入口に光が差し込む | 08-11 |
| `09-solar-boat.png` | 全長約43mの木造船（太陽の船） | 09-06〜09-07 |
| `09-funeral.png` | 王の葬列のシルエット | 09-08 |
| `10-horizon.png` | 地平線から昇る太陽と3つのピラミッド（建設当時の白い姿） | 10-09 |

## 9. 章ごとの画面設計

- 各行の画面指示は `narration.ts` の `screen` にもある。下の表はそれを部品に置きかえたもの。
- 「部品」列に書いた部品を、その行の間に出す。複数の行にまたがる場合は、切り替えずに続けて出し、中身だけ変える。
- 札は `LabelTag`、寸法は `DimensionLine`、数字は必ず `facts.ts` から取る。
- `screen` が空の行は、直前の画面をそのまま続ける。

| 章 | 部 | ファイル名 |
| --- | --- | --- |
| 00 | 導入 | `Ch00Intro.tsx` |
| 01 | 導入 | `Ch01Background.tsx` |
| 02 | 積み上げ | `Ch02Djoser.tsx` |
| 03 | 積み上げ | `Ch03Sneferu.tsx` |
| 04 | 頂点 | `Ch04KhufuScale.tsx` |
| 05 | 頂点 | `Ch05KhufuBuilders.tsx` |
| 06 | 頂点 | `Ch06KhufuInterior.tsx` |
| 07 | その後 | `Ch07KhafreMenkaure.tsx` |
| 08 | その後 | `Ch08End.tsx` |
| 09 | 意味 | `Ch09Afterlife.tsx` |
| 10 | まとめ | `Ch10KhufuUnique.tsx` |

### 00 導入

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 00-01〜00-02 | `Illustration`（`00-dawn-giza.png`）＋`DimensionLine` | ゆっくり寄る。00-02で右端に高さの寸法線。表示は字幕に合わせて「約146m」 |
| 00-03 | 背景 night | 画像を暗くし、中央に空の台座（四角い台の図形） |
| 00-04 | `Illustration`（`00-khufu-statue.png`） | 台座の上に小さく出す。横に「約7.5cm」 |
| 00-05 | 左右2分割 | 左に大ピラミッド、右に小像。小像は小さいまま |
| 00-06 | タイトル | 画面中央に「ピラミッドを見る前に」（Shippori Mincho B1、96px） |

### 01 時代背景

`src/PyramidPrevis/Pacing.tsx` の `Chapter01` を、そのまま移して使う（実装済み）。

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 01-01〜01-03 | `HistoryLine` | 01-01でクフの点、01-02で現在の点、01-03で「日本：縄文時代」「エジプト：古王国」の注記を追加 |
| 01-04〜01-06 | `ZoomMap` | 01-04でアフリカ大陸の全体からエジプトへ寄る。01-05でさらにギザの周辺まで寄る。01-06でエジプト全体に戻し、川沿いの緑の帯を出す。1つの Sequence のまま切らずに動かす |
| 01-07〜01-08 | `Illustration`（`01-nile-fields.png`） | 01-08で絵を暗くし、`IconRow`（穀物 → 倉庫 → パンとビール → 人々へ） |
| 01-09〜01-10 | `Illustration`（`01-king-gods.png`） | |
| 01-11 | `NileMap` | 各地からギザへ集まる矢印（lapis） |

### 02 ジェセル王

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 02-01 | 背景 sand | 章の導入。何も出さずに間を取る |
| 02-02 | `Pyramid3D`（マスタバ） | 平たい台形の墓を1つ |
| 02-03 | `Pyramid3D`（`step`） | マスタバが1段ずつ積み上がり、6段になる |
| 02-04 | `Pyramid3D`＋`NileMap`（小窓） | 右上の小窓でサッカラを示す |
| 02-05 | `PyramidCompare`（`["djoser"]`） | 比較図に1基目 |
| 02-06 | `Pyramid3D`（`step`） | カメラがゆっくり回る |

### 03 スネフェル王

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 03-01 | 家系図（テキスト） | 「スネフェル → クフ」 |
| 03-02 | シルエット3つ | メイドゥム・屈折・赤を横に並べる |
| 03-03 | `Pyramid3D` | 階段状の芯に外側が足されて四角錐になる |
| 03-04〜03-05 | `Pyramid3D`（`bent`）＋角度の注記 | 03-05で下の傾き「約54度」、上の傾き「約43度」（`BENT_SHAPE`） |
| 03-06 | `PyramidCompare`（`["djoser","bent","red"]`） | |
| 03-07 | `NileMap` | ダハシュールからギザへ光が流れる |

### 04 クフ王：規模と当時の姿

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 04-01 | `Pyramid3D`（`true`、`surface="now"`） | 下から見上げる |
| 04-02 | `DimensionLine` ×2＋`PyramidCompare`（〜`khufu`、`highlightKey="khufu"`） | 表示は、高さ「約146.5m」、底辺「約230m」（字幕に合わせる）。後半で比較図へ切り替え、クフを gold |
| 04-03 | `Pyramid3D` | 石のブロックが下から積み上がる |
| 04-04 | 真上から見た正方形 | 四隅に方位（北・東・南・西）。北が上 |
| 04-05〜04-06 | `Illustration`（`04-giza-now.png`） | 04-06で表面を拡大 |
| 04-07〜04-08 | `Illustration`（`04-giza-then.png`） | 04-07の頭で now → then を左から右へワイプ |
| 04-09 | `Illustration`（`04-giza-now.png`） | then → now へ戻す。頂上の失われた部分を点線で描き足す。「約138m」 |
| 04-10 | `Illustration`（`04-horizon-sunrise.png`） | 「アケト・クフ ＝ クフの地平線」を中央に |

### 05 クフ王：誰がどう造ったか

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 05-01 | シルエット | 建設中のピラミッドと大勢の人 |
| 05-02 | `LabelTag`（`noEvidence`） | 「奴隷説」の文字に札 |
| 05-03〜05-04 | `NileMap`（ギザ拡大）→`Illustration`（`05-workers-town.png`） | 05-03で町の位置、05-04で画像 |
| 05-05〜05-06 | `IconRow` | 石工・船乗り・測量・記録係・パン職人を1つずつ。05-06で班ごとにまとまる |
| 05-07 | `NileMap` | 各地からギザへの矢印 |
| 05-08〜05-09 | `NileMap`（紅海沿岸）→`Illustration`（`05-merer-papyrus.png`） | ワディ・エル＝ジャルフを示してから画像 |
| 05-10〜05-11 | `NileMap`（`routes`：トゥーラ→ギザ、`showAncientBranch`）＋`Illustration`（`05-boat-stone.png`） | 船のルートを線で描く |
| 05-12〜05-13 | `Illustration`（`05-sledge-sand.png`） | 05-13で `LabelTag`（`confirmed`）「実験で確認」 |
| 05-14〜05-16 | 3つの坂の図 | まっすぐ・ジグザグ・らせん。05-16で3つすべてに `LabelTag`（`hypothesis`） |

### 06 クフ王：内部構造

VRで最も役に立つ章。断面図を大きく、長めに見せる。

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 06-01 | `CrossSection`（なし） | 断面図が現れる |
| 06-02 | `CrossSection`（`entrance`） | |
| 06-03 | `CrossSection`（`descending`） | 角度「約26°」 |
| 06-04 | `CrossSection`（`ascending` → `grandGallery`） | 光が進む |
| 06-05〜06-06 | `Illustration`（`06-grand-gallery.png`） | 06-05で人の影を置いて高さを見せる。長さ・高さは `KHUFU` から |
| 06-07〜06-08 | `CrossSection`（`queensChamber`） | 06-08で `LabelTag`（`noEvidence`）「王妃の埋葬」 |
| 06-09〜06-10 | `Illustration`（`06-kings-chamber.png`） | |
| 06-11 | `CrossSection`（`relieving`） | 重さの矢印が左右に分かれる |
| 06-12 | `Illustration`（`06-crew-graffiti.png`） | `LabelTag`（`confirmed`） |
| 06-13 | 粒子のアニメーション | 上から点が降り、ピラミッドを通り抜ける |
| 06-14 | `CrossSection`（`bigVoid`） | 点線で描く。形は確定していないので輪郭をぼかす |
| 06-15 | `CrossSection`（`northCorridor`） | |
| 06-16 | `CrossSection`（`bigVoid` と `northCorridor`） | 2つの空間に「？」 |

### 07 カフラー王とメンカウラー王

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 07-01 | ギザの配置図（真上から） | 3基が順に現れる |
| 07-02 | `PyramidCompare`（〜`khafre`） | |
| 07-03 | 横から見た地面の断面 | カフラーの地面が高いことを示す |
| 07-04 | `Pyramid3D`（カフラー） | 頂上付近だけ limestone |
| 07-05〜07-06 | `Illustration`（`07-sphinx.png`） | 07-05で全長「約73m」、07-06で `LabelTag`（`likely`）「顔はカフラー王」 |
| 07-07〜07-08 | `PyramidCompare`（〜`menkaure`） | 07-08でメンカウラーの下の部分を granite に |

### 08 ピラミッドの終わり

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 08-01〜08-03 | `PyramidCompare`（全7基） | 08-03でウナスを強調 |
| 08-04〜08-05 | `Illustration`（`08-pyramid-texts.png`） | 08-05で「ピラミッド・テキスト」 |
| 08-06 | 左右の切り替え | 左「石の量」→ 右「言葉と祈り」 |
| 08-07〜08-08 | `HistoryLine`（〜`tut`） | 「約1200年後」 |
| 08-09〜08-10 | `NileMap`（ギザ→ルクソール）→`Illustration`（`08-valley-kings.png`） | 08-10で `LabelTag`（`likely`）「理由のひとつ」 |
| 08-11 | `Illustration`（`08-tomb-light.png`） | |
| 08-12 | 左右2分割 | 左に大ピラミッド「目立たせた」、右に谷の墓「隠した」 |

### 09 死生観・太陽の船・葬儀

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 09-01〜09-03 | 背景 night → 夕日の色 | 09-03で太陽が沈んで昇る円の動き |
| 09-04〜09-05 | `IconRow` | 09-04で「カー」「バー」、09-05で「体」「名前」「供え物」 |
| 09-06〜09-07 | `Illustration`（`09-solar-boat.png`） | 09-06で全長「約43m」、09-07で2つの説に `LabelTag`（`hypothesis`） |
| 09-08 | `Illustration`（`09-funeral.png`） | `LabelTag`（`likely`） |
| 09-09 | ギザの配置図 | 谷の神殿・参道・葬祭殿・ピラミッドを線でつなぐ |

### 10 クフだけの特徴

| 行 | 部品 | 指示 |
| --- | --- | --- |
| 10-01〜10-02 | `PyramidCompare`（全7基、`highlightKey="khufu"`） | |
| 10-03〜10-05 | 断面の並べ比べ | 10-04で他のピラミッドの部屋が下の方にある簡易断面、10-05でクフの `CrossSection`（`kingsChamber`） |
| 10-06 | `CrossSection`（`grandGallery` → `kingsChamber` → `relieving`） | 順に光らせる |
| 10-07 | アイコン7つ | 大ピラミッド以外が薄くなって消える |
| 10-08 | `PyramidCompare`（全7基、`sweepEvery`） | ジェセルから順に1基ずつ光る |
| 10-09 | `Illustration`（`10-horizon.png`） | そのままクレジットへ |


### クレジット（`Credits.tsx`）

- 6秒（`CREDITS_FRAMES`）。背景 night、中央に次の3行。
  - `VOICEVOX:暁記ミタマ`（`CREDIT_VOICE`）。`CREDIT_VOICE_ACTOR` が空でなければ、その下に「声：（名前）」
  - 「参考：エジプト観光・考古省、Harvard Digital Giza、AERA ほか」
  - 「制作：my-video」

## 10. 作業の手順

各手順が終わるたびに、確認欄のコマンドを実行して問題が無いことを確かめる。

1. **準備**：`src/PyramidPrevis/` の部品と `src/Pyramid/data/` を読む。
   - 確認：`npx tsc --noEmit` で `src/Pyramid*` にエラーが出ない（他のフォルダの既存エラー3件は無視してよい）。
2. **骨組み**：`src/PyramidFull/index.tsx` と、12章＋クレジットの空のファイルを作る。字幕と音声だけを並べる。`Root.tsx` に登録する。
   - 確認：`npx remotion studio` で `PyramidFull` を開き、字幕が最後まで順に出る。
3. **章の実装**：00章から順に、9章の表どおりに作る。1章できるたびに確認する。
   - 確認：その章の各行の途中のフレームを静止画で書き出して見る。
     `npx remotion still PyramidFull out/pyramid-check.png --frame=<フレーム>`
4. **音声の反映**：音声が届いたら `node scripts/measure_pyramid_audio.cjs` を実行する。
   - 確認：「音声が無い行」が0件。Studioで音声と字幕がずれていない。
5. **通しの確認**：全体を再生し、11章の完成条件を1つずつ確かめる。
6. **書き出し**：
   ```bash
   npx remotion render PyramidFull out/pyramid-full.mp4
   ```

## 11. 完成条件

- [ ] 110行すべての字幕が、`narration.ts` と1文字も違わずに出る。
- [ ] 画面の数字が、すべて `facts.ts` の値と一致する。
- [ ] 110本すべての音声が鳴り、字幕と同じタイミングで始まる。
- [ ] 章タイトルが01〜10章の頭に出る。
- [ ] 字幕と他の文字が重ならない。安全領域の外に文字がはみ出さない。
- [ ] イラストが無い場所では、プレースホルダーが出て、動画が止まらない。
- [ ] クレジットに `VOICEVOX:暁記ミタマ` が出る（`CREDIT_VOICE_ACTOR` があればそれも）。
- [ ] `npx tsc --noEmit` と `npx eslint src/PyramidFull` で、新しいエラーが出ない。
- [ ] `src/Root.tsx` 以外の既存ファイルを変更していない（`git status` で確認）。

## 12. 困ったとき

- **仕様書に無いことを決める必要があるとき**：いちばん簡単な方法で仮に作り、コードに `// TODO(確認):` と理由を書く。下の確認リストにも1行足す。
- **字幕や数字がおかしいと思ったとき**：直さずに、確認リストに書く。
- **部品の引数が足りないとき**：部品を書き換えず、章ファイルの中で包んで対応する。どうしても必要なら確認リストに書く。
- **レンダーが遅い・重いとき**：イラストの拡大縮小はCSSの `transform` で行い、毎フレームの重い計算を避ける。

### 確認リスト（LUNAが追記する）

| 日付 | 場所 | 内容 | 回答 |
| --- | --- | --- | --- |
|  |  |  |  |
