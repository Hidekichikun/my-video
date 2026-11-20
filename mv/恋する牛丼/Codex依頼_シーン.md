# 恋する牛丼 Codex依頼（シーン画像）

作成: 2026-11-12 / 詳しい絵コンテは MV企画.md

## 依頼のしかた
1. 先に 01_char_sheet（オレ）と 02_kimi_sheet（ヒロイン丼の完成形）を**Midjourneyで**作る（下のMJプロンプト）
2. 02b（土台）と 02c（パーツ）は、02を参考画像にして同じ角度・同じ大きさで作る
3. 03以降は、毎回「共通スタイル」を頭に貼って、01と02を参考画像に渡す
4. 絵の中に文字は入れない（看板・テロップ・メーターはあとでRemotionでのせる）
5. 保存先: my-video/public/gyudon/（ファイル名は見出しの名前.png。例: 03_intro_walk.png）
   - 02c のパーツは 02c_brow.png / 02c_eye_closed.png / 02c_mouth.png / 02c_ginger.png / 02c_yolk.png
6. 実在の牛丼チェーンの看板・ロゴ・制服・丼のデザインに似せない

## Midjourneyで作るもの（11/12）
- **01（オレの設定画）と02（ヒロイン丼の完成形）はMidjourney**で作る（Squaredと同じやり方。絵のクオリティと「おいしそう×可愛い」はMJの方が強い）
- 02b（土台）・02c（パーツ）・03以降のシーンはCodex（01と02を参考画像にして、顔と丼をブレさせない）
- 02b はMJで作った02を、MJのエディター（Vary Region）で顔の具材だけ消して作ってもOK

### MJ 01（オレの設定画）
```
character sheet of an original anime man, about 28 years old tired office worker, navy suit, white shirt, loosened tie, slightly messy short black hair, ID badge on a lanyard, worn black business backpack, front view, side view, back view, four expression close-ups: dead tired eyes, lovestruck blushing like a shoujo manga heroine, jealous pout, blissful satisfied smile, plain light grey background, clean lineart, anime cel shading --ar 16:9 --niji 6 --no text, letters, watermark
```

### MJ 02（ヒロイン丼の完成形）
```
top-down view of a Japanese beef bowl in a plain dark round ceramic bowl, arranged as kyaraben food art into the cute face of an anime heroine, thin sliced simmered beef draped over the top of the rice as her bangs and hair, white rice as her face, curved onion slices as thin eyebrows, a closed winking eye and a small smile, two small piles of bright pink pickled ginger as blushing cheeks, one glossy raw egg yolk as her big shining open eye like a full moon, glistening golden broth, soft steam, warm cinematic light, appetizing and adorable --ar 1:1 --v 7 --no text, logo, chopsticks
```
※ --niji 6 でも出して、可愛い方を選ぶ。顔が崩れたら「kyaraben」「face」の重みを上げる（例: `cute anime heroine face::2`）
※ ニジやv7はもっと新しいバージョンが出ていたらそっちでOK

### 共通スタイル（毎回の頭に貼る）
```
Japanese anime illustration, cinematic emotional romance anime style, cold winter night city in deep navy blue, warm orange glow of a small 24-hour restaurant, soft steam and light bokeh, delicate lighting, film grain, 16:9, no text, no letters, no logos, no watermark.
Keep the same man as the reference image: about 28 years old office worker, navy suit, loosened tie, slightly messy short black hair, ID badge lanyard, worn black business backpack.
The gyudon is an original generic beef bowl in a plain dark bowl, not any real restaurant chain's design.
```

---

## 設定画

### 01_char_sheet（オレ）
```
Character sheet of an original anime man, about 28 years old office worker. Navy suit, white shirt, loosened tie, slightly messy short black hair, tired gentle eyes, ID badge on a lanyard, worn black business backpack. Front view, side view, back view, plus 4 expression close-ups: dead tired eyes, lovestruck blushing, jealous pout, blissful satisfied smile. Plain light grey background, clean lineart, anime cel shading, no text.
```

### 02_kimi_sheet（君＝牛丼・完成形）
```
Top-down view of a Japanese gyudon beef bowl in a plain dark round ceramic bowl, arranged like Japanese character bento food art into the cute face of an anime heroine: thin sliced simmered beef draped over the top part of the rice as bangs and hair, the lower white rice area forms her face. Curved slices of simmered onion form thin eyebrows, a closed winking eye and a small smiling mouth. Two small piles of bright pink pickled ginger as blushing cheeks. One raw egg yolk as her big shining open eye, glowing like a full moon. Glistening golden broth highlights. Soft steam, warm light, appetizing and cute, no text, no logos.
```

### 02b_kimi_base（真上カットの土台）
```
Same top-down gyudon bowl as the reference image, but only the bowl, the white rice and the simmered beef as bangs and hair. The face area is plain white rice with nothing on it: no onion, no ginger, no egg. Same angle, same size, same lighting.
```

### 02c_kimi_parts（パーツ）
※1パーツ1枚、真っ白な背景で。背景はクラウドで抜く
```
Single isolated food item on a pure white background, top-down view, same lighting as the reference: [curved slices of simmered onion shaped like thin eyebrows] / [a curved onion slice shaped like a closed eye] / [a curved onion slice shaped like a small smile] / [a small pile of bright pink pickled ginger] / [one glossy raw egg yolk]. No shadow, no text.
```

---

## Codexプロンプト（シーン）
※全部、頭に「共通スタイル」を貼って、01と02を参考画像に。

### 03_intro_walk
```
Wide shot from behind: the man walking alone on a cold winter night street near a station after overtime, shoulders slumped, white breath, street lights and blurred city bokeh in deep navy.
```
### 04_intro_face
```
Close-up side profile of the man in cold wind, hair strands blowing, empty exhausted eyes, cheeks slightly red from the cold, navy night background.
```
### 05_intro_light
```
Long shot of a quiet night street, far away a single small warm orange glow of a tiny restaurant at the end of the road, the rest of the city cold and blue. Empty center area for a title. No people.
```
### 06_verse1_train
```
The man leaning his head on a crowded late-night train window, eyes closed, city lights streaking outside, faint warm steam reflected in the glass.
```
### 07_verse1_steam
```
Dreamy flashback: thick soft white steam backlit by warm orange light, something warm glowing behind the steam but not visible, romantic soft focus, lens flare. No people.
```
### 08_verse1_chopsticks
```
Close-up of the man's hands snapping a pair of wooden disposable chopsticks apart at a wooden counter, warm light, shallow depth of field.
```
### 09_pre_pass
```
The man walking past a row of stylish cafes and fancy restaurants with glowing windows at night, not even looking at them, determined face, side view.
```
### 10_pre_door
```
Front view of the man standing in front of a small traditional sliding door of a tiny 24-hour restaurant with a plain fabric noren curtain, warm orange light spilling out onto the cold street. Plain signboard with no text.
```
### 11_chorus_reveal
```
Romance anime heroine reveal composition: a sliding door opens and blinding warm light pours out, in the center a glistening gyudon beef bowl on a wooden counter surrounded by sparkling steam and light particles, like the first appearance of a love interest. Seen from the man's point of view.
```
### 12_chorus_hold
```
The man sitting at a wooden counter, holding a gyudon bowl gently with both hands, lovestruck blushing expression, warm orange glow on his face, steam rising.
```
### 13_chorus_bite
```
The man taking the first bite with eyes closed, blissful face, the background turning into shoujo manga style soft flowers and sparkles in warm colors.
```
### 14_chorus_again
```
The man walking fast on a night street with a happy smile, ID badge swinging, coat flapping, the small orange-lit restaurant ahead.
```
### 15_verse2_glisten
```
Extreme close-up of a gyudon beef bowl, simmered beef glistening with golden broth, dramatic romantic lighting with rim light and soft steam, like a close-up of a beautiful face.
```
### 16_verse2_order
```
Close-up of the man's finger pressing a button on a plain ordering touch screen at a small restaurant, the screen shows only blank colored buttons, warm light.
```
### 17_verse2_midnight
```
Exterior of a tiny 24-hour restaurant at 2 a.m. in the rain, the only lit building on a dark empty street, warm orange windows reflected in wet asphalt. No people.
```
### 18_pre2_rival
```
Out-of-focus shot: next to a gyudon bowl on the counter there is a blurry pink shape that looks like the silhouette of a pink-haired girl. In the foreground the man glares with a jealous pout.
```
### 19_pre2_ginger
```
Sharp focus close-up: a small pile of bright pink pickled ginger sitting beside a gyudon bowl, cute and innocent, warm light.
```
### 20_chorus2_choose
```
The man pointing decisively at a blurred menu board on the wall (no readable text), confident face, dynamic angle.
```
### 21_chorus2_wallet
```
The man peeking into an almost empty wallet with only a few coins, teary laughing face, while behind his a gyudon bowl glows gently and warmly on the counter.
```
### 22_bridge_fast
```
Three-panel comic style split image: a bowl being placed on the counter, the man eating happily, an empty bowl with chopsticks laid neatly. Speed lines, warm colors.
```
### 23_bridge_moon
```
A huge glowing yellow full moon over a winter night city, with soft clouds, dreamy and romantic. No people.
```
### 24_bridge_egg
```
Slow-motion close-up: a raw egg yolk falling from a cracked eggshell toward a gyudon bowl, glowing like a small yellow moon, droplets frozen in the air.
```
### 25_last_glow
```
A gyudon bowl topped with a shining egg yolk like a full moon, radiating golden light that fills the whole small restaurant, light particles everywhere, the man's silhouette in awe.
```
### 26_last_counter
```
Wide shot inside a cozy tiny restaurant at night: the man alone at the wooden counter eating happily, snow falling outside the window, warm orange interior against cold blue outside.
```
### 27_outro_wake
```
Ordinary late-night office: the man lifting his head from his desk, waking up, monitor glow, flat realistic colors, stunned face.
```
### 27b_outro_mutter
```
Close-up of the man's face at his office desk late at night, deadpan serious expression, paper crease marks on his cheek, monitor glow, flat realistic colors.
```
### 28_shout_order
```
Comedic anime gag face: inside a small ordinary gyudon restaurant, the man leaning over the counter shouting an order with fiery eyes and a huge open mouth, speed lines, while a calm restaurant clerk in a plain generic uniform looks at him completely deadpan. Ordinary realistic colors, not dreamy.
```
### 29_end_wink
```
Top-down view of an ordinary gyudon bowl with a raw egg yolk on a counter, no face, plain and realistic, the man's hand holding split chopsticks above it. A tiny sparkle on the egg yolk.
```
※29の「ウインク」は02の完成形の顔をRemotionで一瞬だけ半透明で重ねる

---

