import React, { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { parseLrc } from "../utils/lrc-parser";

const LRC_FILE = "lyrics/SETSUBUNN.lrc";
const AUDIO_FILE = "music/SETSUBUNN.mp3";

// Image segments for different parts of the song
const IMAGE_SEGMENTS = [
  {
    start: 0,
    end: 20.0,
    src: "photo/SETSUBUNN/setsu-01.png",
  },
  {
    start: 20.0,
    end: 34.0,
    src: "photo/SETSUBUNN/setsu-02.png",
  },
  {
    start: 34.0,
    end: 44.5,
    src: "photo/SETSUBUNN/setsu-03.png",
    offsetY: 60,
  },
  {
    start: 44.5,
    end: 55.0,
    src: "photo/SETSUBUNN/setsu-04.png",
  },
  {
    start: 55.0,
    end: 65.0,
    src: "photo/SETSUBUNN/setsu-05.png",
    offsetY: 60,
  },
  {
    start: 65.0,
    end: 75.0,
    src: "photo/SETSUBUNN/setsu-06.png",
    offsetY: 60,
  },
  {
    start: 75.0,
    end: 85.5,
    src: "photo/SETSUBUNN/setsu-07.png",
  },
  {
    start: 85.5,
    end: 96.0,
    src: "photo/SETSUBUNN/setsu-08.png",
  },
  {
    start: 96.0,
    end: 109.0,
    src: "photo/SETSUBUNN/setsu-09.png",
    offsetY: 60,
  },
  {
    start: 109.0,
    end: 119.5,
    src: "photo/SETSUBUNN/setsu-10.png",
  },
  {
    start: 119.5,
    end: 129.5,
    src: "photo/SETSUBUNN/setsu-11.png",
    offsetY: 60,
  },
  {
    start: 129.5,
    end: 139.6,
    src: "photo/SETSUBUNN/setsu-12.png",
  },
  {
    start: 139.6,
    end: 150.5,
    src: "photo/SETSUBUNN/setsu-13.png",
  },
  {
    start: 150.5,
    end: 156.0,
    src: "photo/SETSUBUNN/setsu-14.png",
  },
  {
    start: 156.0,
    end: 159.6,
    src: "photo/SETSUBUNN/setsu-15.png",
  },
  {
    start: 159.6,
    end: 178.5,
    src: "photo/SETSUBUNN/setsu-16.png",
    scale: 1.25,
    offsetY: 175,
  },
];

const loadSetsubunnFonts = async () => {
  const fonts = [
    new FontFace(
      "ZenInShugo Pop Kanji",
      `url(${staticFile("fonts/ZenInShugoPopKanji.ttf")}) format("truetype")`
    ),
    new FontFace(
      "KLSMARU",
      `url(${staticFile("fonts/klsmaru.otf")}) format("opentype")`
    ),
    new FontFace(
      "ZenInShugo Pop",
      `url(${staticFile("fonts/ZenInShugoPop.ttf")}) format("truetype")`
    ),
  ];

  await Promise.all(
    fonts.map(async (font) => {
      const loaded = await font.load();
      document.fonts.add(loaded);
    })
  );
};

export const Setsubunn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender("setsubunn-fonts"));

  useEffect(() => {
    loadSetsubunnFonts()
      .catch((err) => console.error("Failed to load Setsubunn fonts:", err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(staticFile(LRC_FILE), { signal: controller.signal })
      .then((res) => res.text())
      .then((text) => setLrcContent(text))
      .catch((err) => {
        if ((err as any)?.name === "AbortError") return;
        console.error("Failed to load Setsubunn LRC:", err);
        setLrcContent("");
      });

    return () => controller.abort();
  }, []);

  const parsedLyrics = useMemo(() => {
    return lrcContent ? parseLrc(lrcContent) : [];
  }, [lrcContent]);

  const currentTime = frame / fps;

  // Image switching with crossfade
  const currentSegmentIndex = IMAGE_SEGMENTS.findIndex(
    (segment) => currentTime >= segment.start && currentTime < segment.end
  );
  const currentSegment = currentSegmentIndex >= 0 ? IMAGE_SEGMENTS[currentSegmentIndex] : null;
  const nextSegment = currentSegmentIndex >= 0 ? IMAGE_SEGMENTS[currentSegmentIndex + 1] : null;
  const currentImage = currentSegment?.src || IMAGE_SEGMENTS[0].src;
  const defaultOffsetY = 60;
  const currentOffsetY = currentSegment?.offsetY ?? defaultOffsetY;
  const nextOffsetY = nextSegment?.offsetY ?? defaultOffsetY;
  const currentScale = currentSegment?.scale ?? 1;
  const nextScale = nextSegment?.scale ?? 1;

  const imageFadeDuration = 0.6;
  const isFadingToNext =
    currentSegment && nextSegment && currentTime >= currentSegment.end - imageFadeDuration;
  const imageFadeProgress = isFadingToNext
    ? interpolate(
        currentTime,
        [currentSegment.end - imageFadeDuration, currentSegment.end],
        [0, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }
      )
    : 0;

  const currentImageOpacity = isFadingToNext ? 1 - imageFadeProgress : 1;
  const nextImageOpacity = isFadingToNext ? imageFadeProgress : 0;

  // Lyric display logic
  const currentIndex = parsedLyrics.findIndex((line, index) => {
    const nextLine = parsedLyrics[index + 1];
    return line.time <= currentTime && (!nextLine || nextLine.time > currentTime);
  });

  const currentLine = currentIndex >= 0 ? parsedLyrics[currentIndex] : null;
  const nextLine = currentIndex >= 0 ? parsedLyrics[currentIndex + 1] : null;
  const prevLine = currentIndex > 0 ? parsedLyrics[currentIndex - 1] : null;

  const lineStart = currentLine ? currentLine.time * fps : 0;

  // Bouncy animation for lyrics - perfect for energetic Setsubun theme!
  const bounceIn = currentLine
    ? interpolate(
        frame,
        [lineStart, lineStart + 8, lineStart + 15],
        [0, 1.15, 1],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        }
      )
    : 0;

  const lineOpacity = currentLine
    ? interpolate(frame, [lineStart, lineStart + 5], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Bean throwing effect - playful floating beans during chorus
  const isChorus = currentLine?.text.includes("鬼は外") || currentLine?.text.includes("福は内");
  const beanFloat = Math.sin(frame / 15) * 10;

  // Background color based on mood - red/orange for energetic parts, softer for dialogue
  const isDialogue = currentLine?.text.includes("「") || currentLine?.text.includes("？");
  const bgColor = "#000000";

  // Zoom and drift for image
  const driftX = Math.sin(frame / fps / 4) * 15;
  const driftY = Math.cos(frame / fps / 5) * 12;
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.04], {
    extrapolateRight: "clamp",
  });
  const currentZoom = zoom * currentScale;
  const nextZoom = zoom * nextScale;

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor }}>
      {/* Background image */}
      <Img
        src={staticFile(currentImage)}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "110%",
          height: "110%",
          objectFit: "cover",
          transform: `translate(-50%, -50%) scale(${currentZoom}) translate(${driftX}px, ${driftY + currentOffsetY}px)`,
          opacity: currentImageOpacity,
        }}
      />
      {isFadingToNext && nextSegment && (
        <Img
          src={staticFile(nextSegment.src)}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "110%",
            height: "110%",
            objectFit: "cover",
            transform: `translate(-50%, -50%) scale(${nextZoom}) translate(${driftX}px, ${driftY + nextOffsetY}px)`,
            opacity: nextImageOpacity,
          }}
        />
      )}

      {/* Gradient overlay for text readability */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(255,235,235,0.1) 0%, rgba(255,235,235,0.4) 60%, rgba(255,235,235,0.75) 100%)",
        }}
      />

      {/* Decorative beans floating during chorus */}
      {isChorus && (
        <>
          <div
            style={{
              position: "absolute",
              top: `${15 + beanFloat}%`,
              left: "10%",
              fontSize: 48,
              opacity: 0.6,
            }}
          >
            🫘
          </div>
          <div
            style={{
              position: "absolute",
              top: `${20 - beanFloat}%`,
              right: "15%",
              fontSize: 40,
              opacity: 0.5,
            }}
          >
            🫘
          </div>
          <div
            style={{
              position: "absolute",
              top: `${25 + beanFloat * 0.7}%`,
              right: "25%",
              fontSize: 44,
              opacity: 0.55,
            }}
          >
            🫘
          </div>
        </>
      )}

      {/* Lyrics container */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: 1600,
          textAlign: "center",
        }}
      >
        {/* Previous line (subtle) */}
        <div
          style={{
            fontFamily: "'ZenInShugo Pop Kanji', 'KLSMARU', 'Hiragino Kaku Gothic Pro', sans-serif",
            fontSize: 32,
            letterSpacing: "0.1em",
            color: "#666",
            opacity: prevLine ? 0.35 : 0,
            marginBottom: 20,
            textShadow: "0 2px 8px rgba(255,255,255,0.8)",
          }}
        >
          {prevLine?.text ?? ""}
        </div>

        {/* Current line (main) */}
        <div
          style={{
            fontFamily: isChorus
              ? "'ZenInShugo Pop Kanji', 'ZenMaru Pop', 'KLSMARU', sans-serif"
              : "'ZenInShugo Pop Kanji', 'KLSMARU', 'Hiragino Kaku Gothic Pro', sans-serif",
            fontSize: isChorus ? 88 : isDialogue ? 68 : 72,
            fontWeight: isChorus ? "bold" : "normal",
            letterSpacing: isChorus ? "0.08em" : "0.06em",
            lineHeight: 1.3,
            color: isChorus ? "#ff4444" : isDialogue ? "#555" : "#333",
            opacity: lineOpacity,
            transform: `scale(${bounceIn})`,
            textShadow: isChorus
              ? "0 0 20px rgba(255, 68, 68, 0.5), 0 6px 24px rgba(0,0,0,0.3), 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff"
              : "0 4px 16px rgba(0,0,0,0.2), 1px 1px 0 #fff, -1px -1px 0 #fff",
            WebkitTextStroke: isChorus ? "2px white" : "0",
          }}
        >
          {currentLine?.text ?? ""}
        </div>

        {/* Next line (preview) */}
        <div
          style={{
            fontFamily: "'ZenInShugo Pop Kanji', 'KLSMARU', 'Hiragino Kaku Gothic Pro', sans-serif",
            fontSize: 36,
            letterSpacing: "0.1em",
            color: "#888",
            opacity: nextLine ? 0.4 : 0,
            marginTop: 24,
            textShadow: "0 2px 8px rgba(255,255,255,0.8)",
          }}
        >
          {nextLine?.text ?? ""}
        </div>
      </div>

      <Audio src={staticFile(AUDIO_FILE)} />
    </AbsoluteFill>
  );
};
