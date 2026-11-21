import { interpolate } from 'remotion';
import { clamp, Reveal } from '../../shared/anim';
import { CacheGrid } from '../../shared/CacheGrid';
import {
  formatHex,
  simulate,
  splitAddress,
  type CacheConfig,
  type MemoryAccess,
} from '../../../../src/components/mdx/memory/cache-model';
import { color, mono } from '../../theme';
import { stepAt, useCues } from '../cues';
import { Cite, Heading, Layer, Panel, Strong } from '../ui';

// Three layouts of the same 8 lines of 16 bytes.
const DESIGNS: {
  cue: string;
  name: string;
  config: CacheConfig;
  note: string;
}[] = [
  {
    cue: 'full',
    name: 'Fully associative',
    config: { lineSize: 16, sets: 1, ways: 8 },
    note: '1 set × 8 ways',
  },
  {
    cue: 'direct',
    name: 'Direct-mapped',
    config: { lineSize: 16, sets: 8, ways: 1 },
    note: '8 sets × 1 way',
  },
  {
    cue: 'setassoc',
    name: '2-way set-associative',
    config: { lineSize: 16, sets: 4, ways: 2 },
    note: '4 sets × 2 ways',
  },
];

const INCOMING = 0x0b0;
const CELL = 46;

/** Empty cache layout with the slots an incoming line may use highlighted. */
const Candidates = ({ config, t }: { config: CacheConfig; t: number }) => {
  const { set } = splitAddress(INCOMING, config);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Array.from({ length: config.sets }, (_, s) => (
        <div key={s} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span
            style={{
              fontFamily: mono,
              fontSize: 18,
              color: color.faint,
              width: 60,
            }}
          >
            set {s}
          </span>
          {Array.from({ length: config.ways }, (_, w) => {
            const ok = s === set;
            return (
              <div
                key={w}
                style={{
                  width: config.ways === 8 ? CELL : CELL * 2,
                  height: config.sets === 1 ? 80 : 34,
                  borderRadius: 8,
                  border: `2px solid ${ok && t > 0 ? color.amber : color.lineSubtle}`,
                  background: `color-mix(in srgb, ${color.amber} ${ok ? Math.round(t * 30) : 0}%, ${color.surface})`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

// LRU demo: four lines fill a 4-way set, line 0x000 is reused, then 0x040
// arrives and evicts the least recently used line (0x010).
const LRU_CONFIG: CacheConfig = { lineSize: 16, sets: 1, ways: 4 };
const LRU_TRACE: MemoryAccess[] = [
  0x000, 0x010, 0x020, 0x030, 0x000, 0x040,
].map((address) => ({
  address,
  kind: 'read',
}));
const LRU_STEPS = simulate(LRU_CONFIG, LRU_TRACE);

export const Associativity = () => {
  const c = useCues();
  const lruProgress = interpolate(
    c.frame,
    [c.at('lru') + 10, c.end('lru') - 10],
    [0, 1],
    clamp,
  );
  const lruIndex = stepAt(lruProgress, LRU_TRACE.length);
  const stepFrames = Math.max(
    1,
    (c.end('lru') - c.at('lru') - 20) / LRU_TRACE.length,
  );
  const lruLocal = c.frame - (c.at('lru') + 10 + (lruIndex - 1) * stepFrames);
  const lruStep = LRU_STEPS[lruIndex];

  return (
    <>
      <Layer t={c.phase('def', 'lru')}>
        <Reveal t={c.on('def')}>
          <Heading>Associativity: where can a line go?</Heading>
        </Reveal>
        <Reveal t={c.on('def', 18, 30)} style={{ marginTop: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 28, color: color.muted }}>
            8 lines of 16 B in each design · incoming line{' '}
            <span style={{ color: color.amber }}>{formatHex(INCOMING)}</span>
          </div>
        </Reveal>
        <div
          style={{
            display: 'flex',
            gap: 60,
            marginTop: 36,
            alignItems: 'flex-start',
          }}
        >
          {DESIGNS.map((d) => {
            const t = c.on(d.cue);
            return (
              <Reveal key={d.cue} t={t} style={{ flex: 1 }}>
                <div style={{ fontSize: 36, fontWeight: 600 }}>{d.name}</div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 24,
                    color: color.faint,
                    margin: '6px 0 16px',
                  }}
                >
                  {d.note}
                </div>
                <Candidates config={d.config} t={c.on(d.cue, 18, 40)} />
              </Reveal>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 30 }}>
          <Reveal t={c.on('fullcost')} style={{ flex: 1 }}>
            <Panel accent={color.miss} style={{ padding: '18px 24px' }}>
              <div style={{ fontSize: 28, color: color.muted }}>
                4 MB / 64 B = <Strong c={color.miss}>65,536 comparators</Strong>
                . Only tiny caches, like TLBs.
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('directcost')} style={{ flex: 1 }}>
            <Panel accent={color.miss} style={{ padding: '18px 24px' }}>
              <div style={{ fontSize: 28, color: color.muted }}>
                1 comparator, but same-slot lines evict each other:{' '}
                <Strong c={color.miss}>conflict misses</Strong>.
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('setassoc', 18, 60)} style={{ flex: 1 }}>
            <Panel accent={color.hit} style={{ padding: '18px 24px' }}>
              <div style={{ fontSize: 28, color: color.muted }}>
                Set index picks a set; compare{' '}
                <Strong c={color.hit}>one tag per way</Strong>.
              </div>
            </Panel>
          </Reveal>
        </div>
      </Layer>

      <Layer t={c.phase('lru')} style={{ alignItems: 'center' }}>
        <Heading>A full set evicts the least recently used line</Heading>
        <div
          style={{
            fontFamily: mono,
            fontSize: 30,
            color: color.muted,
            marginTop: 26,
            height: 40,
          }}
        >
          {lruStep.access ? (
            <>
              read{' '}
              <span style={{ color: color.foreground }}>
                {formatHex(lruStep.access.address)}
              </span>{' '}
              <span
                style={{
                  color: lruStep.outcome === 'hit' ? color.hit : color.miss,
                }}
              >
                {lruStep.outcome}
              </span>
              {lruStep.evicted && (
                <span style={{ color: color.amber }}>
                  {' '}
                  · evicts {formatHex(lruStep.evicted.lineAddress)}
                </span>
              )}
            </>
          ) : (
            'one 4-way set, empty'
          )}
        </div>
        <div style={{ marginTop: 40 }}>
          <CacheGrid
            config={LRU_CONFIG}
            step={lruStep}
            local={lruLocal}
            stepFrames={stepFrames}
            lineLabel={(line) => formatHex(line.lineAddress)}
            cellW={240}
            cellH={110}
            fontSize={34}
          />
        </div>
      </Layer>
      <Cite t={c.on('fullcost')}>Drepper (2007), §3.3.1</Cite>
    </>
  );
};
