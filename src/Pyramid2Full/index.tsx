import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import {
  TIMELINE,
  LINE_GAP_FRAMES,
  CREDITS_FRAMES,
  type TimedChapter,
} from "../Pyramid2/data/timeline";
import { PopChapterTitle } from "./pop/Parts";
import { PopSubtitle } from "./pop/Subtitle";
import { PopFontGate } from "./pop/FontGate";
import { POP } from "./pop-theme";
const SUBTITLE_LEAD_FRAMES = 10;
import { Pyramid2Guide } from "./Guide";
import { Pyramid2Bgm } from "./Bgm";
import { type ChapterProps } from "./lib";
import { Ch00Intro } from "./chapters/Ch00Intro";
import { Ch01Life } from "./chapters/Ch01Life";
import { Ch02King } from "./chapters/Ch02King";
import { Ch03Afterlife } from "./chapters/Ch03Afterlife";
import { Ch04Tomb } from "./chapters/Ch04Tomb";
import { Ch05People } from "./chapters/Ch05People";
import { Ch06Funeral } from "./chapters/Ch06Funeral";
import { Ch07Gods } from "./chapters/Ch07Gods";
import { Ch08Summary } from "./chapters/Ch08Summary";
import { Credits } from "./chapters/Credits";
import { LayoutAudit } from "./LayoutAudit";

const VIEWS: Record<string, React.FC<ChapterProps>> = {
  "00": Ch00Intro,
  "01": Ch01Life,
  "02": Ch02King,
  "03": Ch03Afterlife,
  "04": Ch04Tomb,
  "05": Ch05People,
  "06": Ch06Funeral,
  "07": Ch07Gods,
  "08": Ch08Summary,
};
const ChapterView: React.FC<{ chapter: TimedChapter }> = ({ chapter }) => {
  const View = VIEWS[chapter.id];
  return (
    <AbsoluteFill>
      <View chapter={chapter} />
      {chapter.titleFrames > 0 ? (
        <Sequence durationInFrames={chapter.titleFrames}>
          <PopChapterTitle
            id={chapter.id}
            title={
              chapter.id === "08" ? "ピラミッドを見る3つの問い" : chapter.title
            }
            durationInFrames={chapter.titleFrames}
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
const LINES = TIMELINE.chapters.flatMap((c) => c.lines);
export const PYRAMID2_FULL_DURATION = TIMELINE.totalFrames;
export const Pyramid2Full: React.FC<{ audit?: boolean }> = ({
  audit = false,
}) => (
  <PopFontGate>
    <AbsoluteFill style={{ background: POP.cream }}>
      {TIMELINE.chapters.map((chapter) => (
        <Sequence
          key={chapter.id}
          from={chapter.from}
          durationInFrames={chapter.durationInFrames}
        >
          <ChapterView chapter={chapter} />
        </Sequence>
      ))}
      <Sequence from={TIMELINE.creditsFrom} durationInFrames={CREDITS_FRAMES}>
        <Credits />
      </Sequence>
      <Pyramid2Guide />
      <Pyramid2Bgm />
      {LINES.map((line) => (
        <Sequence
          key={`audio-${line.id}`}
          from={line.from}
          durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}
        >
          <Audio src={staticFile(line.audio)} />
        </Sequence>
      ))}
      {LINES.map((line) => (
        <Sequence
          key={`subtitle-${line.id}`}
          from={line.from - SUBTITLE_LEAD_FRAMES}
          durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}
        >
          <AbsoluteFill data-pyramid2-subtitle={line.id}>
            <PopSubtitle
              text={line.subtitle}
              durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
      {audit ? <LayoutAudit /> : null}
    </AbsoluteFill>
  </PopFontGate>
);
export const Pyramid2Chapter: React.FC<{ chapterId: string }> = ({
  chapterId,
}) => {
  const chapter = TIMELINE.chapters.find((c) => c.id === chapterId);
  if (!chapter) throw new Error(`章がありません: ${chapterId}`);
  return (
    <Sequence from={-chapter.from}>
      <Pyramid2Full />
    </Sequence>
  );
};
export const PYRAMID2_CHAPTERS = TIMELINE.chapters.map((c) => ({
  id: c.id,
  durationInFrames: c.durationInFrames,
}));
