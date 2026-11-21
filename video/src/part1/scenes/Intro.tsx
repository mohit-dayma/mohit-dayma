import { AbsoluteFill, interpolate } from 'remotion';
import { clamp, Eyebrow, ramp, Reveal } from '../../shared/anim';
import { color, mono, sans } from '../../theme';
import { useCues } from '../cues';
import { Heading, Layer, Panel } from '../ui';

const PARTS = [
  'How CPU caches work',
  'Measuring the cache hierarchy',
  'Writing cache-friendly code',
  'Virtual memory and the TLB',
  'Many cores: coherence and NUMA',
];

/** Title card, then the hook, the paper, and the series outline. */
export const Intro = () => {
  const c = useCues();
  const f = c.frame;
  const lead = c.scene.lead;

  const title = interpolate(f, [0, 12, lead - 10, lead], [0, 1, 1, 0], clamp);
  // Cycle counter that keeps climbing while the CPU "waits".
  const waited = Math.round(
    interpolate(f, [c.at('hook2') + 20, c.end('hook2')], [1, 240], clamp),
  );

  return (
    <AbsoluteFill style={{ fontFamily: sans }}>
      {title > 0 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            gap: 30,
            opacity: title,
          }}
        >
          <Reveal t={ramp(f, 4)}>
            <Eyebrow>Memory Series · Part 1</Eyebrow>
          </Reveal>
          <Reveal t={ramp(f, 12)}>
            <div
              style={{
                fontSize: 130,
                fontWeight: 700,
                color: color.foreground,
              }}
            >
              How CPU Caches Work
            </div>
          </Reveal>
          <Reveal t={ramp(f, 24)}>
            <div style={{ fontSize: 36, color: color.muted }}>
              Based on Ulrich Drepper,{' '}
              <i>What Every Programmer Should Know About Memory</i> (2007)
            </div>
          </Reveal>
        </AbsoluteFill>
      )}

      <Layer
        t={c.phase('hook1', 'paper')}
        style={{ justifyContent: 'center', alignItems: 'center', gap: 28 }}
      >
        <Reveal t={c.on('hook1')}>
          <Heading size={110}>Your CPU is fast.</Heading>
        </Reveal>
        <Reveal t={c.on('hook2')}>
          <Heading size={110} style={{ color: color.amber }}>
            Memory is not.
          </Heading>
        </Reveal>
        <Reveal t={c.on('hook2', 18, 20)}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 44,
              color: color.muted,
              marginTop: 30,
            }}
          >
            waiting… <span style={{ color: color.amber }}>{waited}</span> cycles
          </div>
        </Reveal>
        <Reveal t={c.on('hook3')}>
          <div style={{ fontSize: 44, color: color.muted, marginTop: 10 }}>
            Why — and how caches hide most of the wait.
          </div>
        </Reveal>
      </Layer>

      <Layer
        t={c.phase('paper', 'scope')}
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Reveal t={c.on('paper')}>
          <Panel
            style={{ width: 1100, padding: '56px 64px' }}
            accent={color.line}
          >
            <Eyebrow>The source</Eyebrow>
            <div
              style={{
                fontSize: 62,
                fontWeight: 600,
                marginTop: 24,
                lineHeight: 1.15,
              }}
            >
              What Every Programmer Should Know About Memory
            </div>
            <div style={{ fontSize: 38, color: color.muted, marginTop: 28 }}>
              Ulrich Drepper · Red Hat · 2007 · 114 pages
            </div>
          </Panel>
        </Reveal>
      </Layer>

      <Layer t={c.phase('scope')} style={{ justifyContent: 'center' }}>
        <Reveal t={c.on('scope')}>
          <Eyebrow>The series</Eyebrow>
        </Reveal>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            marginTop: 34,
          }}
        >
          {PARTS.map((part, i) => (
            <Reveal key={part} t={c.on('scope', 16, 6 + i * 5)}>
              <div
                style={{
                  display: 'flex',
                  gap: 32,
                  alignItems: 'baseline',
                  fontSize: 50,
                  color: i === 0 ? color.foreground : color.faint,
                  fontWeight: i === 0 ? 600 : 400,
                }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 36,
                    color: i === 0 ? color.amber : color.faint,
                  }}
                >
                  0{i + 1}
                </span>
                {part}
                {i === 0 && (
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 28,
                      color: color.amber,
                    }}
                  >
                    ← this video
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal t={c.on('dated')} style={{ marginTop: 56 }}>
          <div style={{ fontSize: 40, color: color.muted }}>
            Concepts: <span style={{ color: color.hit }}>still true</span>.
            Hardware: <span style={{ color: color.amber }}>dated</span> — watch
            for{' '}
            <span style={{ fontFamily: mono, color: color.foreground }}>
              Since 2007
            </span>{' '}
            notes.
          </div>
        </Reveal>
      </Layer>
    </AbsoluteFill>
  );
};
