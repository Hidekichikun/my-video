import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { OhanaImages } from "./OhanaImages";
import { OhanaText } from "./OhanaText";

export const OhanaBatake: React.FC = () => {
    return (
        <AbsoluteFill>
            <OhanaImages />
            <OhanaText />
            <Audio src={staticFile("/music/ohana_batake.mp3")} />
        </AbsoluteFill>
    );
};
