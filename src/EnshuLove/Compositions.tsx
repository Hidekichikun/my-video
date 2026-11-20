import React from 'react';
import {Composition, Folder} from 'remotion';
import {EnshuLove, EnshuLoveThumbnail, ENSHU_DURATION} from './index';
import {timeline} from './timeline';
import {EnshuLoveShortHype, HYPE_START, HYPE_END} from './ShortHype';

export const EnshuLoveCompositions: React.FC = () => <Folder name="EnshuLove">
  <Composition id="EnshuLove" component={EnshuLove} durationInFrames={ENSHU_DURATION} fps={30} width={1920} height={1080}/>
  <Composition id="EnshuLoveShortChorus" component={EnshuLove} defaultProps={{mode: 'chorus' as const}} durationInFrames={Math.round((timeline.sections[3].end-timeline.sections[3].start)*30)} fps={30} width={1080} height={1920}/>
  <Composition id="EnshuLoveShortBreakdown" component={EnshuLove} defaultProps={{mode: 'breakdown' as const}} durationInFrames={Math.round((timeline.sections[9].end-timeline.sections[9].start)*30)} fps={30} width={1080} height={1920}/>
  <Composition id="EnshuLoveShortHype" component={EnshuLoveShortHype} durationInFrames={Math.round((HYPE_END - HYPE_START) * 30)} fps={30} width={1080} height={1920}/>
  <Composition id="EnshuLoveThumbnail" component={EnshuLoveThumbnail} durationInFrames={1} fps={30} width={1920} height={1080}/>
</Folder>;
