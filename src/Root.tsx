import "./index.css";
import { Composition, Folder } from "remotion";

// ---- MV（六ツ扉ほか・2026年〜） ----
import { EnshuLoveCompositions } from "./EnshuLove/Compositions";
import { CosineCompositions } from "./Cosine/Compositions";
import { SineCompositions } from "./Sine/Compositions";
import { SquaredCompositions } from "./Squared/Compositions";
import { GyudonCompositions } from "./Gyudon/Compositions";
import { ForwardGlow } from "./ForwardGlow";
import { ForwardGlowV2 } from "./ForwardGlowV2";
import { ICloseMyMind } from "./ICloseMyMind";
import { ICloseMyMindLyric } from "./ICloseMyMind/LyricV3";
import { FireInMySensesLyric } from "./FireInMySenses/LyricMV";
import { JiGaMe } from "./JiGaMe";
import { IllFindYouAgain, ILL_FIND_YOU_AGAIN_DURATION } from "./IllFindYouAgain";
import { CircleZero, CIRCLE_ZERO_DURATION } from "./CircleZero";
import { CircleZeroShort, SHORT_CUTS as CZ_SHORT_CUTS, shortFrames as czShortFrames } from "./CircleZero/Short";
import { CircleZeroTypeShort, TYPE_CUTS as CZ_TYPE_CUTS, typeFrames as czTypeFrames } from "./CircleZero/ShortType";
import { CircleZeroIllustShort, ILLUST_CUTS_PROPS as CZ_IL_CUTS, illustFrames as czIlFrames } from "./CircleZero/ShortIllust";
import { LumiaSlideOperation } from "./LumiaBeginningSea";
import { Lumia, LUMIA_DURATION } from "./Lumia";

// ---- 社畜シリーズ（ドット絵MV） ----
import { ShachoChikyu, SHACHO_CHIKYU_DURATION } from "./ShachoChikyu";
import { KachoKaisha, KACHO_KAISHA_DURATION } from "./KachoKaisha";
import { ShachikuWelcome, SHACHIKU_WELCOME_DURATION } from "./ShachikuWelcome";
import { BuchoChijo, BUCHO_CHIJO_DURATION } from "./BuchoChijo";
import { KeitoraOjisan, KEITORA_OJISAN_DURATION } from "./KeitoraOjisan";

// ---- 解説動画（急に詳しくなりたいチャンネル） ----
import { KamakuraPrevis } from "./KamakuraPrevis";
import { KamakuraFull } from "./KamakuraPrevis/Full";
import { PyramidPrevis, PYRAMID_PREVIS_DURATION } from "./PyramidPrevis";
import { PyramidChapter, PyramidFull, PYRAMID_CHAPTERS, PYRAMID_FULL_DURATION } from "./PyramidFull";
import { Pyramid2Chapter, Pyramid2Full, PYRAMID2_CHAPTERS, PYRAMID2_FULL_DURATION } from "./Pyramid2Full";

// ---- アーカイブ（2025年〜2026年初めのリリックMV） ----
import { LyricVideo } from "./LyricVideo";
import { GlitchCandy } from "./GlitchCandy";
import { WorldHateProtocol } from "./WorldHateProtocol";
import { Chikichihi } from "./Chikichihi";
import { Freedom } from "./Freedom";
import { OhanaBatake } from "./OhanaBatake";
import { Dokkoisho } from "./Dokkoisho";
import { Poppo } from "./Poppo";
import { Seasons } from "./Seasons";
import { Setsubunn } from "./Setsubunn";
import { MahouShojoTanabe } from "./MahouShojoTanabe";
import { NichijoTakagi } from "./NichijoTakagi";
import { HarakataNabe } from "./HarakataNabe";

// Studio のサイドバーは <Folder> 単位でまとまる。Folder 名は英数字とハイフンのみ。
const HD = { fps: 30, width: 1920, height: 1080 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="MV">
        <EnshuLoveCompositions />
        <Folder name="Cosine"><CosineCompositions /></Folder>
        <Folder name="Sine"><SineCompositions /></Folder>
        <Folder name="Squared"><SquaredCompositions /></Folder>
        <Folder name="Gyudon"><GyudonCompositions /></Folder>

        <Folder name="CircleZero">
          {/* CIRCLE Ø 3:43（曲3:42＋暗転1.5秒） */}
          <Composition id="CircleZero" component={CircleZero} durationInFrames={CIRCLE_ZERO_DURATION} {...HD} />
          {/* ショート（縦・イラスト版）: sabi / sabi15 */}
          {Object.entries(CZ_IL_CUTS).map(([k, p]) => (
            <Composition key={`czil-${k}`} id={`CircleZeroIllustShort-${k}`} component={CircleZeroIllustShort} defaultProps={p} durationInFrames={czIlFrames(p)} fps={30} width={1080} height={1920} />
          ))}
          {/* ショート（縦・タイポグラフィ版）: sabi / sabi15 */}
          {Object.entries(CZ_TYPE_CUTS).map(([k, p]) => (
            <Composition key={`czty-${k}`} id={`CircleZeroTypeShort-${k}`} component={CircleZeroTypeShort} defaultProps={p} durationInFrames={czTypeFrames(p)} fps={30} width={1080} height={1920} />
          ))}
          {/* ショート（縦）: sabi / sabi15 / ending */}
          {Object.entries(CZ_SHORT_CUTS).map(([k, p]) => (
            <Composition key={`cz-${k}`} id={`CircleZeroShort-${k}`} component={CircleZeroShort} defaultProps={p} durationInFrames={czShortFrames(p)} fps={30} width={1080} height={1920} />
          ))}
        </Folder>

        <Composition id="ForwardGlow" component={ForwardGlow} durationInFrames={5400} {...HD} />
        <Composition id="ForwardGlowV2" component={ForwardGlowV2} durationInFrames={5400} {...HD} />
        <Composition id="ICloseMyMind" component={ICloseMyMind} durationInFrames={7245} {...HD} />
        {/* I close my mind v3：1枚絵＋グリッチのリリックMV */}
        <Composition id="ICloseMyMindLyric" component={ICloseMyMindLyric} durationInFrames={7245} {...HD} />
        {/* Fire in my senses：1枚絵＋雪ループ＋火の粉のリリックMV */}
        <Composition id="FireInMySensesLyric" component={FireInMySensesLyric} durationInFrames={6525} {...HD} />
        {/* 4:52 (292s * 30fps) */}
        <Composition id="IllFindYouAgain" component={IllFindYouAgain} durationInFrames={ILL_FIND_YOU_AGAIN_DURATION} {...HD} />
        {/* 3:50 (230s * 30fps), lets the audio finish after the final lyric. */}
        <Composition id="JiGaMe" component={JiGaMe} durationInFrames={6900} {...HD} />
        {/* Title card + scene 1 + scene 2 + end card (33.3s) */}
        <Composition id="Lumia" component={Lumia} durationInFrames={LUMIA_DURATION} {...HD} />
        <Composition id="LumiaSlideOperation" component={LumiaSlideOperation} durationInFrames={2700} {...HD} />
      </Folder>

      <Folder name="Shachiku-series">
        {/* 社長、ここは地球です 3:37 (217.6s * 30fps) */}
        <Composition id="ShachoChikyu" component={ShachoChikyu} durationInFrames={SHACHO_CHIKYU_DURATION} {...HD} />
        {/* 課長、ここは会社です 5:53（曲5:36＋寸劇12秒＋余白5秒） */}
        <Composition id="KachoKaisha" component={KachoKaisha} durationInFrames={KACHO_KAISHA_DURATION} {...HD} />
        {/* ウェルカム・トゥ・ザ・社畜！ 4:12（曲3:50＋寸劇18秒＋余白4秒） */}
        <Composition id="ShachikuWelcome" component={ShachikuWelcome} durationInFrames={SHACHIKU_WELCOME_DURATION} {...HD} />
        {/* 部長、ここは地上です！ 4:09（曲3:46＋寸劇19.8秒＋余白3秒） */}
        <Composition id="BuchoChijo" component={BuchoChijo} durationInFrames={BUCHO_CHIJO_DURATION} {...HD} />
        {/* 軽トラのおじさん 5:05（曲4:41＋テープストップと寸劇21秒＋余白3秒） */}
        <Composition id="KeitoraOjisan" component={KeitoraOjisan} durationInFrames={KEITORA_OJISAN_DURATION} {...HD} />
      </Folder>

      <Folder name="Explainer">
        <Composition id="KamakuraFull" component={KamakuraFull} durationInFrames={1800} {...HD} />
        <Composition id="KamakuraPrevis" component={KamakuraPrevis} durationInFrames={450} {...HD} />
        {/* 全11章の代表ショットを約2分に縮めたダイジェスト */}
        <Composition id="PyramidPrevis" component={PyramidPrevis} durationInFrames={PYRAMID_PREVIS_DURATION} {...HD} />
        {/* 本編：全11章＋クレジット。尺は音声の長さから決まる */}
        <Composition id="PyramidFull" component={PyramidFull} durationInFrames={PYRAMID_FULL_DURATION} {...HD} />
        <Folder name="Pyramid-chapters">
          {PYRAMID_CHAPTERS.map((c) => (
            <Composition key={c.id} id={`PyramidCh${c.id}`} component={PyramidChapter} defaultProps={{ chapterId: c.id }} durationInFrames={c.durationInFrames} {...HD} />
          ))}
        </Folder>
        <Composition id="Pyramid2Full" component={Pyramid2Full} durationInFrames={PYRAMID2_FULL_DURATION} {...HD} />
        <Folder name="Pyramid2-chapters">
          {PYRAMID2_CHAPTERS.map((c) => (
            <Composition key={c.id} id={`Pyramid2Ch${c.id}`} component={Pyramid2Chapter} defaultProps={{ chapterId: c.id }} durationInFrames={c.durationInFrames} {...HD} />
          ))}
        </Folder>
      </Folder>

      <Folder name="Archive-2025">
        {/* 3m 50s * 30fps (230 seconds * 30fps) */}
        <Composition id="FireInMySenses1" component={LyricVideo} durationInFrames={6900} {...HD} />
        <Composition id="GlitchCandy" component={GlitchCandy} durationInFrames={9900} {...HD} />
        {/* 3m25s at 30fps (WORLD_HATE.PROTOCOL - matches audio length) */}
        <Composition id="WorldHateProtocol" component={WorldHateProtocol} durationInFrames={6150} {...HD} />
        {/* ~3m26s track, padded with extra tail for final captions */}
        <Composition id="Chikichihi" component={Chikichihi} durationInFrames={7200} {...HD} />
        {/* ~2m 47s track + short tail */}
        <Composition id="Freedom" component={Freedom} durationInFrames={5100} {...HD} />
        <Composition id="OhanaBatake" component={OhanaBatake} durationInFrames={7200} {...HD} />
        <Composition id="Dokkoisho" component={Dokkoisho} durationInFrames={6600} {...HD} />
        {/* Extend to 3:22. */}
        <Composition id="Poppo1" component={Poppo} durationInFrames={6060} {...HD} />
        {/* Extend to 3:30. */}
        <Composition id="Seasons" component={Seasons} durationInFrames={6300} {...HD} />
        {/* 3:00 (180s * 30fps) */}
        <Composition id="Setsubunn" component={Setsubunn} durationInFrames={5400} {...HD} />
        {/* 3:35 (215s * 30fps) */}
        <Composition id="MahouShojoTanabe" component={MahouShojoTanabe} durationInFrames={6450} {...HD} />
        {/* 3:30 (210s * 30fps) */}
        <Composition id="NichijoTakagi" component={NichijoTakagi} durationInFrames={6300} {...HD} />
        {/* 4:20 (260s * 30fps) */}
        <Composition id="HarakataNabe" component={HarakataNabe} durationInFrames={7800} {...HD} />
      </Folder>
    </>
  );
};
