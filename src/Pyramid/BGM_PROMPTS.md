# BGMのプロンプト（Suno向け）

- 版：v1（2026-09-26）
- 本編の長さ：約11分44秒（ナレーション入り）
- 方針：**ナレーションの邪魔をしない、歌なしのBGM**。場面に合わせて4曲を切り替え、つなぎ目は動画側でクロスフェードする。
- 置き場所：`public/music/pyramid/`（ファイル名は下の表のとおり。mp3でよい）

## 全曲共通の設定

- **Instrumental（歌なし）をオンにする**
- 下の「Style」をそのまま貼る。歌詞欄は空でよい
- 気に入ったものを1曲ずつ選ぶ。長さが足りない曲は「Extend」で延ばす（動画側でループしてもよい）

## 曲の割り当て

| ファイル名 | 使う章 | 動画の中の時間 | 必要な長さ | 雰囲気 |
| --- | --- | --- | --- | --- |
| `bgm-1-opening.mp3` | 00 導入〜01 時代背景 | 0:00〜1:31 | 1分半 | 神秘的、大きな景色の前に立つ感じ |
| `bgm-2-building.mp3` | 02 ジェセル〜06 内部構造 | 1:31〜7:25 | 6分（延長かループ） | 知的な好奇心、積み上げていく感じ |
| `bgm-3-ritual.mp3` | 07 カフラー〜09 死生観 | 7:25〜10:41 | 3分半 | 静かで厳か、儀式、夕暮れ |
| `bgm-4-horizon.mp3` | 10 まとめ〜クレジット | 10:41〜11:44 | 1分 | 温かい、希望、地平線に日が昇る |

## Style（そのまま貼る）

### 1. bgm-1-opening.mp3

```
cinematic ambient, ancient Egypt atmosphere, slow and mysterious, warm low string pad, soft ney flute melody, distant frame drum, gentle harp arpeggios, desert wind, spacious reverb, awe and wonder, documentary underscore, no vocals, 70 bpm
```

### 2. bgm-2-building.mp3

```
documentary underscore, curious and thoughtful, steady light percussion pulse, plucked oud and pizzicato strings, soft marimba, subtle ancient Egyptian scale, gradually building layers, calm but forward-moving, background music for narration, no vocals, 90 bpm
```

### 3. bgm-3-ritual.mp3

```
solemn ancient ritual ambient, dusk atmosphere, low sustained cello drones, slow frame drum heartbeat, breathy ney flute, soft temple bells, meditative and reverent, sparse and quiet, background music for narration, no vocals, 60 bpm
```

### 4. bgm-4-horizon.mp3

```
warm hopeful cinematic finale, sunrise over the horizon, gentle rising strings, soft piano and harp, light oud melody, uplifting but calm, emotional documentary ending, slow build then fade out, no vocals, 75 bpm
```

## うまくいかないときの足し方

- 主張が強すぎる → Style に `minimal, sparse, low intensity` を足す
- 砂漠っぽさが強すぎる（ベタな民族音楽になる） → `subtle` を足し、`oud` や `ney flute` を1つ消す
- 暗すぎる → `warm, gentle` を足す
- 声（コーラス）が入ってしまう → Instrumental がオンか確かめ、`no choir, no humming` を足す

## 動画側で行うこと（Opus担当）

- 曲の実際の長さを測る（mp3は申告の長さが当てにならないため、デコードして測る）
- ナレーション中は音量を下げ（目安 12%）、行と行の間や章タイトルでは少し上げる（目安 22%）
- 曲の切り替えは約3秒のクロスフェード
- 足りない長さはループでつなぐ
