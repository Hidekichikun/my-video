# Codex用：イラスト21枚の一括生成

この1ファイルをそのままCodexに渡す。下の「Codexへの指示」から最後までが依頼内容。

---

## Codexへの指示

ピラミッドの解説動画で使うイラストを21枚生成してください。

### 出力

- 保存先：`public/photo/pyramid/`（リポジトリのルートから）
- ファイル名：下の一覧の `file` のとおり（PNG）
- サイズ：横長。1536×1024 か 1920×1080 を推奨。動画側で16:9に切り抜くので、**大事なものは画面の中央寄りに置く**
- すでに同じ名前のファイルがあれば、上書きせずに報告する

### 守ること

1. **全部同じ画風にする。** 各プロンプトの末尾に、下の「共通の画風」をそのまま付ける。
2. **画像の中に文字・数字・ロゴ・透かしを入れない。** ヒエログリフのように文字が出る絵は、読めない装飾の模様でよい。アルファベットや漢字が混ざったら作り直す。
3. **`avoid` に書いたものは描かない。** 時代考証の間違いを防ぐため。できた絵を見て、`avoid` に当てはまるものがあれば作り直す。
4. **`04-giza-then.png` は `04-giza-now.png` の後に作る。** 画像編集ができるなら、now を元にして「表面だけ白い化粧石に変える」編集で作る。できない場合は、プロンプトの構図の指定を now と完全に同じにして作る。
5. 全部終わったら、作ったファイルの一覧と、作り直した絵があればその理由を報告する。

### 共通の画風（すべてのプロンプトの末尾に付ける）

```
Semi-realistic 3D rendered illustration, cinematic CG like a high-quality museum documentary reconstruction, physically based materials, soft global illumination, warm golden desert sunlight, subtle atmospheric haze, detailed but clean, muted sandstone and ochre palette with deep lapis-blue accents, wide cinematic composition with the main subject near the center, ancient Egypt Old Kingdom period around 2500 BC, not a photograph, no text, no letters, no numbers, no logos, no watermark
```

### 一覧（JSON）

```json
[
  {
    "file": "00-dawn-giza.png",
    "prompt": "The Great Pyramid of Giza at dawn seen from far away across the desert, its rough stepped brown surface as it looks today with the very top slightly missing, the pyramid of Khafre behind it with a small patch of smooth white casing near its peak, low golden sun on the horizon, long soft shadows, quiet and majestic",
    "avoid": "smooth white casing on the Great Pyramid, golden capstone, people, modern buildings in the foreground"
  },
  {
    "file": "00-khufu-statue.png",
    "prompt": "A tiny seated ivory figurine of an ancient Egyptian king, only a few centimeters tall, standing alone on a simple dark stone pedestal under a soft museum spotlight, lots of empty dark space around it to show how small it is, dignified and quiet",
    "avoid": "gold statue, large statue, exact replica of a real museum object, glass case reflections, text labels"
  },
  {
    "file": "01-nile-fields.png",
    "prompt": "The Nile river valley in ancient Egypt, a band of dark black fertile soil and green fields along the calm river, farmers in simple white linen kilts working with wooden hoes and reed baskets, date palms, small reed boats, dry desert cliffs in the distance",
    "avoid": "camels, horses, chariots, wheels, iron tools, modern clothing"
  },
  {
    "file": "01-king-gods.png",
    "prompt": "A symbolic scene: an ancient Egyptian king of the Old Kingdom standing in the center wearing the striped nemes headdress and a white pleated kilt, above him large glowing semi-transparent figures of Egyptian gods including a falcon-headed sun god with a sun disk, below him ordinary people bowing, the king connecting gods and people",
    "avoid": "Tutankhamun-style golden mask, blue war crown, New Kingdom chariots, text"
  },
  {
    "file": "04-giza-now.png",
    "prompt": "The Great Pyramid of Giza as it looks today, viewed from the southeast at a slight angle from ground level, the whole pyramid visible in the center of the frame, rough brown stepped core stones, the very top slightly missing, clear blue sky, flat desert ground in the foreground, simple background",
    "avoid": "people, tourists, camels, modern buildings, smooth white casing, golden capstone"
  },
  {
    "file": "04-giza-then.png",
    "prompt": "Exactly the same camera position, angle and framing as 04-giza-now.png: the Great Pyramid of Giza viewed from the southeast at a slight angle from ground level, the whole pyramid visible in the center of the frame, but as it looked when newly built: covered in smooth polished white limestone casing with no visible steps, a perfect sharp pyramid up to the very top, shining white in the sunlight, clear blue sky, flat desert ground in the foreground",
    "avoid": "golden capstone, gold tip, visible steps, people, modern buildings, a different camera angle from 04-giza-now.png"
  },
  {
    "file": "04-horizon-sunrise.png",
    "prompt": "The sun rising exactly on the horizon line right next to the tip of a great white pyramid, rays of golden light spreading over the desert, a serene symbolic composition about the horizon",
    "avoid": "text, golden capstone"
  },
  {
    "file": "05-workers-town.png",
    "prompt": "Bird's-eye view of an ancient Egyptian workers' town near the Giza plateau, long rows of mud-brick gallery buildings, bakeries with smoke rising, granaries, a walled enclosure, busy workers carrying bread and clay jars, pyramids under construction in the background with earthen construction ramps",
    "avoid": "chained slaves, whips, stone palaces, camels, horses, wheels"
  },
  {
    "file": "05-merer-papyrus.png",
    "prompt": "Close-up of an ancient papyrus sheet with torn edges, covered in columns of faded black and red handwritten ancient Egyptian cursive script, lying on a wooden table in warm oil-lamp light",
    "avoid": "latin letters, kanji, readable modern text, printed text"
  },
  {
    "file": "05-boat-stone.png",
    "prompt": "A wooden ancient Egyptian cargo boat on the Nile carrying large blocks of bright white limestone, a single rectangular square sail, oarsmen and a steersman with a steering oar, other boats in the distance, the Giza plateau far away with a white pyramid under construction",
    "avoid": "triangular lateen sail, metal ship, cannons, modern boats"
  },
  {
    "file": "05-sledge-sand.png",
    "prompt": "A team of ancient Egyptian workers pulling a large stone block on a wooden sledge with thick ropes across the desert sand, one man standing in front pouring water from a clay jar onto the sand to make pulling easier, an overseer clapping the rhythm",
    "avoid": "wheels, rollers, carts, whips, chained slaves, camels, horses"
  },
  {
    "file": "06-grand-gallery.png",
    "prompt": "Inside the Grand Gallery of the Great Pyramid: a very tall and narrow passage rising upward at a steep angle, the side walls step inward layer by layer toward a narrow flat ceiling (corbelled vault), low stone benches along both sides with a channel in the middle, lit by small warm oil lamps, a tiny human figure for scale, plain undecorated limestone walls",
    "avoid": "paintings or hieroglyphs on the walls, arched ceiling, torches with modern style, treasure, mummies"
  },
  {
    "file": "06-kings-chamber.png",
    "prompt": "Inside the King's Chamber of the Great Pyramid: a plain rectangular room built of large polished red granite blocks with a flat ceiling of huge granite beams, a single lidless rectangular granite sarcophagus at the far end, dim warm lamp light, empty and silent",
    "avoid": "paintings or hieroglyphs on the walls, treasure, gold, mummy, a lid on the sarcophagus"
  },
  {
    "file": "06-crew-graffiti.png",
    "prompt": "Close-up of rough limestone blocks in a dark narrow space, marked with red ochre painted builders' marks, leveling lines and simple quickly painted signs, an oval cartouche painted roughly in red, lit by a warm narrow beam of light",
    "avoid": "neatly carved inscriptions, colorful wall paintings, latin letters, kanji"
  },
  {
    "file": "07-sphinx.png",
    "prompt": "The Great Sphinx of Giza carved from the bedrock, a lion body with a royal human head wearing the nemes headdress, the nose missing as it is today, the pyramid of Khafre rising behind it with a small patch of white casing near the top, late afternoon light",
    "avoid": "intact nose, people, tourists, modern buildings, text"
  },
  {
    "file": "08-pyramid-texts.png",
    "prompt": "Inside a small ancient Egyptian burial chamber, every wall covered from floor to ceiling with neat vertical columns of carved hieroglyph-like symbols painted blue-green, a gabled ceiling painted with yellow stars on dark blue, a stone sarcophagus, soft lamp light",
    "avoid": "figurative wall paintings of people, latin letters, kanji, readable modern text"
  },
  {
    "file": "08-valley-kings.png",
    "prompt": "The Valley of the Kings near Luxor: a dry rocky desert valley between steep limestone cliffs, above it a natural mountain peak shaped like a pyramid, small tomb entrances cut into the rock at the bottom of the cliffs, harsh bright sunlight",
    "avoid": "built pyramids, modern roads, tourists, buses"
  },
  {
    "file": "08-tomb-light.png",
    "prompt": "Stone steps descending into the rock toward the sealed doorway of an ancient tomb, a beam of light entering the darkness for the first time, dust floating in the light, mysterious and quiet",
    "avoid": "golden mask, treasure piles, people, recreation of famous excavation photos"
  },
  {
    "file": "09-solar-boat.png",
    "prompt": "A long slender ancient Egyptian royal boat made of cedar wood, about forty meters long, with high elegant curved prow and stern shaped like papyrus stalks, a small cabin in the middle, long oars, gliding on a calm river at sunset",
    "avoid": "sails, mast with sail, metal parts, modern boats"
  },
  {
    "file": "09-funeral.png",
    "prompt": "Silhouettes of an ancient Egyptian royal funeral procession at dusk moving toward a pyramid, priests in white linen, people carrying offerings, a wooden sledge carrying a shrine pulled by men, solemn atmosphere, strongly backlit by the setting sun",
    "avoid": "detailed faces, New Kingdom chariots, horses, text"
  },
  {
    "file": "10-horizon.png",
    "prompt": "The three pyramids of Giza at sunrise as they looked when newly built, two large pyramids and one smaller pyramid, covered in smooth white limestone and glowing in golden light, the green Nile valley in the distance, hopeful and grand, wide panoramic view",
    "avoid": "golden capstones, visible steps, modern buildings, people"
  }
]
```
