# Codex に貼る依頼文

以下をそのまま Codex に渡す。

---

`mv/部長ここは地上です/制作メモ.md` を読んで、MV用の画像素材を作ってください。

- 各フォルダ（characters / sprites / backgrounds / thumbnail）にある `〇〇-prompt.txt` の内容をそのままプロンプトにして、内蔵の画像生成で1枚ずつ作る
- 保存名はプロンプトファイル名から `-prompt.txt` を取って `.png` にしたもの（例: `sprites/D01_idle-prompt.txt` → `sprites/D01_idle.png`）
- 作る順番:
  1. `characters/bucho.png`（部長の立ち絵。参照: `../社長ここは地球です/characters/hero.png` は大きさとドットの細かさの参考だけ）
  2. `characters/somu.png`（総務部。参照は同上）、`characters/trouble_icons.png`
  3. `sprites/` 全部。プロンプトに「Reference image role」と書いてある画像を、必ず参照画像として一緒に渡す
     - D〜 は `characters/bucho.png`
     - H〜 は `../社長ここは地球です/characters/hero.png`
     - G〜 は `characters/somu.png`
     - S〜 は `../ウェルカムトゥザ社畜/characters/shinjin.png`
  4. `backgrounds/` 全部（参照: `../課長ここは会社ですよ/backgrounds/B2_kacho_desk.png` はドットの粗さの参考だけ）
  5. `thumbnail/` 全部（**ここだけドット絵じゃなくイラスト**。参照: `../課長ここは会社ですよ/サムネ_課長ここは会社です_イラスト版.png` と `../社長ここは地球です/サムネ案_イラスト×ゲームUI.png` を、主人公の見た目と画風の参考として渡す。UIの枠や文字はマネしない。部長は `characters/bucho.png` の見た目に寄せる）
- 部長は**ヘルメットを右手に持っていて、絶対にかぶらない**（頭には何も乗せない）。ここが一番大事
- 背景とサムネ以外は緑のクロマキー背景のまま。切り抜き・加工はしなくてOK
- 文字・数字・ロゴは絵に入れない
- 終わったら、前作と同じ形式で `assets-manifest.json` と `素材一覧.html` を作って、制作メモの「10. 決まったこと」に生成日と内容を1行追記
