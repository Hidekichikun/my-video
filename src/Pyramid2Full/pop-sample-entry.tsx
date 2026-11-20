import "../index.css";
import { Composition, registerRoot } from "remotion";
import { TIMELINE } from "../Pyramid2/data/timeline";
import { PopSamples } from "./pop/Samples";

const PopSampleRoot = () => (
  <Composition
    id="Pyramid2PopSamples"
    component={PopSamples}
    defaultProps={{ sample: "00-03" as const, audit: false }}
    durationInFrames={TIMELINE.totalFrames}
    fps={30}
    width={1920}
    height={1080}
  />
);
registerRoot(PopSampleRoot);
