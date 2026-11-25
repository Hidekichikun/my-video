// 章の画面の書き方の見本（コピーして Ch01.tsx… を作る）。
// ・行IDの開始フレームで札を置く：startOf(chapter, "01-03")
// ・先生はポーズ表（行番号→ポーズ）で切り替え、3D場面では smallness で小さく左下へ寄せる
// ・出す・消すは frame（章の頭から数えたフレーム）の範囲で決め、Seq で中身のフレームを0に戻す
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Guide, usePoseTrack, type PoseName } from "../Guide";
import { NowBadge, PopBackground, PopBadge } from "../parts";
import { BIG, SMALL, mixLayout, smallness, startOf, type ChapterProps } from "../lib";

const POSES: Record<number, PoseName> = { 1: "neutral" };

const Seq: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Sequence from={at} layout="none">
    {children}
  </Sequence>
);

export const ChapterExample: React.FC<ChapterProps> = ({ chapter }) => {
  const frame = useCurrentFrame();
  const s = (id: string) => startOf(chapter, id);
  const { pose, since } = usePoseTrack(chapter, POSES);
  const firstId = chapter.lines[0]?.id;
  // 3Dなどで画面を広く使う区間 [開始, 終了] だけ、先生を小さく左下へ
  const small = smallness(frame, []);
  const lay = mixLayout(BIG, SMALL, small);
  return (
    <AbsoluteFill>
      <PopBackground />
      <NowBadge id={chapter.id} title={chapter.shortTitle} />
      {firstId && frame >= s(firstId) ? (
        <Seq at={s(firstId)}>
          <PopBadge tone="meaning" size={80} angle={-2} style={{ position: "absolute", left: 740, top: 300 }}>
            ここに札
          </PopBadge>
        </Seq>
      ) : null}
      <Guide chapter={chapter} pose={pose} since={since} x={lay.x} footY={lay.footY} height={lay.height} />
    </AbsoluteFill>
  );
};
