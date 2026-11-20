import React from 'react';
import { Composition } from 'remotion';
import { Cosine, DURATION, FPS } from './Cosine';
import { CosineShort } from './Short';
const SH: [string, number, number, string][] = [
  ['CosineShortA', 56.5, 74.2, 'サビ'],
  ['CosineShortB', 141.3, 162.5, 'キモい×(−1)'],
  ['CosineShortC', 190.3, 213.9, '名前で呼んでよね'],
];
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Cosine" component={Cosine} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    {SH.map(([id, s, e, label]) => (
      <Composition key={id} id={id} component={CosineShort as any} durationInFrames={Math.round((e - s) * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ start: s, end: e, label }} />
    ))}
  </>
);
