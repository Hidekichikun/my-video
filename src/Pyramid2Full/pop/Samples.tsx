import React, { useEffect } from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { TIMELINE, LINE_GAP_FRAMES } from "../../Pyramid2/data/timeline";
import { illustrationPath, sceneFor } from "../../Pyramid2/data/scenes";
import { Pyramid2Guide } from "../Guide";
import { LayoutAudit } from "../LayoutAudit";
import { PopFontGate } from "./FontGate";
import { PopSubtitle } from "./Subtitle";
import {
  PopBackground,
  PopChapterTitle,
  PopEvidence,
  PopIcons,
  PopLatePeriod,
  PopMeaning,
  PopNowBadge,
  PopQuestion,
} from "./Parts";
import { POP, POP_BODY, POP_HEADING } from "../pop-theme";

export const POP_SAMPLE_IDS = [
  "00-03",
  "00-08",
  "01-title",
  "03-04",
  "03-16",
  "05-04",
] as const;
export type PopSampleId = (typeof POP_SAMPLE_IDS)[number];
const lines = TIMELINE.chapters.flatMap((c) => c.lines);

const SampleAudit: React.FC = () => {
  const frame = useCurrentFrame();
  useEffect(() => {
    const subtitle = document.querySelector<HTMLElement>(
      "[data-pop-subtitle-lines]",
    );
    const overlays = Array.from(
      document.querySelectorAll<HTMLElement>("[data-pyramid2-overlay]"),
    );
    const serif = overlays.filter((e) =>
      /Shippori|Mincho/.test(getComputedStyle(e).fontFamily),
    );
    console.log(
      "POP_STYLE_AUDIT " +
        JSON.stringify({
          frame,
          subtitleRows: Number(subtitle?.dataset.popSubtitleLines ?? 0),
          subtitleScale: Number(subtitle?.dataset.popSubtitleScale ?? 1),
          highlightCount: document.querySelectorAll("[data-pop-highlight]")
            .length,
          headingFont: POP_HEADING,
          bodyFont: POP_BODY,
          headingReady: document.fonts.check(`400 64px "${POP_HEADING}"`),
          bodyReady: document.fonts.check(`800 52px "${POP_BODY}"`),
          serifElements: serif.length,
        }),
    );
  }, [frame]);
  return <LayoutAudit />;
};

/** 現行タイムラインのフレームで6場面だけを確認する。既存本編にはまだ組み込まない。 */
export const PopSamples: React.FC<{ sample: PopSampleId; audit?: boolean }> = ({
  sample,
  audit = false,
}) => {
  const frame = useCurrentFrame();
  const title = sample === "01-title";
  const line = lines.find((l) => l.id === sample);
  const chapter = TIMELINE.chapters.find(
    (c) => c.id === (title ? "01" : sample.slice(0, 2)),
  )!;
  const scene = line ? sceneFor(chapter.id, Number(line.id.slice(3))) : null;
  const backgroundFile = sample === "00-08" ? undefined : scene?.file;
  let zoom = 1;
  if (scene && line) {
    const from = chapter.lines[scene.from - 1].from;
    const end =
      chapter.lines[scene.to]?.from ?? chapter.from + chapter.durationInFrames;
    zoom += Math.max(0, Math.min(1, (frame - from) / (end - from))) * 0.08;
  }
  const intro = TIMELINE.chapters[0];
  const iconsFrom = intro.lines[4].from;
  return (
    <PopFontGate>
      <AbsoluteFill style={{ background: POP.cream }}>
        {title ? (
          <Sequence from={chapter.from} durationInFrames={chapter.titleFrames}>
            <PopChapterTitle
              id="01"
              title={chapter.title}
              durationInFrames={chapter.titleFrames}
            />
          </Sequence>
        ) : (
          <>
            {backgroundFile ? (
              <AbsoluteFill style={{ overflow: "hidden" }}>
                <Img
                  src={staticFile(illustrationPath(backgroundFile))}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${zoom})`,
                  }}
                />
              </AbsoluteFill>
            ) : (
              <PopBackground />
            )}
            {sample === "00-08" ? (
              <Sequence from={iconsFrom}>
                <PopIcons
                  items={[
                    { label: "ナイルの暮らし", file: "01-nile-fields" },
                    { label: "王という存在", file: "01-king-gods" },
                    { label: "死後も生き続ける", file: "03-ka-offering" },
                  ]}
                  revealAt={intro.lines
                    .slice(4, 7)
                    .map((l) => l.from - iconsFrom)}
                  glowAt={intro.lines[7].from - iconsFrom}
                />
              </Sequence>
            ) : null}
            {line ? (
              <Sequence
                from={line.from}
                durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}
              >
                {sample === "00-03" ? (
                  <PopQuestion text="なぜ、死後のために？" />
                ) : null}
                {sample === "03-04" ? (
                  <PopMeaning term="カー" meaning="生命を支える力" />
                ) : null}
                {sample === "03-16" ? <PopLatePeriod /> : null}
                {sample === "05-04" ? (
                  <PopEvidence kind="noEvidence" subject="一人で全部を設計" />
                ) : null}
              </Sequence>
            ) : null}
            {chapter.id !== "00" ? (
              <Sequence from={chapter.lines[0].from}>
                <PopNowBadge id={chapter.id} />
              </Sequence>
            ) : null}
          </>
        )}
        <Pyramid2Guide />
        {line ? (
          <Sequence
            from={line.from - 10}
            durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}
          >
            <AbsoluteFill data-pyramid2-subtitle={line.id}>
              <PopSubtitle
                text={line.subtitle}
                durationInFrames={line.durationInFrames + LINE_GAP_FRAMES}
              />
            </AbsoluteFill>
          </Sequence>
        ) : null}
        {audit ? <SampleAudit /> : null}
      </AbsoluteFill>
    </PopFontGate>
  );
};
