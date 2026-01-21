import React from "react";
import {
  AbsoluteFill,
  Img,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { POPPO_FIXED_IMAGES, POPPO_IMAGES } from "./constants";

const getFixedImageForTime = (time: number) => {
  for (let i = 0; i < POPPO_FIXED_IMAGES.length; i += 1) {
    const current = POPPO_FIXED_IMAGES[i];
    const next = POPPO_FIXED_IMAGES[i + 1];
    const fallbackDuration = Math.min(10, Math.max(6, next ? next.time - current.time : 10));
    const endTime = current.endTime ?? current.time + fallbackDuration;
    if (time >= current.time && time < endTime) {
      return { src: current.src, start: current.time, end: endTime };
    }
  }
  return null;
};

export const PoppoImages: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const fixedSegment = getFixedImageForTime(currentTime);

  const cycleDuration = Math.round(fps * 9);
  const transitionFrames = Math.round(fps * 1.8);
  const localFrame = frame % cycleDuration;

  const index = Math.floor(frame / cycleDuration) % POPPO_IMAGES.length;
  const nextIndex = (index + 1) % POPPO_IMAGES.length;

  const transitionProgress = interpolate(
    localFrame,
    [cycleDuration - transitionFrames, cycleDuration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    }
  );

  const drift = Math.sin(frame * 0.004) * 5;
  const scale = 1.035 + Math.sin(frame * 0.008) * 0.012;

  const baseImage = fixedSegment?.src ?? POPPO_IMAGES[index];
  const nextImage = POPPO_IMAGES[nextIndex];
  const fixedOpacity = fixedSegment
    ? Math.min(
        interpolate(currentTime, [fixedSegment.start, fixedSegment.start + 0.8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        interpolate(currentTime, [fixedSegment.end - 0.8, fixedSegment.end], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      )
    : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: "#06070a" }}>
      <Img
        src={baseImage}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translateY(${drift}px) scale(${scale})`,
          opacity: fixedOpacity,
        }}
      />

      {!fixedSegment && transitionProgress > 0 && (
        <Img
          src={nextImage}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: transitionProgress,
            transform: `translateY(${-drift}px) scale(${scale})`,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.12), transparent 45%)," +
            "radial-gradient(circle at 80% 30%, rgba(255,255,255,0.08), transparent 50%)," +
            "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
          opacity: 0.9,
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "inset 0 0 180px rgba(0,0,0,0.55)",
        }}
      />
    </AbsoluteFill>
  );
};
