import { interpolate } from 'remotion';
import { clamp, Reveal } from '../../shared/anim';
import { CacheGrid } from '../../shared/CacheGrid';
import {
  simulate,
  type CacheConfig,
  type MemoryAccess,
} from '../../../../src/components/mdx/memory/cache-model';
import { color, mono } from '../../theme';
import { stepAt, useCues } from '../cues';
import { Cite, Heading, Layer, Panel, Strong } from '../ui';

// A one-line cache: a loop writes `x` six times, then `y` needs the slot.
const ONE_LINE: CacheConfig = { lineSize: 16, sets: 1, ways: 1 };
const LOOP: MemoryAccess[] = [
  ...Array.from({ length: 6 }, () => ({
    address: 0x000,
    kind: 'write' as const,
    label: 'x',
  })),
  { address: 0x040, kind: 'read' as const, label: 'y' },
];
const LOOP_STEPS = simulate(ONE_LINE, LOOP);

// The conflicting-arrays trace from the simulator, direct-mapped vs 4-way.
const CONFLICT: MemoryAccess[] = Array.from({ length: 4 }, (_, i) => [
  { address: 0x080 + i * 4, kind: 'read' as const },
  { address: 0x100 + i * 4, kind: 'read' as const },
  { address: 0x000 + i * 4, kind: 'write' as const },
]).flat();
const WB_DIRECT = simulate({ lineSize: 16, sets: 8, ways: 1 }, CONFLICT).at(-1)!
  .stats.writebacks;
const WB_FOUR = simulate({ lineSize: 16, sets: 2, ways: 4 }, CONFLICT).at(-1)!
  .stats.writebacks;

export const Writes = () => {
  const c = useCues();
  const start = c.at('through') + 10;
  const stop = c.end('back');
  const progress = interpolate(c.frame, [start, stop], [0, 1], clamp);
  const index = stepAt(progress, LOOP.length);
  const stepFrames = (stop - start) / LOOP.length;
  const local = c.frame - (start + (index - 1) * stepFrames);
  const step = LOOP_STEPS[index];
  const writes = LOOP.slice(0, index).filter((a) => a.kind === 'write').length;

  return (
    <>
      <Layer t={c.phase('rule', 'special')}>
        <Reveal t={c.on('rule')}>
          <Heading>A cache must act as if it weren't there</Heading>
        </Reveal>
        <div
          style={{
            fontFamily: mono,
            fontSize: 30,
            color: color.muted,
            marginTop: 24,
            height: 40,
          }}
        >
          {step.access ? (
            <>
              {step.access.kind}{' '}
              <span style={{ color: color.foreground }}>
                {step.access.label}
              </span>
              {step.evicted?.dirty && (
                <span style={{ color: color.amber }}>
                  {' '}
                  · evicts dirty x → write back
                </span>
              )}
            </>
          ) : c.reached('through') ? (
            'loop: x = x + 1, six times; then read y'
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 50, marginTop: 40 }}>
          <Reveal t={c.on('through')} style={{ flex: 1 }}>
            <Panel style={{ height: 380 }}>
              <div style={{ fontSize: 44, fontWeight: 600 }}>Write-through</div>
              <div style={{ fontSize: 30, color: color.muted, marginTop: 10 }}>
                Every write also goes to memory.
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 96,
                  color: color.miss,
                  marginTop: 50,
                }}
              >
                {writes}
              </div>
              <div
                style={{ fontFamily: mono, fontSize: 26, color: color.faint }}
              >
                memory writes
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('back')} style={{ flex: 1 }}>
            <Panel style={{ height: 380 }}>
              <div style={{ fontSize: 44, fontWeight: 600 }}>Write-back</div>
              <div style={{ fontSize: 30, color: color.muted, marginTop: 10 }}>
                Mark the line <span style={{ color: color.amber }}>dirty</span>;
                write on eviction.
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 50,
                  marginTop: 50,
                }}
              >
                <div>
                  <div
                    style={{ fontFamily: mono, fontSize: 96, color: color.hit }}
                  >
                    {step.stats.writebacks}
                  </div>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 26,
                      color: color.faint,
                    }}
                  >
                    memory writes
                  </div>
                </div>
                <CacheGrid
                  config={ONE_LINE}
                  step={step}
                  local={local}
                  stepFrames={stepFrames}
                  lineLabel={(line) => (line.lineAddress === 0 ? 'x' : 'y')}
                  cellW={200}
                  cellH={80}
                  fontSize={34}
                  showStats={false}
                />
              </div>
            </Panel>
          </Reveal>
        </div>
        <Reveal t={c.on('sim')} style={{ marginTop: 34 }}>
          <div style={{ fontSize: 36, color: color.muted }}>
            Conflicting arrays: direct-mapped wrote back{' '}
            <Strong c={color.miss}>{WB_DIRECT}×</Strong>, 4-way{' '}
            <Strong c={color.hit}>{WB_FOUR}×</Strong>.
          </div>
        </Reveal>
      </Layer>

      <Layer t={c.phase('special')}>
        <Heading>Special memory, and many cores</Heading>
        <div style={{ display: 'flex', gap: 40, marginTop: 50 }}>
          <Reveal t={c.on('special', 18, 20)} style={{ flex: 1 }}>
            <Panel style={{ height: 210 }}>
              <div style={{ fontSize: 40, fontWeight: 600 }}>
                Write-combining
              </div>
              <div style={{ fontSize: 30, color: color.muted, marginTop: 12 }}>
                Gather writes to a line, send together. Graphics card memory.
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('special', 18, 150)} style={{ flex: 1 }}>
            <Panel style={{ height: 210 }}>
              <div style={{ fontSize: 40, fontWeight: 600 }}>Uncacheable</div>
              <div style={{ fontSize: 30, color: color.muted, marginTop: 12 }}>
                Never cached. Device registers, where writes must take effect
                now.
              </div>
            </Panel>
          </Reveal>
        </div>
        <Reveal t={c.on('coherence')} style={{ marginTop: 44 }}>
          <Panel accent={color.amber}>
            <div style={{ fontSize: 40, fontWeight: 600 }}>Cache coherence</div>
            <div
              style={{
                display: 'flex',
                gap: 50,
                marginTop: 20,
                fontSize: 32,
                color: color.muted,
              }}
            >
              <div>
                <span style={{ color: color.amber }}>●</span> A{' '}
                <Strong>dirty</Strong> line is in only one cache.
              </div>
              <div>
                <span style={{ color: color.hit }}>●</span>{' '}
                <Strong>Clean</Strong> copies can be in many.
              </div>
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 24,
                color: color.faint,
                marginTop: 16,
              }}
            >
              How MESI enforces this: Part 5
            </div>
          </Panel>
        </Reveal>
        <Cite>Drepper (2007), §3.3.3</Cite>
      </Layer>
    </>
  );
};
