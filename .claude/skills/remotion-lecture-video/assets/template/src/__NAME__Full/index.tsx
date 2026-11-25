import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ALL_LINES, CREDITS_FRAMES, TIMELINE, type TimedChapter } from "../__NAME__/data/timeline";
import { PopFontGate } from "./FontGate";
import { PopSubtitle } from "./Subtitle";
import { __NAME__Bgm } from "./Bgm";
import { NowBadge, PopBackground } from "./parts";
import { POP } from "./theme";
import { Guide } from "./Guide";
import type { ChapterProps } from "./lib";
import { ChapterExample } from "./chapters/ChapterExample";
import { Credits } from "./chapters/Credits";

/** 章の画面が無いときの予備（背景と先生だけ） */
const Todo: React.FC<ChapterProps> = ({ chapter }) => (
  <AbsoluteFill>
    <PopBackground />
    <NowBadge id={chapter.id} title={chapter.shortTitle} />
    <Guide chapter={chapter} pose="neutral" x={430} footY={885} height={900} />
  </AbsoluteFill>
);

/** 章ID → 章の画面。章ができるたびに足す */
const VIEWS: Record<string, React.FC<ChapterProps>> = {
  "00": ChapterExample,
};

const ChapterView: React.FC<{ chapter: TimedChapter }> = ({ chapter }) => {
  const View = VIEWS[chapter.id] ?? Todo;
  return (
    <AbsoluteFill>
      <View chapter={chapter} />
    </AbsoluteFill>
  );
};

export const __NAME___FULL_DURATION = TIMELINE.totalFrames;

export const __NAME__Full: React.FC = () => (
  <PopFontGate>
    <AbsoluteFill style={{ background: POP.cream }}>
      {TIMELINE.chapters.map((chapter) => (
        <Sequence key={chapter.id} from={chapter.from} durationInFrames={chapter.durationInFrames}>
          <ChapterView chapter={chapter} />
        </Sequence>
      ))}
      <Sequence from={TIMELINE.creditsFrom} durationInFrames={CREDITS_FRAMES}>
        <Credits />
      </Sequence>
      <__NAME__Bgm />
      {ALL_LINES.map((line) => (
        <Sequence key={`audio-${line.id}`} from={line.from} durationInFrames={line.durationInFrames + 6}>
          <Audio src={staticFile(line.audio)} />
        </Sequence>
      ))}
      {ALL_LINES.map((line) => (
        <Sequence key={`subtitle-${line.id}`} from={line.from} durationInFrames={line.subtitleFrames}>
          <AbsoluteFill data-subtitle={line.id}>
            <PopSubtitle text={line.subtitle} durationInFrames={line.subtitleFrames} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  </PopFontGate>
);

/** 章だけを見る（Remotion Studio の __NAME__Ch00〜） */
export const __NAME__Chapter: React.FC<{ chapterId: string }> = ({ chapterId }) => {
  const chapter = TIMELINE.chapters.find((c) => c.id === chapterId);
  if (!chapter) throw new Error(`章がありません: ${chapterId}`);
  return (
    <Sequence from={-chapter.from}>
      <__NAME__Full />
    </Sequence>
  );
};
export const __NAME___CHAPTERS = TIMELINE.chapters.map((c) => ({
  id: c.id,
  durationInFrames: c.durationInFrames,
}));
