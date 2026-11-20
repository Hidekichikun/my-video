# 棒人間、鎌倉を歩く。

## 仕様と成果物

- 1260年代を想定した鎌倉の散策。穏やかで少しコミカル。
- 最終目標60秒、16:9、1920×1080、30fps。
- 15秒の映像試作に加え、全7場面・60秒版を制作。
- 60秒版：`out/kamakura-previs-60s.mp4`、Composition ID：`KamakuraFull`。
- 15秒版：`out/kamakura-previs-15s.mp4`、Composition ID：`KamakuraPrevis`（保存）。
- 丸い頭と棒の身体、箱と三角屋根、共通の3D座標と透視投影によるカメラ移動。
- 会話は字幕。音声台詞なし。足音・鳥・風を模したオリジナルの仮効果音。
- 建物、店、人物の配置は仮。測量的な復元ではない。登場人物と会話は創作。

## 60秒版の構成

| 秒 | 内容 |
| --- | --- |
| 0–7 | 若宮大路を旅人が歩く。丘と街の俯瞰から地上へ |
| 7–17 | 商人と干し魚の会話。籠を運ぶ農民。買うのは後にして散策を続ける |
| 17–27 | 武士に話しかけ、御所の警固という日常の仕事を知る |
| 27–35 | 水場・煮炊き・荷運び。旅人が道を譲る小さな笑い |
| 35–43 | 地図で寺と信仰を紹介。移動時間を省略 |
| 43–55 | 建長寺の僧と坐禅。臨済宗を短く紹介 |
| 55–60 | 旅人のお腹が鳴る。引きの画で終わる |

## 考証の基準

若宮大路と丘陵を街の骨格として扱う。江戸時代のような天守・長屋の定型を持ち込まない。建長寺の現存建物をそのまま1260年代の建物として再現しない。禅だけが信仰されていたようには描かない。寺への移動は実時間ではなく編集で省略する。

- 建長寺（1253年創建、臨済禅）：https://www.kenchoji.com/about/
- 鎌倉市・文化財（街路と館・町屋）：https://www.city.kamakura.kanagawa.jp/treasury/t_aug.html
- 鎌倉市・歴史的風致の背景（多様な仏教）：https://www.city.kamakura.kanagawa.jp/fuuchi/documents/1.pdf

## 再生成

```powershell
node scripts/generate_kamakura_audio.cjs
npx remotion render KamakuraPrevis out/kamakura-previs-15s.mp4
node scripts/generate_kamakura_audio.cjs --full
npx remotion render src/KamakuraPrevis/entry.tsx KamakuraFull out/kamakura-previs-60s.mp4
```

## 実装と確認

- 7場面をフレームから決定。シークしても同じ人物・カメラ位置になる。
- 立体は簡易ポリゴンの透視投影。精密な建築復元・物理シミュレーションではない。
- 寺の建築は仮の形。宗教地図は概略で縮尺を持たない。
- 音は自作の仮効果音。足音・鳥・水と煮炊き・鐘・腹の音。音声会話やBGMなし。
- 60秒版は「あとで買う」という会話に変更し、最後の空腹のオチにつなげる。
- 今回は同一タスクのAstraで継続。モデル切替は行っていない。
- 追加コンポーネントの単独TypeScriptチェックに成功。ESLintはエラーなし（旧15秒版の影に描画速度の警告1件）。
- リポジトリ全体のTypeScriptチェックは既存のHarakataNabe・NichijoTakagi・Seasons内の未使用変数3件で失敗する。今回の変更とは別。
- 代表フレームで構図・字幕を確認し、地図の海岸名との重なりと煮炊き人物の隠れを修正。
