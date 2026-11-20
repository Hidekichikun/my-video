# Codex依頼 v3：オフィスで「つゆだくで！！」

参考画像: 01_char_sheet.png（オレ）と 27_outro_wake.png（同じオフィス。ただし電気はついてる）
- 11/12 Hidekiさん: ビクッとするのはメガネの同僚。オフィスは電気がついてる方がいい
保存名: public/gyudon/45_office_shout.png（1672×941、ほかの絵と同じサイズ）

```
Same anime style and same man as the reference images, in a late-night office with the ceiling lights ON (bright fluorescent office lighting, night city visible through the windows). Comedic anime gag face: the man has jumped up from his office chair at his desk and is shouting with fiery determined eyes and a huge open mouth, one fist raised, speed lines behind him. At the next desk, a coworker wearing glasses flinches in big surprise, jumping in his chair with his glasses sliding off and sweat drops, drawn clearly but as a side character. Ordinary realistic office colors, not dreamy. No text, no letters, no logos.
```

できたら: remotion-src/Main.tsx の `const OFFICE_SHOUT = '27';` を `'45'` に変える（今は27の絵で仮に作ってある）

---

## 追加（11/12）電気のついたオフィス2枚
27・27b は暗いオフィス（モニターの光だけ）なので、電気がついた版を作る。45と同じオフィスに見えるように、45ができたら45も参考画像に入れる。
保存名: public/gyudon/27_office_lit.png・27b_office_lit.png

### 27_office_lit（「……そうだ。」ハッと顔を上げる）
```
Same anime style and same man as the reference images, in a late-night office with the ceiling lights ON (bright fluorescent lighting, night city through the windows). The man lifts his head from his desk, just snapping back to reality, stunned blank face, a paper crease mark on his cheek. At the next desk a coworker wearing glasses is still working, not noticing. Ordinary realistic office colors, not dreamy. No text, no letters, no logos.
```

### 27b_office_lit（「牛丼、食べよう。」真顔でつぶやく）
```
Same office with the ceiling lights ON. Close-up of the man at his desk with a dead serious, determined face, eyes shining slightly, muttering to himself. Part of the glasses coworker visible blurred in the background. Ordinary realistic office colors. No text, no letters, no logos.
```

## 声（VOICEVOX）
voice/gyudon/ に okami_01.wav（いらっしゃい！）・okami_02.wav（待ってるよ〜）・okami_03.wav（……つゆだく、ね。）
- VOICEVOXを開いた状態で **voice/gyudon/make_okami.bat をダブルクリック**すると、冥鳴ひまり（ノーマル）で3つまとめて作れる（ログは make_okami_log.txt）
- 自分で作る場合は同じファイル名で保存すればOK

---

## 追加（11/13）現実の女将さん（2:45ごろ）
妄想のしっとりしたお店とちがって、**現実はよくある明るい牛丼チェーンの店内**。そこで女将さんがふつうに笑って手をふってる。
参考画像: 01c_okami_sheet.png（女将さん）、34_okami_wave.png（手のふり方）
保存名: public/gyudon/46_okami_real.png と 46_okami_real_b.png（手の位置だけ反対にした差分）
※ Main.tsx はさわらない（こっちで切り替える）

```
Same anime style and the same okami (diner proprietress) as the reference image: early 30s, black hair in a messy bun, light indigo-blue samue top with a plain cream apron, cheerful smile. She stands behind the counter of an ordinary, brightly lit Japanese fast-food beef bowl chain restaurant: bright white fluorescent ceiling lights, a long clean U-shaped counter with simple round stools, stainless steel kitchen area behind her, napkin holders and small condiment pots on the counter, a ticket vending machine near the entrance, plain menu boards with only blurred food photos. Clean, bright, everyday, slightly plain mood (not dreamy, not warm night lighting). She smiles and waves one hand toward the viewer. Generic original store design: no real restaurant chain's colors, signs, logos or uniforms, no orange signage. No text, no letters, no numbers, no logos.
```

差分（46_okami_real_b）:
```
Keep everything in the reference image exactly the same (character, store, composition, colors, lighting, line art). Only change: her waving hand is moved to the other side, as the next frame of a waving motion.
```
