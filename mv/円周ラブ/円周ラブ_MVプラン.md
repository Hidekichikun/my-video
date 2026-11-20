# 円周ラブ MV 絵コンテ＆Codex画像プロンプト（ただいま正気を失い中）

作成: 2026-10-29

## コンセプト
- **あたし（主人公）が恋した相手は、黒板に描かれた「円」そのもの**。君＝チョークの円 (x − a)² + (y − b)² = r²。顔はなく、光り方・ゆれ方で気持ちを表す
- 「数式に本気で恋してる女の子」っていう出オチ感が、ただ正のカオスっぽさ担当。音はガチでかっこいいので、絵もかわいい×グリッチでガチ寄りに
- 舞台: 夕方〜夜の大学の講義室。デカい黒板
- 色: 黒板の深緑黒／チョークの白（君の色）／ホットピンク（あたしの色）／シアン（グリッチ）。グリッチはピンク×シアンのRGBずれで統一
- 画面: 16:9（1920×1080）。ショート用は最後に9:16を2枚

## キャラ
- **あたし**: 20歳くらいの大学生の女の子。黒髪ボブ＋ピンクのインナーカラー、オーバーサイズの白シャツ＋チェックのスカート、指にチョークの粉。強気だけど照れやすい、からかう表情が得意
- **君**: 黒板のチョークの円。中心に小さな点（a, b）と半径の線 r。うれしいと白く光る、照れると少しピンクになる、ゆれる

## 作り方のコツ
1. 先に **01_char_sheet（あたしの設定画）** と **02_kimi_sheet（君＝円の設定画）** を作る
2. 以降の絵は毎回その2枚を参考画像としてCodexに渡す（顔と服がブレないように）
3. 下の「共通スタイル」を毎回プロンプトの頭に貼る
4. 絵の中に文字・数式は入れない（歌詞と数式はRemotionで後のせ。チョークの線がくずれるため）

### 共通スタイル（毎回の頭に貼る）
```
Japanese anime illustration, cel shading with soft glow, glitch art accents, a dark green-black university chalkboard world, chalk-white lines that glow softly, accent colors hot pink and cyan with subtle RGB-split glitch, chalk dust particles in the air, cinematic lighting, 16:9, no text, no letters, no numbers, no watermark.
Keep the same girl as the reference image: about 20 years old, black bob hair with pink inner color, oversized white shirt with rolled sleeves, plaid skirt, chalk dust on her fingers.
```

---

## 設定画

### 01_char_sheet（あたし）
```
Character sheet of an original anime girl, about 20 years old university student. Black bob hair with hot pink inner color, big bright eyes, confident teasing smile. Oversized white shirt with rolled sleeves, grey plaid skirt, white sneakers, chalk dust on her fingertips. Front view, side view, back view, plus 4 expression close-ups: teasing grin, blushing embarrassed, nervous, tearful smile. Plain light grey background, clean lineart, anime cel shading, no text.
```

### 02_kimi_sheet（君＝チョークの円）
```
Design sheet of a living chalk circle on a dark green-black chalkboard. A perfect hand-drawn white chalk circle with a small center dot and one straight radius line from the center to the edge. Show 4 moods side by side: calm (soft white glow), happy (bright white glow with sparkles), shy (faint pink glow), wobbly (the line slightly vibrating with chalk dust). No face, no eyes, no text, no numbers.
```

---

## 絵コンテ

| No. | パート | 歌詞のあたり | 絵 | 動き（Remotion） |
|---|---|---|---|---|
| 03 | Intro | r- r- r- / Feel my love! | 黒板に円がひとりでに描かれていく途中 | グリッチ連打、Hey!で円が完成して光る |
| 04 | Intro | （タイトル） | 黒板いっぱいの大きな円。中央はタイトル用に空け | 曲名「円周ラブ」をチョーク風に |
| 05 | Verse1 | 黒板の端っこで 出会った | 夕方の講義室、黒板の端で円を見つけるあたし | ゆっくりズーム |
| 06 | Verse1 | a、b、r それだけで | チョークを持つ手のアップ、円の中心と半径 | a・b・rを手書き風に後のせ |
| 07 | Verse1 | ノートに何度 書いたって | 円だらけのノートを抱えて口をとがらせる | ノートの円がひとつずつ増える |
| 08 | Pre | コンパスみたいに Spin it | コンパスを持ってくるっと回るあたし | 回転ブラー、Spin itで2回転 |
| 09 | Pre | Don't laugh, don't laugh! | ノートで顔を半分かくして赤面 | 小刻みにゆれる |
| 10 | Chorus | Feel my love! 〜 = r² | 黒板いっぱいに光る円、チョークの粉が爆発、ジャンプするあたし | 数式が項ごとに書き足される |
| 11 | Chorus | まあるく 世界を描く | 円が地球みたいな星になり、その前で両手を広げる | 円がゆっくり回転 |
| 12 | Chorus | ノートの端まで 君でいっぱい | ノートの余白まで円とハートの落書き | パン（横移動） |
| 13 | Post | Round and round | 真上から：円の上をくるくる回るあたし | 画面ごと回転させてループ |
| 14 | Verse2 | 円周の上の 点たちに | 円の上に等間隔に並ぶ点。その外でほっぺをふくらますあたし | 点がぽつぽつ光る |
| 15 | Verse2 | あたしの x と y 代入してみて | 付箋を円に差し出す（付箋は白紙） | 付箋に「x, y」を後のせ |
| 16 | Pre2 | ペンを止めて | 答案の上でペンを止めて不安そうな顔 | 止め絵＋ちょいグリッチ |
| 17 | Chorus2 | マイナスだって 二乗すれば プラス | 涙をこぼすあたしを、円の線がやさしく包む | 「−」が「＋」に変わる演出を後のせ |
| 18 | Breakdown | I'm in love with you | 暗い講義室、黒板にヒビ、拳を上げて叫ぶあたし、赤×シアン | ハーフタイムに合わせて強いシェイク |
| 19 | Breakdown | (glitch stop) Solve for me! | 18をピクセルソートで崩したフリーズ画 | 完全停止→Solve for meで復帰 |
| 20 | Bridge | 君は 終わらない線 | 雨の夜、ひとりで黒板の円にそっとふれる。横に小さな点 | 青く沈む、雨粒 |
| 21 | Bridge | 消しゴムでも 消せないくらい | 何重にもなぞられた円、消しゴムをにぎって泣き笑い | 線が1本ずつ重なる |
| 22 | Build | Three, two, one— | 黒板の前で振りかぶる後ろ姿、チョークの粉が渦 | 3・2・1をチョーク文字で後のせ |
| 23 | Final | 君の円周に あたしが 今 乗った | 光る円の線の上に立つあたし、星空みたいなチョークの宇宙 | 最大の光、粉が舞い上がる |
| 24 | Final | 君と回ってく | 円の線の上を走り出すあたし、光の輪 | 回転＋ズームアウト |
| 25 | Outro | イコールで 結ばれた | 朝の講義室、机でうたた寝して微笑むあたし。黒板の円がやさしく光る | 白くフェード、最後に「＝」 |

---

## Codexプロンプト（シーン）
※全部、頭に「共通スタイル」を貼って、01と02を参考画像に。

### 03_intro_draw
```
Extreme close-up of a dark green-black chalkboard. A glowing white chalk circle is drawing itself, about three quarters complete, the unfinished end sparking with chalk dust. Heavy digital glitch: horizontal slice offsets, hot pink and cyan RGB split, scan lines. No people.
```

### 04_title_bg
```
Front view of a huge dark green-black chalkboard filling the frame. One giant perfect glowing white chalk circle in the center with a small center dot and a radius line. The inside of the circle is clean empty space. Faint chalk dust floating, soft vignette. No people.
```

### 05_verse1_meet
```
An empty university lecture hall at sunset, warm orange light through the windows. The girl stands at the far edge of a huge chalkboard holding a piece of chalk, looking up surprised and curious at a perfect glowing white chalk circle on the board. Medium shot, from slightly behind her shoulder.
```

### 06_verse1_hand
```
Close-up of the girl's hand holding white chalk against the chalkboard, chalk dust on her fingers, next to the center dot and radius line of a glowing chalk circle. Shallow depth of field, soft sunset rim light.
```

### 07_verse1_notebook
```
The girl sitting at a lecture hall desk, hugging an open notebook full of hand-drawn circles, pouting with puffed cheeks and looking sideways, slightly jealous and charmed. Sunset light, chalkboard in the blurred background.
```

### 08_pre_spin
```
The girl spinning on one foot in front of the chalkboard, holding a large wooden blackboard compass like a dance partner, skirt and hair flaring out, blushing, playful smile. Motion blur circles trailing behind her, chalk dust swirling.
```

### 09_pre_dontlaugh
```
Close-up of the girl hiding the lower half of her face behind her notebook, deep blush, eyes looking at the viewer, embarrassed but cute. Pink glow, slight cyan glitch on the edges.
```

### 10_chorus_explosion
```
Wide shot, night lecture hall. A giant chalk circle glows brilliantly across the whole chalkboard, chalk dust exploding outward like fireworks in white, pink and cyan. The girl jumps in the air in front of it with one fist raised, joyful festival energy. Dynamic low angle.
```

### 11_chorus_world
```
The glowing chalk circle has become a round planet made of chalk lines floating in a dark chalkboard space. The girl stands in front of it with both arms spread wide, hair blowing, looking up in awe. Three small glowing dots orbit the planet.
```

### 12_chorus_notebook_full
```
Top-down view of an open notebook on a desk. Every page and margin is completely filled with chalk-style circles of all sizes and little pink hearts doodled between them. The girl's hand with a pencil enters from the side. Soft lamp light.
```

### 13_post_round
```
Top-down bird's-eye view. A big glowing chalk circle on a dark surface, and the girl skipping along the circle line, arms out, smiling. Centered composition so the image can rotate. Chalk dust trailing behind her steps.
```

### 14_verse2_points
```
The chalkboard shows the glowing chalk circle with many small glowing dots placed at equal spacing along its line. The girl stands outside the circle with arms crossed, cheeks puffed, staring jealously at the dots. Evening blue light.
```

### 15_verse2_substitute
```
The girl leans toward the glowing chalk circle on the chalkboard, holding out a blank pink sticky note with both hands like a love letter, eyes closed, blushing. The circle glows a faint pink in response.
```

### 16_pre2_pen_stop
```
Close-up of the girl at a desk, pen frozen just above a blank answer sheet, biting her lip, nervous eyes. Cool blue night light, slight cyan glitch lines across the image.
```

### 17_chorus2_embrace
```
The girl stands in front of the chalkboard with a tear falling, smiling through it. White glowing chalk lines peel off the board and gently wrap around her shoulders in a circle like a hug. Warm white and pink glow, chalk dust like snow.
```

### 18_breakdown_heavy
```
Dark lecture hall lit by red and cyan light. The chalkboard is cracked, chalk shards flying. The girl stands in front of it, both fists raised, chanting with fierce confidence, hair whipping. Heavy glitch distortion, strong contrast, intense heavy-music energy.
```

### 19_breakdown_freeze
```
Same scene as a girl with raised fists in a dark red and cyan lecture hall with a cracked chalkboard, but frozen and broken by extreme pixel sorting and data-moshing glitch, horizontal streaks of pink and cyan, half of the image dissolving into pixel blocks.
```

### 20_bridge_rain
```
Rainy night, empty lecture hall, blue moonlight and rain streaks on the windows. The girl stands alone, gently touching the glowing chalk circle on the chalkboard with her fingertips, sad gentle eyes. A single tiny chalk dot sits beside the circle. Quiet, intimate mood.
```

### 21_bridge_eraser
```
Close-up of the chalkboard: one circle traced over many, many times, thick layered chalk lines. The girl holds a chalkboard eraser in one hand but cannot erase it, crying and smiling at the same time. Soft blue light, chalk dust.
```

### 22_build_windup
```
Back view of the girl in front of the giant chalkboard, winding up with chalk in her raised hand, ready to draw. A vortex of chalk dust and pink and cyan glitch sparks spiraling around her. Tension before an explosion.
```

### 23_final_ontheline
```
Epic wide shot. A gigantic glowing white chalk circle floating in a dark space full of chalk-drawn stars and constellations. The girl stands on top of the circle's line like standing on a ring of light, arms spread, triumphant joyful smile. Chalk dust rising like sparks, brightest image of the video.
```

### 24_final_run
```
The girl running along the glowing circle line in a dark chalk-star space, the circle curving around like a ring of light, her hand reaching forward, hair and skirt in motion, pure happiness. Light trails in pink and white.
```

### 25_outro_morning
```
Morning, soft white sunlight in the lecture hall. The girl sleeps with her head on a desk, peaceful smile, chalk in her hand. On the chalkboard behind her, the chalk circle glows softly. Calm, warm, gentle.
```

---

## サムネ・ショート

### thumb_main（サムネ）
```
The girl hugging a giant glowing white chalk circle on a chalkboard with her whole body, cheek pressed to the line, eyes closed, deep blush and happy smile. Strong pink and cyan glitch on the edges. Leave empty space on the right side for a big title. 16:9.
```
- 文字案: 「円周ラブ」＋小さく「数式に恋しました。」

### short_01（9:16・サビ）
```
Vertical 9:16. Low angle, the girl jumping with a fist raised in front of a giant glowing chalk circle, chalk dust explosion in white, pink and cyan. Space at the top for lyrics.
```

### short_02（9:16・ブレイクダウン）
```
Vertical 9:16. Dark red and cyan lecture hall with a cracked chalkboard, the girl chanting with both fists up, heavy glitch distortion. Space at the bottom for lyrics.
```

---

## 歌詞の見せ方（案）
- 日本語はチョーク風の手書きフォント、英語のFeel my love!は特大でグリッチ
- サビの数式は1行「(x − a)² + (y − b)² = r²」を、歌に合わせて項ごとに書き足す。「= r²」で円がピカッと光る
- Breakdownの (glitch stop) は、画面も歌詞も完全に止める
- ラストの「イコールで結ばれた」のあと、「＝」だけ残してフェードアウト
