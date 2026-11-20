import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Main';
import { DURATION, FPS } from './common';
export const GyudonCompositions: React.FC = () => <Composition id="Gyudon" component={Main} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />;
