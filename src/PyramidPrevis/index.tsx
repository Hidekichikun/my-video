// プレビズ（ダイジェスト）：全11章を約2分に縮め、構成と見せ方を確かめる。本編の速さは Pacing.tsx で確かめる。
// 各章の代表的な行を1〜3つ選び、共通部品（components/）で画面を組む。
// 本編（src/PyramidFull/）はこの部品を使って、全111行を組み立てる。

import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import {
  CREDIT_VOICE,
  CREDIT_VOICE_ACTOR,
  KHUFU,
  SPHINX,
} from "../Pyramid/data/facts";
import { narration } from "../Pyramid/data/narration";
import {
  ChapterTitle,
  CrossSection,
  DimensionLine,
  HistoryLine,
  IconRow,
  Illustration,
  LabelTag,
  NileMap,
  Pyramid3D,
  PyramidCompare,
  Subtitle,
  ZoomMap,
  type SectionPart,
} from "./components";
import { COLORS, GOTHIC, MINCHO, PART_OF_CHAPTER } from "./theme";

const allLines = narration.chapters.flatMap((c) => c.lines);
const subtitleOf = (id: string) =>
  allLines.find((l) => l.id === id)?.subtitle ?? id;
const chapterTitle = (id: string) => {
  const t = narration.chapters.find((c) => c.id === id)?.title ?? id;
  return t.includes("：") ? t.slice(t.indexOf("：") + 1) : t;
};

const TITLE_FRAMES = 45;
const CREDITS_FRAMES = 75;
/** ダイジェストの各ショットを本来の何倍の長さにするか */
const SLOW = 1.3;

type Shot = { chapter: string; line: string; frames: number; View: React.FC };

// ---- 動きのある場面（useCurrentFrame を使うもの） ----

const MastabaToStep: React.FC = () => {
  const f = useCurrentFrame();
  const steps = Math.min(6, 1 + Math.floor(f / 12));
  return (
    <Pyramid3D
      shape={f < 12 ? "mastaba" : "step"}
      heightM={62}
      baseM={121}
      steps={steps}
      azimuth={30}
      spin={4}
      elevation={16}
      distance={2.6}
    />
  );
};

const BentWithAngles: React.FC = () => (
  <>
    <Pyramid3D
      shape="bent"
      heightM={105}
      baseM={189}
      azimuth={0}
      elevation={4}
      distance={2.2}
    />
    <AngleNote text="約54度" x={470} y={700} />
    <AngleNote text="約43度" x={760} y={330} />
  </>
);

/** 角度などの注記（札ではない文字） */
const AngleNote: React.FC<{ text: string; x: number; y: number }> = ({
  text,
  x,
  y,
}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: GOTHIC,
        fontWeight: 700,
        fontSize: 48,
        color: COLORS.ink,
        opacity: interpolate(f, [10, 20], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {text}
    </div>
  );
};

const KhufuScale: React.FC = () => (
  <>
    <Pyramid3D
      shape="true"
      surface="now"
      missingTopM={KHUFU.heightOriginalM - KHUFU.heightNowM}
      azimuth={0}
      spin={2}
      elevation={5}
      distance={2.0}
      center={[960, 560]}
    />
    <DimensionLine
      from={[1420, 790]}
      to={[1420, 320]}
      label="約146.5m"
      side="right"
      delay={8}
    />
    <DimensionLine
      from={[560, 800]}
      to={[1360, 800]}
      label="約230m"
      side="below"
      delay={20}
    />
  </>
);

const NowToThen: React.FC = () => {
  const f = useCurrentFrame();
  const wipe = interpolate(f, [15, 45], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Pyramid3D
        shape="true"
        surface="now"
        missingTopM={KHUFU.heightOriginalM - KHUFU.heightNowM}
        azimuth={25}
        elevation={8}
        distance={2.2}
      />
      <AbsoluteFill style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
        <Pyramid3D
          shape="true"
          surface="then"
          azimuth={25}
          elevation={8}
          distance={2.2}
        />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: `${wipe}%`,
          top: 0,
          bottom: 0,
          width: 4,
          background: COLORS.gold,
          opacity: wipe > 0 && wipe < 100 ? 1 : 0,
        }}
      />
    </>
  );
};

const InteriorWalk: React.FC = () => {
  const f = useCurrentFrame();
  const order: SectionPart[] = [
    "entrance",
    "descending",
    "ascending",
    "grandGallery",
  ];
  const step = Math.min(order.length - 1, Math.floor(f / 30));
  return <CrossSection highlight={[order[step]]} />;
};

const KhafreSphinx: React.FC = () => (
  <>
    <Illustration file="07-sphinx.png" dim={0.2} />
    <DimensionLine
      from={[360, 820]}
      to={[1560, 820]}
      label={`全長 約${SPHINX.lengthM}m`}
      side="above"
      delay={6}
    />
    <LabelTag
      kind="likely"
      subject="顔はカフラー王"
      x={120}
      y={120}
      delay={40}
    />
  </>
);

const SectionCompare: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: COLORS.night }} />
    <CrossSection
      variant="typical"
      highlight={["kingsChamber"]}
      center={500}
      pxPerM={2.6}
      background={false}
      showLabels={false}
      caption={false}
    />
    <CrossSection
      highlight={["kingsChamber"]}
      center={1420}
      pxPerM={2.6}
      background={false}
      showLabels={false}
      caption={false}
    />
    <Caption x={500} text="ほかのピラミッド" />
    <Caption x={1420} text="クフ" gold />
  </>
);

const Caption: React.FC<{ x: number; text: string; gold?: boolean }> = ({
  x,
  text,
  gold,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 300,
      width: 600,
      top: 800,
      textAlign: "center",
      fontFamily: GOTHIC,
      fontWeight: 700,
      fontSize: 44,
      color: gold ? COLORS.gold : COLORS.limestone,
    }}
  >
    {text}
  </div>
);

// ---- ショット一覧 ----

const SHOTS: Shot[] = [
  {
    chapter: "00",
    line: "00-02",
    frames: 90,
    View: () => (
      <>
        <Illustration file="00-dawn-giza.png" />
        <DimensionLine
          from={[1560, 900]}
          to={[1560, 250]}
          label="約146m"
          side="right"
          delay={10}
        />
      </>
    ),
  },
  {
    chapter: "00",
    line: "00-04",
    frames: 90,
    View: () => <Illustration file="00-khufu-statue.png" zoom={[1.05, 1.15]} />,
  },
  {
    chapter: "01",
    line: "01-03",
    frames: 100,
    View: () => (
      <HistoryLine
        visibleKeys={["khufu", "now"]}
        highlightKey="khufu"
        notes={["日本：縄文時代", "エジプト：古王国"]}
      />
    ),
  },
  {
    chapter: "01",
    line: "01-05",
    frames: 200,
    View: () => (
      <ZoomMap
        keyframes={[
          { at: 0, view: "africa" },
          { at: 20, view: "africa" },
          { at: 90, view: "egypt" },
          { at: 110, view: "egypt" },
          { at: 190, view: "giza" },
        ]}
      />
    ),
  },
  {
    chapter: "01",
    line: "01-11",
    frames: 90,
    View: () => (
      <NileMap
        view="egypt"
        places={["giza", "luxor", "aswan"]}
        highlight="giza"
        converge
      />
    ),
  },
  { chapter: "02", line: "02-03", frames: 90, View: MastabaToStep },
  {
    chapter: "02",
    line: "02-05",
    frames: 75,
    View: () => <PyramidCompare visibleKeys={["djoser"]} enterKey="djoser" />,
  },
  { chapter: "03", line: "03-05", frames: 90, View: BentWithAngles },
  {
    chapter: "03",
    line: "03-06",
    frames: 75,
    View: () => (
      <PyramidCompare visibleKeys={["djoser", "bent", "red"]} enterKey="red" />
    ),
  },
  { chapter: "04", line: "04-02", frames: 90, View: KhufuScale },
  { chapter: "04", line: "04-07", frames: 90, View: NowToThen },
  {
    chapter: "05",
    line: "05-02",
    frames: 70,
    View: () => (
      <>
        <AbsoluteFill style={{ background: COLORS.night }} />
        <LabelTag
          kind="noEvidence"
          subject="「奴隷が造った」説"
          x={560}
          y={420}
          delay={20}
          size={1.3}
        />
      </>
    ),
  },
  {
    chapter: "05",
    line: "05-10",
    frames: 95,
    View: () => (
      <NileMap
        view="memphis"
        places={["giza", "tura", "wadiElJarf", "saqqara"]}
        highlight="giza"
        routes={[["tura", "giza"]]}
        showAncientBranch
      />
    ),
  },
  {
    chapter: "05",
    line: "05-05",
    frames: 90,
    View: () => (
      <>
        <AbsoluteFill style={{ background: COLORS.sand }} />
        <IconRow
          items={[
            { glyph: "石", label: "石工" },
            { glyph: "船", label: "船乗り" },
            { glyph: "測", label: "測量" },
            { glyph: "記", label: "記録係" },
            { glyph: "パ", label: "パン職人" },
          ]}
        />
      </>
    ),
  },
  { chapter: "06", line: "06-04", frames: 120, View: InteriorWalk },
  {
    chapter: "06",
    line: "06-11",
    frames: 80,
    View: () => <CrossSection highlight={["kingsChamber", "relieving"]} />,
  },
  {
    chapter: "06",
    line: "06-16",
    frames: 90,
    View: () => <CrossSection highlight={["bigVoid", "northCorridor"]} />,
  },
  {
    chapter: "07",
    line: "07-08",
    frames: 80,
    View: () => (
      <PyramidCompare
        visibleKeys={["djoser", "bent", "red", "khufu", "khafre", "menkaure"]}
        enterKey="menkaure"
        graniteKeys={["menkaure"]}
      />
    ),
  },
  { chapter: "07", line: "07-05", frames: 90, View: KhafreSphinx },
  {
    chapter: "08",
    line: "08-03",
    frames: 75,
    View: () => <PyramidCompare highlightKey="unas" enterKey="unas" />,
  },
  {
    chapter: "08",
    line: "08-08",
    frames: 100,
    View: () => (
      <HistoryLine
        visibleKeys={["khufu", "tut", "cleopatra", "now"]}
        highlightKey="tut"
        bracket={{ from: "khufu", to: "tut", label: "約1200年後" }}
      />
    ),
  },
  {
    chapter: "09",
    line: "09-04",
    frames: 80,
    View: () => (
      <>
        <AbsoluteFill style={{ background: COLORS.night }} />
        <IconRow
          dark
          items={[
            { glyph: "カー", label: "生命の力" },
            { glyph: "バー", label: "自由に動く魂" },
          ]}
          stagger={14}
        />
      </>
    ),
  },
  {
    chapter: "09",
    line: "09-07",
    frames: 90,
    View: () => (
      <>
        <Illustration file="09-solar-boat.png" dim={0.25} />
        <LabelTag
          kind="hypothesis"
          subject="王の遺体を運んだ船"
          x={140}
          y={160}
          delay={10}
        />
        <LabelTag
          kind="hypothesis"
          subject="太陽の神と空を旅する船"
          x={140}
          y={290}
          delay={30}
        />
      </>
    ),
  },
  {
    chapter: "10",
    line: "10-02",
    frames: 75,
    View: () => <PyramidCompare highlightKey="khufu" dark />,
  },
  { chapter: "10", line: "10-05", frames: 90, View: SectionCompare },
  {
    chapter: "10",
    line: "10-09",
    frames: 100,
    View: () => <Illustration file="10-horizon.png" zoom={[1, 1.1]} />,
  },
];

type Placed = Shot & { from: number; titleFrom: number | null };

const place = (): { shots: Placed[]; creditsFrom: number } => {
  let cursor = 0;
  let prevChapter = "";
  const shots = SHOTS.map((s) => {
    let titleFrom: number | null = null;
    if (s.chapter !== prevChapter && s.chapter !== "00") {
      titleFrom = cursor;
      cursor += TITLE_FRAMES;
    }
    prevChapter = s.chapter;
    const placed = {
      ...s,
      frames: Math.round(s.frames * SLOW),
      from: cursor,
      titleFrom,
    };
    cursor += placed.frames;
    return placed;
  });
  return { shots, creditsFrom: cursor };
};

const PLACED = place();
export const PYRAMID_PREVIS_DURATION = PLACED.creditsFrom + CREDITS_FRAMES;

const PrevisTag: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      left: 24,
      top: 20,
      fontFamily: "monospace",
      fontSize: 20,
      color: "rgba(255,255,255,0.85)",
      background: "rgba(0,0,0,0.45)",
      padding: "4px 10px",
      borderRadius: 4,
    }}
  >
    {text}
  </div>
);

const Credits: React.FC = () => (
  <AbsoluteFill
    style={{
      background: COLORS.night,
      justifyContent: "center",
      alignItems: "center",
      gap: 24,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        fontFamily: MINCHO,
        fontWeight: 800,
        fontSize: 56,
        color: COLORS.limestone,
      }}
    >
      {CREDIT_VOICE}
    </div>
    {CREDIT_VOICE_ACTOR ? (
      <div
        style={{ fontFamily: GOTHIC, fontSize: 36, color: COLORS.limestone }}
      >{`声：${CREDIT_VOICE_ACTOR}`}</div>
    ) : null}
    <div style={{ fontFamily: GOTHIC, fontSize: 30, color: "#A8ADB8" }}>
      参考：エジプト観光・考古省、Harvard Digital Giza、AERA ほか
    </div>
  </AbsoluteFill>
);

export const PyramidPrevis: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.night }}>
    {PLACED.shots.map((s) => (
      <React.Fragment key={s.line}>
        {s.titleFrom !== null ? (
          <Sequence from={s.titleFrom} durationInFrames={TITLE_FRAMES}>
            <ChapterTitle
              part={PART_OF_CHAPTER[s.chapter]}
              title={chapterTitle(s.chapter)}
              durationInFrames={TITLE_FRAMES}
            />
          </Sequence>
        ) : null}
        <Sequence from={s.from} durationInFrames={s.frames}>
          <s.View />
          <Subtitle text={subtitleOf(s.line)} durationInFrames={s.frames} />
          <PrevisTag text={`DIGEST ${s.line}`} />
        </Sequence>
      </React.Fragment>
    ))}
    <Sequence from={PLACED.creditsFrom} durationInFrames={CREDITS_FRAMES}>
      <Credits />
    </Sequence>
  </AbsoluteFill>
);
