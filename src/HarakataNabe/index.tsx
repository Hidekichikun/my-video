import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { parseLrc } from "../utils/lrc-parser";

const LRC_FILE = "lyrics/ハーカタ・ナーベの日常 senegal.lrc";
const AUDIO_FILE = "music/ハーカタ・ナーベの日常.mp3";
const PHOTO_SEGMENTS = [
  { start: 23, end: 45.5, src: "photo/ハーカタ・ナーベの日常/踊るナベ２.png" },
  { start: 45.5, end: 58, src: "photo/ハーカタ・ナーベの日常/反省しないハーカタ.png" },
];
const FONT_FILE = "fonts/OtsutomeFont_Ver3_16.ttf";
const SPECIAL_FONT_FILE = "fonts/NikumaruFont.otf";


const loadOtsutomeFont = async () => {
  const otsutome = new FontFace(
    "Otsutome",
    `url(${staticFile(FONT_FILE)}) format("truetype")`
  );
  const nikumaru = new FontFace(
    "Nikumaru",
    `url(${staticFile(SPECIAL_FONT_FILE)}) format("opentype")`
  );
  const loaded = await Promise.all([otsutome.load(), nikumaru.load()]);
  loaded.forEach((font) => document.fonts.add(font));
};

export const HarakataNabe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender("harakata-nabe-font"));

  useEffect(() => {
    loadOtsutomeFont()
      .catch((err) => console.error("Failed to load Otsutome font:", err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(staticFile(LRC_FILE), { signal: controller.signal })
      .then((res) => res.text())
      .then((text) => setLrcContent(text))
      .catch((err) => {
        if ((err as any)?.name === "AbortError") return;
        console.error("Failed to load LRC:", err);
        setLrcContent("");
      });
    return () => controller.abort();
  }, []);

  const parsedLyrics = useMemo(() => (lrcContent ? parseLrc(lrcContent) : []), [lrcContent]);
  const currentTime = frame / fps;

  const currentIndex = parsedLyrics.findIndex((line, index) => {
    const nextLine = parsedLyrics[index + 1];
    return line.time <= currentTime && (!nextLine || nextLine.time > currentTime);
  });
  const currentLine = currentIndex >= 0 ? parsedLyrics[currentIndex] : null;
  const nextLine = currentIndex >= 0 ? parsedLyrics[currentIndex + 1] : null;

  const lineStart = currentLine ? currentLine.time : 0;
  const rawLineEnd = nextLine ? nextLine.time : lineStart + 6.5;
  const isTitleLine = currentLine ? Math.abs(lineStart - 0) < 0.2 : false;
  const titleEnd = 13.0;
  const isCenterLine = currentLine
    ? Math.abs(lineStart - 0) < 0.2 || Math.abs(lineStart - 23.0) < 0.2
    : false;
  const isSlowSlideLine = currentLine ? Math.abs(lineStart - 45.5) < 0.2 : false;
  const isSlowHoldLine = currentLine ? Math.abs(lineStart - 118.0) < 0.2 : false;
  const lineEnd = isTitleLine
    ? Math.min(titleEnd, rawLineEnd)
    : isSlowSlideLine || isSlowHoldLine
      ? rawLineEnd
      : Math.min(lineStart + 6.5, rawLineEnd);

  const fadeIn = 0.35;
  const fadeOut = 0.6;
  const fadeOutStart = Math.max(lineEnd - fadeOut, lineStart + 0.1);
  const lineOpacity = currentLine
    ? interpolate(
        currentTime,
        [lineStart, lineStart + fadeIn, fadeOutStart, lineEnd],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;
  const lineRise = currentLine
    ? interpolate(
        currentTime,
        [lineStart, lineStart + fadeIn, lineEnd],
        [20, 0, -10],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  const slideStart = 23.0;
  const slideEnd = 210.0;
  const shouldSlide =
    currentLine && lineStart >= slideStart && lineStart <= slideEnd;

  const closeUpTimes = [
    23.0, 92.5, 93.0, 94.0, 97.0, 100.0, 104.0, 105.0, 109.0, 111.0, 115.0,
    153.0, 154.0, 157.0, 160.0, 164.0, 165.0, 169.0, 171.0, 175.0,
  ];
  const isCloseUpLine = currentLine
    ? closeUpTimes.some((time) => Math.abs(lineStart - time) < 0.2)
    : false;
  const isBigCloseUp = currentLine ? Math.abs(lineStart - 23.0) < 0.2 : false;
  const slideX = shouldSlide && !isCloseUpLine
    ? interpolate(
        currentTime,
        [lineStart, lineEnd],
        isSlowSlideLine ? [width * 0.2, -width * 0.2] : [width * 0.35, -width * 0.35],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  const lineScale = isCloseUpLine
    ? (isBigCloseUp
        ? interpolate(currentTime, [lineStart, lineStart + 0.6], [1.0, 1.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        : interpolate(currentTime, [lineStart, lineEnd], [1.02, 1.18], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }))
    : 1;

  const currentPhoto = PHOTO_SEGMENTS.find(
    (segment) => currentTime >= segment.start && currentTime < segment.end
  );
  const photoFade = 0.8;
  const photoOpacity = currentPhoto
    ? interpolate(
        currentTime,
        [
          currentPhoto.start,
          currentPhoto.start + photoFade,
          currentPhoto.end - photoFade,
          currentPhoto.end,
        ],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;
  const photoZoom = currentPhoto
    ? interpolate(currentTime, [currentPhoto.start, currentPhoto.end], [1.02, 1.06], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1.02;

  const isFlashPhoto = currentPhoto?.src === PHOTO_SEGMENTS[0].src;
  const photoFlash = isFlashPhoto
    ? interpolate(currentTime, [currentPhoto.start, currentPhoto.start + 0.12], [0, 0.15], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const isLongLine = currentLine ? currentLine.text.length > 18 : false;
  const lineColor = isBigCloseUp ? "#ffb3d5" : "#ffffff";

  const fontSize = isTitleLine
    ? 84
    : isBigCloseUp
      ? 96
      : isCenterLine
        ? 72
        : isLongLine
          ? 56
          : 64;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0b10", color: "#ffffff" }}>
      {currentPhoto && photoOpacity > 0 && (
        <Img
          src={staticFile(currentPhoto.src)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "110%",
            height: "110%",
            objectFit: "cover",
            transform: `translate(-50%, -50%) scale(${photoZoom})`,
            opacity: photoOpacity,
          }}
        />
      )}

      {photoFlash > 0 && (
        <AbsoluteFill
          style={{
            backgroundColor: "#ffffff",
            opacity: photoFlash,
          }}
        />
      )}

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(7,8,14,0.15) 0%, rgba(7,8,14,0.55) 55%, rgba(7,8,14,0.85) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: isCenterLine ? "50%" : undefined,
          bottom: isCenterLine ? undefined : "10%",
          transform: `translate(-50%, ${lineRise}px) translateX(${slideX}px) scale(${lineScale})`,
          width: "88%",
          maxWidth: 1500,
          textAlign: "center",
          fontFamily: isBigCloseUp
            ? "'Nikumaru', 'Otsutome', 'Soukou Mincho', sans-serif"
            : "'Otsutome', 'Soukou Mincho', serif",
          fontSize,
          letterSpacing: "0.04em",
          lineHeight: 1.45,
          textShadow: "0 6px 22px rgba(0,0,0,0.65)",
          color: lineColor,
          opacity: lineOpacity,
          whiteSpace: "pre-wrap",
        }}
      >
        {currentLine?.text ?? ""}
      </div>

      <Audio src={staticFile(AUDIO_FILE)} />
    </AbsoluteFill>
  );
};
