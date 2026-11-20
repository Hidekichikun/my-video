// ピラミッド本編だけを読み込み、他の動画のフォント取得を避ける書き出し用入口。
import '../index.css';
import {Composition, registerRoot} from 'remotion';
import {PyramidFull, PYRAMID_FULL_DURATION} from './index';

const PyramidRenderRoot = () => (
  <Composition id="PyramidFull" component={PyramidFull}
    durationInFrames={PYRAMID_FULL_DURATION} fps={30} width={1920} height={1080} />
);
registerRoot(PyramidRenderRoot);
