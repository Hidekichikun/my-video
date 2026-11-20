# I close my mind MV作業方針（写真でたどるあの頃・2本目）

更新日: 2026-11-14
元にしたもの: ChatGPTの方針メモ（i close my mind mv plan）＋ `photo/I close my mind/MVプラン.md`（10/23版）＋ 手元の素材26枚

---

## 0. 前提（ここを先に共有）

- **公開中のMV本編は v3（1枚絵リリック・4:01）**。これはこのまま。今回作るのは「2本目」の写真版
- 写真版は **ゼロから作らない**。v2（写真＋ライブ・Remotionの `ICloseMyMind` / `timeline.ts`）と `MV素材/` の26枚をベースに組み直す
- ChatGPTの案は、手元の素材をほぼ知らないまま書かれている。合ってた点・ずれてた点はこう：
  - 合ってた: 「コンビニまでの道」がいちばん大事な場面／カラオケで笑い声を先に見せる／君は撮影者の目線で描かない → **全部、今のプランと同じ方向**
  - すでにある: コンビニの曲がり角 `N6`（今・誰もいない）と `N6b`（過去・ふり返る）、職質 `B`、夜の公園 `P3`、改札 `P4`、電車 `N7` など
  - ずれてた: 「黒髪のボブ」→ 実際は **グレーがかったボブ＋内側ピンク**。Codexの共通文（`gray hair with pink inner color`）をそのまま使う

## 1. 写真版のコンセプト

- タイトル案: 『I close my mind｜Lyric Video — 写真でたどるあの頃』
- 過去＝隣にいた「君」が使い捨てカメラで撮った写真。君の顔は出さない（袖・手・影だけ）
- 今＝夜の静かな街。**写真版ではライブを使わない**（v3・v2との差を出すため。ライブはショート側で使う）
- 写真をめくる速さ: サビは拍に合わせて速く、Verse 3〜ブリッジ（今）はゆっくり
- 質感: ブレ・傾き・フラッシュあり。うまく撮れすぎてない友だちのアルバムっぽさ

## 2. 決めること（Hidekiさん）

| # | 決めること | おすすめ | 理由 |
|---|---|---|---|
| ① | 放課後の写真のヘッドホン | **今ある絵はそのまま使う。新しく作る絵（カラオケなど）はヘッドホンなし** | P1〜P4・N1・N2・B・C・N6b の9枚が全部ヘッドホン付き。作り直すと約9枚ぶんの手間。P1みたいに首にかけてる絵は不自然じゃない |
| ② | 写真版にライブを入れるか | **入れない** | v2（写真＋ライブ）と区別がつかなくなる |
| ③ | 旅行の写真 | **後回し** | まずカラオケとコンビニがつながるかを確かめる |

※①で「全部ヘッドホンなしにそろえたい」なら、Codexで「headphonesを消して自然な髪と耳を描く」編集を9枚にかける（L1・L2のときと同じ指示文）

## 3. 新しく作る絵（4枚だけ）

保存先: `photo/I close my mind/MV素材/`。サイズ 1456×816。参照画像は顔・髪・絵柄合わせ用。

| ID | 参照画像 | 内容 | 服 |
|---|---|---|---|
| S1 校門 | A 教室・P5 屋上 | 昼、校門の外。少し先を歩く彼女がふり返って「行こ」と手招き。端に撮影者の袖 | ブレザー制服・ヘッドホンなし |
| K1 カラオケ真顔 | P1 寝起き | 狭いカラオケの部屋。マイクを持って真顔で歌い出す。テーブルに飲みかけのメロンソーダ | 放課後の服・ヘッドホンなし |
| K2 カラオケ吹き出し | K1 | 同じ部屋。マイクを持ったまま吹き出して笑う | 同上 |
| K3 カラオケ手ブレ | K2 | 笑いすぎて手ブレした1枚（モーションブラー） | 同上 |
| W1 二人の影 | N6 曲がり角 | **N6と同じ構図・夕方の光**。人は映さず、歩道に並んだ二人の影だけ | — |

Codex用（共通の頭は `MVプラン.md` の「共通」をそのまま）:

- S1: `Daytime, just outside a Japanese school gate. She walks a few steps ahead in her blazer school uniform (no headphones), looks back over her shoulder and waves the camera to come along, mischievous grin. The edge of the photographer's sleeve is visible at the frame edge. Disposable film camera snapshot feel, slightly tilted.`
- K1: `A small Japanese karaoke booth with colorful lights. She sits holding a microphone and starts singing with a serious, deadpan face. A half-finished melon soda on the table. Plain cream hoodie and gray/navy check skirt, no headphones. Disposable film camera snapshot with flash.`
- K2: `Same karaoke booth and outfit as the reference. She bursts out laughing while still holding the microphone, eyes squeezed shut. Disposable film camera snapshot with flash.`
- K3: `Same scene as the reference, but the photo is blurred from camera shake because the photographer was laughing too. Her laughing face is still recognizable. Disposable film camera snapshot.`
- W1: `Keep the exact composition and location of the edited image. Warm sunset light. No people visible; only two long shadows of two teenagers walking side by side on the sidewalk, stretching toward the convenience store.`

## 4. 構成（写真版タイムライン）

時間は `lyrics/I close my mind.lrc` から。

| 時間 | パート | 歌詞 | 画像 |
|---|---|---|---|
| 0:00–0:14 | イントロ | — | ジャケ元（歩道橋）→ N6 曲がり角（今・誰もいない）を一瞬 → 曲名 |
| 0:14–0:21 | Verse 1 | 授業なんて／逃げ出して | A 教室 → **S1 校門** |
| 0:21–0:35 | | 似合わない煙／You laughed at me | N1 BBQ |
| 0:35–0:50 | Pre-Chorus | 財布はいつも空っぽ／気づけば君が隣に | N2 自販機 → P2 線路沿い |
| 0:50–1:08 | Chorus | We were young, we were stupid | **K1 → K2 → K3**（カラオケ）→ P1 寝起き（「寝て起きて」） |
| 1:08–1:18 | Post-Chorus | 君も笑って俺も笑った | P5 屋上 → K2 をもう一度チラッと |
| 1:18–1:32 | Verse 2 | 職質されて／君は横で笑ってた | B 職質 |
| 1:32–1:45 | Pre-Chorus 2 | くだらない夜ほど長くて／明日もまた会える | C 花火 → P3 夜の公園 → P4 改札 |
| 1:45–2:07 | Chorus 2 | 次の日もまた会ってた | 過去の写真を拍でめくる（A・N1・P2・P3・C）。間奏で暗くして「今」へ |
| 2:07–2:15 | Verse 3 | 今じゃ連絡も取らない | N7 電車の窓 → N4 今の彼女 |
| 2:15–2:22 | | 銭湯で若いやつらが | N5b 若い子を見る |
| 2:22–2:29 | | I wonder where you are now | N4（ゆっくりズーム） |
| 2:29–2:38 | Bridge | But sometimes / when the night gets quiet | N6 曲がり角（今・誰もいない） |
| **2:38–2:51** | | **君とコンビニまで歩いた／あの歩道の曲がり方** | **N6 → W1 二人の影 → N6b ふり返る。ふり返った瞬間に写真のフチがついて止まる**（ここだけ動き多め） |
| 2:51–3:00 | | 君の笑い声はまだ聞こえる | **K2 吹き出し**を長めに → 過去の写真を早いカットで |
| 3:00–3:29 | Final Chorus | 確かにあの時愛していた | 過去の写真をいちばん速く。「それぞれの道」で N4 |
| 3:29–4:01 | Outro | あの道だけは覚えてる → But I liked who I was | N6（今・誰もいない）を長めに → 最後に歩道橋（ジャケ元）で曲名と六ツ扉 |

## 5. 作る順番

1. **試作（コンビニの場面だけ）**: 2:38〜2:55。N6・N6bは今あるので、**W1 二人の影の1枚だけ作れば試せる**
   - 横16:9・約20秒の試写と、縦9:16のショートを同じ素材から書き出す
   - 見るポイント: N6bでふり返った瞬間に「あの頃に戻った」感じがするか
2. 試作がよければ S1・K1〜K3 を作る（①のヘッドホンの決定もここまでに）
3. Remotionで写真版を組む（v2の `timeline.ts` をコピーして新しいコンポジションにする。v2・v3は触らない）
4. 書き出し先: `mv/I close my mind/IClosemyMind_MV_photo.mp4`

## 6. ショート

- 1本目: コンビニの場面（2:38〜2:55）。最後に「フル曲は関連動画から」
- 次の候補: 職質（1:18〜1:32）／今は連絡も取らない（2:07〜2:22）
- 投稿7日後に見る: 視聴を続けた割合、写真が切り替わる前後の離脱、本編への流入

## 7. 使わないもの

- ライブの絵（L1〜L9）は写真版では使わない（ショート用）
- N5（人のいない銭湯）は使わない（N5b に差し替え済み）
- 黒い服・チェーン・ギザ歯・赤い目・タバコ（病み感NG）
