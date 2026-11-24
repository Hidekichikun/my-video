# my-video（Remotion リリックビデオ）

## コマンド

```console
npm i                                       # 最初に1回
npm run dev                                 # Remotion Studio（プレビュー）
npx remotion render <コンポジションID> out/<曲ID>/<曲ID>_mv_v1.mp4
```

## フォルダのルール（ダブらせないために）

```
public/
├─ songs/<曲ID>/          ← 動画で使う素材はここだけ
│   ├─ *.mp3 / *.lrc      ← 曲と歌詞
│   └─ photo/             ← 使う画像
└─ fonts/<フォント名>/     ← フォント本体＋ライセンス（1フォント1フォルダ）
src/
├─ songs/<曲名>/          ← 曲ごとのコード（MVもショートもここ）
├─ utils/ resources/      ← 共通処理
└─ Root.tsx               ← コンポジション一覧
archive/<曲ID>/           ← 使っていない候補画像など（動画には入らない）
out/<曲ID>/               ← 書き出した動画（Git には入れない）
```

1. **動画で使う素材は `public/songs/<曲ID>/` にしか置かない。** 同じファイルを2か所に置かない
2. **使わない候補画像は `archive/` か Google ドライブへ。** `public/` には使うものだけ
3. **フォントは `public/fonts/<フォント名>/` に、ライセンスと一緒に置く**
4. **MV とショートは同じ曲フォルダで作る。** コンポジションIDは `<曲名>-MV` / `<曲名>-Shorts`。素材は共通で使う
5. **書き出しは `out/<曲ID>/<曲ID>_mv_v1.mp4` / `_shorts_v1.mp4`。** 完成したら Google ドライブの曲フォルダへ
6. コードから素材を呼ぶときは `staticFile("songs/<曲ID>/...")` / `staticFile("fonts/<フォント名>/...")`。ファイル名の大文字・小文字はぴったり合わせる（クラウドのLinuxでは別物扱い）

## 曲ID 一覧

| 曲ID | 曲名 | コード (`src/songs/`) | コンポジションID |
|---|---|---|---|
| boot-sequence | BOOT_SEQUENCE_00 | BootSequence | （未登録） |
| chikichihi | 知己知彼 | Chikichihi | Chikichihi |
| dokkoisho | どっこいしょ | Dokkoisho | Dokkoisho |
| fire-in-my-senses | Fire in my senses | LyricVideo | FireInMySenses1 |
| forward-glow | Forward Glow | ForwardGlow | ForwardGlow |
| freedom | ふりーだむ | Freedom | Freedom |
| glitch-candy | グリッチキャンディー | GlitchCandy | GlitchCandy |
| harakata-nabe | ハーカタ・ナーベの日常 | HarakataNabe | HarakataNabe |
| jigame | JiGaMe | JiGaMe | JiGaMe |
| mahou-shoujo-tanabe | 魔法少女田辺さん | MahouShojoTanabe | MahouShojoTanabe |
| nichijo-takagi | 日常の守り人、高木さん | NichijoTakagi | NichijoTakagi |
| ohana-batake | おはな　ばたけ | OhanaBatake | OhanaBatake |
| osushi | OSUSHI | （なし・画像のみ） | — |
| poppo | ぽっぽー | Poppo | Poppo1 |
| seasons | Seasons | Seasons | Seasons |
| setsubunn | SETSUBUNN | Setsubunn | Setsubunn |
| world-hate-protocol | WORLD_HATE.PROTOCOL | WorldHateProtocol | WorldHateProtocol |

## Google ドライブ

`my-video素材/<曲ID>/` に、候補画像・元データ・完成動画を保管する。
新しくアップするものは、まず `my-video素材/_アップロード置き場/` に入れておけば、曲フォルダに仕分けてもらえる。
