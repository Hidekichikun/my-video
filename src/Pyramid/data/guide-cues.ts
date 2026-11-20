import { TIMELINE } from "./timeline";

type Pose = "neutral" | "point" | "wonder";
export type GuideCue = {
  first: string;
  last?: string;
  pose: Pose;
  side?: "left" | "right";
  left?: number;
  top: number;
  width: number;
};

// Each group follows a visual scene, rather than switching size for every sentence.
// All frame intervals, including pauses, chapter titles and credits, are covered.
export const GUIDE_CUES: GuideCue[] = [
  { first: "00-01", last: "00-02", pose: "neutral", width: 400, top: 235 },
  { first: "00-03", last: "00-04", pose: "wonder", side: "left", width: 390, top: 245 },
  { first: "00-05", pose: "wonder", width: 260, top: 400 },
  { first: "00-06", pose: "point", side: "left", width: 340, top: 280 },
  { first: "01-01", last: "01-03", pose: "point", left: 850, width: 300, top: 35 },
  { first: "01-04", last: "01-06", pose: "point", side: "left", width: 350, top: 300 },
  { first: "01-07", pose: "neutral", width: 340, top: 315 },
  { first: "01-08", pose: "point", width: 260, top: 120 },
  { first: "01-09", last: "01-10", pose: "wonder", side: "left", width: 320, top: 350 },
  { first: "01-11", pose: "point", side: "left", width: 380, top: 270 },
  { first: "02-01", last: "02-03", pose: "point", width: 430, top: 180 },
  { first: "02-04", pose: "point", width: 245, top: 475 },
  { first: "02-05", pose: "point", left: 445, width: 410, top: 195 },
  { first: "02-06", pose: "neutral", width: 430, top: 185 },
  { first: "03-01", pose: "neutral", side: "left", width: 350, top: 300 },
  { first: "03-02", pose: "point", width: 220, top: 175 },
  { first: "03-03", pose: "point", width: 420, top: 195 },
  { first: "03-04", last: "03-05", pose: "wonder", side: "left", width: 350, top: 305 },
  { first: "03-06", pose: "point", width: 400, top: 220 },
  { first: "03-07", pose: "point", side: "left", width: 370, top: 285 },
  { first: "04-01", pose: "neutral", width: 360, top: 295 },
  { first: "04-02", pose: "point", width: 180, top: 430 },
  { first: "04-03", pose: "wonder", width: 420, top: 195 },
  { first: "04-04", pose: "point", width: 320, top: 340 },
  { first: "04-05", last: "04-08", pose: "point", width: 350, top: 300 },
  { first: "04-09", pose: "point", side: "left", width: 330, top: 335 },
  { first: "04-10", pose: "wonder", width: 240, top: 490 },
  { first: "05-01", pose: "neutral", width: 320, top: 350 },
  { first: "05-02", pose: "wonder", width: 440, top: 170 },
  { first: "05-03", pose: "point", side: "left", width: 350, top: 310 },
  { first: "05-04", pose: "neutral", width: 330, top: 335 },
  { first: "05-05", last: "05-06", pose: "point", width: 200, top: 545 },
  { first: "05-07", last: "05-08", pose: "point", side: "left", width: 380, top: 270 },
  { first: "05-09", pose: "point", side: "left", width: 300, top: 370 },
  { first: "05-10", pose: "neutral", width: 290, top: 385 },
  { first: "05-11", pose: "point", side: "left", width: 350, top: 310 },
  { first: "05-12", last: "05-13", pose: "point", width: 220, top: 35 },
  { first: "05-14", pose: "wonder", width: 380, top: 265 },
  { first: "05-15", last: "05-16", pose: "point", width: 185, top: 535 },
  { first: "06-01", last: "06-04", pose: "point", width: 300, top: 260 },
  { first: "06-05", last: "06-06", pose: "wonder", width: 340, top: 320 },
  { first: "06-07", last: "06-08", pose: "point", side: "left", width: 350, top: 310 },
  { first: "06-09", last: "06-10", pose: "neutral", side: "left", width: 350, top: 305 },
  { first: "06-11", pose: "point", side: "left", width: 350, top: 310 },
  { first: "06-12", pose: "point", width: 330, top: 335 },
  { first: "06-13", pose: "wonder", width: 280, top: 390 },
  { first: "06-14", last: "06-16", pose: "wonder", width: 300, top: 260 },
  { first: "07-01", pose: "point", side: "left", width: 380, top: 270 },
  { first: "07-02", pose: "point", width: 260, top: 180 },
  { first: "07-03", pose: "wonder", width: 180, top: 490 },
  { first: "07-04", pose: "point", width: 350, top: 310 },
  { first: "07-05", last: "07-06", pose: "point", width: 350, top: 310 },
  { first: "07-07", last: "07-08", pose: "point", width: 260, top: 180 },
  { first: "08-01", last: "08-03", pose: "point", width: 260, top: 180 },
  { first: "08-04", last: "08-05", pose: "wonder", width: 320, top: 350 },
  { first: "08-06", pose: "point", width: 220, top: 495 },
  { first: "08-07", last: "08-08", pose: "point", left: 1300, width: 260, top: 60 },
  { first: "08-09", pose: "point", side: "left", width: 380, top: 270 },
  { first: "08-10", pose: "point", width: 340, top: 320 },
  { first: "08-11", pose: "wonder", width: 340, top: 320 },
  { first: "08-12", pose: "neutral", width: 230, top: 480 },
  { first: "09-01", last: "09-02", pose: "neutral", width: 400, top: 235 },
  { first: "09-03", pose: "point", width: 220, top: 270 },
  { first: "09-04", last: "09-05", pose: "point", width: 390, top: 250 },
  { first: "09-06", last: "09-07", pose: "wonder", width: 250, top: 175 },
  { first: "09-08", pose: "neutral", width: 300, top: 375 },
  { first: "09-09", pose: "point", side: "left", width: 380, top: 270 },
  { first: "10-01", last: "10-02", pose: "point", width: 260, top: 180 },
  { first: "10-03", pose: "point", side: "left", width: 340, top: 320 },
  { first: "10-04", last: "10-05", pose: "point", left: 845, width: 230, top: 470 },
  { first: "10-06", pose: "point", side: "left", width: 250, top: 470 },
  { first: "10-07", pose: "wonder", width: 390, top: 250 },
  { first: "10-08", pose: "point", width: 260, top: 180 },
  { first: "10-09", pose: "neutral", width: 420, top: 195 },
];

const lines = TIMELINE.chapters.flatMap((chapter) => chapter.lines);
export const GUIDE_WINDOWS = [
  ...TIMELINE.chapters.filter((chapter) => chapter.titleFrames > 0).map((chapter) => ({
    first: `title-${chapter.id}`, pose: "neutral" as Pose, width: 330, top: 335,
    from: chapter.from, end: chapter.lines[0].from,
  })),
  ...GUIDE_CUES.flatMap((cue) => {
    const first = lines.find((line) => line.id === cue.first);
    const chapter = TIMELINE.chapters.find((item) => item.lines.includes(first!));
    const lastIndex = chapter?.lines.findIndex((line) => line.id === (cue.last ?? cue.first)) ?? -1;
    if (!first || !chapter || lastIndex < 0) throw new Error(`Unknown guide cue: ${cue.first}`);
    const next = chapter.lines[lastIndex + 1];
    const window = { ...cue, from: first.from, end: next?.from ?? chapter.from + chapter.durationInFrames };
    // 04-02 changes from a dimensioned model to the comparison chart at this same point.
    if (cue.first === "04-02") {
      const cut = first.from + Math.round((window.end - first.from) * 0.6);
      return [{ ...window, end: cut },
        { ...window, first: "04-02-compare", from: cut, width: 440, top: 180 }];
    }
    return [window];
  }),
  { first: "credits", pose: "neutral" as Pose, width: 240, top: 480,
    from: TIMELINE.creditsFrom, end: TIMELINE.totalFrames },
].sort((a, b) => a.from - b.from) as (GuideCue & { from: number; end: number })[];

for (let i = 0; i < GUIDE_WINDOWS.length; i++) {
  const cue = GUIDE_WINDOWS[i];
  if (cue.from !== (i ? GUIDE_WINDOWS[i - 1].end : 0)) throw new Error(`Gap in guide coverage: ${cue.first}`);
  if (cue.end <= cue.from || cue.top + cue.width * 1.5 > 850) throw new Error(`Invalid guide placement: ${cue.first}`);
}
if (GUIDE_WINDOWS[GUIDE_WINDOWS.length - 1]?.end !== TIMELINE.totalFrames) throw new Error("Guide coverage must include the full video");
