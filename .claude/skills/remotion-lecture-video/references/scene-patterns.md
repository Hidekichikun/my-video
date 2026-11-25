# 画面づくりのパターン

実物は `src/MathGachaFull/`。使いたいものはそこからコピーして直す（テンプレートには入れていない）。
章の画面は、行IDの開始フレームで置く：`startOf(chapter, "03-10")`、`endOf`、`lenOf`（lib.tsx）。

## 札と文字（parts.tsx）

| 部品 | 使いどころ |
|---|---|
| `PopBadge`（tone: term=cyan 用語／meaning=yellow 意味／note=pink 注意／miss=灰／card=cream） | 札。0.6→1.08→1 のバネで出る。`still` で出しっぱなし |
| `PopArrow` | 「A → B」の pink の矢印。A=cyan、B=yellow |
| `PopTitle` / `popOutline` | 中央の大きな題・答え（白文字＋ink縁＋pinkの影） |
| `IconCircle` | 丸い枠のアイコン＋下に札。ラベルなしも可 |
| `CapsuleArt` `GemArt` `GridArt` `ResetArt` `FlipArt` `LadderArt` | キーワードのアイコン（SVG） |
| `NowBadge` | 左上の「いまどこ？」（章番号と短い名前）。章タイトルのカードは作らない |

ルビは `<ruby style={{rubyAlign:"center", rubyPosition:"over"}}>` と `<rt style={{rubyAlign:"center"}}>`（これを付けないと文字ごとに散る）。

## 図・演出（MathGachaFull/chapters/）

- **ベン図（面積が割合どおり）** `Venn.tsx`：長方形＝全体100%、円＝全部ハズレ36.6%（円の面積＝割合×長方形）。円を引き抜く→穴＋残りが光る→もどす、で余事象を見せる。`FlipBoard` はくるっと裏返る。
- **公式の札** `Ch03.tsx` の `FormulaCard` / `CalcCard`：式は白いカード＋ラベルの札。左上のスペースに収める。
- **枝分かれの図が増えてパンク** `Ch03.tsx`（`BranchTree` ＋ `Boom`）。
- **カウントダウン（3・2・1）** `Ch06.tsx` の `Countdown`：間の長さを3等分して数字をポンと出す。
- **×のハンコ** `Ch01.tsx` の `RedStamp`（円＋×、ポンと押される）。放射状の効果線は `Ch00.tsx` の `SpeedLines`。
- **石の山（16・15・…・9個の8段＝100個）**：2Dは `Ch00.tsx`、3Dの積み上がりは `three/StackScene.tsx`。数字のカウンターとは「出現フレームの配列」を共有して同期させる（`k = 出現済みの数`）。

## 3D（MathGachaFull/three/）

| ファイル | 内容 |
|---|---|
| `toon.tsx` | トゥーン材質・輪郭線・カプセル・星の光・テクスチャ読み込み・乱数 |
| `Stage3D.tsx` | カメラ設定と `project()` |
| `GachaMachine.tsx` | 架空のガチャマシン（背景用に薄く） |
| `HundredScene.tsx` + `hundred.ts` | 100人（当たり63・ハズレ37固定、seed固定）。カプセルが開く／ジャンプ／体育座り／ハズレに寄る |
| `WallScene.tsx` | カプセル10×10の壁、1個だけ金、シャッフル |
| `StackScene.tsx` | 灰色カプセルが1個ずつ積み上がる |
| `PullsScene.tsx` | 10連×5、コイン（表／裏の文字テクスチャ） |
| `BarScene.tsx` | 棒グラフ（上端の札は `barTop()` で位置を出す） |
| `FinaleScene.tsx` | 100連の高速演出（最後だけ金→灰）、ちび先生37人の「おかえり」 |

## 配置の目安（1920×1080）

- 左の列（x 40〜540）：カウンター・公式の札。先生（SMALL）は左下。
- 右〜中央（x 700〜1850、y 100〜850）：札・3D・図。
- 字幕は y 870 以降。札と図は 860 までに収める。
- 3Dは `shiftX` で右に寄せ、左の列を空ける。
