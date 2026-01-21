import React, { useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { parseLrc, LyricLine } from "../utils/lrc-parser";
import { HIRAGANA_FONT, KANJI_FONT, POPPO_LRC } from "./constants";

export const PoppoText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);

  useEffect(() => {
    fetch(POPPO_LRC)
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
  const opacity = interpolate(timeSinceStart, [0, 0.35], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOutTargets = [149.43, 176.96];
  const needsFadeOut = fadeOutTargets.some((target) => Math.abs(currentLine.time - target) < 0.01);
  const fadeOut = needsFadeOut
    ? interpolate(timeSinceStart, [6, 7], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const finalOpacity = opacity * fadeOut;

  const renderStyledText = (text: string) => {
    if (!text) return null;
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
          fontSize: 96,
          margin: "0 2px",
        }}
      >
        {seg.text}
      </span>
    ));
  };

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        color: "#fffaf2",
        textShadow: "0 4px 16px rgba(0,0,0,0.7)",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          width: "92%",
          maxWidth: "1600px",
          textAlign: "center",
          opacity: finalOpacity,
          transform: `translateY(${interpolate(timeSinceStart, [0, 0.35], [18, 0], {
            extrapolateRight: "clamp",
          })}px)`,
          lineHeight: 1.35,
          wordBreak: "keep-all",
          padding: "22px 36px",
          borderRadius: 24,
          background: "rgba(0,0,0,0.28)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        {renderStyledText(currentLine.text)}
      </div>
    </AbsoluteFill>
  );
};
