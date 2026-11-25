import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ALL_LINES, CREDITS_FRAMES, TIMELINE, type TimedChapter } from "../MathGacha/data/timeline";
import { PopFontGate } from "./FontGate";
import { PopSubtitle } from "./Subtitle";
import { MathGachaBgm } from "./Bgm";
import { NowBadge, PopBackground } from "./parts";
import { POP } from "./theme";
import { Guide } from "./Guide";
import type { ChapterProps } from "./lib";
import { Ch00 } from "./chapters/Ch00";
import { Ch01 } from "./chapters/Ch01";
import { Ch02 } from "./chapters/Ch02";
import { Ch03 } from "./chapters/Ch03";
import { Ch04 } from "./chapters/Ch04";
import { Ch05 } from "./chapters/Ch05";
import { Ch06 } from "./chapters/Ch06";
import { Ch07 } from "./chapters/Ch07";
import { Credits } from "./chapters/Credits";

/** 章の画面が無いときの予備（背景と先生だけ）。 */
const Todo: React.FC<ChapterProps> = ({ chapter }) => (
  <AbsoluteFill>
    <PopBackground />
    <NowBadge id={chapter.id} title={chapter.shortTitle} />
    <Guide chapter={chapter} pose="neutral" x={430} footY={885} height={900} />
  </AbsoluteFill>
);

const VIEWS: Record<string, React.FC<ChapterProps>> = {
  "00": Ch00,
  "01": Ch01,
  "02": Ch02,
  "03": Ch03,
  "04": Ch04,
  "05": Ch05,
  "06": Ch06,
  "07": Ch07,
};

const ChapterView: React.FC<{ chapter: TimedChapter }> = ({ chapter }) => {
  const View = VIEWS[chapter.id] ?? Todo;
  return (
    <AbsoluteFill>
      <View chapter={chapter} />
    </AbsoluteFill>
  );
};

export const MATHGACHA_FULL_DURATION = TIMELINE.totalFrames;

export const MathGachaFull: React.FC = () => (
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
      <MathGachaBgm />
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

/** 章だけを見る（Remotion Studio の MathGachaCh00〜07） */
export const MathGachaChapter: React.FC<{ chapterId: string }> = ({ chapterId }) => {
  const chapter = TIMELINE.chapters.find((c) => c.id === chapterId);
  if (!chapter) throw new Error(`章がありません: ${chapterId}`);
  return (
    <Sequence from={-chapter.from}>
      <MathGachaFull />
    </Sequence>
  );
};
export const MATHGACHA_CHAPTERS = TIMELINE.chapters.map((c) => ({
  id: c.id,
  durationInFrames: c.durationInFrames,
}));
