import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const LOGO_FILE = "photo/lumia/title-logo.png";
const SCENE1_FILE = "movie/lumia-scene1.mp4";
const SCENE2_FILE = "movie/lumia-scene2.mp4";
const BGM_FILE = "music/fire-in-my-senses-piano.mp3";

// --- Title card -----------------------------------------------------------
// The scene 1 source already opens on its own logo card, but that one is
// burned in with a typo (「滑りり台大作戦」). We skip past it and rebuild the
// card from the clean logo artwork instead, matching the original pull-back
// so the join into the water-swirl transition stays invisible.
const LOGO_IN_END = 20;
const SHINE_START = 36;
const SHINE_END = 78;
const BLOOM_START = 56;
const TITLE_OUT_END = 102;

// --- Scene 1 --------------------------------------------------------------
const S1_START = 84;
// 83 frames @30fps = 2.767s of source skipped: the typo card plus the first
// beat of the swirl, so the video re-enters just as the logo has dissolved.
const S1_TRIM = 83;
const S1_LEN = 368;

// --- Scene 2 --------------------------------------------------------------
const S2_START = S1_START + S1_LEN; // 452
// 68 frames @30fps = 2.267s of source skipped. That drops the whole opening
// diagram shot - the arrows and scattered props - and lands exactly on the cut
// to the front-facing framing, so nothing is sliced mid-shot. It also takes the
// storyboard shot-number badge (①) with it, which is why no crop is needed.
const S2_TRIM = 68;
const S2_LEN = 382;
const S2_END = S2_START + S2_LEN; // 834

// --- Scene 1 to scene 2: dip to white -------------------------------------
// Scene 1 fades out, the frame sits white for a beat, then scene 2 fades in.
const DIP_IN = S2_START - 20;
const DIP_FULL_START = S2_START - 2;
const DIP_FULL_END = S2_START + 4;
const DIP_OUT = S2_START + 26;

// --- End card -------------------------------------------------------------
// Everything trimmed off scene 2 is handed to the end card, so the logo holds
// roughly 5.5s instead of 3.7s.
const END_BLOOM_START = S2_END - 14;
const END_LOGO_IN = S2_END + 2;
const END_LOGO_HELD = S2_END + 32;
export const LUMIA_DURATION = 1000;

// --- BGM ------------------------------------------------------------------
// "Fire in my senses (piano)" runs 204s. It goes fully silent from 44.45s and
// lands its strongest downbeat at 45.10s, so we align that hit to the frame
// scene 2 cuts in. That also drops the track's other hush (35.7s-37.2s) right
// where scene 1's own splash SFX take over, so the two never fight.
const BGM_HIT_SECONDS = 45.1;
const BGM_START_SECONDS = BGM_HIT_SECONDS - S2_START / 30;

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  const cardOpacity = interpolate(frame, [S1_START, TITLE_OUT_END], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Slow pull-back, continuing straight into the source clip's own framing.
  const scale = interpolate(frame, [0, TITLE_OUT_END], [1.06, 0.94], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });

  const logoOpacity =
    interpolate(frame, [0, LOGO_IN_END], [0, 1], {
      extrapolateRight: "clamp",
    }) *
    interpolate(frame, [BLOOM_START + 10, TITLE_OUT_END - 12], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  // Light sweeping across the strokes, landing on the piano's entry.
  const shine = interpolate(frame, [SHINE_START, SHINE_END], [-70, 170], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shineOpacity = interpolate(
    frame,
    [SHINE_START, SHINE_START + 8, SHINE_END - 10, SHINE_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const bloom = interpolate(frame, [BLOOM_START, TITLE_OUT_END], [0, 1], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: cardOpacity, isolation: "isolate" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 46%, #ffffff 0%, #ffffff 58%, #f4fbfe 100%)",
        }}
      />

      {/* The blend has to sit on the wrapper: putting it on the <Img> lets the
          wrapper's own opacity isolate it, and the logo's white plate then
          shows as a hard rectangle instead of dropping out. */}
      <AbsoluteFill
        style={{
          transform: `scale(${scale})`,
          opacity: logoOpacity,
          mixBlendMode: "multiply",
        }}
      >
        <Img
          src={staticFile(LOGO_FILE)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
        <AbsoluteFill
          style={{
            mixBlendMode: "screen",
            opacity: shineOpacity,
            background: `linear-gradient(102deg, rgba(255,255,255,0) ${shine - 16}%, rgba(255,255,255,0.9) ${shine}%, rgba(255,255,255,0) ${shine + 16}%)`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(240,251,255,0.9) ${18 + bloom * 34}%, rgba(255,255,255,0) ${44 + bloom * 46}%)`,
          opacity: bloom,
        }}
      />
    </AbsoluteFill>
  );
};

const Scene1: React.FC = () => (
  <Sequence from={S1_START} durationInFrames={S1_LEN} name="Scene 1 - 始まりの海">
    <OffthreadVideo
      src={staticFile(SCENE1_FILE)}
      trimBefore={S1_TRIM}
      volume={1}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </Sequence>
);

const Scene2: React.FC = () => (
  <Sequence from={S2_START} durationInFrames={S2_LEN} name="Scene 2 - すべり台大作戦">
    <OffthreadVideo
      src={staticFile(SCENE2_FILE)}
      trimBefore={S2_TRIM}
      volume={1}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </Sequence>
);

const SceneDip: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [DIP_IN, DIP_FULL_START, DIP_FULL_END, DIP_OUT],
    [0, 1, 1, 0],
    {
      easing: Easing.inOut(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  if (opacity <= 0) {
    return null;
  }

  return <AbsoluteFill style={{ backgroundColor: "#f4fcff", opacity }} />;
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();

  const bloom = interpolate(
    frame,
    [END_BLOOM_START, END_BLOOM_START + 22],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const logoOpacity = interpolate(
    frame,
    [END_LOGO_IN, END_LOGO_HELD, LUMIA_DURATION - 34, LUMIA_DURATION - 4],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const logoScale = interpolate(
    frame,
    [END_LOGO_IN, LUMIA_DURATION],
    [0.74, 0.81],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (bloom <= 0) {
    return null;
  }

  return (
    <AbsoluteFill style={{ opacity: bloom, isolation: "isolate" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 48%, #ffffff 0%, #fbfeff 52%, #e8f6fd 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
          mixBlendMode: "multiply",
        }}
      >
        <Img
          src={staticFile(LOGO_FILE)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Lumia: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff" }}>
      <Scene1 />
      <Scene2 />
      <TitleCard />
      <SceneDip />
      <EndCard />

      <Audio
        src={staticFile(BGM_FILE)}
        trimBefore={Math.round(BGM_START_SECONDS * 30)}
        // Loud where nothing else is speaking (title / end card), tucked under
        // the clips' own splash and wave SFX in between.
        volume={(f) =>
          interpolate(
            f,
            [
              0,
              25,
              S1_START,
              S1_START + 30,
              S2_START,
              END_BLOOM_START,
              END_BLOOM_START + 40,
              LUMIA_DURATION - 45,
              LUMIA_DURATION - 2,
            ],
            [0, 0.62, 0.62, 0.46, 0.44, 0.44, 0.62, 0.58, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
    </AbsoluteFill>
  );
};
