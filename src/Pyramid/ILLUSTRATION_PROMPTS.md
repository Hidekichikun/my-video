# イラストのプロンプト集

> **2026-09-25 更新**：画風は「3Dっぽく少しリアルなイラスト」に決まり、生成はCodexでまとめて行う。最新のプロンプトは `CODEX_IMAGE_BATCH.md` を使う。このファイルは、MidjourneyやChatGPTで1枚ずつ作り直すときの参考として残す。

- 版：v1（2026-09-25）
- 枚数：21枚（一覧は `HANDOFF.md` の8章、`src/Pyramid/data/illustrations.ts`）
- 置き場所：`public/photo/pyramid/{ファイル名}`（PNG、横長。サイズは自由。動画側で切り抜く）
- 作ったイラストはプレビズ `PyramidPrevis` に自動で出る。「イラスト未着」の枠が消えれば置けている。

## 進め方

1. **Midjourneyで基準の1枚を作る。** 下の「基準の1枚」のプロンプトで何枚か出し、気に入った画風の1枚を選ぶ。これを `00-dawn-giza.png` として使う。
2. **残りはChatGPTの画像生成で作る。** 基準の1枚を毎回添付し、「この画像と同じ画風で」と頼む。下の「ChatGPTへの頼み方」の文に、各イラストの英語のプロンプトを貼る。
3. **注意書きを確かめる。** 各イラストの「注意」は、時代考証で間違えやすい点。できた絵がこれに反していたら、その点を指摘して描き直してもらう。
4. **同じ構図の2枚**（`04-giza-now` と `04-giza-then`）は、先に now を作り、それを添付して「表面だけ変えて」と頼む（手順は該当の項目）。

## 共通の画風（全部のプロンプトの末尾に付ける）

```
Painterly semi-realistic digital illustration, documentary storybook mood, soft warm desert light, muted sandstone and ochre palette with deep lapis-blue accents, gentle atmospheric haze, clean readable shapes, cinematic wide composition, ancient Egypt Old Kingdom period (about 2500 BC), no text, no letters, no captions, no watermark
```

## 基準の1枚（Midjourney）

`00-dawn-giza.png`

```
The Great Pyramid of Giza at dawn seen from far away across the desert, the rough stepped surface of the pyramid as it looks today with the top slightly missing, the pyramid of Khafre behind it with a small patch of smooth white casing near its peak, low golden sun on the horizon, long soft shadows, quiet and majestic, Painterly semi-realistic digital illustration, documentary storybook mood, soft warm desert light, muted sandstone and ochre palette with deep lapis-blue accents, gentle atmospheric haze, clean readable shapes, cinematic wide composition, no text, no letters, no watermark --ar 16:9 --style raw
```

- 注意：現在の姿なので、表面は茶色い段々で、頂上が少し欠けている。白く輝く姿にしない。

## ChatGPTへの頼み方（毎回この文に、プロンプトを差し込む）

```
添付した画像と同じ画風・色づかい・筆のタッチで、次の場面を横長（16:9に近い横長）で描いてください。
画像の中に文字・数字・ロゴは入れないでください。

（ここに各イラストの英語のプロンプトを貼る）
```

---

## 各イラストのプロンプト

### 00-khufu-statue.png

```
A tiny seated ivory figurine of an ancient Egyptian king, only a few centimeters tall, shown alone on a simple dark pedestal in soft museum-like spotlight, lots of empty dark space around it to emphasize how small it is, gentle and dignified
```

- 注意：実物の写真やそっくりな再現はしない（イメージでよい）。金ぴかにしない（象牙なので白っぽいクリーム色）。

### 01-nile-fields.png

```
The Nile river valley in ancient Egypt, a band of dark black fertile soil and green fields along the river, farmers in simple white linen kilts working with wooden hoes and baskets, date palms, dry desert cliffs in the distance, a calm river with small reed boats
```

- 注意：**ラクダ・馬・馬車・車輪・鉄の道具を描かない**（どれもこの時代のエジプトには無い）。

### 01-king-gods.png

```
An ancient Egyptian king of the Old Kingdom standing in the center wearing the striped nemes headdress and a white kilt, above him large faint figures of Egyptian gods (a falcon-headed sun god with a sun disk), below him ordinary people bowing, symbolic composition showing the king connecting gods and people
```

- 注意：ツタンカーメンの黄金のマスク風にしない。青い冠（新王国の冠）にしない。

### 04-giza-now.png

```
The Great Pyramid of Giza as it looks today, viewed from the southeast at a slight angle, rough brown stepped core stones visible, the top slightly missing, clear sky, desert floor in the foreground, no people, no modern buildings
```

- 注意：頂上が欠けた茶色い段々の姿。次の then と同じ構図にするので、背景はシンプルにする。

### 04-giza-then.png

`04-giza-now.png` を添付して、次のように頼む。

```
添付した画像と構図・カメラ位置・画角を完全に同じにしたまま、ピラミッドの表面だけを、建設当時の姿に変えてください。
表面はなめらかに磨かれた白い石灰岩で覆われ、段々は見えません。頂上まで完全な四角錐で、日差しを受けて白く輝いています。
それ以外（空、地面、光の向き）は変えないでください。文字は入れないでください。
```

- 注意：**頂上を金色にしない**（何で覆われていたかは分かっていない）。

### 04-horizon-sunrise.png

```
The sun rising exactly between the horizon line and the tip of a great pyramid, rays of golden light spreading over the desert, a symbolic and serene composition about the horizon
```

### 05-workers-town.png

```
Bird's-eye view of an ancient Egyptian workers' town near the Giza plateau, long rows of mud-brick gallery buildings, bakeries with smoke rising, granaries, a walled enclosure, busy people carrying bread and jars, pyramids under construction in the background with construction ramps
```

- 注意：**鎖につながれた人・むちで打つ場面を描かない**。建物は日干しれんが（石造りの宮殿にしない）。

### 05-merer-papyrus.png

```
Close-up of an ancient papyrus sheet, slightly torn at the edges, covered in columns of faded black and red handwritten ancient Egyptian cursive script, lying on a wooden table in warm lamp light
```

- 注意：文字は雰囲気だけでよい（正確なヒエログリフは求めない）。アルファベットや漢字が混ざったら描き直す。

### 05-boat-stone.png

```
A wooden ancient Egyptian cargo boat on the Nile carrying large blocks of bright white limestone, a single square sail, oarsmen and a steersman, other boats in the distance, the Giza plateau with a white pyramid under construction far away
```

- 注意：**三角の帆にしない**（四角い帆）。金属の船・大砲など後の時代のものを描かない。

### 05-sledge-sand.png

```
A team of ancient Egyptian workers pulling a large stone block on a wooden sledge with thick ropes across the desert sand, one man in front pouring water from a jar onto the sand to make it easier to pull, overseers giving the rhythm
```

- 注意：**車輪やころを描かない**（そりで引く）。むちで打つ場面にしない。

### 06-grand-gallery.png

```
Inside the Grand Gallery of the Great Pyramid, a very tall and narrow ascending passage rising at a steep angle, the side walls step inward layer by layer toward a narrow ceiling (corbelled vault), low stone benches along both sides with a channel in the middle, lit by small oil lamps, a tiny human figure for scale, plain undecorated limestone walls
```

- 注意：**壁に絵や文字を描かない**（内部は装飾がない）。天井は平らでもアーチでもなく、段々に内側へせり出す形。

### 06-kings-chamber.png

```
Inside the King's Chamber of the Great Pyramid, a plain rectangular room built of large polished red granite blocks with a flat ceiling of huge granite beams, a single lidless rectangular granite sarcophagus at the far end, dim warm lamp light, empty and silent
```

- 注意：**壁に絵や文字を描かない**。宝物・ミイラ・棺のふたを描かない（見つかっていない）。

### 06-crew-graffiti.png

```
Close-up of rough limestone blocks in a dark narrow space, marked with red ochre painted builders' marks and simple quickly painted signs, leveling lines, an oval cartouche painted in red, lit by a flashlight-like warm beam
```

- 注意：落書きなので、きれいに彫られた碑文にしない。赤い塗料の手描き。

### 07-sphinx.png

```
The Great Sphinx of Giza carved from the bedrock, lion body with a royal human head wearing the nemes headdress, the nose missing, the pyramid of Khafre rising behind it with a small patch of white casing near the top, late afternoon light
```

- 注意：現在の姿（鼻が欠けている）。背後のピラミッドの頂上付近だけ白い外装が残る。

### 08-pyramid-texts.png

```
Inside a small ancient Egyptian burial chamber, every wall covered from floor to ceiling with neat vertical columns of carved hieroglyphs painted blue-green, a gabled ceiling painted with yellow stars on dark blue, a stone sarcophagus, soft lamp light
```

- 注意：文字は雰囲気だけでよい。壁画（人物の絵）ではなく、文字の列で埋める。

### 08-valley-kings.png

```
The Valley of the Kings near Luxor, a dry rocky desert valley between steep limestone cliffs, above it a natural mountain peak shaped like a pyramid, small tomb entrances cut into the rock at the bottom of the cliffs, harsh bright sun
```

- 注意：**ピラミッドを建てない**（自然の山がピラミッドの形に見えるだけ）。

### 08-tomb-light.png

```
Stone steps descending into the rock toward a sealed doorway of an ancient tomb, a beam of light entering the darkness for the first time, dust floating in the light, mysterious and quiet
```

- 注意：黄金のマスクや宝物は描かない（有名な発見写真に似せない）。

### 09-solar-boat.png

```
A long slender ancient Egyptian royal boat made of cedar wood, about forty meters long, with high elegant curved prow and stern shaped like papyrus stalks, a small cabin in the middle, long oars, gliding on a calm river at sunset
```

- 注意：帆を立てない（オールでこぐ船）。

### 09-funeral.png

```
Silhouettes of an ancient Egyptian royal funeral procession at dusk moving toward a pyramid, priests in white linen, people carrying offerings, a wooden sledge carrying a shrine pulled by men, solemn atmosphere, backlit by the setting sun
```

- 注意：あくまで想像の再現。細部は描き込みすぎず、シルエット中心にする。

### 10-horizon.png

```
The three pyramids of Giza at sunrise as they looked when newly built, covered in smooth white limestone and glowing in the golden light, the Nile valley green in the distance, hopeful and grand, wide panoramic view
```

- 注意：大きい2基（クフ、カフラー）と小さい1基（メンカウラー）が分かればよい。頂上を金色にしない。
