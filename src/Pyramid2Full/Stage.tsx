import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { Atmosphere } from "../PyramidPrevis/components/Atmosphere";
import { POP } from "./pop-theme";
import { PopBackground, PopNowBadge } from "./pop/Parts";
import { illustrationPath, SCENES, type Scene } from "../Pyramid2/data/scenes";
import { type ChapterProps, startOf } from "./lib";

export const useChapterLine = (chapter: ChapterProps["chapter"]) => {
  const frame = useCurrentFrame();
  return (
    [...chapter.lines]
      .reverse()
      .find((line) => line.from - chapter.from <= frame) ?? chapter.lines[0]
  );
};
const Backdrop: React.FC<{ scene: Scene; progress: number; dim: number }> = ({
  scene,
  progress,
  dim,
}) => (
  <AbsoluteFill
    style={{
      background: POP.cream,
      overflow: "hidden",
    }}
  >
    {!scene.file ? <PopBackground /> : null}
    {scene.file ? (
      <>
        <Img
          src={staticFile(illustrationPath(scene.file))}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${1 + progress * (scene.focus ? 0.14 : 0.08)})`,
            transformOrigin: `${(scene.focus?.[0] ?? 0.5) * 100}% ${(scene.focus?.[1] ?? 0.5) * 100}%`,
          }}
        />
        <Atmosphere file={`${scene.file}.png`} />
        <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />
      </>
    ) : null}
  </AbsoluteFill>
);
/** 一つの行は一つの画面に対応。行間・章末も同じ画面を保つ。 */
export const Stage: React.FC<
  ChapterProps & { children: (line: number) => React.ReactNode }
> = ({ chapter, children }) => {
  const frame = useCurrentFrame();
  const line = useChapterLine(chapter);
  const number = Number(line.id.slice(3));
  const scenes = SCENES[chapter.id];
  const scene = scenes.find((s) => number >= s.from && number <= s.to)!;
  const from = startOf(
    chapter,
    `${chapter.id}-${String(scene.from).padStart(2, "0")}`,
  );
  const next = chapter.lines.find(
    (l) => Number(l.id.slice(3)) === scene.to + 1,
  );
  const end = next ? next.from - chapter.from : chapter.durationInFrames;
  const progress = Math.max(
    0,
    Math.min(1, (frame - from) / Math.max(1, end - from)),
  );
  const dim = 0;
  let transition: React.ReactNode = null;
  if (chapter.id === "06" && number >= 15 && number <= 16) {
    const fade = interpolate(
      frame - startOf(chapter, "06-15"),
      [0, 60],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    transition = (
      <AbsoluteFill style={{ opacity: fade }}>
        <Backdrop
          scene={{ ...scene, file: "04-horizon-sunrise" }}
          progress={progress}
          dim={0}
        />
      </AbsoluteFill>
    );
  }
  if (line.id === "08-11") {
    const fade = interpolate(frame - from, [0, 60], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    transition = (
      <AbsoluteFill style={{ opacity: fade }}>
        <Backdrop
          scene={{ ...scene, file: "08-people-dawn" }}
          progress={0.08}
          dim={0}
        />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill data-pyramid2-line={line.id}>
      <Backdrop scene={scene} progress={progress} dim={dim} />
      {transition}
      <Sequence from={line.from - chapter.from} layout="none">
        {children(number)}
      </Sequence>
      {chapter.id !== "00" && frame >= chapter.titleFrames ? (
        <PopNowBadge
          id={chapter.id}
          side={scene.side === "left" ? "right" : "left"}
        />
      ) : null}
    </AbsoluteFill>
  );
};
