import React from "react";
import { AbsoluteFill, Audio } from "remotion";
import { PoppoImages } from "./PoppoImages";
import { PoppoText } from "./PoppoText";
import { POPPO_AUDIO } from "./constants";

export const Poppo: React.FC = () => {
  return (
    <AbsoluteFill>
      <PoppoImages />
      <PoppoText />
      <Audio src={POPPO_AUDIO} />
    </AbsoluteFill>
  );
};
