import React from 'react';
import { Composition } from 'remotion';
import { Sine, DURATION, FPS } from './Sine';
import { SineShort } from './Short';
const SH: [string, number, number, string, boolean, boolean?][] = [
  ['SineShortA', 41.7, 65.3, 'サビ', false],
  ['SineHookA', 42.0, 57.0, 'サビ_音なし', true, true],
];
export const SineCompositions: React.FC = () => (
  <>
    <Composition id="Sine" component={Sine} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    {SH.map(([id, s, e, label, silent, clean]) => (
      <Composition key={id} id={id} component={SineShort as any} durationInFrames={Math.round((e - s) * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ start: s, end: e, label, silent, clean }} />
    ))}
  </>
);
