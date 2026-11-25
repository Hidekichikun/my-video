// 02 100人の私に引かせてみた（02-01〜02-10）
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Guide, usePoseTrack, type PoseName } from "../Guide";
import { HundredScene } from "../three/HundredScene";
import { sadCount, winCount, type HundredTimes } from "../three/hundred";
import {
  GridArt,
  IconCircle,
  NowBadge,
  PopBackground,
  PopBadge,
} from "../parts";
import { POP, clamp } from "../theme";
import { easeInOut, lenOf, startOf, type ChapterProps } from "../lib";

const POSES: Record<number, PoseName> = { 1: "neutral" };

export const Ch02: React.FC<ChapterProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const s = (id: string) => startOf(chapter, id);
  const { pose, since } = usePoseTrack(chapter, POSES);

  const times: HundredTimes = useMemo(
    () => ({
      appear: startOf(chapter, "02-02") + 4,
      // 「よーい、スタート！」の「スタート！」あたりで一斉にまわし始める
      start: startOf(chapter, "02-04") + Math.round(lenOf(chapter, "02-04") * 0.65),
      revealFrom: startOf(chapter, "02-05") + 6,
      revealTo: startOf(chapter, "02-06") + Math.round(lenOf(chapter, "02-06") * 0.85),
      sadFrom: startOf(chapter, "02-07") + Math.round(lenOf(chapter, "02-07") * 0.55),
      sadTo: startOf(chapter, "02-07") + Math.round(lenOf(chapter, "02-07") * 0.55) + 26,
      focus: startOf(chapter, "02-09"),
    }),
    [chapter],
  );

  // 先生：最初は大きく、100人が並ぶと左下に小さく
  const k = easeInOut(interpolate(frame, [s("02-02"), s("02-02") + 14], [0, 1], clamp));
  const gx = 430 + (190 - 430) * k;
  const gh = 900 + (440 - 900) * k;
  const gy = 885 + (860 - 885) * k;

  const wins = winCount(frame, times);
  const sads = sadCount(frame, times);

  return (
    <AbsoluteFill>
      <PopBackground />
      <HundredScene times={times} />

      <NowBadge id={chapter.id} title={chapter.shortTitle} />

      {/* 100連アイコン（02-03〜04） */}
      {frame >= s("02-03") && frame < times.revealFrom ? (
        <Sequence from={s("02-03")} layout="none">
          <div style={{ position: "absolute", left: 60, top: 140 }}>
            <IconCircle label="100連" color={POP.cyan} size={190}>
              <GridArt size={128} />
            </IconCircle>
          </div>
        </Sequence>
      ) : null}

      {/* カウンター：当たり・ハズレ */}
      {frame >= times.revealFrom - 6 ? (
        <Sequence from={times.revealFrom - 6} layout="none">
          <PopBadge
            tone="meaning"
            size={58}
            angle={-2}
            style={{ position: "absolute", left: 50, top: 150, minWidth: 380 }}
          >
            {`当たり ${wins}人`}
          </PopBadge>
        </Sequence>
      ) : null}
      {frame >= s("02-07") ? (
        <Sequence from={s("02-07")} layout="none">
          <PopBadge
            tone="miss"
            size={58}
            angle={2}
            style={{ position: "absolute", left: 50, top: 290, minWidth: 380 }}
          >
            {`ハズレ ${sads}人`}
          </PopBadge>
        </Sequence>
      ) : null}

      {/* 02-08：3人に1人以上がハズレ */}
      {frame >= s("02-08") && frame < s("02-10") ? (
        <Sequence from={s("02-08")} layout="none">
          <PopBadge
            tone="note"
            size={62}
            angle={-2}
            style={{ position: "absolute", left: 640, top: 60 }}
          >
            3人に1人以上がハズレ
          </PopBadge>
        </Sequence>
      ) : null}

      <Guide chapter={chapter} pose={pose} since={since} x={gx} footY={gy} height={gh} />
    </AbsoluteFill>
  );
};
