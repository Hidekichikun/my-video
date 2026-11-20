# ピラミッド動画：アニメ解説ガイド

2026-10-01更新：内容・ナレーション・音楽・尺は既存のまま。字幕は00-06のタイトル画面だけ非表示。成人の探検ガイド風キャラクターを、章タイトル・無音区間・クレジットを含め全編に登場させる。茶色のボブ、青緑のリボンとベスト、生成りブラウス、砂色スカートで背景と統一。

## 動き

- 音声の30 fps RMSに合わせて口を開閉。無音と文の間は口を閉じる。音素ごとのリップシンクではなく音量に同期した簡易アニメーション。
- 約3～5秒間隔でまばたき。自然な小さな揺れ。場面の切り替えで消えるフェードは廃止。
- 説明に合わせて通常、指さし、発見の3ポーズ。
- 一部背景に水面のきらめき、朝の光、内部の小さな浮遊粒子。

## 再生成・書き出し

`python scripts/pyramid_guide_envelopes.py`

`node scripts/render_pyramid_fulltime.cjs --qa-only`

`node scripts/render_pyramid_fulltime.cjs --render-only`

出力：`out/pyramid-guide-fulltime.mp4`。以前の動画は保持。イムホテプ像のカードも本編に含む。

86の連続区間で全21103フレームをカバー。幅180〜440pxで調整し、文字や図が多い場面は小さく、余白の広いモデル・タイトル・年表では大きくする。04-02は寸法図から比較図への切り替えに合わせてサイズ変更。口の開閉・まばたきは維持。

## 生成素材とプロンプト

画像生成ツールで透明背景1024×1536のPNGを生成し、`public/photo/pyramid-guide/`に保存。

### neutral.png

生成元：C:\Users\hiden\.codex\generated_images\01a0efd4-ffe3-7623-8d6d-63461936e5f5\exec-d3f8a79c-e78e-4122-8fbf-abbc631c0a1c.png

Use case: illustration-story. Create a production-ready transparent cutout of a cute young adult female educational presenter for a Japanese illustrated video about ancient Egypt. Original character, warm friendly anime face, large amber eyes, softly rounded chestnut brown bob hair, small turquoise hair ribbon, blush cheeks. Modest practical explorer outfit: ivory long-sleeve blouse, teal waistcoat, tan skirt, small brown crossbody satchel, tiny lapis-blue pendant. Charming 2D hand-drawn anime storybook art, warm brown clean ink outlines, soft cel shading, very light gouache texture; matching pastel apricot desert illustrations. Show from top of head to upper thighs, head generously large and clearly readable at small size. Front facing with slight attention toward viewer's left. Neutral relaxed arms, friendly CLOSED mouth smile, BOTH EYES OPEN. Clear uncluttered silhouette. Single character centered, all hair and hands fully inside canvas with generous margins, portrait canvas. No scenery, no text, no letters, no logo, no watermark, no shadows outside character. Actual transparent background, not white or checkerboard. Flat even soft light. This will be animated later.

### talk.png

生成元：C:\Users\hiden\.codex\generated_images\01a0efd4-ffe3-7623-8d6d-63461936e5f5\exec-879d31cf-084b-4cb7-a7fd-11f3f6680a60.png

Use case: precise-object-edit. Edit target: the transparent anime educational presenter. Change ONLY the mouth: she is speaking with a small cheerful open mouth, visible tongue and tiny upper teeth. Preserve exact head tilt and facial landmark positions, eyes, nose, skin colors, hair, pose, outfit and image framing. Everything outside the mouth is invariant. This is an animation sprite of the SAME character, same hand-drawn ink and cel shading, not a redesign. Keep original 1024x1536 canvas and transparent background. No background, no external glow or shadow, no text, logo or watermark.

### blink.png

生成元：C:\Users\hiden\.codex\generated_images\01a0efd4-ffe3-7623-8d6d-63461936e5f5\exec-68570ecf-fd5b-477a-9214-cb32a9ff90b1.png

Use case: precise-object-edit. Edit target: the transparent anime educational presenter. Change ONLY the eyelids: close BOTH eyes for a relaxed blink, curved eyelash lines. Keep CLOSED mouth smile exactly unchanged. Preserve head tilt, every facial landmark position, hair, skin, pose, outfit, exact framing. This is an animation sprite of the SAME character, same hand-drawn ink and cel shading, not a redesign. Keep original 1024x1536 canvas and transparent background. No background, no external glow or shadow, no text, logo or watermark.

### point.png

生成元：C:\Users\hiden\.codex\generated_images\01a0efd4-ffe3-7623-8d6d-63461936e5f5\exec-094182a1-002d-4846-950a-f22f5216b160.png

Use case: precise-object-edit. Edit target: the transparent anime educational presenter. Change ONLY the arms: her right arm (on viewer's left) raises gently toward viewer's left with the index finger pointing slightly upward to explain something. Other hand relaxed near waist. CRITICAL head, face, hair and entire upper torso stay in EXACT same pixel position and scale as input; keep closed mouth smile and open eyes identical. Keep clothes and canvas dimensions unchanged. Keep pointing hand inside canvas. This is an animation sprite of the SAME character, same hand-drawn ink and cel shading, not a redesign. Keep original 1024x1536 canvas and transparent background. No background, no external glow or shadow, no text, logo or watermark.

### wonder.png

生成元：C:\Users\hiden\.codex\generated_images\01a0efd4-ffe3-7623-8d6d-63461936e5f5\exec-2c65c44b-b647-4e43-98b6-6df7b90961fe.png

Use case: precise-object-edit. Edit target: the transparent anime educational presenter. Change ONLY the arms and facial expression: one hand softly near her chest and the other open palm as she looks pleasantly surprised at a fascinating discovery. Cute gentle wonder, not frightened. CRITICAL keep head placement, tilt, mouth center, eye positions and scale identical, keep outfit and hair design unchanged. Both eyes open, closed-mouth delighted smile. Hands inside canvas. This is an animation sprite of the SAME character, same hand-drawn ink and cel shading, not a redesign. Keep original 1024x1536 canvas and transparent background. No background, no external glow or shadow, no text, logo or watermark.


## 以前の版の確認結果

- 19登場場面とまばたき1場面のPNGを確認。字幕領域への重なりなし。
- 冒頭40秒のプレビューを生成し、口の開閉・まばたきのフレームを確認。
- 本編1920×1080、30 fps、21103フレーム（映像703.433333秒、音声703.488000秒）。元の動画と一致。
- 最終MP4から中盤・終盤の3フレームを抽出し確認。
- 編集対象のESLintエラーなし。tscには別動画の既存未使用変数3件（HarakataNabe、NichijoTakagi、Seasons）が残る。
- 映像・音声を全編デコードし、エラーなし。

## 2026-10-01 全編登場版の確認結果

- 86区間がフレーム0〜21102を隙間・重複なくカバーし、位置・大きさの85場面と途中切り替え1場面を確認。
- 年表、寸法図から比較図への切り替え、職業の班分け、内部構造のラベルなど、追加の7場面もPNGで確認。
- 完成MP4からタイトル、イムホテプ、比較図、ツタンカーメンの年表の4場面を抽出し確認。
- タイトル画面00-06だけ下部のナレーション字幕を削除。中央タイトルと音声は保持。
- 1920×1080、30fps、21103フレーム。映像703.433333秒・音声703.488000秒で前版と一致。
- 音声パケット内容・タイムスタンプ・長さのSHA-256が前版と完全一致。
- 映像と音声を全編デコードしエラーなし。編集対象のTypeScriptエラーなし（他動画の既存未使用変数3件は残る）。
- 本編：out/pyramid-guide-fulltime.mp4。45秒のプレビュー：out/pyramid-guide-fulltime-preview.mp4。
- 確認画像と検証データ：out/pyramid-guide-fulltime-check/。
