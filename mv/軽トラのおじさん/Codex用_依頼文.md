# Codex に貼る依頼文

以下をそのまま Codex に渡す。

---

`mv/軽トラのおじさん/制作メモ.md` を読んで、MV用の画像素材を作ってください。

- 各フォルダ（characters / sprites / backgrounds / thumbnail）にある `〇〇-prompt.txt` の内容をそのままプロンプトにして、内蔵の画像生成で1枚ずつ作る（全部で42枚。まとめて見るなら `プロンプト集.md`）
- 保存名はプロンプトファイル名から `-prompt.txt` を取って `.png` にしたもの（例: `sprites/O01_idle_armcross-prompt.txt` → `sprites/O01_idle_armcross.png`）
- 作る順番:
  1. `characters/ojisan.png`（おじさんの立ち絵。参照: `../社長ここは地球です/characters/hero.png` は大きさとドットの細かさの参考だけ）
  2. `characters/keitora.png`（軽トラ・横と後ろ）、`characters/race_icons.png`
  3. `sprites/` 全部。プロンプトに「Reference image role」と書いてある画像を、必ず参照画像として一緒に渡す
     - O〜 は `characters/ojisan.png`
     - V〜 は `characters/keitora.png` と `characters/ojisan.png`
     - H〜 は `../社長ここは地球です/characters/hero.png`
     - M〜 は `../ウェルカムトゥザ社畜/characters/coworkers.png`
     - K〜 は `../課長ここは会社ですよ/characters/kacho.png`
  4. `backgrounds/` 全部（参照: `../部長ここは地上です/backgrounds/B2_factory_floor.png` はドットの粗さの参考だけ）
     - B2 と B10 は**後ろから見た疑似3D（スーファミのモード7のレースゲーム）**の道。道のまん中の下半分は空けておく
  5. `thumbnail/` 全部（**ここだけドット絵じゃなくイラスト**。参照: `../課長ここは会社ですよ/サムネ_課長ここは会社です_イラスト版.png` と `../社長ここは地球です/サムネ案_イラスト×ゲームUI.png` を、主人公の見た目と画風の参考として渡す。UIの枠や文字はマネしない。おじさんと軽トラは `characters/ojisan.png` `characters/keitora.png` の見た目に寄せる）
- おじさんは**白いヘルメットの前に小さい丸いライト**がついている。うれしいとき（O05・O10・V04・V05 の指定コマ）だけそのライトがピカーッと光る。ここが一番大事
- おじさんは**細身の短髪でサル顔**。部長（背が高くて肩幅広い・オールバック）や社長（スーツ）と見分けがつくように
- 背景とサムネ以外は緑のクロマキー背景のまま。切り抜き・加工はしなくてOK
- 文字・数字・ロゴは絵に入れない（ホワイトボードも落書きの線だけ。ナンバープレートも文字なし）
- 終わったら、前作と同じ形式で `assets-manifest.json` と `素材一覧.html` を作って、制作メモの「10. 決まったこと」に生成日と内容を1行追記
