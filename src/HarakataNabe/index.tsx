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
  { start: 58, end: 65, src: "photo/ハーカタ・ナーベの日常/明太子なべ.png" },
  { start: 65, end: 70, src: "photo/ハーカタ・ナーベの日常/自信満々なべ.png" },
  { start: 70, end: 75, src: "photo/ハーカタ・ナーベの日常/後輩にえばる.png" },
  { start: 75, end: 81, src: "photo/ハーカタ・ナーベの日常/先輩とナベ (2).png" },
  { start: 81, end: 92.5, src: "photo/ハーカタ・ナーベの日常/困惑ナーベ.png" },
  { start: 92.5, end: 97, src: "photo/ハーカタ・ナーベの日常/踊る女性.png" },
  { start: 97, end: 104, src: "photo/ハーカタ・ナーベの日常/藁.png" },
  { start: 104, end: 109, src: "photo/ハーカタ・ナーベの日常/踊る女性.png" },
  { start: 109, end: 111, src: "photo/ハーカタ・ナーベの日常/形見が狭い (2).png" },
  { start: 111, end: 115, src: "photo/ハーカタ・ナーベの日常/チャブジェン.png" },
  { start: 115, end: 118, src: "photo/ハーカタ・ナーベの日常/ナーベ道2.png" },
  { start: 118, end: 124, src: "photo/ハーカタ・ナーベの日常/雑務.png" },
  { start: 124, end: 130, src: "photo/ハーカタ・ナーベの日常/不服そう.png" },
  { start: 132.5, end: 135.5, src: "photo/ハーカタ・ナーベの日常/うわのそら.png" },
  { start: 130, end: 132.5, src: "photo/ハーカタ・ナーベの日常/興奮ナーベ.png" },
  { start: 135.5, end: 141, src: "photo/ハーカタ・ナーベの日常/考え事なべ.png" },
  { start: 141, end: 144, src: "photo/ハーカタ・ナーベの日常/ChatGPT Image 2026年1月31日 06_26_09.png" },
  { start: 144, end: 146.5, src: "photo/ハーカタ・ナーベの日常/ChatGPT Image 2026年1月31日 06_29_52.png" },
  { start: 146.5, end: 149.5, src: "photo/ハーカタ・ナーベの日常/横から.png" },
  { start: 149.5, end: 153, src: "photo/ハーカタ・ナーベの日常/まぬけなべ.png" },
  { start: 153, end: 157, src: "photo/ハーカタ・ナーベの日常/謳う女性２.png" },
  { start: 157, end: 164, src: "photo/ハーカタ・ナーベの日常/先輩とナベ.png" },
  { start: 164, end: 169, src: "photo/ハーカタ・ナーベの日常/謳う女性.png" },
  { start: 169, end: 175, src: "photo/ハーカタ・ナーベの日常/形見が狭い.png" },
  { start: 175, end: 179, src: "photo/ハーカタ・ナーベの日常/ナーベ道2.png" },
  { start: 179, end: 180.375, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 180.375, end: 181.75, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 181.75, end: 183.125, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 183.125, end: 184.5, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 184.5, end: 185.875, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 185.875, end: 187.25, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 187.25, end: 188.625, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 188.625, end: 190, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 190, end: 190.375, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 190.375, end: 190.75, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 190.75, end: 191.125, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 191.125, end: 191.5, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 191.5, end: 191.875, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 191.875, end: 192.25, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 192.25, end: 192.625, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 192.625, end: 193, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 193, end: 193.375, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 193.375, end: 193.75, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 193.75, end: 194.125, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 194.125, end: 194.5, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 194.5, end: 194.875, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 194.875, end: 195.25, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 195.25, end: 195.625, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 195.625, end: 196, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 196, end: 196.1875, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 196.1875, end: 196.375, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 196.375, end: 196.5625, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 196.5625, end: 196.75, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 196.75, end: 196.9375, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 196.9375, end: 197.125, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 197.125, end: 197.3125, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 197.3125, end: 197.5, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 197.5, end: 197.6875, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 197.6875, end: 197.875, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 197.875, end: 198.0625, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 198.0625, end: 198.25, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 198.25, end: 198.4375, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 198.4375, end: 198.625, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 198.625, end: 198.8125, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 198.8125, end: 199, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 199, end: 199.09375, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 199.09375, end: 199.1875, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 199.1875, end: 199.28125, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 199.28125, end: 199.375, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 199.375, end: 199.46875, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 199.46875, end: 199.5625, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 199.5625, end: 199.65625, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 199.65625, end: 199.75, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 199.75, end: 199.84375, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 199.84375, end: 199.9375, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 199.9375, end: 200.03125, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 200.03125, end: 200.125, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 200.125, end: 200.21875, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 200.21875, end: 200.3125, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 200.3125, end: 200.40625, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 200.40625, end: 200.5, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 200.5, end: 200.59375, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 200.59375, end: 200.6875, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 200.6875, end: 200.78125, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 200.78125, end: 200.875, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 200.875, end: 200.96875, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 200.96875, end: 201.0625, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 201.0625, end: 201.15625, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 201.15625, end: 201.25, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 201.25, end: 201.34375, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 201.34375, end: 201.4375, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 201.4375, end: 201.53125, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 201.53125, end: 201.625, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 201.625, end: 201.71875, src: "photo/ハーカタ・ナーベの日常/ドット正面.png", noFade: true },
  { start: 201.71875, end: 201.8125, src: "photo/ハーカタ・ナーベの日常/ドット左.png", noFade: true },
  { start: 201.8125, end: 201.90625, src: "photo/ハーカタ・ナーベの日常/ドット後ろ.png", noFade: true },
  { start: 201.90625, end: 202, src: "photo/ハーカタ・ナーベの日常/ドット→.png", noFade: true },
  { start: 202, end: 205.142857, src: "photo/ハーカタ・ナーベの日常/踊るナベ１.png" },
  { start: 205.142857, end: 208.285714, src: "photo/ハーカタ・ナーベの日常/踊るナベ３.png" },
  { start: 208.285714, end: 211.428571, src: "photo/ハーカタ・ナーベの日常/踊るナベ４.png" },
  { start: 211.428571, end: 214.571428, src: "photo/ハーカタ・ナーベの日常/踊るナベ３.png" },
  { start: 214.571428, end: 217.714285, src: "photo/ハーカタ・ナーベの日常/踊るナベ２.png" },
  { start: 217.714285, end: 220.857142, src: "photo/ハーカタ・ナーベの日常/踊るナベ３.png" },
  { start: 220.857142, end: 224, src: "photo/ハーカタ・ナーベの日常/踊るナベ５.png" },
  { start: 224, end: 230, src: "photo/ハーカタ・ナーベの日常/セネガルの衣装１.png" },
  { start: 230, end: 235, src: "photo/ハーカタ・ナーベの日常/セネガルの衣装３.png" },
  { start: 235, end: 241, src: "photo/ハーカタ・ナーベの日常/セネガルの衣装２.png" },
  { start: 241, end: 251, src: "photo/ハーカタ・ナーベの日常/飛ぶ女性.png" },
  { start: 253.5, end: 260, src: "photo/ハーカタ・ナーベの日常/ナーベ道2.png" },
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
  const isWeeeLine = currentLine ? Math.abs(lineStart - 23.0) < 0.2 : false;
  const weeeLineEnd = 34.0;
  const yassaStyleTimes = [166.0, 171.0, 175.5];
  const isYassaStyleLine = currentLine
    ? yassaStyleTimes.some((time) => Math.abs(lineStart - time) < 0.2)
    : false;
  const isCenterLine = currentLine
    ? Math.abs(lineStart - 0) < 0.2
      || isWeeeLine
      || Math.abs(lineStart - 23.3) < 0.2
      || Math.abs(lineStart - 35.0) < 0.2
      || Math.abs(lineStart - 38.0) < 0.2
    : false;
  const isSlowSlideLine = currentLine ? Math.abs(lineStart - 45.5) < 0.2 : false;
  const isSlowHoldLine = currentLine ? Math.abs(lineStart - 118.0) < 0.2 : false;
  const fullScreenLineStart = 184.0;
  const fullScreenLineEnd = 199.0;
  const isFullScreenLine = currentLine
    ? Math.abs(lineStart - fullScreenLineStart) < 0.2
    : false;
  const lineEnd = isTitleLine
    ? Math.min(titleEnd, rawLineEnd)
    : isWeeeLine
      ? Math.min(weeeLineEnd, rawLineEnd)
      : isFullScreenLine
        ? Math.min(fullScreenLineEnd, rawLineEnd)
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
  const noSlideTimes = [202.0, 213.0];
  const shouldSlide =
    currentLine
    && lineStart >= slideStart
    && lineStart <= slideEnd
    && !noSlideTimes.some((time) => Math.abs(lineStart - time) < 0.2);

  const closeUpTimes = [
    23.3, 35.0, 38.0, 65.0,
    92.5, 93.0, 94.0, 97.0, 100.0, 104.0, 105.0, 109.0, 111.0, 115.0,
    153.0, 154.0, 157.0, 160.0, 164.0, 166.0, 169.0, 171.1, 175.1,
  ];
  const isCloseUpLine = currentLine
    ? closeUpTimes.some((time) => Math.abs(lineStart - time) < 0.2)
    : false;
  const isBigCloseUp = currentLine
    ? [
        23.3, 35.0, 38.0, 65.0, 164.0, 166.0, 169.0, 171.1, 175.1,
      ].some((time) => Math.abs(lineStart - time) < 0.2)
    : false;
  const slideX = shouldSlide && !isCloseUpLine && !isWeeeLine && !isYassaStyleLine
    ? interpolate(
        currentTime,
        [lineStart, lineEnd],
        isSlowSlideLine ? [width * 0.2, -width * 0.2] : [width * 0.35, -width * 0.35],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  const isFont90Line = currentLine
    ? [
        166.0, 171.0, 175.5,
        92.5, 94.0, 97.0, 100.0, 104.0, 105.0, 109.0, 111.0, 115.0,
        153.0, 154.0, 157.0, 160.0, 164.0, 166.0, 169.0, 171.1, 175.1,
        251.0,
      ].some((time) => Math.abs(lineStart - time) < 0.2)
    : false;
  const isDaimanzokuLine = currentLine ? Math.abs(lineStart - 65.0) < 0.2 : false;
  const isChorusBlockLine = currentLine
    ? [164.0, 166.0, 169.0, 171.1, 175.1].some(
        (time) => Math.abs(lineStart - time) < 0.2
      )
    : false;
  const isYassaLine = currentLine ? Math.abs(lineStart - 171.0) < 0.2 : false;
  const daimanzokuHoldEnd = 69.0;
  const lineScale = isWeeeLine
    ? interpolate(currentTime, [lineStart, lineEnd], [1.0, 1.4], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : isCloseUpLine
      ? (isChorusBlockLine || isFont90Line
          ? 1
          : isDaimanzokuLine
            ? interpolate(
                currentTime,
                [lineStart, lineStart + 0.6, daimanzokuHoldEnd],
                [1.0, 1.6, 1.6],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )
            : isBigCloseUp
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
  const basePhotoFade = 0.8;
  const photoOpacity = currentPhoto
    ? currentPhoto.noFade
      ? 1
      : (() => {
          const duration = currentPhoto.end - currentPhoto.start;
          const safeFade = Math.min(basePhotoFade, Math.max(0, duration / 2 - 0.01));
          const fadeInEnd = currentPhoto.start + safeFade;
          const fadeOutStart = currentPhoto.end - safeFade;
          return interpolate(
            currentTime,
            [currentPhoto.start, fadeInEnd, fadeOutStart, currentPhoto.end],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
        })()
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

  const introMoveStart = 23.3;
  const introMoveEnd = 37.0;
  const introMove =
    currentTime >= introMoveStart && currentTime <= introMoveEnd
      ? interpolate(currentTime, [introMoveStart, introMoveEnd], [18, -18], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const isLongLine = currentLine ? currentLine.text.length > 18 : false;
  const isPinkLine = currentLine
    ? Math.abs(lineStart - 23.3) < 0.2 || isWeeeLine
    : false;
  const isNikumaruLine = isPinkLine;
  const isOtsutomeOnlyLine = isChorusBlockLine;
  const lineColor = isPinkLine ? "#ffb3d5" : "#ffffff";

  const fontSize = isTitleLine
    ? 84
    : isWeeeLine
      ? 150
    : isFullScreenLine
      ? 44
    : isFont90Line
      ? 90
    : isBigCloseUp
      ? 96
        : isCenterLine
          ? 72
          : isChorusBlockLine
            ? 52
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
          left: isFullScreenLine ? "0%" : "50%",
          top: isCenterLine || isFullScreenLine ? "50%" : undefined,
          bottom: isCenterLine || isFullScreenLine ? undefined : "10%",
          transform: `translate(${isFullScreenLine ? "0%" : "-50%"}, ${
            lineRise + introMove
          }px) translateX(${slideX}px) scale(${lineScale})`,
          width: isFullScreenLine ? "100%" : "88%",
          maxWidth: isFullScreenLine ? "100%" : 1500,
          padding: isFullScreenLine ? "0 6%" : undefined,
          textAlign: "center",
          fontFamily: isOtsutomeOnlyLine
            ? "'Otsutome', 'Soukou Mincho', serif"
            : isNikumaruLine || isBigCloseUp
              ? "'Nikumaru', 'Otsutome', 'Soukou Mincho', sans-serif"
              : "'Otsutome', 'Soukou Mincho', serif",
          fontSize,
          letterSpacing: "0.04em",
          lineHeight: isFullScreenLine ? 1.6 : 1.45,
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
