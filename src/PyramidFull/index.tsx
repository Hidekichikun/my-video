// 本編：全11章（00〜10）とクレジット。章ごとの画面は chapters/ の各ファイル。
// 音声と字幕は、章とは別に全体の時間（TIMELINE）で並べる。

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import {
  LINE_GAP_FRAMES,
  TIMELINE,
  type TimedChapter,
} from "../Pyramid/data/timeline";
import {
  ChapterTitle,
  Subtitle,
  SUBTITLE_LEAD_FRAMES,
} from "../PyramidPrevis/components";
import { COLORS, PART_OF_CHAPTER } from "../PyramidPrevis/theme";
import { Ch00Intro } from "./chapters/Ch00Intro";
import { Ch01Background } from "./chapters/Ch01Background";
import { Ch02Djoser } from "./chapters/Ch02Djoser";
import { Ch03Sneferu } from "./chapters/Ch03Sneferu";
import { Ch04KhufuScale } from "./chapters/Ch04KhufuScale";
import { Ch05KhufuBuilders } from "./chapters/Ch05KhufuBuilders";
import { Ch06KhufuInterior } from "./chapters/Ch06KhufuInterior";
import { Ch07KhafreMenkaure } from "./chapters/Ch07KhafreMenkaure";
import { Ch08End } from "./chapters/Ch08End";
import { Ch09Afterlife } from "./chapters/Ch09Afterlife";
import { Ch10KhufuUnique } from "./chapters/Ch10KhufuUnique";
import { Credits } from "./chapters/Credits";
import { PyramidBgm } from "./Bgm";
import type { ChapterProps } from "./lib";
import { PyramidGuide } from "./Guide";

const CHAPTER_VIEWS: Record<string, React.FC<ChapterProps>> = {
  "00": Ch00Intro,
  "01": Ch01Background,
  "02": Ch02Djoser,
  "03": Ch03Sneferu,
  "04": Ch04KhufuScale,
  "05": Ch05KhufuBuilders,
  "06": Ch06KhufuInterior,
  "07": Ch07KhafreMenkaure,
  "08": Ch08End,
  "09": Ch09Afterlife,
  "10": Ch10KhufuUnique,
};

const titleText = (title: string) =>
  title.includes("：") ? title.slice(title.indexOf("：") + 1) : title;

const ChapterView: React.FC<{ chapter: TimedChapter }> = ({ chapter }) => {
  const View = CHAPTER_VIEWS[chapter.id];
  return (
    <AbsoluteFill>
      <View chapter={chapter} />
      {chapter.titleFrames > 0 ? (
        <Sequence durationInFrames={chapter.titleFrames}>
          <ChapterTitle
            part={PART_OF_CHAPTER[chapter.id]}
            title={titleText(chapter.title)}
            durationInFrames={chapter.titleFrames}
          />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

const ALL_LINES = TIMELINE.chapters.flatMap((c) => c.lines);

export const PYRAMID_FULL_DURATION = TIMELINE.totalFrames;

export const PyramidFull: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.night }}>
    {TIMELINE.chapters.map((chapter) => (
      <Sequence
        key={chapter.id}
        from={chapter.from}
        durationInFrames={chapter.durationInFrames}
      >
        <ChapterView chapter={chapter} />
      </Sequence>
    ))}
    <Sequence from={TIMELINE.creditsFrom}>
      <Credits />
    </Sequence>
    <PyramidGuide />
    <PyramidBgm />
    {ALL_LINES.map((line) =>
      line.hasAudio ? (
        <Sequence
          key={`a-${line.id}`}
          from={line.from}
          durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}
        >
          <Audio src={staticFile(line.audio)} />
        </Sequence>
      ) : null,
    )}
    {/* 字幕は声より少し前から出し、次の字幕が出る前に消える */}
    {ALL_LINES.filter((line) => line.id !== "00-06").map((line) => (
      <Sequence
        key={`s-${line.id}`}
        from={line.from - SUBTITLE_LEAD_FRAMES}
        durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}
      >
        <Subtitle
          text={line.subtitle}
          durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}
        />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/** 1章だけを確かめるためのコンポジション（Studio の「Pyramid章」フォルダ） */
export const PyramidChapter: React.FC<{ chapterId: string }> = ({
  chapterId,
}) => {
  const chapter = TIMELINE.chapters.find((c) => c.id === chapterId);
  if (!chapter) throw new Error(`章${chapterId}がありません`);
  return (
    <Sequence from={-chapter.from}>
      <PyramidFull />
    </Sequence>
  );
};

export const PYRAMID_CHAPTERS = TIMELINE.chapters.map((c) => ({
  id: c.id,
  durationInFrames: c.durationInFrames,
}));
