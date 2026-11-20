# Sine 〜僕×君＝好きの面積!?〜 MV用イラスト 生成依頼（Codex）

ただいま正気を失い中のMV「Sine」（恋する数学講義 第3講）で使うイラストを作ってください。
前作「Cosine」で主人公の女の子とは気持ちが直交していた「文系の王子様」が主人公です。モテモテなのに心が空っぽの王子が、性格も好みも真逆のクールな理系女子にひかれていく、ギャグ×ちょっと胸キュンのMVです。

## 共通ルール
- サイズ：**横 16:9（1920×1080）**（設定画も16:9）
- 保存先：`public/sine/`（ファイル名は各カットに書いてあるとおり）
- キャラは参考画像に顔・髪型・服をそろえる
  - 王子：`public/cosine/ref-prince.png`（背が高い、さらさらの明るい茶髪、紺のブレザー、詩集）
  - 理系女子：01 で作る `public/sine/ref-rikei-girl.png`
  - 01〜03 ができたら、04 以降は `ref-prince-faces.png`・`ref-rikei-faces.png` も一緒に参考に渡す
  - シーン07・21 だけ前作の2人も出る：私 `public/squared/ref-girl.png`（栗色のゆるふわ髪、紺のブレザー、ベージュのベスト、紺のスカート）、オタクくん `public/squared/ref-boy.png`（黒髪ぼさぼさ、丸メガネ、半袖の白シャツ）
  - ファンの女子などの脇役は、理系女子とかぶらない髪色（茶髪・金髪など）でメガネなし
- 絵柄：前作 Cosine（`public/cosine/` の絵）と同じギャグ寄りアニメ絵。太めの線、はっきりした色
- 色：王子＝ラベンダー、理系女子＝ミント／ティール。背景は夜明け前の濃い紺の方眼の床や、夕方の図書室のオレンジ
- 理系女子は基本メガネ。**18でメガネが吹っ飛んで、19・20はメガネなし**、21でかけ直す。メガネなしのシーンは共通文の「thin rectangular glasses」を「(not wearing her glasses in this scene)」に置きかえる
- 画面の**下から4分の1はごちゃごちゃさせない**（歌詞をのせるので）
- 文字・数字・数式・ロゴ・透かしは入れない（数式と矢印はあとで動画側でのせる）

### 毎回プロンプトの最後に付ける共通文
```
Keep the characters exactly the same as the reference images (prince: tall and slim, silky light-brown hair, gentle princely face, neat navy blazer school uniform; science girl: long straight black hair, thin rectangular glasses, cool calm eyes, white shirt with a navy ribbon, loose light-gray cardigan instead of a blazer, navy blue pleated skirt, always holding a notebook and a pencil). Gag anime style matching the previous Cosine illustrations, bold clean line art, bright flat vivid colors. Color motif: the prince's color is lavender, the girl's color is mint teal. Horizontal 16:9 composition, keep the bottom quarter uncluttered. No text, no letters, no numbers, no equations, no logo, no watermark.
```

---

## 設定画

### 01. `ref-rikei-girl.png`（新キャラ：理系女子）
```
Anime character sheet of a new character, a Japanese high school girl who loves math and physics: long straight glossy black hair down to her back, thin rectangular glasses, cool calm expressionless face, sharp but pretty eyes, white school shirt with a navy ribbon, loose light-gray cardigan over it (no blazer), navy blue pleated skirt, black socks, always holding an open notebook and a mechanical pencil, faint mint-teal sparkles around her. Cool, aloof, a little tsundere, clearly the opposite vibe of a sparkly prince. Full body front view, side view, and face close-up, plain white background, gag anime style matching the reference images, bold clean line art.
```

### 02. `ref-prince-faces.png`（王子の表情集）
```
Expression sheet of the prince from the reference image: 6 face close-ups in a grid — perfect sparkly princely smile, hollow empty smile with dull eyes, lovestruck dazed face with sparkles, flustered heavy blush, comically melting wobbly face, serious determined face. Same silky light-brown hair and navy blazer as the reference. Plain white background, gag anime style, bold clean line art.
```

### 03. `ref-rikei-faces.png`（理系女子の表情集）
```
Expression sheet of the science girl from 01: 8 face close-ups in a 4x2 grid. Top row WITH her thin rectangular glasses — cool expressionless face pushing up her glasses, looking away with a slight pout (tsun), faint tiny smile, slightly smug proud face. Bottom row WITHOUT glasses (same face, same eyes, she just took them off) — surprised wide eyes, flustered blush with a small voice, holding her glasses in one hand and looking up softly, big genuine happy smile for the first time. Same long black hair and gray cardigan. Plain white background, gag anime style, bold clean line art.
```

---

## シーン

### 04. `sine-04-lecture.png`（Intro「本日の講義は…」／王子）
```
The same lecture hall as the previous Squared and Cosine MVs: the prince standing at a huge empty green chalkboard like a professor, holding a long pointer, elegant sparkly smile, dramatic spotlight from above, chalk dust and lavender sparkles floating. Wide shot.
```

### 05. `sine-05-fans.png`（Verse1「黄色い声／同じ向き／平行線」／王子）
```
School hallway: the prince walking with a polished smile, surrounded by a crowd of fangirls with hearts in their eyes. Everyone, including the prince, is walking and facing exactly the same direction in neat parallel lines, like a parade. Bright, glamorous, slightly comedic. Lavender sparkles.
```

### 06. `sine-06-empty.png`（Verse1「心は空っぽだった」／王子）
```
The prince alone by a classroom window in pale evening light, his polished smile fading into a hollow empty expression. He looks flat and thin like a paper cutout, a faint see-through hollow where his heart should be. Quiet, lonely, desaturated lavender tones.
```

### 07. `sine-07-flashback.png`（Pre-Chorus1「あの日 内積で知ったんだ」／王子・私・オタクくん）
```
Flashback scene with soft sepia-lavender filter: under a sunset sky, the girl (chestnut wavy hair) and the nerd boy (messy black hair, round glasses) from the reference images walk away side by side facing the same direction, seen from behind. In the foreground the prince watches them leave with a gentle, slightly bitter smile. Nostalgic and calm.
```

### 08. `sine-08-crossroad.png`（Pre-Chorus1「直角に交わる彼女に」／王子・理系女子）
```
Top-down bird's-eye view of a school hallway crossroads where two corridors meet at a perfect right angle. The prince walks along one corridor, the science girl walks along the other corridor while reading her notebook, not looking up. They are just about to cross at the intersection. A thin beam of lavender light and a beam of mint light run along each corridor and meet at exactly 90 degrees. Fateful moment.
```

### 09. `sine-09-ignored.png`（Chorus1「僕の笑顔もスルーして」／王子・理系女子）
```
Library: the prince leaning toward the science girl and flashing his brightest sparkly smile with dazzling lavender sparkles, while she completely ignores him, staring at the formulas in her notebook with a cool blank face. The sparkles bounce off her uselessly. Comedic.
```

### 10. `sine-10-sinewave.png`（Chorus1「たまに見せる笑顔に／揺れてサインカーブ」／王子・理系女子）
```
Close-up of the science girl showing a rare, tiny soft smile while looking at her notebook. Behind her, the prince is comically melting and swaying like a smooth wave, his whole body wobbling in a gentle curve, dazed with hearts. Mint and lavender light, cute and funny.
```

### 11. `sine-11-max.png`（Post-Chorus1「直角の君が最大値」／王子・理系女子）
```
Surreal scene on a vast dark navy graph-paper floor with glowing grid lines: the prince and the science girl stand back to back at exactly a right angle to each other, and between them a huge glowing square-like parallelogram of light (lavender to mint gradient) rises dramatically. Epic, high energy, extreme perspective.
```

### 12. `sine-12-library.png`（Verse2「図書室の窓際／言葉と数式」／王子・理系女子）
```
Library window seat after school at sunset, warm orange light through tall windows: the prince reading a small poetry book with a dreamy face, and across from him the science girl writing in her notebook with a focused face. They face each other at the same table but are in completely different worlds. Soft and warm.
```

### 13. `sine-13-mata-ashita.png`（Verse2「…また明日」って それ反則／王子・理系女子）
```
Library doorway at dusk: the science girl half-turned back toward the prince, holding her notebook to her chest, saying something in a tiny voice with a faint blush and averted eyes. The prince behind is frozen in shock, comically struck in the chest by a glowing mint arrow, sparkles bursting. Cute and funny.
```

### 14. `sine-14-shadow-height.png`（Pre-Chorus2「似た者同士じゃ影ばかり／直角だから高く」）
```
Split composition. Left half: the prince and his fangirls all facing the same direction, casting only long flat shadows on the ground, dull and gray. Right half: the prince and the science girl standing at a right angle to each other, and a tall pillar of light rises high above them into the sky, bright lavender and mint. Clear contrast between flat and tall.
```

### 15. `sine-15-matenai.png`（Chorus2「別に待ってないし／ペンを止めてる指先」／理系女子・王子）
```
Classroom after school: the science girl sitting at her desk, looking away with a slight pout and a blush, her mechanical pencil frozen in mid-air above the notebook (the stopped fingertips are clearly visible in the foreground). The prince has just appeared at the doorway in the background, surprised and happy. Tsundere mood, soft light.
```

### 16. `sine-16-qed.png`（Rap「sinの定義〜Q.E.D.」／理系女子・王子）
```
Classroom: the science girl standing at a large empty green chalkboard holding chalk, pushing up her glasses with a slightly smug proud face, faint mint sparkles. The prince sits in the front row with spinning swirly eyes, overwhelmed but smitten. Cool hip-hop mood with mint and lavender light. Leave the chalkboard empty.
```

### 17. `sine-17-right-hand.png`（Bridge「右手を出して 親指 人差し指 中指」／2人）
```
The prince and the science girl standing side by side, both holding out their right hands toward the viewer in the three-finger pose (thumb up, index finger forward, middle finger to the side, all at right angles, like the right-hand rule in physics). Both have very serious faces, which makes it a little funny. Dark navy background with a glowing graph-paper floor.
```

### 18. `sine-18-cancel.png`（Bridge「同時に言ったら足して0!?」／2人・ギャグ）※理系女子のメガネが衝撃で吹っ飛ぶ
```
Gag scene: the prince and the science girl facing each other and shouting at exactly the same time with wide open mouths, and right between them a comical puff of smoke bursts as if two things collided and vanished. The shock sends the girl's glasses flying off her face into the air. Both freeze in shock with blank white eyes. Exaggerated comedic anime style.
```

### 19. `sine-19-let-me-say.png`（Bridge「だから僕から先に言わせて」／王子・理系女子）※メガネなし（手に持ってる）
```
Classroom at sunset: the prince stepping forward with one hand on his chest, a serious sincere face for the first time (no sparkles), golden-orange backlight. The science girl in front of him is NOT wearing her glasses — she holds them in one hand against her notebook, her bare eyes slightly widened, looking up at him. Quiet, emotional moment.
```

### 20. `sine-20-new-dimension.png`（Final「初めて笑った 直角の君」／2人）※メガネなし
```
Climax: the science girl, NOT wearing her glasses (bare eyes, same face), smiling a big genuine happy smile for the first time, the prince smiling back. From between the two of them a brilliant white beam of light shoots straight up, piercing through the ceiling, and the classroom around them dissolves into a vast glowing 3D grid space expanding in every direction. Lavender and mint light swirling, emotional and epic.
```

### 21. `sine-21-outro.png`（Outro「以上で講義を終わります」／王子・理系女子・前作の2人）※メガネはかけ直してる
```
The same lecture hall: the prince at the lectern bowing elegantly, the science girl (wearing her glasses again) in the front row clapping lightly while looking away with a tsundere pout. In the back row, the chestnut-haired girl and the nerd boy from the reference images clap and cheer. Warm, satisfying ending, chalk dust in the light.
```

### thumb. `sine-thumb.png`（サムネ）
```
YouTube thumbnail: the science girl in the foreground turning her face away with a blush and pushing up her glasses, the prince behind her flustered with sparkles and a dazed lovestruck face, a glowing parallelogram of light between them. Strong contrast, eye-catching. Characters on the left two-thirds, keep the right third simple for title text.
```
