import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { LyricVideo } from "./LyricVideo";
import { GlitchCandy } from "./GlitchCandy";


import { WorldHateProtocol } from "./WorldHateProtocol";
import { ForwardGlow } from "./ForwardGlow";
import { Chikichihi } from "./Chikichihi";
import { Freedom } from "./Freedom";
import { OhanaBatake } from "./OhanaBatake";
import { Dokkoisho } from "./Dokkoisho";
import { Poppo } from "./Poppo";
import { Seasons } from "./Seasons";
import { Setsubunn } from "./Setsubunn";
import { MahouShojoTanabe } from "./MahouShojoTanabe";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
    </>
  );
};
