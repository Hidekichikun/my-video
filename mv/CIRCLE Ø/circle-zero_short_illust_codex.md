# CIRCLE Ø ショート用 イラスト 生成依頼（Codex）

CIRCLE Ø の縦型ショート（サビ版・約39秒／曲の 0:40〜1:20）で使うイラストを8枚作ってください。
1枚あたり4〜5秒、ゆっくりズーム・横スライド・グリッチ切り替えでつなぎます。

## 共通ルール

- サイズ：**縦 9:16（1080×1920）**
- 保存先：`public/circle-zero/short/`（ファイル名は各カットに書いてあるとおり）
- キャラ：MVと同じ女の子。参考画像 `public/circle-zero/circle-zero-girl-open.png` と `circle-zero-girl-closed.png` の顔・髪型・服をそろえる
  - 白〜銀髪のボブ、うすい水色の目、白いタートルネック、頭の上にグリッチっぽい白いヘイロー（輪っか）
- 色：暗い紺〜黒の背景に、白とうすいシアンの線。グリッチ（ピクセルソート、データモッシュ）の質感をすこし
- 画面の**下から3分の1は暗め**にして、物を置きすぎない（歌詞をのせるので）
- 上の端も少しあける（タイトル「CIRCLE Ø」をのせるので）
- 文字・数字・ロゴ・透かしは入れない（時計のローマ数字だけはOK）
- 相手の男の子（「君」）は顔を描かない。後ろ姿・手・シルエットだけ

### 毎回プロンプトの最後に付ける共通文

```
Same character as the reference: a girl with a white-silver bob, pale cyan eyes, white turtleneck, and a glitchy white halo above her head. Anime illustration, cinematic, dark navy-black background, glowing white and pale cyan lines, subtle glitch texture with pixel sorting and datamosh streaks. Vertical 9:16 composition, keep the bottom third dark and uncluttered, leave a little space at the top. No text, no letters, no numbers, no logo, no watermark.
```

---

## カット一覧

### 1. `short-01-different-sound.png`（0:40「ひとつだけ違う音がした」）
```
The girl in profile with eyes closed, standing in darkness, tilting her head slightly as if she just heard something. A single circular sound ripple of white light spreads from beside her ear. Behind her, a huge faint clock face whose second hand is glitching and ticking backward.
```

### 2. `short-02-same-morning.png`（0:44「Round and round 同じ朝へ」）
```
A quiet white bedroom at dawn, pale morning light through thin curtains. The girl sits up in bed, and several translucent afterimages of herself overlap in the exact same pose, like a looping video frame. Dust particles in the light, calm but eerie.
```

### 3. `short-03-reborn.png`（0:48「名前を変えて 生まれ直して」）
```
The girl standing in front of a shattered mirror floating in the dark. Each mirror shard reflects a slightly different version of her (different outfits, different hair length, same face), as if she has been reborn many times. Shards drifting apart with glitch streaks.
```

### 4. `short-04-lose-you.png`（0:51「同じ場所で 君を失う」）
```
A city crosswalk at night in light rain, the pedestrian signal blinking. The girl stands on the crosswalk reaching out, while the back silhouette of a boy ahead of her dissolves into white glitch particles and scattered pixels. Reflections of the signal light on the wet asphalt.
```

### 5. `short-05-hajimemashite.png`（0:57「何千回目の『初めまして』」）
```
The girl smiling gently and offering her hand for a first meeting. Behind her, countless translucent copies of the exact same scene are stacked into the distance like a long tunnel of repeated frames, getting fainter and more glitched toward the back.
```

### 6. `short-06-not-take-hand.png`（1:04「でも 今回は 手を取らない」）
```
Extreme close-up of two hands almost touching in the dark: a boy's hand reaching in from the left, and the girl's hand pulling back and closing into a soft fist on the right. A thin line of white light between them, starting to break apart with glitch.
```

### 7. `short-07-tear-page.png`（1:07「決められた頁を破って 物語の外へ」）
```
The girl with eyes wide open, tearing a giant glowing book page in half with both hands. Beyond the tear, a bright white space with no clock. Paper fragments flying, turning into pixels and light. Determined expression, dynamic angle from slightly below.
```

### 8. `short-08-reframe.png`（1:13「RE:FRAME」）
```
The girl stepping out of a giant ornate clock face as if it were a picture frame, one foot crossing the outer ring, the clock hands frozen. The frame edge is cracked and glitching where she breaks through. Still, tense, frozen moment, strong white rim light.
```

---

## 作ったあと

- 8枚そろったら Claude に「できた」と伝えてください。歌詞・時計の針・グリッチを重ねて、動きのあるショートに組み立てます
- 気に入らないカットは、その番号だけ作り直しでOK
