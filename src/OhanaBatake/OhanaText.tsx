import React, { useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile, interpolate, Easing } from "remotion";
import { parseLrc, LyricLine } from "../utils/lrc-parser";

const FONT_NAME = "klsmaru";

export const OhanaText: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);

    useEffect(() => {
        fetch(staticFile("/lyrics/ohana_batake.lrc"))
            .then((res) => res.text())
            .then((text) => {
                const parsed = parseLrc(text);
                setLyrics(parsed);
            })
            .catch((err) => console.error("Failed to load lyrics", err));
    }, []);

    const currentTime = frame / fps;

    // Find current lyric line
    const currentLineIndex = lyrics.findIndex((line, i) => {
        const nextLine = lyrics[i + 1];
        return line.time <= currentTime && (!nextLine || nextLine.time > currentTime);
    });
    const currentLine = lyrics[currentLineIndex];


    if (!currentLine) return null;

    // calculate time since line started for animation
    const timeSinceStart = currentTime - currentLine.time;

    // "Fuwa Fuwa" (Floating) Animation
    // Gentle sine wave motion
    const floatY = Math.sin(timeSinceStart * 2) * 10;


    // Opacity fade in
    const opacity = interpolate(timeSinceStart, [0, 0.5], [0, 1], {
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.ease),
    });

    return (
        <AbsoluteFill style={{
            justifyContent: "center",
            alignItems: "center",
            fontFamily: FONT_NAME,
            color: "#5d4037", // Warm brown for all sections
        }}>
            <div style={{
                position: "absolute",
                bottom: "20%", // Lower third
                fontSize: 100,
                textAlign: "center",
                width: "100%",
                textShadow: "4px 4px 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.8)", // Soft glow for all sections
                transform: `
                    translateY(${floatY}px)
                `,
                opacity: opacity,
                whiteSpace: "pre-wrap"
            }}>
                {currentLine.text}
            </div>
        </AbsoluteFill>
    );
};
