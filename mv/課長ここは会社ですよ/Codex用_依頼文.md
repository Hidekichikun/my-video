# Codex に貼る依頼文

以下をそのまま Codex に渡す。

---

`mv/課長ここは会社ですよ/制作メモ.md` を読んで、MV用の画像素材を作ってください。

- 各フォルダ（characters / sprites / backgrounds）にある `〇〇-prompt.txt` の内容をそのままプロンプトにして、内蔵の画像生成で1枚ずつ作る
- 保存名はプロンプトファイル名から `-prompt.txt` を取って `.png` にしたもの（例: `sprites/K01_idle-prompt.txt` → `sprites/K01_idle.png`）
- 作る順番:
  1. `characters/kacho.png`（課長の立ち絵。参照: `../社長ここは地球です/characters/hero.png` は大きさとドットの細かさの参考だけ）
  2. `characters/okaachan.png` `characters/excel_monster.png` `characters/items.png`
  3. `sprites/` 全部。プロンプトに「Reference image role」と書いてある画像を、必ず参照画像として一緒に渡す（K〜 は kacho.png、H〜 は前作の hero.png、O01 は okaachan.png、E01 は excel_monster.png）
  4. `backgrounds/` 全部（参照: `../社長ここは地球です/backgrounds/B2_floor.png` はドットの粗さの参考だけ）
- 背景以外は緑のクロマキー背景のまま。切り抜き・加工はしなくてOK
- 文字・数字・ロゴは絵に入れない
- 終わったら、前作と同じ形式で `assets-manifest.json` と `素材一覧.html` を作って、制作メモの「9. 決まったこと」に生成日と内容を1行追記

---

## 追加分（2026-10-07）: 課長の車通勤

`sprites/K15_car_drive-prompt.txt` の内容で1枚作って、`sprites/K15_car_drive.png` で保存してください。

- 参照画像: `characters/kacho.png`（課長の見た目をそろえる）
- 3コマ横並び（運転中／車がポンと跳ねて排気ガス／止まって前をのぞき込む）
- 緑のクロマキー背景のまま。文字・ロゴ・ナンバーは入れない
- 終わったら `assets-manifest.json` と `素材一覧.html` に追加して、制作メモ「9. 決まったこと」に1行追記
