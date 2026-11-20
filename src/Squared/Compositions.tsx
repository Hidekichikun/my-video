import React from 'react';
import { Composition } from 'remotion';
import { Squared, DURATION, FPS } from './Squared';
export const SquaredCompositions: React.FC = () => (
  <Composition id="Squared" component={Squared} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
