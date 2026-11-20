import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const IMAGE_DIR = "photo/ルミアと始まりの海";
const AUDIO_FILE = "music/ルミアと始まりの海/lumia-final-mix.wav";

type Scene = {
  id: string;
  start: number;
  end: number;
  image: string;
  fit?: "cover" | "contain";
  fromScale: number;
  toScale: number;
  fromX: number;
  toX: number;
  fromY: number;
  toY: number;
};

const SCENES: Scene[] = [
  {
    id: "title-open",
    start: 0,
    end: 6,
    image: "title-logo.png",
    fit: "contain",
    fromScale: 0.91,
    toScale: 1,
    fromX: 0,
    toX: 0,
    fromY: 12,
    toY: 0,
  },
  {
    id: "dawn",
    start: 6,
    end: 18,
    image: "scene-01-dawn.png",
    fromScale: 1.08,
    toScale: 1.15,
    fromX: 30,
    toX: -20,
    fromY: 8,
    toY: -10,
  },
  {
    id: "plan",
    start: 18,
    end: 30,
    image: "scene-02-plan.png",
    fromScale: 1.09,
    toScale: 1.16,
    fromX: -20,
    toX: 18,
    fromY: -20,
    toY: 12,
  },
  {
    id: "build",
    start: 30,
    end: 44,
    image: "scene-03-build.png",
    fromScale: 1.05,
    toScale: 1.14,
    fromX: 18,
    toX: -26,
    fromY: 5,
    toY: -14,
  },
  {
    id: "stuck",
    start: 44,
    end: 56,
    image: "scene-04-stuck.png",
    fromScale: 1.08,
    toScale: 1.13,
    fromX: -10,
    toX: 14,
    fromY: 4,
    toY: -6,
  },
  {
    id: "wave",
    start: 56,
    end: 68,
    image: "scene-05-wave.png",
    fromScale: 1.12,
    toScale: 1.04,
    fromX: -18,
    toX: 14,
    fromY: 14,
    toY: -8,
  },
  {
    id: "slide",
    start: 68,
    end: 76,
    image: "scene-06-slide.png",
    fromScale: 1.14,
    toScale: 1.29,
    fromX: 24,
    toX: -28,
    fromY: 12,
    toY: -18,
  },
  {
    id: "splash",
    start: 76,
    end: 80,
    image: "scene-07-splash.png",
    fromScale: 1.16,
    toScale: 1.06,
    fromX: -12,
    toX: 12,
    fromY: 10,
    toY: -6,
  },
  {
    id: "underwater",
    start: 80,
    end: 86,
    image: "scene-08-underwater.png",
    fromScale: 1.11,
    toScale: 1.03,
    fromX: 8,
    toX: -8,
    fromY: -8,
    toY: 6,
  },
  {
    id: "title-close",
    start: 86,
    end: 90,
    image: "title-logo.png",
    fit: "contain",
    fromScale: 1.02,
    toScale: 0.96,
    fromX: 0,
    toX: 0,
    fromY: 0,
    toY: -4,
  },
];

const CAPTIONS = [
  { start: 8.0, end: 16.8, text: "まだ誰も知らない、始まりの海。" },
  { start: 20.0, end: 28.8, text: "海まで、ひとっとびできたなら。" },
  { start: 32.0, end: 42.8, text: "ルミアの、すべり台大作戦！" },
  { start: 48.1, end: 52.2, text: "あれ？", emphasis: true },
  { start: 58.0, end: 66.5, text: "海よ、力をかして！" },
  { start: 69.0, end: 74.4, text: "いち、にの、さん！", emphasis: true },
  { start: 81.0, end: 85.7, text: "海は、ここから始まった。" },
];

const BUBBLES = Array.from({ length: 34 }, (_, index) => ({
  x: (index * 137 + 71) % 100,
  y: (index * 83 + 19) % 100,
  size: 8 + ((index * 17) % 34),
  speed: 0.34 + ((index * 11) % 23) / 40,
  phase: (index * 29) % 120,
  alpha: 0.18 + ((index * 13) % 25) / 100,
}));

const SPEED_LINES = Array.from({ length: 18 }, (_, index) => ({
  y: 6 + ((index * 47) % 88),
  width: 210 + ((index * 71) % 510),
  delay: (index * 7) % 24,
  alpha: 0.18 + ((index * 9) % 32) / 100,
}));

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const sceneOpacity = (frame: number, fps: number, scene: Scene) => {
  const start = scene.start * fps;
  const end = scene.end * fps;
  const fadeFrames = scene.fit === "contain" ? 18 : 24;
  const fadeIn =
    scene.start === 0
      ? 1
      : interpolate(frame, [start - fadeFrames, start + fadeFrames], [0, 1], clamp);
  const fadeOut =
    scene.end === 90
      ? 1
      : interpolate(frame, [end - fadeFrames, end + fadeFrames], [1, 0], clamp);
  return Math.min(fadeIn, fadeOut);
};

const SceneLayer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(
    frame,
    [scene.start * fps, scene.end * fps],
    [0, 1],
    { ...clamp, easing: Easing.inOut(Easing.quad) }
  );
  const opacity = sceneOpacity(frame, fps, scene);
  const scale = interpolate(progress, [0, 1], [scene.fromScale, scene.toScale]);
  let x = interpolate(progress, [0, 1], [scene.fromX, scene.toX]);
  let y = interpolate(progress, [0, 1], [scene.fromY, scene.toY]);

  if (scene.id === "stuck") {
    const stopFrame = 47.75 * fps;
    const impact = interpolate(frame, [stopFrame - 5, stopFrame, stopFrame + 12], [0, 1, 0], clamp);
    x += Math.sin((frame - stopFrame) * 2.4) * 9 * impact;
    y += Math.abs(Math.sin((frame - stopFrame) * 1.8)) * 5 * impact;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: scene.fit === "contain" ? "#fff" : "#0b9fcb",
        opacity,
      }}
    >
      <Img
        src={staticFile(`${IMAGE_DIR}/${scene.image}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: scene.fit ?? "cover",
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          filter:
            scene.id === "underwater"
              ? "saturate(1.08) contrast(1.03)"
              : "saturate(1.035) contrast(1.015)",
        }}
      />
    </AbsoluteFill>
  );
};

const WaterLight: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = frame * 0.7;
  const titleFrame = frame < 180 || frame >= 2580;
  return (
    <AbsoluteFill
      style={{
        opacity: titleFrame ? 0.42 : 0.24,
        mixBlendMode: "screen",
        backgroundImage:
          "radial-gradient(ellipse at 18% 28%, rgba(98,255,239,.72) 0%, transparent 26%), radial-gradient(ellipse at 82% 15%, rgba(164,220,255,.64) 0%, transparent 24%), linear-gradient(115deg, transparent 25%, rgba(255,255,255,.26) 45%, transparent 63%)",
        backgroundSize: "140% 140%, 135% 135%, 180% 180%",
        backgroundPosition: `${-drift * 0.13}px ${drift * 0.08}px, ${drift * 0.09}px ${-drift * 0.05}px, ${drift * 0.18}px 0`,
      }}
    />
  );
};

const BubbleField: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const storyVisibility = interpolate(frame, [160, 220, 2530, 2600], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: storyVisibility, overflow: "hidden" }}>
      {BUBBLES.map((bubble, index) => {
        const travel = ((frame * bubble.speed + bubble.phase) % (height + 240)) - 120;
        const y = height - travel;
        const sway = Math.sin(frame * 0.025 + index * 1.7) * (18 + (index % 4) * 7);
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: `${bubble.x}%`,
              top: y,
              width: bubble.size,
              height: bubble.size,
              borderRadius: "50%",
              border: `${Math.max(1, bubble.size / 15)}px solid rgba(230,255,255,.82)`,
              background:
                "radial-gradient(circle at 30% 25%, rgba(255,255,255,.9), rgba(89,228,245,.12) 42%, rgba(20,158,213,.15) 72%, rgba(255,255,255,.3))",
              boxShadow: "inset -2px -3px 8px rgba(18,142,202,.18), 0 0 12px rgba(159,250,255,.35)",
              opacity: bubble.alpha,
              transform: `translateX(${sway}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const SpeedLines: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [67.7 * fps, 68.5 * fps, 79.2 * fps, 80 * fps], [0, 1, 1, 0], clamp);
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity, mixBlendMode: "screen" }}>
      {SPEED_LINES.map((line, index) => {
        const x = ((frame * (24 + (index % 4) * 7) + line.delay * 40) % 2500) - 500;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              top: `${line.y}%`,
              left: x,
              width: line.width,
              height: 3 + (index % 3),
              borderRadius: 999,
              opacity: line.alpha,
              background: "linear-gradient(90deg, transparent, white 42%, #a8ffff)",
              transform: "rotate(-12deg)",
              filter: "blur(.4px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const MagicalWaveGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [55.7 * fps, 57 * fps, 67.2 * fps, 68 * fps], [0, 0.9, 0.5, 0], clamp);
  const sweep = interpolate(frame, [56 * fps, 68 * fps], [-35, 115], clamp);
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity, overflow: "hidden", mixBlendMode: "screen" }}>
      <div
        style={{
          position: "absolute",
          left: `${sweep}%`,
          top: "-20%",
          width: 360,
          height: "140%",
          transform: "rotate(16deg)",
          background: "linear-gradient(90deg, transparent, rgba(166,255,252,.68), white, rgba(94,235,255,.38), transparent)",
          filter: "blur(24px)",
        }}
      />
    </AbsoluteFill>
  );
};

const SplashFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const flash = interpolate(frame, [79.55 * fps, 79.82 * fps, 80.1 * fps, 80.8 * fps], [0, 0.94, 0.38, 0], clamp);
  return <AbsoluteFill style={{ backgroundColor: "#e9ffff", opacity: flash, mixBlendMode: "screen" }} />;
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      {CAPTIONS.map((caption) => {
        const startFrame = caption.start * fps;
        const endFrame = caption.end * fps;
        const visible = frame >= startFrame - 10 && frame <= endFrame + 10;
        if (!visible) return null;
        const entrance = spring({ frame: frame - startFrame, fps, config: { damping: 16, stiffness: 120, mass: 0.7 } });
        const opacity = Math.min(
          interpolate(frame, [startFrame - 8, startFrame + 7], [0, 1], clamp),
          interpolate(frame, [endFrame - 10, endFrame + 6], [1, 0], clamp)
        );
        const emphasis = "emphasis" in caption && caption.emphasis;
        return (
          <div
            key={`${caption.start}-${caption.text}`}
            style={{
              position: "absolute",
              left: "50%",
              bottom: emphasis ? 95 : 78,
              transform: `translateX(-50%) translateY(${(1 - entrance) * 28}px) scale(${0.96 + entrance * 0.04})`,
              opacity,
              padding: emphasis ? "18px 46px 22px" : "17px 42px 21px",
              maxWidth: 1500,
              borderRadius: 32,
              border: "2px solid rgba(255,255,255,.74)",
              background: "linear-gradient(135deg, rgba(4,81,129,.67), rgba(9,155,176,.52))",
              boxShadow: "0 18px 45px rgba(0,50,91,.28), inset 0 1px 0 rgba(255,255,255,.55)",
              backdropFilter: "blur(13px)",
              color: "white",
              fontFamily: '"ZenInShugo", "Yu Gothic", sans-serif',
              fontSize: emphasis ? 80 : 57,
              fontWeight: 700,
              lineHeight: 1.22,
              letterSpacing: emphasis ? ".08em" : ".045em",
              textAlign: "center",
              whiteSpace: "nowrap",
              textShadow: "0 3px 0 rgba(0,67,103,.28), 0 0 18px rgba(124,247,255,.7)",
            }}
          >
            {caption.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.055,
        mixBlendMode: "soft-light",
        backgroundImage:
          "repeating-radial-gradient(circle at 30% 40%, rgba(255,255,255,.7) 0 1px, rgba(0,44,70,.42) 1px 2px, transparent 2px 5px)",
        backgroundSize: "8px 8px",
        backgroundPosition: `${frame % 8}px ${(frame * 3) % 8}px`,
      }}
    />
  );
};

export const LumiaSlideOperation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const masterFade = Math.min(
    interpolate(frame, [0, 22], [0, 1], clamp),
    interpolate(frame, [durationInFrames - 54, durationInFrames - 1], [1, 0], clamp)
  );
  const vignette = frame >= 80 * fps ? 0.26 : 0.16;

  return (
    <AbsoluteFill style={{ backgroundColor: "#ecffff", overflow: "hidden", opacity: masterFade }}>
      <Audio src={staticFile(AUDIO_FILE)} />
      {SCENES.map((scene) => (
        <SceneLayer key={scene.id} scene={scene} />
      ))}
      <WaterLight />
      <MagicalWaveGlow />
      <BubbleField />
      <SpeedLines />
      <SplashFlash />
      <Captions />
      <AbsoluteFill
        style={{
          boxShadow: `inset 0 0 210px rgba(0,41,79,${vignette})`,
          pointerEvents: "none",
        }}
      />
      <FilmGrain />
    </AbsoluteFill>
  );
};
