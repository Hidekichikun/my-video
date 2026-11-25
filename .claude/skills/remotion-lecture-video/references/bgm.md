# BGM

## 方針

- BGM は**歌なし版だけ**を使う。歌入りへの切り替えは過去に却下された。
- **動画のテーマに合う曲を新しく用意する**。前作の曲の流用は避ける（ピラミッドの曲を数学講義に使ったら「まるでエジプト」でNGだった）。
- 曲づくりは私にはできない。Suno 用のプロンプトを書いて、ヒデキさんが作って `music/<テーマ>用/` に入れる。入れてもらったら `public/music/<slug>/` にコピーして組み込む。

## Suno プロンプトの型（数学講義の例）

本編（約4分・歌なし）：
```
Style: playful quirky pop instrumental, light and curious "thinking" mood, marimba and pizzicato strings, glockenspiel, soft plucked bass, finger snaps, light brushed drums, bright major key, 108 BPM, minimal and clean arrangement, gentle repeating motif, no vocals, background music for a friendly math lecture video, steady and non-intrusive, smooth loop
Exclude: vocals, choir, lyrics, middle eastern scale, ethnic instruments, EDM drop, heavy bass, distorted guitar, epic orchestral, big climax
```
派手すぎたら先頭に `very subtle, low energy,`。オチ用の短い曲（約8秒）は「緊張が高まる上昇フレーズ→一瞬の間→ズコーと落ちる」を指定する。実際にはヒデキさんが数曲（Loop×2、素朴な通常、オチ）を作ってくれた。テーマが変わるときは音色と雰囲気の部分だけ差し替える。

## 組み込み（Bgm.tsx）

1. `python scripts/measure_bgm.py --ref public/music/pyramid/find-you-again-inst.mp3 <新しい曲>...` で長さと gain を出す。
2. `PLAYLIST` に `{file, sec, gain}` を並べる。曲は順に回り、3秒のクロスフェードでつなぐ。
3. 音量は ナレ中 0.15／行の間 0.27（前作で調整済み）に曲ごとの gain をかける。新しい曲は前作の約2.7倍の大きさだったので gain が約 0.35〜0.48 になり、ナレ中が約 6%（-24dB 前後）に収まった。
4. オチ曲など特別な曲を鳴らす間は `QUIET_RANGES` に範囲を入れて本編BGMを止め、`<Audio>` を別に置く（MathGacha の `Bgm.tsx` の `OCHI` が実例）。曲の「間」の位置は音量の谷から推定した仮の値なので、ヒデキさんの耳で `dipSec` を直す。

## 確認

- `render_check.cjs audio …` で声＋BGM の mp3 を書き出して `SendUserFile` で渡す。私には聴けないので、「音量とタイミングはヒデキさんの耳で確認」と伝える。
