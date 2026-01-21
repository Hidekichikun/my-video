import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LyricLine } from "../utils/lrc-parser";

const BASE_FONT = "GenkaiMincho";
const GLITCH_FONT = "ToroNoGlitchMinchoH3";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

interface FreedomTextProps {
  lines: LyricLine[];
}

interface LineWindow {
  startFrame: number;
  endFrame: number;
  isAccent: boolean;
}

const getLineOverrides = (text: string) => {
  const overrides: {
    entryMode?: number;
    fontScale?: number;
    textAlign?: "left" | "center" | "right";
    padding?: number;
  } = {};

  if (text.includes("「こうあるべき」が増えてく")) {
    overrides.entryMode = 0;
  }

  if (text.includes("「自由」になる")) {
    overrides.entryMode = 1;
  }

  if (
    text.includes("全部シャットアウトして") ||
    text.includes("胸の奥で鳴ってる") ||
    text.includes("このビートだけ信じて") ||
    text.includes("正解もいらない")
  ) {
    overrides.fontScale = 0.86;
    overrides.textAlign = "center";
    overrides.padding = 200;
  }

  return overrides;
};

const buildLineWindows = (lines: LyricLine[], fps: number): LineWindow[] => {
  return lines.map((line, index) => {
    const startFrame = Math.floor(line.time * fps);
    const nextStart = lines[index + 1]
      ? Math.floor(lines[index + 1].time * fps)
      : startFrame + Math.floor(fps * 3.5);

    const minDuration = Math.floor(fps * 1.2);
    const maxDuration = Math.floor(fps * 4);
    const duration = Math.min(Math.max(nextStart - startFrame, minDuration), maxDuration);
    const endFrame = startFrame + duration;

    const isAccent = Boolean(line.isChorus) || index % 5 === 0;

    return { startFrame, endFrame, isAccent };
  });
};

const TextLine: React.FC<{
  line: LyricLine;
  window: LineWindow;
  frame: number;
  fps: number;
  index: number;
}> = ({ line, window, frame, fps, index }) => {
  const { startFrame, endFrame, isAccent } = window;

  if (frame < startFrame - fps || frame > endFrame + fps) return null;

  const enter = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 160, mass: 0.9 },
  });

  const rise = interpolate(enter, [0, 1], [12, 0], clamp);
  const settle = interpolate(enter, [0, 1], [1.06, 1], clamp);

  const opacity = interpolate(
    frame,
    [startFrame - 8, startFrame + 6, endFrame - 8, endFrame + 2],
    [0, 1, 1, 0],
    clamp
  );

  const glitchIn = interpolate(frame, [startFrame, startFrame + 6], [1, 0], clamp);
  const glitchOut = interpolate(frame, [endFrame - 6, endFrame], [0, 1], clamp);
  const glitch = Math.max(glitchIn, glitchOut);

  const jitterX =
    (Math.sin(frame * 2.3 + index * 1.7) * 12 + Math.sin(frame * 5.2) * 6) * glitch * 0.4;
  const jitterY = Math.cos(frame * 2.1 + index * 2.1) * 8 * glitch;
  const skew = Math.sin(frame * 1.4 + index) * 6 * glitch;
  const flicker = 0.88 + Math.sin(frame * 0.25 + index * 3.2) * 0.12;

  const overrides = getLineOverrides(line.text);

  const sizeOptions = [46, 52, 58, 66, 74, 82];
  const sizeSeed = sizeOptions[index % sizeOptions.length];
  const length = line.text.length;
  const sizePenalty = Math.max(0, length - 10) * 2.2;
  const baseSize = Math.max(40, (isAccent ? sizeSeed + 6 : sizeSeed) - sizePenalty);
  const fontSize = Math.max(38, baseSize * (overrides.fontScale ?? 1));
  const letterSpacing = length > 12 ? "0.02em" : "0.05em";

  const posY = 28 + ((index * 13) % 44);
  const entryMode = overrides.entryMode ?? (index % 6);
  const textAlign = overrides.textAlign ?? (entryMode === 0 ? "left" : entryMode === 1 ? "right" : "center");

  const { width, height } = useVideoConfig();
  const contentWidth = Math.round(width * 0.68);
  const baseOffsetX =
    entryMode === 0 ? -width * 0.1 : entryMode === 1 ? width * 0.1 : entryMode === 4 ? -width * 0.06 : entryMode === 5 ? width * 0.06 : 0;
  const maxTravelX = Math.max(50, width / 2 - contentWidth / 2 - Math.abs(baseOffsetX));
  const maxTravelY = Math.max(90, height / 2 - 260);
  const travelProgress = interpolate(frame, [startFrame, endFrame], [0, 1], clamp);

  let startX = 0;
  let endX = 0;
  let startY = 0;
  let endY = 0;

  if (entryMode === 0) {
    startX = -maxTravelX;
    endX = maxTravelX;
  } else if (entryMode === 1) {
    startX = maxTravelX;
    endX = -maxTravelX;
  } else if (entryMode === 2) {
    startY = -maxTravelY;
    endY = maxTravelY;
  } else if (entryMode === 3) {
    startY = maxTravelY;
    endY = -maxTravelY;
  } else if (entryMode === 4) {
    startX = -maxTravelX * 0.7;
    endX = maxTravelX * 0.7;
    startY = -maxTravelY * 0.7;
    endY = maxTravelY * 0.7;
  } else {
    startX = maxTravelX * 0.7;
    endX = -maxTravelX * 0.7;
    startY = -maxTravelY * 0.7;
    endY = maxTravelY * 0.7;
  }

  const travelX = interpolate(travelProgress, [0, 1], [startX, endX], clamp);
  const travelY = interpolate(travelProgress, [0, 1], [startY, endY], clamp);

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: `${posY}%`,
    transform: `translate(-50%, -50%) translate(${baseOffsetX + travelX + jitterX}px, ${travelY + jitterY + rise}px) scale(${settle}) skewX(${skew}deg)`,
    opacity: opacity * flicker,
    textAlign,
    boxSizing: "border-box",
    width: `${contentWidth}px`,
    maxWidth: "100%",
    padding: `0 ${overrides.padding ?? 200}px`,
    lineHeight: 1.12,
    pointerEvents: "none",
  };

  const layerBase: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  const baseStyle: React.CSSProperties = {
    ...layerBase,
    fontFamily: isAccent ? GLITCH_FONT : BASE_FONT,
    fontSize,
    fontWeight: isAccent ? 700 : 600,
    letterSpacing,
    color: "#f6f6ff",
    textShadow:
      "0 0 12px rgba(120, 168, 255, 0.45), 0 0 28px rgba(255, 106, 214, 0.35), 0 8px 24px rgba(0, 0, 0, 0.65)",
  };

  const ghostA: React.CSSProperties = {
    ...layerBase,
    fontFamily: GLITCH_FONT,
    fontSize,
    fontWeight: 600,
    letterSpacing,
    color: "rgba(125, 249, 255, 0.85)",
    transform: `translate(${jitterX * 0.5}px, ${-jitterY * 0.4}px)`,
    opacity: 0.5 * glitch,
    mixBlendMode: "screen",
  };

  const ghostB: React.CSSProperties = {
    ...layerBase,
    fontFamily: GLITCH_FONT,
    fontSize,
    fontWeight: 600,
    letterSpacing,
    color: "rgba(255, 97, 210, 0.85)",
    transform: `translate(${-jitterX * 0.6}px, ${jitterY * 0.3}px)`,
    opacity: 0.5 * glitch,
    mixBlendMode: "screen",
  };

  return (
    <div style={containerStyle}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <span style={ghostA}>{line.text}</span>
        <span style={ghostB}>{line.text}</span>
        <span style={baseStyle}>{line.text}</span>
      </div>
    </div>
  );
};

export const FreedomText: React.FC<FreedomTextProps> = ({ lines }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const windows = useMemo(() => buildLineWindows(lines, fps), [lines, fps]);

  return (
    <AbsoluteFill>
      {lines.map((line, i) => (
        <TextLine key={`${line.time}-${i}`} line={line} window={windows[i]} frame={frame} fps={fps} index={i} />
      ))}
    </AbsoluteFill>
  );
};
