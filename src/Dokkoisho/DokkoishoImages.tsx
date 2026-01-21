import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { DOKKOISHO_IMAGES } from "./constants";

export const DokkoishoImages: React.FC = () => {
    const frame = useCurrentFrame();
    const { height } = useVideoConfig();

    // Slot machine move: Top to Bottom.
    // We can cycle through images. Let's change image every 10 seconds (300 frames).
    const framePerImage = 300;
    const transitionFrames = 60; // 2 second transition

    const currentIndex = Math.floor(frame / framePerImage) % DOKKOISHO_IMAGES.length;
    const nextIndex = (currentIndex + 1) % DOKKOISHO_IMAGES.length;

    const relativeFrame = frame % framePerImage;

    // Transition happens at the end of each segment
    const progress = interpolate(
        relativeFrame,
        [framePerImage - transitionFrames, framePerImage],
        [0, 1],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.ease),
        }
    );

    // Current image moves from 0 to height
    const currentY = interpolate(progress, [0, 1], [0, height]);
    // Next image moves from -height to 0
    const nextY = interpolate(progress, [0, 1], [-height, 0]);

    return (
        <AbsoluteFill style={{ backgroundColor: "black", overflow: "hidden" }}>
            <AbsoluteFill style={{ transform: `translateY(${currentY}px)` }}>
                <img
                    src={DOKKOISHO_IMAGES[currentIndex]}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    alt="background-current"
                />
            </AbsoluteFill>
            {progress > 0 && (
                <AbsoluteFill style={{ transform: `translateY(${nextY}px)` }}>
                    <img
                        src={DOKKOISHO_IMAGES[nextIndex]}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        alt="background-next"
                    />
                </AbsoluteFill>
            )}
        </AbsoluteFill>
    );
};
