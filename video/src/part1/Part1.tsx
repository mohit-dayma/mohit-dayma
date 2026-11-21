import type { FC } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { Fade } from '../shared/anim';
import { color } from '../theme';
import { SceneContext } from './cues';
import { SCENES } from './timeline';
import { Captions, ChapterCard, ChapterTag } from './ui';
import { Addresses } from './scenes/Addresses';
import { Associativity } from './scenes/Associativity';
import { Changed } from './scenes/Changed';
import { Dram } from './scenes/Dram';
import { Hierarchy } from './scenes/Hierarchy';
import { Intro } from './scenes/Intro';
import { Latency } from './scenes/Latency';
import { Lines } from './scenes/Lines';
import { Locality } from './scenes/Locality';
import { Outro } from './scenes/Outro';
import { Ram } from './scenes/Ram';
import { Remember } from './scenes/Remember';
import { Simulator } from './scenes/Simulator';
import { Writes } from './scenes/Writes';

export { PART1_DURATION } from './timeline';

const SCENE_COMPONENTS: Record<string, FC> = {
  intro: Intro,
  latency: Latency,
  ram: Ram,
  dram: Dram,
  locality: Locality,
  hierarchy: Hierarchy,
  lines: Lines,
  assoc: Associativity,
  sim: Simulator,
  writes: Writes,
  addresses: Addresses,
  changed: Changed,
  remember: Remember,
  outro: Outro,
};

export const Part1 = () => (
  <AbsoluteFill style={{ background: color.background }}>
    {SCENES.map((scene) => {
      const Scene = SCENE_COMPONENTS[scene.id];
      return (
        <Sequence
          key={scene.id}
          name={scene.id}
          from={scene.from}
          durationInFrames={scene.duration}
        >
          <SceneContext.Provider value={scene}>
            <Fade duration={scene.duration} edge={8}>
              <Scene />
              <ChapterTag />
              <ChapterCard />
              <Captions />
            </Fade>
            <Sequence from={scene.lead} name={`${scene.id} voice`}>
              <Audio src={staticFile(`part1/audio/${scene.id}.mp3`)} />
            </Sequence>
          </SceneContext.Provider>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
