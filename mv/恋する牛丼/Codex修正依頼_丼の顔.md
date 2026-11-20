# 恋する牛丼 Codex修正依頼（丼の顔を曲の流れに合わせる）

作成: 2026-11-12

## なぜ直すか
シーンの丼が最初から完成形（黄身の目＋紅しょうがのほっぺ）になっているので、顔がだんだんできていく流れに合わせる。
- 黄身はBridge（24）で落とすまで、のせない
- 紅しょうがのほっぺは19でのせるまで、つけない

## 参考画像（public/gyudon/）
- ref_stage2_lines.png … 段階2: タレの線（前髪・まゆ・閉じた目・耳）＋口だけ。**黄身なし、ほっぺなし**。左目の場所はまゆだけで、その下はただのごはん
- ref_stage3_cheeks.png … 段階3: 段階2＋紅しょうがのほっぺ。**黄身なし**
- 02_kimi_sheet.png … 完成形（25・26はこれのまま）

## やり方
- 元の絵を参考画像に入れて、**丼の顔の部分だけ**を直す。人物・背景・構図・光・色はそのまま
- 保存は元の名前に「-fix」をつける（例: 11_chorus_reveal-fix.png）。元の絵は消さない
- 毎回、下の共通の指示を頭に貼る

### 共通の指示
```
Edit only the face on the gyudon beef bowl in the first image. Keep the person, background, composition, lighting, colors and art style exactly the same. Match the bowl face to the reference bowl image exactly. Do not add a raw egg yolk anywhere on the bowl. No text.
```

## 直す絵

| 絵 | 丼の顔 | 参考にする段階 |
|---|---|---|
| 11_chorus_reveal | 段階2（線と口だけ） | ref_stage2_lines |
| 12_chorus_hold | 段階2 | ref_stage2_lines |
| 13_chorus_bite | 段階2 | ref_stage2_lines |
| 15_verse2_glisten | 段階2 | ref_stage2_lines |
| 18_pre2_rival | 段階2 | ref_stage2_lines |
| 19_pre2_ginger | 段階2（紅しょうがはまだ丼の横） | ref_stage2_lines |
| 20_chorus2_choose | 段階3（ほっぺあり・黄身なし） | ref_stage3_cheeks |
| 21_chorus2_wallet | 段階3 | ref_stage3_cheeks |
| 22_bridge_fast | 段階3（3コマとも） | ref_stage3_cheeks |

段階2用の追加文:
```
The bowl face has only drawn sauce lines (bangs, eyebrows, one closed winking eye on the right, ear outlines) and an open smiling pink mouth. No egg yolk: under the left eyebrow there is only plain white rice. No pink pickled ginger on the cheeks.
```

段階3用の追加文:
```
The bowl face has drawn sauce lines (bangs, eyebrows, one closed winking eye on the right, ear outlines), an open smiling pink mouth, and small piles of pink pickled ginger as blushing cheeks. No egg yolk: under the left eyebrow there is only plain white rice.
```

## 直さない絵
- 25_last_glow・26_last_counter … 完成形のままでOK
- 24_bridge_egg … 丼のアップで顔が見えないのでそのまま
- 29_end_wink … ふつうの丼（顔なし）なのでそのまま
