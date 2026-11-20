# CIRCLE Ø MV ラストの「ニヤリ」絵 作り直し依頼

CIRCLE Ø のMVのラスト（「鐘は――鳴らなかった。」のあと）で使う女の子の絵を1枚作り直してください。

## なぜ作り直すか

- 今のラスト `circle-zero-girl-grin.png` は、顔をこっち（カメラ）に向けた別アングルの絵になっている
- それまでの絵（closed / open / grin-closed / broken）は全部「横向き・同じ大きさ・同じ位置」なので、最後だけ角度が変わると別の絵に見えて不自然
- **同じ角度・同じ大きさのまま、表情だけ「目を開けてニヤリ」に変える**ことで、「ずっと見てた子が最後に本性を見せた」感じにしたい

## ベースにする画像（いちばん大事）

- `public/circle-zero/circle-zero-girl-grin-closed.png`（目を閉じてニヤリ、横向き）を**元画像として編集**してください
- 新しく描き直すのではなく、**目のまわりだけを変える**イメージです
- 顔の輪郭・髪・ヘイロー・首・タートルネック・ヒビ・体の位置は、元画像と**1pxもずらさない**でください（MVでは元画像の上にじわっと重ねて切り替えるので、ズレるとブレて見えます）

## 変えるところ

1. **目を開ける**：まぶたを開いて、うすい色の瞳が見えるように
2. **目線だけこっち（見ている人の方）に向ける**：顔の向きは横向きのまま、黒目だけを目じりの方へ寄せて、横目でこっちを見る感じ
3. **口元**：grin-closed のニヤリをそのまま使う。少しだけ口角を上げて、歯がちらっと見える程度まで強めてもOK（今の grin ほど大きく開けない）
4. 雰囲気：かわいいけど、ちょっと怖い。「やっと気づいた？」という余裕のある笑み

## プロンプト（参考）

```
Edit the reference image. Keep exactly the same character, same side-profile angle, same size, same position, same hair, same halo, same turtleneck, same cracks and same lighting. Change ONLY the eyes and the corners of the mouth: open her eyes, pale lilac-gray irises, and shift her pupils to the corner of the eyes so she is glancing sideways directly at the viewer, while her head stays in side profile. Keep the sly grin from the reference, slightly deeper, with a small glimpse of teeth. Cute but unsettling, calm and knowing expression. Transparent background. No text, no watermark.
```

避けたいこと（ネガティブ）：

```
head turned toward camera, front view, three-quarter view, changed hairstyle, changed halo, moved or resized character, wide open mouth, big toothy grin, blood, tears, extra characters, text
```

## 書き出し

- ファイル名：`circle-zero-girl-grin-side.png`
- サイズ：**1444×1089**（grin-closed と完全に同じ）、**背景透過のPNG（RGBA）**
- 保存先：次の2か所に同じものを保存
  - `public/circle-zero/circle-zero-girl-grin-side.png`
  - `build/public/CIRCLE/transparent/circle-zero-girl-grin-side.png`
- 今ある `circle-zero-girl-grin.png` は消さない・上書きしない（比べたいので残す）

## 最後に確認してほしいこと

- [ ] サイズが 1444×1089 で、背景が透過になっているか
- [ ] grin-closed と重ねて、目と口以外（輪郭・髪・ヘイロー・服・ヒビ）がズレていないか
  - 2枚を50%で重ねた比較画像を `tmp/circle-check/grin-side_overlay.png` に保存して確認してください
- [ ] 顔の向きが横向きのままか（こっちを向いていないか）
- [ ] 黒目だけがこっちを見ているか（横目になっているか）
- [ ] 口が開きすぎていないか
- [ ] 文字や透かしが入っていないか

## このあと（Claude側でやること）

- MVのラストで使う絵を `grin` → `grin-side` に差し替え、grin-closed からじわっと切り替える（今と同じ1.6秒のクロスフェード）
