import { Composition } from 'remotion';
import { Part1, PART1_DURATION } from './part1/Part1';
import { Teaser, TEASER_DURATION } from './Teaser';

export const Root = () => (
  <>
    <Composition
      id="Teaser"
      component={Teaser}
      durationInFrames={TEASER_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="Part1"
      component={Part1}
      durationInFrames={PART1_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
