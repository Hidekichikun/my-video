# ピラミッド動画・アニメ調イラスト差し替え

内蔵 image_gen ツールで既存CG素材を編集。元素材は `public/photo/pyramid/`、差し替え素材は `public/photo/pyramid-anime/` に保存。

内容・ナレーション・字幕・BGM・タイムライン・説明図は変更していない。Illustration の参照先を切り替えたので本編とプリビズ双方に反映される。

画風：茶色の輪郭線、セル塗り、薄いガッシュの紙質、暖かい杏色の光、青緑とラベンダーの色。人物はアニメ調。元の構図と建築・道具の特徴を維持。

現在／完成当時と台座／像のペアは、新しい絵から片方だけ編集して連続性を保った。

## 使用プロンプト

### 00-dawn-giza.png

Use case: style-transfer. Edit target: the provided image, a background in a Japanese educational video about pyramids. Redraw the whole image as a charming hand-drawn 2D anime storybook illustration. Clear warm brown ink contours, simple cel-shaded shapes, subtle gouache paper texture, soft apricot sunlight, pastel turquoise and lavender sky, inviting sense of discovery. Clearly illustrated, no realistic CG textures, no 3D rendering, no photographic lighting. Preserve the exact subject placements, pyramid silhouette, relative sizes, horizon and camera framing so existing educational overlays still align. Preserve current rough stepped pyramid surfaces and missing apex; Khafre has white casing near its peak only. Keep no people. No text, logo, watermark. Output a wide 16:9 background.

### 00-empty-pedestal.png

Use case: precise-object-edit. Edit the provided hand-drawn anime illustration. Remove ONLY the tiny seated ivory figurine from the pedestal. Preserve every other pixel's composition, the pedestal and surrounding room. Fill the removed area with the same illustrated wall. No object on pedestal. Keep hand-drawn brown outlines, gouache texture and all colors unchanged. No text or watermark.

### 00-khufu-statue.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep the tiny ivory seated figurine and pedestal centered. The figurine must read as ivory, not gold.

### 01-nile-fields.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Farmers working with wooden hoes and reed baskets, white linen clothing, fertile dark soil. No wheels, horses or camels.

### 01-king-gods.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep the king mediating between translucent gods above and people below, but give faces appealing hand-drawn anime expressions.

### 04-giza-now.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep the present-day rough stepped brown pyramid, apex missing, no white casing, no gold. Preserve camera for the comparison pair.

### 04-giza-then.png

Use case: precise-object-edit. Edit the provided hand-drawn anime illustration. Change ONLY the pyramid surface from brown rough stepped core stones to smooth ivory-white limestone casing, restore a sharp apex. Keep camera, sky, desert, foreground rocks, bottom corners and base location identical. No gold capstone. Keep hand-drawn brown outlines, gouache texture and all colors unchanged. No text or watermark.

### 04-horizon-sunrise.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep smooth white pyramids, no gold capstone.

### 05-workers-town.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep mud-brick worker settlement, bakeries, granaries and people; no wheels, whips, chained slaves or camels. Simplify dense detail into inviting illustrated shapes.

### 05-merer-papyrus.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep papyrus with black and red ancient cursive-like decorative marks, no Latin or Japanese letters.

### 05-boat-stone.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep wooden limestone cargo boat, rectangular square sail, oars, white limestone blocks. No triangular sail, metal ship or wheels.

### 05-sledge-sand.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Workers pulling stone on wooden sledge and pouring water in the path ahead of the sledge. Friendly expressive anime faces with sense of teamwork. No wheels, rollers, whips or chains.

### 06-grand-gallery.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Preserve tall narrow ascending corbelled gallery, plain undecorated walls, inward stepping ceiling and tiny person for scale; no hieroglyphs, arch, treasure or mummy.

### 06-kings-chamber.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Preserve plain red granite rectangular chamber with flat ceiling beams and empty lidless stone sarcophagus. No wall decoration, treasure, mummy or lid.

### 06-crew-graffiti.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Preserve rough limestone with red ochre painted builders' marks and oval cartouche, not carved inscriptions. Ancient-like decorative symbols only.

### 07-sphinx.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Preserve Sphinx with missing nose, lion body and human royal head, Khafre pyramid behind with white casing only near top.

### 08-pyramid-texts.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep blue-green hieroglyph-like decorative symbol columns on walls and yellow starry dark blue gabled ceiling, sarcophagus. No modern letters.

### 08-valley-kings.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep natural rocky valley, mountain peak shaped like pyramid and rock-cut tomb entrances. No man-made pyramid.

### 08-tomb-light.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep descending stone steps and sealed tomb door with light entering from upper left; no treasure or gold masks.

### 09-solar-boat.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep long slender cedar royal boat, curved high prow and stern, cabin, oars, NO sail.

### 09-funeral.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep solemn royal funeral procession toward pyramid with shrine on wooden sledge, no wheels. Simplified silhouettes in warm dusk colors.

### 10-horizon.png

Use case: style-transfer. Image 1 is the edit target, Image 2 is the style reference only. Redraw image 1 entirely in the hand-drawn 2D anime storybook style of image 2: warm brown ink contours, simplified cel-shaded forms, delicate gouache paper texture, friendly expressive anime faces where people exist, apricot gold light and pastel turquoise/lavender accents. Clearly a drawing, not 3D CG or photorealistic. Keep the original subject, historical features, exact camera composition, proportions and locations. Do not add characters or objects. Preserve space for video subtitles. No text, numbers, logos, watermark. Wide landscape output. Keep three smooth white pyramids: two large, one small; green Nile valley in distance. No gold tips.

## 検証・書き出し

`node scripts/render_pyramid_anime.cjs --qa-only` で22場面の確認画像、`node scripts/render_pyramid_anime.cjs` で確認画像と本編を生成。出力先 `out/pyramid-anime.mp4`。元の `out/pyramid-full.mp4` は保持。

確認画像は `out/pyramid-anime-check/`。実際に絵が表示される時点で22枚を目視確認した。元のフォント取得のため通信できる環境でレンダラーを実行する。`--render-only` は確認画像の再生成を省略する。タイムラインは元の21103フレーム・30fpsを維持。

変更したTypeScriptファイルのESLintは成功。全体の `tsc --noEmit` は既存の未使用変数3件（HarakataNabe、NichijoTakagi、Seasons）で失敗し、ピラミッド関連の型エラーは報告されなかった。

本編書き出し完了。ffprobeで元動画と同じ21103映像フレーム、映像703.433333秒・音声703.488000秒を確認。全映像・音声のデコード検査はエラーなし。完成MP4から冒頭の像・建設作業・終盤の3場面を抽出して目視確認した。
