import React from "react";
import { AbsoluteFill, Audio } from "remotion";
import { DokkoishoImages } from "./DokkoishoImages";
import { DokkoishoText } from "./DokkoishoText";
import { DOKKOISHO_AUDIO } from "./constants";

export const Dokkoisho: React.FC = () => {
    return (
        <AbsoluteFill>
            <DokkoishoImages />
            <DokkoishoText />
            <Audio src={DOKKOISHO_AUDIO} />
        </AbsoluteFill>
    );
};
