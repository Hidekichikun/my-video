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

const LRC_FILE = "lyrics/Seasons.lrc";
const AUDIO_FILE = "music/Seasons.mp3";
const IMAGE_FILE =
  "photo/Seasons/u2944115231_The_same_person_standing_in_the_center_while_the__2675e787-409c-4c32-b906-93beb2c3e0a0_1.png";
const IMAGE_SEGMENTS = [
  {
    start: 0,
    end: 10.7,
    src: "photo/Seasons/u2944115231_A_calm_serene_moment_just_before_dawn_a_person_ge_be553876-f723-4cea-937f-6f422e893154_0.png",
  },
  {
    start: 10.7,
    end: 20.6,
    src: "photo/Seasons/u2944115231_A_serene_anime-style_scene_of_a_person_gently_clo_57c3f6c5-217a-4f7b-b142-38dddb413df6_1.png",
  },
  {
    start: 20.6,
    end: 33.5,
    src: "photo/Seasons/u2944115231_A_warm_gentle_light_quietly_flickering_deep_insid_4a0d1d35-df30-44b9-89e2-5f25fea6a38b_0 (1).png",
  },
  {
    start: 54.9,
    end: 66.9,
    src: "photo/Seasons/u2944115231_A_quiet_night_scene_a_lone_person_standing_slight_42efc1b1-747d-421f-bb41-9730b22e5595_0.png",
  },
  {
    start: 66.9,
    end: 77.0,
    src: "photo/Seasons/u2944115231_A_calm_serene_moment_just_before_dawn_a_person_ge_be553876-f723-4cea-937f-6f422e893154_1.png",
  },
  {
    start: 77.0,
    end: 89.7,
    src: "photo/Seasons/u2944115231_A_quiet_night_scene_a_lone_person_standing_slight_b491d210-4354-463f-8046-ee1163e1d0fd_2.png",
  },
  {
    start: 89.7,
    end: 110.5,
    src: "photo/Seasons/u2944115231_The_same_person_standing_in_the_center_while_the__2675e787-409c-4c32-b906-93beb2c3e0a0_2.png",
  },
  {
    start: 110.5,
    end: 131.49,
    src: "photo/Seasons/u2944115231_A_peaceful_nighttime_landscape_above_ground_quiet_48535238-ba30-4562-9a86-630c1a4c352e_3.png",
  },
  {
    start: 131.49,
    end: 141.57,
    src: "photo/Seasons/u2944115231_A_quiet_emotional_anime-style_scene_set_in_darkne_2347af5d-2ae3-4bbd-88b1-b70b2465b1bb_3.png",
  },
  {
    start: 141.57,
    end: 151.9,
    src: "photo/Seasons/u2944115231_A_warm_life-filled_scene_inside_the_soil_a_small__09ff0bbb-5c12-4390-9155-d81032f43faa_2.png",
  },
  {
    start: 151.9,
    end: 161.9,
    src: "photo/Seasons/u2944115231_A_serene_emotional_scene_showing_invisible_connec_19d8d7ee-398a-4daf-8d82-db9d1d32c7e0_1.png",
  },
  {
    start: 161.9,
    end: 182.5,
    src: "photo/Seasons/u2944115231_The_same_person_standing_in_the_center_while_the__2675e787-409c-4c32-b906-93beb2c3e0a0_3.png",
  },
  {
    start: 182.5,
    end: 999999,
    src: "photo/Seasons/u2944115231_A_person_walking_forward_confidently_while_gently_a5b9f4e8-93c3-4072-80db-d813e1cdc6c9_1.png",
  },
];

const loadSeasonsFonts = async () => {
  const fonts = [
    new FontFace(
      "Totono Glitch Mincho",
      `url(${staticFile("fonts/TotonoGlitchMincho.otf")}) format("opentype")`
    ),
    new FontFace(
      "Soukou Mincho",
      `url(${staticFile("fonts/SoukouMincho.ttf")}) format("truetype")`
    ),
  ];

  await Promise.all(
    fonts.map(async (font) => {
      const loaded = await font.load();
      document.fonts.add(loaded);
    })
  );
};

export const Seasons: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [lrcContent, setLrcContent] = useState<string | null>(null);
  const [fontHandle] = useState(() => delayRender("seasons-fonts"));

  useEffect(() => {
    loadSeasonsFonts()
      .catch((err) => console.error("Failed to load Seasons fonts:", err))
      .finally(() => continueRender(fontHandle));
  }, [fontHandle]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(staticFile(LRC_FILE), { signal: controller.signal })
      .then((res) => res.text())
      .then((text) => setLrcContent(text))
      .catch((err) => {
        if ((err as any)?.name === "AbortError") return;
        console.error("Failed to load Seasons LRC:", err);
        setLrcContent("");
      });

    return () => controller.abort();
  }, []);

  const parsedLyrics = useMemo(() => {
    return lrcContent ? parseLrc(lrcContent) : [];
  }, [lrcContent]);

  const currentTime = frame / fps;
  const currentSegmentIndex = IMAGE_SEGMENTS.findIndex(
    (segment) => currentTime >= segment.start && currentTime < segment.end
  );
  const currentSegment = currentSegmentIndex >= 0 ? IMAGE_SEGMENTS[currentSegmentIndex] : null;
  const nextSegment = currentSegmentIndex >= 0 ? IMAGE_SEGMENTS[currentSegmentIndex + 1] : null;
  const currentImage = currentSegment?.src || IMAGE_FILE;
  const imageFadeDuration = 0.5;
  const isFadingToNext =
    currentSegment && nextSegment && currentTime >= currentSegment.end - imageFadeDuration;
  const imageFadeProgress = isFadingToNext
    ? interpolate(currentTime, [currentSegment.end - imageFadeDuration, currentSegment.end], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const currentImageOpacity = isFadingToNext ? 1 - imageFadeProgress : 1;
  const nextImageOpacity = isFadingToNext ? imageFadeProgress : 0;
  const currentIndex = parsedLyrics.findIndex((line, index) => {
    const nextLine = parsedLyrics[index + 1];
    return line.time <= currentTime && (!nextLine || nextLine.time > currentTime);
  });
  const currentLine = currentIndex >= 0 ? parsedLyrics[currentIndex] : null;
  const nextLine = currentIndex >= 0 ? parsedLyrics[currentIndex + 1] : null;
  const prevLine = currentIndex > 0 ? parsedLyrics[currentIndex - 1] : null;

  const lineStart = currentLine ? currentLine.time * fps : 0;
  const lineEnd = currentLine
    ? (nextLine ? nextLine.time * fps : lineStart + fps * 4)
    : 0;
  const lineOpacity = currentLine ? 1 : 0;
  const isLyricsHiddenSegment = currentTime >= 110.5 && currentTime < 131.49;
  const endFadeStart = 186;
  const endFadeEnd = 190;
  const endFade =
    currentTime >= endFadeStart
      ? interpolate(currentTime, [endFadeStart, endFadeEnd], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const lyricsOpacity = isLyricsHiddenSegment ? 0 : lineOpacity * endFade;

  const lineGap = 120;
  const reelDuration = Math.max(6, Math.round(fps * 0.25));
  const reelOvershootFrame = Math.max(1, Math.round(reelDuration * 0.7));
  const reelShift = currentLine
    ? interpolate(
        frame,
        [lineStart, lineStart + reelOvershootFrame, lineStart + reelDuration],
        [lineGap, -8, 0],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.quad),
        }
      )
    : 0;
  const reelTransform = (offset: number) => {
    const rotate = interpolate(offset, [-lineGap, 0, lineGap], [45, 0, -45], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const scale = interpolate(Math.abs(offset), [0, lineGap], [1, 0.9], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return `translateY(${offset}px) rotateX(${rotate}deg) scale(${scale})`;
  };

  const driftX = Math.sin(frame / fps / 5) * 10;
  const driftY = Math.cos(frame / fps / 6) * 12;
  const zoom = interpolate(frame, [0, durationInFrames], [1.03, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0b0f", color: "#f7f3e9" }}>
      <Img
        src={staticFile(currentImage)}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "110%",
          height: "110%",
          objectFit: "cover",
          transform: `translate(-50%, -50%) scale(${zoom}) translate(${driftX}px, ${driftY}px)`,
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
            transform: `translate(-50%, -50%) scale(${zoom}) translate(${driftX}px, ${driftY}px)`,
            opacity: nextImageOpacity,
          }}
        />
      )}

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,14,0.2) 0%, rgba(8,8,14,0.55) 55%, rgba(8,8,14,0.85) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "86%",
          maxWidth: 1500,
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            height: lineGap * 3,
            overflow: "hidden",
            perspective: 900,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: lineGap,
              left: 0,
              right: 0,
              height: lineGap,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Soukou Mincho', serif",
              fontSize: 36,
              letterSpacing: "0.08em",
              color: "#f7f3e9",
              opacity: prevLine ? lyricsOpacity * 0.4 : 0,
              textShadow: "0 4px 16px rgba(0,0,0,0.45)",
              transform: reelTransform(-lineGap + reelShift),
              transformOrigin: "center center",
            }}
          >
            {prevLine?.text ?? ""}
          </div>
          <div
            style={{
              position: "absolute",
              top: lineGap,
              left: 0,
              right: 0,
              height: lineGap,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: currentLine?.isChorus ? "'Totono Glitch Mincho', serif" : "'Soukou Mincho', serif",
              fontSize: currentLine?.isChorus ? 86 : 76,
              letterSpacing: currentLine?.isChorus ? "0.08em" : "0.04em",
              lineHeight: 1.2,
              color: "#ffffff",
              textShadow: currentLine?.isChorus
                ? "0 0 26px rgba(255, 232, 210, 0.75), 0 8px 26px rgba(0,0,0,0.45)"
                : "0 6px 20px rgba(0,0,0,0.55)",
              opacity: currentLine ? lyricsOpacity : 0,
              transform: reelTransform(reelShift),
              transformOrigin: "center center",
            }}
          >
            {currentLine?.text ?? ""}
          </div>
          <div
            style={{
              position: "absolute",
              top: lineGap,
              left: 0,
              right: 0,
              height: lineGap,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Soukou Mincho', serif",
              fontSize: 40,
              letterSpacing: "0.08em",
              color: "#f7f3e9",
              opacity: nextLine ? lyricsOpacity * 0.4 : 0,
              textShadow: "0 4px 16px rgba(0,0,0,0.45)",
              transform: reelTransform(lineGap + reelShift),
              transformOrigin: "center center",
            }}
          >
            {nextLine?.text ?? ""}
          </div>
        </div>
      </div>

      <Audio src={staticFile(AUDIO_FILE)} />
    </AbsoluteFill>
  );
};
