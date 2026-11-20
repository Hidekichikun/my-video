# イムホテプ像の追加

2026-09-30に美術館の公開資料を確認。解説役入りの既存動画に、02-05（フレーム3435〜3659、114.5〜122秒）の資料カードを追加。原稿・音声・字幕・全体の尺は維持。

## 採用した資料

- The Metropolitan Museum of Art, *Statue of Seated Imhotep*
- 所蔵番号：26.7.852a, b
- プトレマイオス朝時代、紀元前332〜30年
- 銅系金属、貴金属の象嵌。高さ14cm。
- 作品ページ：https://www.metmuseum.org/art/collection/search/548300
- 画像：https://collectionapi.metmuseum.org/api/collection/v1/iiif/548300/1213745/main-image
- 画像利用条件：作品ページにPublic Domainと明記。Open Access画像は商用・非商用の使用を許可。
- 保存先：public/photo/pyramid-imhotep/met-26.7.852.jpg

美術館は、イムホテプが第3王朝初め（紀元前2650〜2600年ごろ）の石造ピラミッド建設を監督した高官で、この像の制作時には神格化されていたと説明している。後世の像を本人の生前の容貌を確定する証拠として扱わない。動画には「後世に作られた像」「生前の肖像ではなく、神格化された姿です」と明記。想像による顔の復元は行わない。

## 実装と出力

`ImhotepCard.tsx`を`chapters/Ch02Djoser.tsx`の02-05に追加。写真を枠内で拡大表示し、制作年代・所蔵館・Public Domainのクレジットを併記。字幕を避けた右側に配置。

`node scripts/render_pyramid_imhotep.cjs`でRemotionの実際の場面と透明な資料カードをPNG出力。

`python scripts/export_pyramid_imhotep.py`で既存の`out/pyramid-guide.mp4`に同じカードを同じフレーム範囲・12フレームのフェードで合成し、`out/pyramid-guide-imhotep.mp4`を出力。映像はH.264 CRF17で再エンコード、音声はコピー。通常のRemotion本編レンダーでも同じカードが表示される。

合成用FFmpegは、`python -m pip install --no-cache-dir --target tmp/imhotep-tools imageio-ffmpeg==0.6.0`で作業フォルダ内に取得。Remotion同梱のFFmpegにはoverlay・fadeフィルタが含まれないため、合成用のみこのバイナリを使用。

以前の動画は保持。新しい本編と、追加場面だけの短いプレビューを提供。

## 検証

- 本編：1920×1080、30fps、21103フレーム。映像703.433333秒・音声703.488000秒で元動画と一致。
- 音声パケットの内容・タイムスタンプ・長さをSHA-256で比較し、元動画と完全一致。
- 映像・音声を全編デコードしエラーなし。フレームの重複・欠落なし。
- 完成MP4から116.5秒と122.5秒の画面を抽出し、追加カードの表示・終了・字幕を確認。
- 追加場面のプレビュー：9.5秒。検証結果はout/pyramid-imhotep-check/verification.json。
- 編集対象のESLintエラーなし。tscは別動画の既存未使用変数3件のみ。
