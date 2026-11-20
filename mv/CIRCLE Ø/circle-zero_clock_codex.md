# CIRCLE Ø MV 時計素材 生成依頼

CIRCLE Ø のMVで使う「時計」の素材を作ってください。
女性キャラの素材はもうできているので、今回は時計だけです。

## 前提

- 時計は女性キャラとは別の素材として作り、動画編集で重ねます
- 針は編集で回転させるので、文字盤と針3本はすべて別々の画像にしてください
- 背景はすべて**真っ黒（#000000）の単色**にしてください。編集でブレンドを「スクリーン」にして黒を消します
- 文字盤と針は**同じサイズの正方形（1:1）**で、**回転の中心がキャンバスのど真ん中**にくるようにしてください（針をそのまま重ねて回すだけで合うように）
- ローマ数字以外の文字・透かし・ロゴは入れないでください

## 世界観（参考）

- 曲のテーマ：同じ一日を何千回もくり返すループ。ラストで「午前零時 鐘は――鳴らなかった。」
- 女性キャラ：白〜銀髪のボブ、白いタートルネック、頭の上にグリッチっぽい白いヘイロー
- 色：白とうすいシアンの線。グリッチ（ピクセルソート、データモッシュ）の質感をすこし
- 参考画像：`build/public/CIRCLE/circle-zero-girl-closed.png`（色味と線の雰囲気をそろえてください）

## 作ってほしいもの

### 1. 文字盤（針なし）

ファイル名：`circle-zero-clock-face.png`

```
A colossal ornate clock face seen straight from the front, perfectly centered and perfectly circular, NO hands at all. Roman numerals, intricate concentric rings and fine tick marks for every second (60 ticks), subtle gears visible through gaps in the dial. Drawn in glowing white and pale cyan lines with slight glitch and vertical pixel-sorting texture. Gothic, sacred atmosphere. Pure flat black #000000 background. No text other than the numerals, no watermark, no logo. Square 1:1.
```

### 2. 文字盤・ヒビ版（針なし）

ファイル名：`circle-zero-clock-face-cracked.png`

1の画像を参考画像として渡して、**同じ構図・同じ大きさ・同じ位置**で作ってください。

```
Same clock face, exactly the same composition, size and position as the reference, NO hands. Spiderweb cracks spreading outward from the center, a few Roman numerals breaking apart into cyan pixel fragments, stronger glitch. Pure flat black #000000 background. No text other than the numerals, no watermark. Square 1:1.
```

### 3. 時針

ファイル名：`circle-zero-hand-hour.png`

```
A single ornate clock hour hand, short and thick, pointing perfectly straight up (12 o'clock). The pivot circle of the hand is exactly at the center of the canvas, and the hand extends upward from there. Drawn in glowing white and pale cyan lines with slight glitch texture, matching a gothic glitch-style clock face. Pure flat black #000000 background. Nothing else in the image. No text, no watermark. Square 1:1, same canvas size as the clock face.
```

### 4. 分針

ファイル名：`circle-zero-hand-minute.png`

```
A single ornate clock minute hand, long and slender, pointing perfectly straight up (12 o'clock). The pivot circle of the hand is exactly at the center of the canvas, and the hand extends upward from there, reaching close to the edge of the dial. Drawn in glowing white and pale cyan lines with slight glitch texture, matching a gothic glitch-style clock face. Pure flat black #000000 background. Nothing else in the image. No text, no watermark. Square 1:1, same canvas size as the clock face.
```

### 5. 秒針

ファイル名：`circle-zero-hand-second.png`

```
A single very thin clock second hand, the longest of the three, pointing perfectly straight up (12 o'clock), with a small counterweight tail extending slightly below the pivot. The pivot circle is exactly at the center of the canvas. Drawn in a glowing thin pale cyan line with slight glitch texture, matching a gothic glitch-style clock face. Pure flat black #000000 background. Nothing else in the image. No text, no watermark. Square 1:1, same canvas size as the clock face.
```

## 保存先

すべて `build/public/CIRCLE/` に、上のファイル名で保存してください。

## 最後に確認してほしいこと

- [ ] 5枚とも正方形で、同じサイズになっているか
- [ ] 背景が真っ黒の単色か（グラデーションやノイズが乗っていないか）
- [ ] 文字盤に針が描かれていないか
- [ ] 針3本とも真上（12時）を向いていて、根元の丸がキャンバスの中心にあるか
  - ずれていたら、根元の丸がちょうど中心にくるように画像を移動して直してください
- [ ] 針を文字盤に重ねたとき、長さが文字盤からはみ出していないか（秒針 > 分針 > 時針の順に長い）
- [ ] ヒビ版が通常版と同じ位置・同じ大きさで重なるか
- [ ] ローマ数字以外の文字や透かしが入っていないか
