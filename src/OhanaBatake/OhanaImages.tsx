import { AbsoluteFill, useCurrentFrame, Img, staticFile } from "remotion";
import React from "react";

export const OhanaImages: React.FC = () => {
    const frame = useCurrentFrame();

    // Animations
    // Gentle breathing (Scale 1.0 -> 1.05)
    const breathingScale = 1.0 + Math.sin(frame * 0.05) * 0.02; // Very slow breathe

    const currentScale = breathingScale;
    const shakeX = 0;
    const shakeY = 0;

    // Image Source
    const bgMain = staticFile("/photo/ohana_batake/bg_main.png");

    const currentBg = bgMain;

    return (
        <AbsoluteFill style={{ backgroundColor: "#fff" }}>
            <Img
                src={currentBg}
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `translate(${shakeX}px, ${shakeY}px) scale(${currentScale})`,
                    transition: "transform 1s ease-in-out, opacity 0.5s ease"
                }}
            />
            {/* Overlay for softness (Fuwa Fuwa) */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 100%)",
                pointerEvents: "none"
            }} />
        </AbsoluteFill>
    );
};
