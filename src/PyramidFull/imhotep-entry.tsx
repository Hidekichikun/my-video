import "../index.css";
import { Composition, registerRoot } from "remotion";
import { PyramidFull, PYRAMID_FULL_DURATION } from "./index";
import { ImhotepCard } from "./ImhotepCard";

const ImhotepRenderRoot = () => (
  <>
    <Composition id="PyramidFull" component={PyramidFull}
      durationInFrames={PYRAMID_FULL_DURATION} fps={30} width={1920} height={1080} />
    <Composition id="ImhotepOverlay" component={ImhotepCard} defaultProps={{ animate: false }}
      durationInFrames={60} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(ImhotepRenderRoot);
