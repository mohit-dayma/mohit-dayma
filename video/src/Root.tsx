import { Composition } from 'remotion';
import { Teaser, TEASER_DURATION } from './Teaser';

export const Root = () => (
  <Composition
    id="Teaser"
    component={Teaser}
    durationInFrames={TEASER_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
);
