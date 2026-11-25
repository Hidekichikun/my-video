# MathGacha BGM 用 Suno プロンプト

前作ピラミッドの曲（find-you-again-inst）はエジプト調で数学に合わないため、新しく作る。
できた曲は `music/MathGacha/` に入れ、`src/MathGachaFull/Bgm.tsx` の `BGM_SOURCE` を差し替える。
音量はナレ中15%／間27%から調整する。

## ① 本編BGM（約4分・歌なし）

```
Style: playful quirky pop instrumental, light and curious "thinking" mood, marimba and pizzicato strings, glockenspiel, soft plucked bass, finger snaps, light brushed drums, bright major key, 108 BPM, minimal and clean arrangement, gentle repeating motif, no vocals, background music for a friendly math lecture video, steady and non-intrusive, smooth loop
Exclude: vocals, choir, lyrics, middle eastern scale, ethnic instruments, EDM drop, heavy bass, distorted guitar, epic orchestral, big climax
```

派手すぎたら先頭に `very subtle, low energy,` を足す。

## ② 07章の100連用（約8秒・歌なし）

```
Style: short suspense-to-fail sting instrumental, fast ascending marimba and pizzicato run building tension, tiny pause, then a comical deflating "wah-wah" trombone slide down, playful, no vocals
Exclude: vocals, epic, horror, loud explosion
```
