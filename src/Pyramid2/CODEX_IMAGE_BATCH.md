# Codex用：エジプト第2弾 イラスト一括生成

この1ファイルをそのままCodexに渡す。「Codexへの指示」から最後までが依頼内容。
台本：`src/Pyramid2/script.md`（章番号はここと対応）

---

## Codexへの指示

古代エジプト解説動画の第2弾（テーマ：暮らし・王・死後の世界）で使うイラストを生成してください。
前作 `src/Pyramid/ANIME_ART.md` のアニメ調と**同じ画風**にそろえます。

### 出力

- 保存先：`public/photo/pyramid2-anime/`（リポジトリのルートから）
- ファイル名：下の一覧の `file` のとおり（PNG）
- サイズ：横長 16:9（1920×1080 か 1536×864）
- 同じ名前のファイルがあれば、上書きせずに報告する

### 守ること

1. **画風の参照画像を毎回添付する。** `public/photo/pyramid-anime/00-dawn-giza.png`（風景）と `public/photo/pyramid-anime/09-funeral.png`（人物）を「画風の参考だけ」として使う。構図や内容はまねしない。
2. **各プロンプトの末尾に、下の「共通の画風」をそのまま付ける。**
3. **画面の空け方。** 下から1/5くらいは字幕用に落ち着いた絵にする。左か右の端に、解説キャラ（`public/photo/pyramid-guide/`）が立てる余白を残す。`guide` に `left` とあれば左を空ける、`right` なら右を空ける。
4. **文字を入れない。** 文字・数字・ロゴ・透かしは入れない。ヒエログリフのような文字は、読めない装飾の模様でよい。アルファベットや漢字が混ざったら作り直す。
5. **`avoid` と「共通で描かないもの」は描かない。** 時代考証の間違いを防ぐため。できた絵を見て当てはまったら作り直す。
6. **`reuse` の項目は新しく作らない。** 前作の絵をそのまま使うので、ファイルがあるかだけ確認する。
7. 全部終わったら、作ったファイルの一覧と、作り直した絵があればその理由を報告する。確認用に、全部を並べた一覧画像（コンタクトシート）も `out/pyramid2-anime-check/` に出してほしい。

### 共通の画風（すべてのプロンプトの末尾に付ける）

```
Charming hand-drawn 2D anime storybook illustration, clear warm brown ink contours, simple cel-shaded shapes, subtle gouache paper texture, soft apricot sunlight, pastel turquoise and lavender accents, friendly expressive anime faces where people exist, inviting sense of discovery. Clearly a drawing, not 3D CG, not photorealistic, no photographic lighting. Ancient Egypt, Old Kingdom 4th Dynasty, around 2600-2500 BC. Wide 16:9 landscape with the main subject near the center, calm lower fifth for subtitles. No text, no letters, no numbers, no logos, no watermark.
```

### 共通で描かないもの（全部の絵）

- ラクダ、馬、馬車、車輪、鉄の道具（この時代のエジプトにない）
- ツタンカーメン風の黄金のマスク、青い戦の冠（後の新王国のもの）
- 心臓を天秤にかける場面、死者の書の巻物（後の時代のもの）
- 動物の頭のふたが付いた壺（カノポス壺の後の時代の形）
- 鎖につながれた人、むちで打つ場面
- ギリシャ・ローマ風の柱やアーチ
- 怖い・グロテスクなミイラ表現（ホラー映画風にしない）

---

## 一覧（JSON）

```json
[
  {
    "file": "00-dawn-offering.png",
    "chapter": "0 導入",
    "guide": "right",
    "prompt": "Quiet dawn at the Giza plateau, in the foreground a simple stone offering table with round loaves of bread, a jar of beer and a lotus flower, the Great Pyramid rising softly in the distance under a pastel sky, a feeling of a gentle question: why build this for after death",
    "avoid": "golden capstone, people, modern buildings, skulls"
  },
  {
    "file": "01-nile-fields.png",
    "chapter": "1 ナイルと暮らし",
    "reuse": "public/photo/pyramid-anime/01-nile-fields.png"
  },
  {
    "file": "01-flood-season.png",
    "chapter": "1 ナイルと暮らし",
    "guide": "left",
    "prompt": "The Nile inundation season, wide shallow brown floodwater spreading over flat fields and leaving dark fertile mud, villages of mud-brick houses on slightly raised ground like islands, date palms reflected in the water, small papyrus reed boats, a farmer family watching from a low mound",
    "avoid": "stone bridges, dams, modern irrigation, wheels"
  },
  {
    "file": "01-bakery-brewery.png",
    "chapter": "1 ナイルと暮らし",
    "guide": "right",
    "prompt": "An ancient Egyptian bakery and brewery courtyard, women kneeling and grinding grain on flat saddle-shaped grinding stones, bread baked in stacked conical clay bread molds over hot embers, tall clay beer jars, baskets of barley and emmer wheat, workers receiving their daily ration of bread and beer, warm busy atmosphere",
    "avoid": "modern ovens, metal pots, wine glasses, a tavern or bar scene"
  },
  {
    "file": "01-linen-weaving.png",
    "chapter": "1 ナイルと暮らし",
    "guide": "left",
    "prompt": "Two ancient Egyptian women weaving white linen on a low horizontal ground loom pegged to the floor, bundles of flax stalks and spindles nearby, simple white linen dresses with straps, soft light through a doorway of a mud-brick workshop",
    "avoid": "upright vertical loom, spinning wheel, colorful patterned fabrics, cotton"
  },
  {
    "file": "01-kohl-makeup.png",
    "chapter": "1 ナイルと暮らし",
    "guide": "right",
    "prompt": "A well-off ancient Egyptian woman of the Old Kingdom applying dark kohl around her eyes with a slender stick, a small round stone kohl pot with a lid on a low table, a polished copper mirror, short black wig, simple white linen dress, calm and elegant",
    "avoid": "Cleopatra-style crown, modern makeup brushes, glass bottles, gold jewelry overload"
  },
  {
    "file": "01-family-meal.png",
    "chapter": "1 ナイルと暮らし",
    "guide": "left",
    "prompt": "An ancient Egyptian family sharing a simple meal in the courtyard of a mud-brick house at sunset, bread, onions, fish and a jug of beer on reed mats, parents and two children, a cat resting nearby, warm and peaceful everyday life",
    "avoid": "chairs and dining table like modern home, forks, plates of porcelain"
  },
  {
    "file": "02-maat-order.png",
    "chapter": "2 王ってそもそも何者？",
    "guide": "right",
    "prompt": "A symbolic serene composition about cosmic order: a kneeling goddess with a single tall ostrich feather on her head, wings softly spread, above her the sun rising, below her the Nile flowing and green fields, people working peacefully, everything balanced and harmonious",
    "avoid": "scales or balance, heart weighing scene, chaos or monsters"
  },
  {
    "file": "01-king-gods.png",
    "chapter": "2 王ってそもそも何者？",
    "reuse": "public/photo/pyramid-anime/01-king-gods.png"
  },
  {
    "file": "02-king-horus.png",
    "chapter": "2 王ってそもそも何者？（カフラー像）",
    "guide": "left",
    "prompt": "An illustration inspired by the idea of a seated Old Kingdom king statue carved in dark green-black stone, the king on a throne wearing the striped nemes headdress and a false beard, a falcon perched behind his head with its wings wrapping protectively around the back of the headdress, dignified and calm, plain warm background",
    "avoid": "exact replica of a real museum statue, gold, blue crown, living falcon flying, text on the throne"
  },
  {
    "file": "03-ka-offering.png",
    "chapter": "3 人は死ぬとどうなる？",
    "guide": "right",
    "prompt": "A gentle symbolic scene: in a quiet tomb chapel, offerings of bread, beer jars and meat on an offering table, soft glowing threads of light rising from the food toward a translucent luminous double of a smiling man standing beside his own statue, the double with both arms raised upward, warm and comforting, not scary",
    "avoid": "ghost horror style, skeleton, dark scary atmosphere, the dead person eating the food"
  },
  {
    "file": "03-wrapped-body.png",
    "chapter": "3 人は死ぬとどうなる？",
    "guide": "left",
    "prompt": "A respectful quiet scene in a dim embalming workshop: a body completely wrapped in clean white linen lying on a low wooden bier, the shape simplified and calm, rolls of linen and a plain square alabaster chest with four compartments nearby, two priests in white linen gently folding cloth, soft lamp light",
    "avoid": "exposed body, organs, blood, horror mummy, animal-headed jars, gold mask, painted human-shaped coffin"
  },
  {
    "file": "04-false-door.png",
    "chapter": "4 お墓は儀式を続ける装置",
    "guide": "right",
    "prompt": "Inside the offering chapel of an Old Kingdom mastaba tomb, a tall carved stone false door in the wall shaped like a doorway with recessed frames that cannot be opened, in front of it a stone offering table with bread loaves and jars, a son and daughter in white linen bringing more offerings, warm light from the entrance",
    "avoid": "a real opening door, hinges, readable text, gold"
  },
  {
    "file": "04-serdab.png",
    "chapter": "4 お墓は儀式を続ける装置",
    "guide": "left",
    "prompt": "A cross-section style view of a closed small stone room inside a mastaba tomb containing a painted seated statue of the tomb owner, a narrow slit in the wall at eye level through which the statue gazes out toward the offering chapel where a priest burns incense, mysterious and calm",
    "avoid": "treasure piles, mummy, open doorway into the statue room"
  },
  {
    "file": "04-offering-list.png",
    "chapter": "4 お墓は儀式を続ける装置",
    "guide": "right",
    "prompt": "A painted limestone wall relief in an Old Kingdom tomb chapel: a grid of small decorative offering symbols, rows of bread, jars, geese and joints of meat, and a procession of offering bearers carrying baskets on their heads and leading cattle, soft ochre, green and blue painted colors",
    "avoid": "readable letters, modern frames, gods judging"
  },
  {
    "file": "04-mortuary-temple.png",
    "chapter": "4 お墓は儀式を続ける装置",
    "guide": "left",
    "prompt": "Priests in white linen carrying offerings of bread and jars into a stone mortuary temple at the east foot of a smooth white-cased great pyramid, a long covered causeway leading down toward green fields and the river, morning light, a sense of rituals continuing every day after the king's burial",
    "avoid": "golden capstone, three finished pyramids side by side, Greek columns, sphinx in the foreground"
  },
  {
    "file": "05-hemiunu.png",
    "chapter": "5 王を支えた人たち（ヘミウヌ）",
    "guide": "right",
    "prompt": "A plump, dignified ancient Egyptian high official with a calm round face and short hair, wearing a white linen kilt, holding a long wooden staff, overseeing construction work from a low platform, scribes with papyrus beside him, teams of workers and white limestone blocks in the background, the Great Pyramid partly built",
    "avoid": "modern blueprints or rulers on a drafting table, whips, a slim muscular pharaoh look, crown or nemes headdress"
  },
  {
    "file": "05-merer-papyrus.png",
    "chapter": "5 王を支えた人たち（メレル）",
    "reuse": "public/photo/pyramid-anime/05-merer-papyrus.png"
  },
  {
    "file": "05-boat-stone.png",
    "chapter": "5 王を支えた人たち（メレル）",
    "reuse": "public/photo/pyramid-anime/05-boat-stone.png"
  },
  {
    "file": "05-red-sea-port.png",
    "chapter": "5 王を支えた人たち（ワディ・エル＝ジャルフ）",
    "guide": "left",
    "prompt": "An ancient Egyptian harbor on the arid coast of the Red Sea, a long stone jetty curving into turquoise water, a few wooden expedition boats, a rocky hillside behind with a row of rectangular storage galleries cut into the rock, large storage jars at their entrances, dry desert mountains, bright clear light",
    "avoid": "Nile greenery, palm groves, pyramids nearby, modern port cranes"
  },
  {
    "file": "05-scribe.png",
    "chapter": "5 王を支えた人たち（書記とヒエラティック）",
    "guide": "right",
    "prompt": "An ancient Egyptian scribe sitting cross-legged with a papyrus scroll stretched across his lap, writing quickly with a thin reed brush, a wooden scribe palette with two ink wells of black and red, a spare brush tucked behind his ear, flowing cursive decorative marks on the papyrus, focused and friendly",
    "avoid": "feather quill, paper notebook, Latin or Japanese letters, carved stone"
  },
  {
    "file": "05-hetepheres-furniture.png",
    "chapter": "5 王を支えた人たち（ヘテプヘレス1世）",
    "guide": "left",
    "prompt": "An elegant queen mother of the Old Kingdom resting in her private room, seated on a low gilded wooden armchair with papyrus-flower armrests, beside her a gilded bed with a footboard and a headrest instead of a pillow, a light gilded canopy frame with linen curtains around them, silver bracelets, calm and gentle evening light",
    "avoid": "tall throne with steps, European bed and pillows, crown with cobra and vulture, overly modern furniture"
  },
  {
    "file": "05-empty-sarcophagus.png",
    "chapter": "5 王を支えた人たち（空の石棺）",
    "guide": "right",
    "prompt": "A small dim underground chamber at the bottom of a deep shaft, a plain white alabaster sarcophagus with its lid slightly open and nothing inside, fragments of decayed gilded wooden furniture lying around, a single beam of light from above, a quiet mystery",
    "avoid": "mummy, skeleton, treasure piles, gold mask"
  },
  {
    "file": "06-opening-mouth.png",
    "chapter": "6 葬送と太陽の船（口開けの儀式）",
    "guide": "left",
    "prompt": "A solemn Old Kingdom ritual: a priest in white linen with a sash gently touching the mouth of a standing painted statue of the deceased with a small forked ritual tool, small vessels and offering jars arranged on a tray, another priest reading from a papyrus roll, incense smoke, soft light suggesting the statue being given the ability to eat, see and breathe",
    "avoid": "touching a bare body, cutting, blood, jackal mask priest, painted human-shaped coffin, Book of the Dead"
  },
  {
    "file": "06-boat-pit.png",
    "chapter": "6 葬送と太陽の船",
    "guide": "right",
    "prompt": "Beside the base of the Great Pyramid, workers carefully lowering neatly numbered dismantled cedar wood planks and oars into a long rectangular pit cut into the rock, large limestone slabs ready to cover it, the pyramid's smooth white side rising above, quiet careful work",
    "avoid": "fully assembled boat floating, sails, cranes, readable numbers"
  },
  {
    "file": "09-solar-boat.png",
    "chapter": "6 葬送と太陽の船",
    "reuse": "public/photo/pyramid-anime/09-solar-boat.png"
  },
  {
    "file": "09-funeral.png",
    "chapter": "6 葬送と太陽の船",
    "reuse": "public/photo/pyramid-anime/09-funeral.png"
  },
  {
    "file": "06-sunset-west.png",
    "chapter": "6 葬送と太陽の船（沈む太陽）",
    "guide": "left",
    "prompt": "The sun setting on the western horizon behind a smooth white great pyramid, seen from the green Nile valley on the east, sky melting from apricot to lavender, the pyramid silhouette glowing at its edges, a peaceful feeling of an ending that promises a new dawn",
    "avoid": "golden capstone, three pyramids, modern city lights"
  },
  {
    "file": "04-horizon-sunrise.png",
    "chapter": "6 葬送と太陽の船（昇る太陽・アケト）",
    "reuse": "public/photo/pyramid-anime/04-horizon-sunrise.png"
  },
  {
    "file": "07-ra.png",
    "chapter": "7 神々の役割",
    "guide": "right",
    "prompt": "The Egyptian sun god Ra as a dignified falcon-headed man with a large glowing sun disk above his head, standing on a graceful papyrus boat sailing across a golden sky, warm radiant light, friendly and majestic deity design",
    "avoid": "scary monster, modern superhero armor, text"
  },
  {
    "file": "07-horus.png",
    "chapter": "7 神々の役割",
    "guide": "left",
    "prompt": "The Egyptian god Horus shown as a noble falcon with spread wings protecting a small king figure below him wearing the striped nemes headdress, clear sky, protective and calm mood",
    "avoid": "eagle or hawk of other cultures, aggressive attack pose, text"
  },
  {
    "file": "07-anubis.png",
    "chapter": "7 神々の役割",
    "guide": "right",
    "prompt": "The Egyptian god Anubis as a sleek black jackal lying calmly on top of a shrine-shaped chest at the edge of a quiet desert cemetery of mastaba tombs at twilight, watchful and gentle, guarding the dead",
    "avoid": "weighing of the heart, scales, horror werewolf look, text"
  },
  {
    "file": "07-bastet.png",
    "chapter": "7 神々の役割（ライオン→猫）",
    "guide": "left",
    "prompt": "A two-part side-by-side composition showing how the protective goddess Bastet was depicted: on the left an earlier fierce but noble lioness-headed goddess holding a papyrus scepter, on the right a later gentle graceful seated cat goddess figure with earrings, a soft arrow of time between them in warm light",
    "avoid": "cartoon house cat, scary monster, text labels, arrows with letters"
  },
  {
    "file": "08-people-dawn.png",
    "chapter": "8 まとめ",
    "guide": "right",
    "prompt": "At dawn, ordinary ancient Egyptians stand together on the edge of green fields looking toward the smooth white Great Pyramid on the horizon: a baker with a basket of bread, a scribe with a papyrus roll, a boatman with an oar, a mother holding a child's hand, seen from behind and side, hopeful and warm, the rising sun behind the pyramid",
    "avoid": "golden capstone, three finished pyramids, king or gods, sad faces"
  },
  {
    "file": "10-horizon.png",
    "chapter": "8 まとめ（予備）",
    "reuse": "public/photo/pyramid-anime/10-horizon.png"
  }
]
```

---

## 枚数のまとめ

- 新しく作る：27枚
- 前作の絵を使う：8枚（01-nile-fields、01-king-gods、05-merer-papyrus、05-boat-stone、09-solar-boat、09-funeral、04-horizon-sunrise、10-horizon）
- 解説キャラ：前作の `public/photo/pyramid-guide/` の5枚をそのまま使う

## 絵ではなく図解で作るもの（Remotion側で作る）

- 3章：カー・バー・アクの3ラベル図
- 4章：「供物＝養う／偽扉＝つなぐ／像とセルダブ＝存在を保つ／供物リスト＝永遠に届ける」の4枚カード
- 2章：王・神々・人々の三角形
- 5章：ヒエログリフとヒエラティックの対比（実物の写真をもとに。架空の文字を本物風にしない）
- 6章：口・目・呼吸のアイコン図／「アケト・クフ＝クフの地平線＝Horizon of Khufu」
- 7章：4柱のまとめカード
- 8章：3つの問い

## Public Domain の写真を使う場合（The Met）

- 偽扉：08.201.1e（第5王朝）→ 画面に「クフより少し後・第5王朝」と出す
- 口開けの儀式の道具の模型：07.228.117a–h（第5〜6王朝）
- 作品名・年代・所蔵館・番号を画面か説明欄に入れる
