# my-video

ヒデキさんの楽曲MV・ショート・解説動画を作る Remotion プロジェクト。
コードは `src/`、Remotion が読む素材は `public/`、作品ごとの企画・納品物は `mv/<作品名>/` に置く。

## コマンド

- プレビュー: `npm run dev`（Remotion Studio）
- レンダー: `npx remotion render src/index.ts <CompositionId> out/<名前>.mp4`
- 型チェック: `npx tsc --noEmit`（既存エラーが十数件ある。作業前後で件数が増えていないかを見る）
- ffmpeg はシステムに無い。Remotion 同梱のものを使う

## スキル

- `.claude/skills/remotion-lecture-video`：講義・解説動画（MathGacha 型）の組み立て。骨組み作成（`scaffold.py`）、音声の尺計測、確認用の静止画・動画の書き出し、BGMの測り方、つまずき集。新作はここから始める。

## フォルダの役割

| フォルダ | 中身 | git |
|---|---|---|
| `src/<作品>/` | Remotion のコード。登録は `src/Root.tsx`（Folder で MV / Shachiku-series / Explainer / Archive-2025 に分類） | ○ |
| `public/` | Remotion が `staticFile()` で読む素材。新しい作品は `public/<slug>/` にまとめる（直下のバラ置きは旧作のもの） | テキストのみ |
| `mv/<作品名>/` | 作品ごとの企画md・Codex依頼・YouTube投稿メモ・ジャケ・サムネ・完成MP4。古い版は `_archive/` | テキストのみ |
| `shorts/<slug>/` | ショート動画の書き出しと作業ファイル | テキストのみ |
| `music/` | 曲のマスター音源（mp3/wav）、`jacket/`、`mastered/`、DistroKid入力メモ | テキストのみ |
| `lyrics/` | 歌詞（`.lrc` と DistroKid 用 `.txt`） | ○ |
| `voice/<作品>/` | VOICEVOX のセリフ音声。VOICEVOX は `voice/` 直下に書き出すので、書き出したら `voice/<作品>/` へ移す | テキストのみ |
| `photo/<作品名>/` | 生成した画像の元ファイル（Remotion は `public/photo/` 側のコピーを使う） | テキストのみ |
| `font/` | フォントの元ファイル（Remotion 用は `public/fonts/`） | テキストのみ |
| `scripts/` | 音声処理・レンダー・検証用の Python / Node スクリプト | ○ |
| `channel-art/` | チャンネルのバナー・アイコン | − |
| `out/` | レンダーの一時出力。完成したら `mv/<作品>/` へ移す。いつ消してもよい | × |

`.gitignore` で動画・音声・画像・フォントは git の管理外にしている（PC にだけある）。

## 置き場のルール

- 完成品は必ず `mv/<作品名>/` に置く。ルートや `out/` に置きっぱなしにしない
- 新しいバージョンを作ったら、古い版は `mv/<作品名>/_archive/` へ移す（最新版だけを作品フォルダ直下に残す）
- 作業用の一時ファイルは `out/` か各フォルダの `_work/` に置き、終わったら消す
- 部分プレビュー・変更点の確認用の書き出し・レイアウト案などは使い捨て。`out/` に出し、確認が済んだら消す（`mv/` には入れない）
- 消してよいものは `_to_delete/` に入れる（git 管理外）

## 作品対応表

1つの作品が場所ごとに違う名前で置かれている。迷ったらこの表を見る。

### MV

| 作品 | src | public | mv | その他 |
|---|---|---|---|---|
| 円周ラブ | `EnshuLove` | `enshu-love/` | `円周ラブ` | |
| Cosine 〜私・君＝好きの最大値!?〜 | `Cosine` | `cosine/` | `Cosine` | |
| Sine 〜僕×君＝好きの面積!?〜 | `Sine` | `sine/` | `Sine` | |
| Squared 〜僕×君＝好きの2乗!?〜 | `Squared` | `squared/` | `Squared` | |
| 恋する牛丼 | `Gyudon` | `gyudon/` | `恋する牛丼` | `voice/gyudon` |
| CIRCLE Ø | `CircleZero` | `circle-zero/` | `CIRCLE Ø` | `shorts/circle-zero` |
| Forward Glow | `ForwardGlow`, `ForwardGlowV2` | 直下の `forward-glow-*` | `Forward Glow` | `shorts/forward-glow`, `music/ForwardGlow`（15秒ごとの切り出し） |
| I close my mind | `ICloseMyMind` | `i-close-my-mind/` | `I close my mind` | `shorts/i-close-my-mind`, `photo/I close my mind` |
| Fire in my senses | `FireInMySenses` | `fire-in-my-senses/` | `Fire in my senses` | `shorts/fire-in-my-senses` |
| JiGaMe | `JiGaMe` | `photo/JiGaMe/` | `JiGaMe` | |
| I'll Find You Again | `IllFindYouAgain` | `photo/IllFindYouAgain/` | − | |
| ルミアと始まりの海 | `Lumia`, `LumiaBeginningSea` | `photo/lumia/`, `movie/` | `ルミアと始まりの海` | |
| So stupid, but so good | − | − | `So stupid, but so good` | `shorts/so-stupid-but-so-good` |

### 社畜シリーズ（ドット絵MV・チャンネル「ただいま正気を失い中」）

| 作品 | src | public | mv | shorts | voice |
|---|---|---|---|---|---|
| 社長、ここは地球です | `ShachoChikyu` | `photo/shacho/` | `社長ここは地球です` | `shacho-chikyu` | − |
| 課長、ここは会社です（よ） | `KachoKaisha` | `photo/kacho/` | `課長ここは会社ですよ` | `kacho-kaisha` | `課長、ここは会社です` |
| ウェルカム・トゥ・ザ・社畜！ | `ShachikuWelcome` | `photo/shachiku/` | `ウェルカムトゥザ社畜` | − | `ウェルカムトゥザ社畜` |
| 部長、ここは地上です！ | `BuchoChijo` | `photo/bucho/` | `部長ここは地上です` | `bucho-chijo` | `部長ここは地上です` |
| 軽トラのおじさん | `KeitoraOjisan` | `photo/keitora/` | `軽トラのおじさん` | `keitora-ojisan` | `軽トラのおじさん` |

### 解説動画（急に詳しくなりたいチャンネル）

| 作品 | src | public | mv | voice |
|---|---|---|---|---|
| ピラミッド（第1弾） | `Pyramid`（台本・データ）, `PyramidFull`, `PyramidPrevis` | `audio/pyramid/`, `photo/pyramid*/` | `ピラミッド` | `pyramid` |
| ピラミッド2 | `Pyramid2`（台本・データ）, `Pyramid2Full` | `audio/pyramid2/`, `photo/pyramid2-anime/` | `ピラミッド2` | `pyramid2` |
| 鎌倉（プリビズ） | `KamakuraPrevis` | `audio/`（`scripts/generate_kamakura_audio.cjs`） | `鎌倉` | − |
| 数学講義 確率と統計 #1「1%のガチャ、100回引けば当たる？」 | `MathGacha`（台本・データ）, `MathGachaFull`（3D＋2D） | `audio/mathgacha/`, `music/mathgacha/`, `photo/math-guide/`, `photo/math-gacha/` | `MathGacha` | `MathGacha`（元は `voice/MathGacha`） |

### アーカイブ（2025年〜2026年初めのリリックMV）

`src/` の `LyricVideo`（Fire in my senses 初版）・`GlitchCandy`・`WorldHateProtocol`・`Chikichihi`（知己知彼）・`Freedom`（ふりーだむ）・`OhanaBatake`（おはな ばたけ）・`Dokkoisho`（どっこいしょ）・`Poppo`（ぽっぽー）・`Seasons`・`Setsubunn`・`MahouShojoTanabe`（魔法少女田辺さん）・`NichijoTakagi`（日常の守り人、高木さん）・`HarakataNabe`（ハーカタ・ナーベの日常）。
素材は主に `public/` 直下と `public/photo/<作品>/`、元画像は `photo/<作品名>/`。
完成MP4が残っているのは `mv/ハーカタ・ナーベの日常` と `mv/日常の守り人、高木さん` だけ。
