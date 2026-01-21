import React, { useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { parseLrc, LyricLine } from "../utils/lrc-parser";
import { DOKKOISHO_LRC, HIRAGANA_FONT, KANJI_FONT } from "./constants";

export const DokkoishoText: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);

    useEffect(() => {
        fetch(DOKKOISHO_LRC)
            .then((res) => res.text())
            .then((text) => setLyrics(parseLrc(text)))
            .catch((err) => console.error("Failed to load lyrics", err));
    }, []);

    const currentTime = frame / fps;
    const currentLineIndex = lyrics.findIndex((line, i) => {
        const nextLine = lyrics[i + 1];
        return line.time <= currentTime && (!nextLine || nextLine.time > currentTime);
    });
    const currentLine = lyrics[currentLineIndex];

    if (!currentLine) return null;

    const timeSinceStart = currentTime - currentLine.time;
    const opacity = interpolate(timeSinceStart, [0, 0.3], [0, 1], {
        extrapolateRight: "clamp",
    });

    // Helper to split text by character type (Hiragana vs others)
    const renderStyledText = (text: string) => {
        if (!text) return null;
        // Regex for Hiragana: [\u3040-\u309F]
        const segments: { text: string; isHiragana: boolean }[] = [];
        let currentSegment = "";
        let currentIsHiragana = false;

        for (const char of text) {
            const isHiragana = /[\u3040-\u309F]/.test(char);
            if (currentSegment === "") {
                currentIsHiragana = isHiragana;
                currentSegment = char;
            } else if (isHiragana === currentIsHiragana) {
                currentSegment += char;
            } else {
                segments.push({ text: currentSegment, isHiragana: currentIsHiragana });
                currentIsHiragana = isHiragana;
                currentSegment = char;
            }
        }
        if (currentSegment !== "") {
            segments.push({ text: currentSegment, isHiragana: currentIsHiragana });
        }

        return segments.map((seg, i) => (
            <span
                key={i}
                style={{
                    fontFamily: seg.isHiragana ? HIRAGANA_FONT : KANJI_FONT,
                    fontSize: 70,
                    margin: "0 2px",
                }}
            >
                {seg.text}
            </span>
        ));
    };

    return (
        <AbsoluteFill style={{
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textShadow: "0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
        }}>
            <div style={{
                position: "absolute",
                bottom: "12%",
                width: "90%",
                maxWidth: "1600px",
                textAlign: "center",
                opacity: opacity,
                transform: `translateY(${interpolate(timeSinceStart, [0, 0.3], [20, 0], { extrapolateRight: "clamp" })}px)`,
                lineHeight: 1.4,
                wordBreak: "keep-all",
            }}>
                {renderStyledText(currentLine.text)}
            </div>
        </AbsoluteFill>
    );
};
