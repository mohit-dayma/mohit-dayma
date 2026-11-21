import { AbsoluteFill } from 'remotion';
import { Eyebrow, Reveal } from '../../shared/anim';
import { color, mono, sans } from '../../theme';
import { useCues } from '../cues';
import { Panel } from '../ui';

export const Outro = () => {
  const c = useCues();
  const end = c.on('blog');
  return (
    <AbsoluteFill
      style={{
        fontFamily: sans,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ opacity: 1 - end, position: 'absolute' }}>
        <Reveal t={c.on('next')}>
          <Panel style={{ width: 1200, padding: '50px 60px' }}>
            <Eyebrow>Next · Part 2</Eyebrow>
            <div
              style={{
                fontSize: 76,
                fontWeight: 600,
                marginTop: 20,
                color: color.foreground,
              }}
            >
              Measuring the cache hierarchy
            </div>
          </Panel>
        </Reveal>
      </div>
      <div
        style={{
          opacity: end,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 30,
        }}
      >
        <Eyebrow>Memory Series · Part 1</Eyebrow>
        <div
          style={{ fontSize: 120, fontWeight: 700, color: color.foreground }}
        >
          How CPU Caches Work
        </div>
        <div style={{ fontSize: 44, color: color.muted }}>
          The interactive version:{' '}
          <span style={{ color: color.amber }}>mohitd.com/blog</span>
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 24,
            color: color.faint,
            marginTop: 30,
          }}
        >
          Based on Ulrich Drepper, “What Every Programmer Should Know About
          Memory” (2007)
        </div>
      </div>
    </AbsoluteFill>
  );
};
