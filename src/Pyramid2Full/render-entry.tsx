import "../index.css";
import { Composition, Folder, registerRoot } from "remotion";
import {
  Pyramid2Full,
  Pyramid2Chapter,
  PYRAMID2_FULL_DURATION,
  PYRAMID2_CHAPTERS,
} from "./index";
const Root = () => (
  <>
    <Composition
      id="Pyramid2Full"
      component={Pyramid2Full}
      durationInFrames={PYRAMID2_FULL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Folder name="Pyramid2-chapters">
      {PYRAMID2_CHAPTERS.map((c) => (
        <Composition
          key={c.id}
          id={`Pyramid2Ch${c.id}`}
          component={Pyramid2Chapter}
          defaultProps={{ chapterId: c.id }}
          durationInFrames={c.durationInFrames}
          fps={30}
          width={1920}
          height={1080}
        />
      ))}
    </Folder>
  </>
);
registerRoot(Root);
