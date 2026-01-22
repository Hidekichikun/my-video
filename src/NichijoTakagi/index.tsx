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

const LRC_FILE = "lyrics/日常の守り人、高木さん.lrc";
const AUDIO_FILE = "music/日常の守り人、高木さん.mp3";
const IMAGE_DIR = "photo/日常の守り人、高木さん";
const SPECIAL_FONT_FILE = "fonts/SoukouMincho.ttf";

type ImageSegment = {
  start: number;
  end: number;
  src?: string;
  fadeIn?: number;
};

const IMAGE_OFFSETS: Record<string, { x?: number; y?: number }> = {
  [`${IMAGE_DIR}/ChatGPT Image 2026年1月21日 09_48_39.png`]: { y: 40 },
};

const buildAlternatingSegments = (
  start: number,
  end: number,
  sources: string[],
  interval: number
): ImageSegment[] => {
  const segments: ImageSegment[] = [];
  let time = start;
  let index = 0;
  while (time < end) {
    const next = Math.min(time + interval, end);
    segments.push({ start: time, end: next, src: sources[index % sources.length] });
    time = next;
    index += 1;
  }
  return segments;
};

const buildSequenceSegments = (
  start: number,
  end: number,
  sources: string[]
): ImageSegment[] => {
  const span = end - start;
  const step = span / sources.length;
  return sources.map((src, index) => ({
    start: start + step * index,
    end: index === sources.length - 1 ? end : start + step * (index + 1),
    src,
  }));
};

const BASE_SEGMENTS: ImageSegment[] = [
  { start: 0, end: 11, src: `${IMAGE_DIR}/馬車.png`, fadeIn: 4.0 },
  { start: 11, end: 22.5, src: `${IMAGE_DIR}/ChatGPT Image 2026年1月15日 14_57_27.png` },
  { start: 22.5, end: 34, src: `${IMAGE_DIR}/高木さん.png` },
  { start: 34, end: 45, src: `${IMAGE_DIR}/頭をかく高木さん.png` },
  { start: 45, end: 55.5, src: `${IMAGE_DIR}/やさしい高木16.png` },
  { start: 55.5, end: 57.22 },
  { start: 57.22, end: 59.5, src: `${IMAGE_DIR}/ChatGPT Image 2026年1月21日 09_44_06.png` },
  { start: 59.5, end: 68, src: `${IMAGE_DIR}/正面を向いて歌う16.png` },
  { start: 68, end: 79.5, src: `${IMAGE_DIR}/左向き16.png` },
];

const HEADBANG_IMAGES = [
  `${IMAGE_DIR}/ヘドバンマイク.png`,
  `${IMAGE_DIR}/ヘドバン上がる.png`,
  `${IMAGE_DIR}/ヘドバン16.png`,
  `${IMAGE_DIR}/ヘドバン上がる.png`,
  `${IMAGE_DIR}/ヘドバン深い16.png`,
];

const DOT_IMAGES = [
  `${IMAGE_DIR}/動画用ドット１.png`,
  `${IMAGE_DIR}/動画用ドット２.png`,
  `${IMAGE_DIR}/動画用ドット３.png`,
  `${IMAGE_DIR}/動画用ドット４.png`,
  `${IMAGE_DIR}/動画用ドット５.png`,
];

const MONTAGE_IMAGES = [
  `${IMAGE_DIR}/クワを担いだ.png`,
  `${IMAGE_DIR}/牧割り.png`,
  `${IMAGE_DIR}/ChatGPT Image 2026年1月20日 14_38_50.png`,
  `${IMAGE_DIR}/談笑.png`,
  `${IMAGE_DIR}/ChatGPT Image 2026年1月21日 09_48_42.png`,
  `${IMAGE_DIR}/ChatGPT Image 2026年1月21日 14_45_44.png`,
  `${IMAGE_DIR}/ChatGPT Image 2026年1月21日 09_48_39.png`,
  `${IMAGE_DIR}/耕す.png`,
];

const IMAGE_SEGMENTS: ImageSegment[] = [
  ...BASE_SEGMENTS,
  ...buildSequenceSegments(79.5, 85, HEADBANG_IMAGES),
  ...buildSequenceSegments(85, 90.2, DOT_IMAGES),
  { start: 90.2, end: 101.5, src: `${IMAGE_DIR}/おばあさんを添えて.png` },
  { start: 101.5, end: 107, src: `${IMAGE_DIR}/片足.png` },
  { start: 107, end: 113.06, src: `${IMAGE_DIR}/慰め高木.png` },
  { start: 113, end: 114 },
  { start: 114, end: 116.2, src: `${IMAGE_DIR}/下を向く16.png` },
  { start: 116.2, end: 121, src: `${IMAGE_DIR}/正面で歌う.png` },
  { start: 121, end: 127.2, src: `${IMAGE_DIR}/後ろ姿16.png` },
  { start: 127.2, end: 137.5, src: `${IMAGE_DIR}/胸にこぶしを.png` },
  { start: 137.5, end: 143.5, src: `${IMAGE_DIR}/足だけ.png` },
  { start: 143.5, end: 150.0, src: `${IMAGE_DIR}/目を閉じてささやき.png` },
  { start: 150.0, end: 155.0 },
  { start: 155.0, end: 158.0, src: `${IMAGE_DIR}/横から.png` },
  { start: 158.0, end: 163.5, src: `${IMAGE_DIR}/ささやき.png` },
  { start: 163.5, end: 173, src: `${IMAGE_DIR}/左向きに胸に手を当てる.png` },
  ...buildSequenceSegments(173, 196, MONTAGE_IMAGES),
  { start: 196, end: 210, src: `${IMAGE_DIR}/ささやき系16.png` },
];

const normalizeTakagiLrc = (lrc: string) =>
  lrc.replace(/\[(\d{1,2}):(\d{2}):(\d{2})\]/g, "[$1:$2.$3]");

const loadTakagiFonts = async () => {
  const hanazome = new FontFace(
    "Takagi Hanazome",
    `url(${staticFile("fonts/Hanazome.ttf")}) format("truetype")`,
    {
      unicodeRange:
        "U+3000-303F, U+3040-309F, U+30A0-30FF, U+31F0-31FF, U+3400-4DBF, U+4E00-9FFF, U+F900-FAFF",
    }
  );
  const soukou = new FontFace(
    "Soukou Mincho",
    `url(${staticFile("fonts/SoukouMincho.ttf")}) format("truetype")`
  );
  const special = new FontFace(
    "Takagi Special",
    `url(${staticFile(SPECIAL_FONT_FILE)}) format("truetype")`
  );
  const loaded = await Promise.all([hanazome.load(), soukou.load(), special.load()]);
  loaded.forEach((font) => document.fonts.add(font));
};

export const NichijoTakagi: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender("nichijo-takagi-fonts"));

  useEffect(() => {
    loadTakagiFonts()
      .catch((err) => console.error("Failed to load Takagi fonts:", err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(staticFile(LRC_FILE), { signal: controller.signal })
      .then((res) => res.text())
      .then((text) => setLrcContent(text))
      .catch((err) => {
        if ((err as any)?.name === "AbortError") return;
        console.error("Failed to load Takagi LRC:", err);
        setLrcContent("");
      });

    return () => controller.abort();
  }, []);

  const parsedLyrics = useMemo(
    () => (lrcContent ? parseLrc(normalizeTakagiLrc(lrcContent)) : []),
    [lrcContent]
  );
  const currentTime = frame / fps;

  const currentSegmentIndex = IMAGE_SEGMENTS.findIndex(
    (segment) => currentTime >= segment.start && currentTime < segment.end
  );
  const currentSegment =
    currentSegmentIndex >= 0 ? IMAGE_SEGMENTS[currentSegmentIndex] : IMAGE_SEGMENTS[0];
  const nextSegment =
    currentSegmentIndex >= 0 ? IMAGE_SEGMENTS[currentSegmentIndex + 1] : null;
  const currentOffset = currentSegment?.src ? IMAGE_OFFSETS[currentSegment.src] : undefined;
  const nextOffset = nextSegment?.src ? IMAGE_OFFSETS[nextSegment.src] : undefined;

  const fadeDuration = 0.6;
  const isTransition =
    currentSegment && nextSegment && currentTime >= currentSegment.end - fadeDuration;
  const transitionProgress = isTransition
    ? interpolate(
        currentTime,
        [currentSegment.end - fadeDuration, currentSegment.end],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  const baseOpacity = currentSegment?.fadeIn
    ? interpolate(
        currentTime,
        [currentSegment.start, currentSegment.start + currentSegment.fadeIn],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;
  const currentOpacity = (isTransition ? 1 - transitionProgress : 1) * baseOpacity;
  const nextOpacity = isTransition ? transitionProgress : 0;

  const currentIndex = parsedLyrics.findIndex((line, index) => {
    const nextLine = parsedLyrics[index + 1];
    return line.time <= currentTime && (!nextLine || nextLine.time > currentTime);
  });
  const currentLine = currentIndex >= 0 ? parsedLyrics[currentIndex] : null;
  const nextLine = currentIndex >= 0 ? parsedLyrics[currentIndex + 1] : null;
  const lineStart = currentLine ? currentLine.time : 0;
  const rawLineEnd = nextLine ? nextLine.time : lineStart + 7;
  const lineEnd = Math.min(lineStart + 7, rawLineEnd);

  const fadeInDuration = 0.4;
  const fadeOutDuration = 0.6;
  const fadeOutStart = Math.max(lineEnd - fadeOutDuration, lineStart + 0.1);
  const lineOpacity = currentLine
    ? interpolate(
        currentTime,
        [lineStart, lineStart + fadeInDuration, fadeOutStart, lineEnd],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;
  const lineFloat = currentLine
    ? interpolate(
        currentTime,
        [lineStart, lineStart + fadeInDuration, lineEnd],
        [20, 0, -12],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;
  const stylishTimes = [
    60.2, 62.5, 65.5, 68.8, 71.0, 74.5, 118.5, 121.0, 124.0, 127.2, 130.0, 133.7,
    155.0, 158.0, 161.0, 163.5, 167.0, 170.0,
  ];
  const isStylishLine = currentLine
    ? stylishTimes.some((time) => Math.abs(lineStart - time) < 0.25)
    : false;
  const isTitleLine = currentLine?.text.trim() === "日常の守り人、高木さん";
  const isEnglishLine = currentLine ? /[A-Za-z]/.test(currentLine.text) : false;
  const lineFontSize = isEnglishLine
    ? 78
    : isTitleLine
      ? 88
      : isStylishLine
        ? 72
        : 64;
  const lineBottom = isEnglishLine ? "22%" : "10%";
  const titleLoopDuration = 3.5;
  const titleLoopProgress = isTitleLine
    ? ((currentTime - lineStart) % titleLoopDuration) / titleLoopDuration
    : 0;
  const titleSlide = isTitleLine
    ? interpolate(titleLoopProgress, [0, 1], [width * 0.8, -width * 0.8], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const lineTransform = isTitleLine
    ? `translate(-50%, -50%) translate(${titleSlide}px, ${lineFloat}px)`
    : `translate(-50%, ${lineFloat}px)`;

  const driftX = Math.sin(currentTime / 6) * 8;
  const driftY = Math.cos(currentTime / 7) * 10;
  const driftXWithOffset = driftX + (currentOffset?.x ?? 0);
  const driftYWithOffset = driftY + (currentOffset?.y ?? 0);
  const nextDriftXWithOffset = driftX + (nextOffset?.x ?? 0);
  const nextDriftYWithOffset = driftY + (nextOffset?.y ?? 0);
  const zoom = interpolate(currentTime, [0, 210], [1.02, 1.07], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0c10", color: "#f4f0e7" }}>
      {currentSegment?.src && (
        <Img
          src={staticFile(currentSegment.src)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "110%",
            height: "110%",
            objectFit: "cover",
            transform: `translate(-50%, -50%) scale(${zoom}) translate(${driftXWithOffset}px, ${driftYWithOffset}px)`,
            opacity: currentOpacity,
          }}
        />
      )}
      {isTransition && nextSegment?.src && (
        <Img
          src={staticFile(nextSegment.src)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "110%",
            height: "110%",
            objectFit: "cover",
            transform: `translate(-50%, -50%) scale(${zoom}) translate(${nextDriftXWithOffset}px, ${nextDriftYWithOffset}px)`,
            opacity: nextOpacity,
          }}
        />
      )}

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(6,6,10,0.2) 0%, rgba(6,6,10,0.5) 55%, rgba(6,6,10,0.85) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: isTitleLine ? "50%" : undefined,
          bottom: isTitleLine ? undefined : lineBottom,
          left: "50%",
          transform: lineTransform,
          width: "88%",
          maxWidth: 1500,
          textAlign: "center",
          fontFamily: isStylishLine || isTitleLine
            ? "'Takagi Special', 'Soukou Mincho', 'Takagi Hanazome', serif"
            : "'Takagi Hanazome', 'Soukou Mincho', serif",
          fontSize: lineFontSize,
          letterSpacing: "0.04em",
          lineHeight: 1.4,
          color: "#ffffff",
          textShadow: "0 6px 22px rgba(0,0,0,0.65)",
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
