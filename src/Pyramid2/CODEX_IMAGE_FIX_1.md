# Codex用：エジプト第2弾 イラスト修正（1回目）

Claudeが27枚を確認した結果、下の4枚を直してほしい。それ以外の23枚はこのままでOK。

## やり方

- 元の絵を編集対象にして、**指定したところだけ**変える（構図・画風・色・キャラ用の余白はそのまま）
- 直す前の絵は `out/pyramid2-anime-check/<ファイル名>-v1.png` に残してから上書きする
- 終わったら、直した4枚だけのコンタクトシートを `out/pyramid2-anime-check/contact-sheet-fix1.png` に出す
- `GENERATION_REPORT.md` に修正の記録を追加する

## 必ず直す

### 02-maat-order.png

- 問題：川の船の帆が**三角の帆**になっている。古代エジプトの船は四角い帆（前作でも避けた点）
- 指示：
```
Use case: precise-object-edit. Edit the provided illustration. Change ONLY the sails of the boats on the river: replace the triangular sails with tall rectangular square sails on a single mast, typical of ancient Egyptian Nile boats. Keep the boats' hulls, positions and everything else unchanged, including the winged goddess, fields, people, pyramid and sky. Keep hand-drawn brown outlines, gouache texture and all colors unchanged. No text or watermark.
```

### 05-hemiunu.png

- 問題：建設中のピラミッドが**木の足場で囲まれている**。エジプトは木材が貴重で、足場で囲む造り方の証拠はない。前作の説明（傾斜路・そり）ともずれる
- 指示：
```
Use case: precise-object-edit. Edit the provided illustration. Change ONLY the pyramid under construction in the background: remove all wooden scaffolding and wooden towers around it. Instead show a broad ramp made of mud brick and rubble rising along one side of the pyramid, with workers hauling stone blocks on wooden sledges up the ramp. Keep the pyramid's partly built layered shape. Keep the official, the scribes, the workers in the foreground, the sledges without wheels, the sky and the camera framing unchanged. Keep hand-drawn brown outlines, gouache texture and all colors unchanged. No text or watermark.
```

## できれば直す

### 05-hetepheres-furniture.png

- 問題：王の母の肩掛けと、足台・椅子の座面が**ヒョウ柄**。ヒョウの毛皮は神官の衣装の印象が強く、王族女性の普段着としては違和感がある
- 指示：
```
Use case: precise-object-edit. Edit the provided illustration. Change ONLY the leopard-skin patterns: replace the queen mother's leopard-skin shawl with a plain fine white pleated linen shawl, and replace the leopard-pattern cushions on the chair and footstool with plain cream linen cushions. Keep the gilded chair, the bed with the wooden headrest, the canopy, the three women, their poses and faces, and the whole composition unchanged. Keep hand-drawn brown outlines, gouache texture and all other colors unchanged. No text or watermark.
```

### 07-bastet.png

- 問題：ライオン頭の女神がヒョウ柄のマントを着ていて、ライオンなのかヒョウなのか分かりにくい
- 指示：
```
Use case: precise-object-edit. Edit the provided illustration. Change ONLY the lioness-headed goddess: remove the leopard-spotted cloak so she wears only her white linen dress and broad collar, and make her head clearly a lioness with a plain tawny face and a short mane-like headdress, no spots. Keep the cat goddess on the right, the soft arrow between them, the pyramid, the river, the lotus flowers and the whole composition unchanged. Keep hand-drawn brown outlines, gouache texture and all other colors unchanged. No text or watermark.
```
