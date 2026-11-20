import "./index.css";
import { Composition, Folder } from "remotion";
import {EnshuLoveCompositions} from './EnshuLove/Compositions';
import { KamakuraPrevis } from "./KamakuraPrevis";
import { KamakuraFull } from "./KamakuraPrevis/Full";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { LyricVideo } from "./LyricVideo";
import { GlitchCandy } from "./GlitchCandy";


import { WorldHateProtocol } from "./WorldHateProtocol";
import { ForwardGlow } from "./ForwardGlow";
import { ForwardGlowV2 } from "./ForwardGlowV2";
import { ICloseMyMind } from "./ICloseMyMind";
import { ICloseMyMindLyric } from "./ICloseMyMind/LyricV3";
import { FireInMySensesLyric } from "./FireInMySenses/LyricMV";
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
import { JiGaMe } from "./JiGaMe";
import { IllFindYouAgain, ILL_FIND_YOU_AGAIN_DURATION } from "./IllFindYouAgain";
import { ShachoChikyu, SHACHO_CHIKYU_DURATION } from "./ShachoChikyu";
import { KachoKaisha, KACHO_KAISHA_DURATION } from "./KachoKaisha";
import { ShachikuWelcome, SHACHIKU_WELCOME_DURATION } from "./ShachikuWelcome";
import { BuchoChijo, BUCHO_CHIJO_DURATION } from "./BuchoChijo";
import { KeitoraOjisan, KEITORA_OJISAN_DURATION } from "./KeitoraOjisan";
import { CircleZero, CIRCLE_ZERO_DURATION } from "./CircleZero";
import { CircleZeroShort, SHORT_CUTS as CZ_SHORT_CUTS, shortFrames as czShortFrames } from "./CircleZero/Short";
import { CircleZeroTypeShort, TYPE_CUTS as CZ_TYPE_CUTS, typeFrames as czTypeFrames } from "./CircleZero/ShortType";
import { CircleZeroIllustShort, ILLUST_CUTS_PROPS as CZ_IL_CUTS, illustFrames as czIlFrames } from "./CircleZero/ShortIllust";
import { LumiaSlideOperation } from "./LumiaBeginningSea";
import { Lumia, LUMIA_DURATION } from "./Lumia";
import { PyramidPrevis, PYRAMID_PREVIS_DURATION } from "./PyramidPrevis";
import { PyramidChapter, PyramidFull, PYRAMID_CHAPTERS, PYRAMID_FULL_DURATION } from "./PyramidFull";
import { Pyramid2Chapter, Pyramid2Full, PYRAMID2_CHAPTERS, PYRAMID2_FULL_DURATION } from "./Pyramid2Full";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <EnshuLoveCompositions />
      <Composition id="KamakuraFull" component={KamakuraFull} durationInFrames={1800} fps={30} width={1920} height={1080} />
      <Composition id="KamakuraPrevis" component={KamakuraPrevis} durationInFrames={450} fps={30} width={1920} height={1080} />
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />
      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
      <Composition
        id="FireInMySenses1"
        component={LyricVideo}
        // 3m 50s * 30fps (230 seconds * 30fps)
        durationInFrames={6900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GlitchCandy"
        component={GlitchCandy}
        durationInFrames={9900}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="WorldHateProtocol"
        component={WorldHateProtocol}
        // 3m25s at 30fps (WORLD_HATE.PROTOCOL - matches audio length)
        durationInFrames={6150}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="ForwardGlow"
        component={ForwardGlow}
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="ForwardGlowV2"
        component={ForwardGlowV2}
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="ICloseMyMind"
        component={ICloseMyMind}
        durationInFrames={7245}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Fire in my senses：1枚絵＋雪ループ＋火の粉のリリックMV */}
      <Composition
        id="FireInMySensesLyric"
        component={FireInMySensesLyric}
        durationInFrames={6525}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* I close my mind v3：1枚絵＋グリッチのリリックMV */}
      <Composition
        id="ICloseMyMindLyric"
        component={ICloseMyMindLyric}
        durationInFrames={7245}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Chikichihi"
        component={Chikichihi}
        // ~3m26s track, padded with extra tail for final captions
        durationInFrames={7200}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Freedom"
        component={Freedom}
        // ~2m 47s track + short tail
        durationInFrames={5100}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="OhanaBatake"
        component={OhanaBatake}
        // 3m 50s * 30fps = 6900 frames (approx)
        durationInFrames={7200}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Dokkoisho"
        component={Dokkoisho}
        // Lyric file seems to go up to ~3 minutes. 
        // 3m * 60s * 30fps = 5400 frames. Let's use 5400.
        durationInFrames={6600}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Poppo1"
        component={Poppo}
        // Extend to 3:22.
        durationInFrames={6060}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Seasons"
        component={Seasons}
        // Extend to 3:30.
        durationInFrames={6300}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Setsubunn"
        component={Setsubunn}
        // Setsubun song duration 3:00 (180s * 30fps = 5400 frames)
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="MahouShojoTanabe"
        component={MahouShojoTanabe}
        // 3:35 (215s * 30fps = 6450 frames)
        durationInFrames={6450}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="NichijoTakagi"
        component={NichijoTakagi}
        // 3:30 (210s * 30fps = 6300 frames)
        durationInFrames={6300}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="HarakataNabe"
        component={HarakataNabe}
        // 4:20 (260s * 30fps = 7800 frames)
        durationInFrames={7800}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="CircleZero"
        component={CircleZero}
        // CIRCLE Ø 3:43（曲3:42＋暗転1.5秒）
        durationInFrames={CIRCLE_ZERO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* CIRCLE Ø ショート（縦・イラスト版）: sabi / sabi15 */}
      {Object.entries(CZ_IL_CUTS).map(([k, p]) => (
        <Composition key={`czil-${k}`} id={`CircleZeroIllustShort-${k}`} component={CircleZeroIllustShort} defaultProps={p} durationInFrames={czIlFrames(p)} fps={30} width={1080} height={1920} />
      ))}
      {/* CIRCLE Ø ショート（縦・タイポグラフィ版）: sabi / sabi15 */}
      {Object.entries(CZ_TYPE_CUTS).map(([k, p]) => (
        <Composition key={`czty-${k}`} id={`CircleZeroTypeShort-${k}`} component={CircleZeroTypeShort} defaultProps={p} durationInFrames={czTypeFrames(p)} fps={30} width={1080} height={1920} />
      ))}
      {/* CIRCLE Ø ショート（縦）: sabi / sabi15 / ending */}
      {Object.entries(CZ_SHORT_CUTS).map(([k, p]) => (
        <Composition key={`cz-${k}`} id={`CircleZeroShort-${k}`} component={CircleZeroShort} defaultProps={p} durationInFrames={czShortFrames(p)} fps={30} width={1080} height={1920} />
      ))}

      <Composition
        id="KeitoraOjisan"
        component={KeitoraOjisan}
        // 軽トラのおじさん 5:05（曲4:41＋テープストップと寸劇21秒＋余白3秒）
        durationInFrames={KEITORA_OJISAN_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="BuchoChijo"
        component={BuchoChijo}
        // 部長、ここは地上です！ 4:09（曲3:46＋寸劇19.8秒＋余白3秒）
        durationInFrames={BUCHO_CHIJO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="ShachikuWelcome"
        component={ShachikuWelcome}
        // ウェルカム・トゥ・ザ・社畜！ 4:12（曲3:50＋寸劇18秒＋余白4秒）
        durationInFrames={SHACHIKU_WELCOME_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="KachoKaisha"
        component={KachoKaisha}
        // 課長、ここは会社です 5:53（曲5:36＋寸劇12秒＋余白5秒）
        durationInFrames={KACHO_KAISHA_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="ShachoChikyu"
        component={ShachoChikyu}
        // 社長、ここは地球です 3:37 (217.6s * 30fps)
        durationInFrames={SHACHO_CHIKYU_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="IllFindYouAgain"
        component={IllFindYouAgain}
        // 4:52 (292s * 30fps)
        durationInFrames={ILL_FIND_YOU_AGAIN_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="JiGaMe"
        component={JiGaMe}
        // 3:50 (230s * 30fps), lets the audio finish after the final lyric.
        durationInFrames={6900}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Lumia"
        component={Lumia}
        // Title card + scene 1 + scene 2 + end card (33.3s)
        durationInFrames={LUMIA_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="LumiaSlideOperation"
        component={LumiaSlideOperation}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="PyramidPrevis"
        component={PyramidPrevis}
        // 全11章の代表ショットを約2分に縮めたダイジェスト
        durationInFrames={PYRAMID_PREVIS_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="PyramidFull"
        component={PyramidFull}
        // 本編：全11章＋クレジット。尺は音声の長さから決まる
        durationInFrames={PYRAMID_FULL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition id="Pyramid2Full" component={Pyramid2Full} durationInFrames={PYRAMID2_FULL_DURATION} fps={30} width={1920} height={1080} />
      <Folder name="Pyramid2-chapters">
        {PYRAMID2_CHAPTERS.map((c) => (
          <Composition key={c.id} id={`Pyramid2Ch${c.id}`} component={Pyramid2Chapter} defaultProps={{ chapterId: c.id }} durationInFrames={c.durationInFrames} fps={30} width={1920} height={1080} />
        ))}
      </Folder>

      <Folder name="Pyramid-chapters">
        {PYRAMID_CHAPTERS.map((c) => (
          <Composition
            key={c.id}
            id={`PyramidCh${c.id}`}
            component={PyramidChapter}
            defaultProps={{ chapterId: c.id }}
            durationInFrames={c.durationInFrames}
            fps={30}
            width={1920}
            height={1080}
          />
        ))}
      </Folder>
    </>
  );
};
