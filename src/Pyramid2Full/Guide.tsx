import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { TIMELINE } from "../Pyramid2/data/timeline";
import { speechEnergy } from "../Pyramid2/data/speech-energy";
import { GUIDE_WINDOWS } from "../Pyramid2/data/guide-cues";

const lines = TIMELINE.chapters.flatMap((chapter) => chapter.lines);
const energy = speechEnergy;

/** Audio energy drives the mouth; silence and narration gaps close it. */
export const Pyramid2Guide: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = GUIDE_WINDOWS.find(
    (window) => frame >= window.from && frame < window.end,
  );
  if (!cue) return null;
  const local = frame - cue.from;
  const line = lines.find(
    (item) => frame >= item.from && frame < item.from + item.durationInFrames,
  );
  const volume = line ? (energy[line.id]?.[frame - line.from] ?? 0) : 0;
  const mouthOpen = volume > 0.13 && (local % 7 < 5 || volume > 0.7);
  // Keep blinking and breathing continuous across scene cuts.
  const blink = (frame + 31) % 127 < 4;
  const width = cue.width;
  const left = cue.left ?? (cue.side === "left" ? 48 : 1920 - width - 48);
  const imageStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  };
  return (
    <div
      data-pyramid2-guide
      style={{
        position: "absolute",
        left,
        top: cue.top,
        width,
        height: width * 1.5,
        transformOrigin: "50% 90%",
        transform: `translateY(${Math.sin(frame / 28) * 1.6}px) rotate(${Math.sin(frame / 45) * 0.45}deg) scale(${1 + Math.sin(frame / 30) * 0.004})`,
        filter: "drop-shadow(0 3px 3px rgba(46,29,17,0.24))",
        pointerEvents: "none",
      }}
    >
      <Img
        src={staticFile(`photo/pyramid-guide/${cue.pose}.png`)}
        style={imageStyle}
      />
      {mouthOpen ? (
        <Img
          src={staticFile("photo/pyramid-guide/talk.png")}
          style={{ ...imageStyle, clipPath: "ellipse(6% 2.7% at 48.5% 24.7%)" }}
        />
      ) : null}
      {blink ? (
        <Img
          src={staticFile("photo/pyramid-guide/blink.png")}
          style={{
            ...imageStyle,
            clipPath: "polygon(34% 16%, 59% 14%, 60% 22%, 34% 24%)",
          }}
        />
      ) : null}
    </div>
  );
};
