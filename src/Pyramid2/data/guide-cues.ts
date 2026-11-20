import { TIMELINE } from "./timeline";
import { denseLine, sceneFor } from "./scenes";

export type GuideWindow = {
  first: string;
  from: number;
  end: number;
  pose: "neutral" | "point" | "wonder";
  side: "left" | "right";
  top: number;
  width: number;
  left?: number;
};
export const GUIDE_WINDOWS: GuideWindow[] = [];
for (const chapter of TIMELINE.chapters) {
  if (chapter.titleFrames)
    GUIDE_WINDOWS.push({
      first: `${chapter.id}-title`,
      from: chapter.from,
      end: chapter.lines[0].from,
      pose: "neutral",
      side: "right",
      width: 180,
      top: 90,
    });
  chapter.lines.forEach((line, i) => {
    const scene = sceneFor(chapter.id, Number(line.id.slice(3)));
    const width = denseLine(line.id)
      ? Math.min(scene.width ?? 220, 220)
      : (scene.width ?? 400);
    const wonder = ["05-04", "05-24", "06-10", "06-11"].includes(line.id);
    GUIDE_WINDOWS.push({
      first: line.id,
      from: line.from,
      end:
        chapter.lines[i + 1]?.from ?? chapter.from + chapter.durationInFrames,
      side: scene.side,
      pose: wonder
        ? "wonder"
        : denseLine(line.id) || /札|図|カード|注記|アイコン/.test(line.screen)
          ? "point"
          : "neutral",
      // TODO(確認): 00-01〜02も「全編に出す」を優先し、札より上に小さく配置。
      width,
      top: chapter.id === "00" && i < 2 ? 90 : 740 - width * 1.5,
    });
  });
}
GUIDE_WINDOWS.push({
  first: "credits",
  from: TIMELINE.creditsFrom,
  end: TIMELINE.totalFrames,
  pose: "neutral",
  side: "right",
  width: 200,
  top: 450,
});
