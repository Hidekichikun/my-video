import React from "react";
import { Composition, registerRoot } from "remotion";
import { KamakuraPrevis } from "./index";
import { KamakuraFull } from "./Full";
const Root: React.FC = () => (
  <>
    <Composition
      id="KamakuraFull"
      component={KamakuraFull}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="KamakuraPrevis"
      component={KamakuraPrevis}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
registerRoot(Root);
