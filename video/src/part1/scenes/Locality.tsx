import { interpolate } from 'remotion';
import { clamp, Eyebrow, Reveal } from '../../shared/anim';
import { color, mono } from '../../theme';
import { useCues } from '../cues';
import { Cite, Heading, Layer, Panel, Strong } from '../ui';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Eight array slots, with a highlight moving or repeating over them. */
const Slots = ({ active }: { active: (i: number) => number }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    {Array.from({ length: 8 }, (_, i) => {
      const a = active(i);
      return (
        <div
          key={i}
          style={{
            width: 64,
            height: 64,
            borderRadius: 10,
            border: `2px solid ${a > 0 ? color.hit : color.lineSubtle}`,
            background: `color-mix(in srgb, ${color.hit} ${Math.round(a * 40)}%, ${color.surface})`,
          }}
        />
      );
    })}
  </div>
);

const CostBar = ({
  label,
  formula,
  value,
  max,
  t,
  c,
}: {
  label: string;
  formula: string;
  value: number;
  max: number;
  t: number;
  c: string;
}) => (
  <div style={{ opacity: Math.min(1, t * 3) }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}
    >
      <span style={{ fontSize: 36 }}>{label}</span>
      <span style={{ fontFamily: mono, fontSize: 48, color: c }}>
        {fmt(value * t)} cycles
      </span>
    </div>
    <div
      style={{
        fontFamily: mono,
        fontSize: 26,
        color: color.faint,
        marginTop: 6,
      }}
    >
      {formula}
    </div>
    <div
      style={{
        height: 34,
        marginTop: 14,
        borderRadius: 999,
        background: color.surface,
        border: `1px solid ${color.lineSubtle}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${(value / max) * 100 * t}%`,
          height: '100%',
          background: c,
          borderRadius: 999,
        }}
      />
    </div>
  </div>
);

export const Locality = () => {
  const c = useCues();
  const f = c.frame;
  const temporalPulse = (i: number) =>
    i === 2 ? 0.5 + 0.5 * Math.sin((f - c.at('temporal')) / 6) : 0;
  const spatialPos = interpolate(
    f,
    [c.at('spatial') + 10, c.end('spatial')],
    [0, 8],
    clamp,
  );
  const spatial = (i: number) =>
    i < spatialPos && i >= spatialPos - 1.5 ? 1 : i < spatialPos ? 0.25 : 0;

  return (
    <>
      <Layer t={c.phase('auto', 'example')}>
        <Reveal t={c.on('auto')}>
          <Heading>A cache is managed by the hardware</Heading>
        </Reveal>
        <Reveal t={c.on('auto', 18, 30)} style={{ marginTop: 26 }}>
          <div style={{ fontSize: 38, color: color.muted }}>
            Copies of recently used memory. Programs don't need to know it
            exists.
          </div>
        </Reveal>
        <Reveal t={c.on('why')} style={{ marginTop: 50 }}>
          <Eyebrow>It works because of locality</Eyebrow>
        </Reveal>
        <div style={{ display: 'flex', gap: 40, marginTop: 30 }}>
          <Reveal t={c.on('temporal')} style={{ flex: 1 }}>
            <Panel style={{ height: 300 }}>
              <div style={{ fontSize: 44, fontWeight: 600 }}>Temporal</div>
              <div style={{ fontSize: 32, color: color.muted, marginTop: 10 }}>
                Used now → used again soon. Loops.
              </div>
              <div style={{ marginTop: 40 }}>
                <Slots active={temporalPulse} />
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('spatial')} style={{ flex: 1 }}>
            <Panel style={{ height: 300 }}>
              <div style={{ fontSize: 44, fontWeight: 600 }}>Spatial</div>
              <div style={{ fontSize: 32, color: color.muted, marginTop: 10 }}>
                Nearby → used soon. Walking an array.
              </div>
              <div style={{ marginTop: 40 }}>
                <Slots active={spatial} />
              </div>
            </Panel>
          </Reveal>
        </div>
      </Layer>

      <Layer t={c.phase('example', 'limit')}>
        <Reveal t={c.on('example')}>
          <Heading>100 elements, used 100 times each</Heading>
        </Reveal>
        <Reveal t={c.on('example', 18, 40)} style={{ marginTop: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 34, color: color.muted }}>
            main memory <span style={{ color: color.amber }}>200</span> cycles ·
            cache <span style={{ color: color.hit }}>15</span> cycles
          </div>
        </Reveal>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 50,
            marginTop: 60,
            width: 1500,
          }}
        >
          <CostBar
            label="No cache"
            formula="10,000 × 200"
            value={2_000_000}
            max={2_000_000}
            t={c.on('nocache', 40)}
            c={color.amber}
          />
          <CostBar
            label="With a cache"
            formula="100 × 200 + 9,900 × 15"
            value={168_500}
            max={2_000_000}
            t={c.on('cache', 40, 60)}
            c={color.hit}
          />
        </div>
        <Reveal t={c.on('saving')} style={{ marginTop: 50 }}>
          <div style={{ fontSize: 60, fontWeight: 600 }}>
            <span style={{ color: color.hit }}>91.5%</span> less time on memory
          </div>
        </Reveal>
        <Cite>Worked example from Drepper (2007), §3</Cite>
      </Layer>

      <Layer t={c.phase('limit')}>
        <Reveal t={c.on('limit')}>
          <Heading>The limit is size</Heading>
        </Reveal>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 70,
            marginTop: 50,
          }}
        >
          <Reveal t={c.on('limit', 18, 30)}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 50 }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    background: color.hit,
                    margin: '0 auto',
                  }}
                />
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 28,
                    marginTop: 14,
                    color: color.hit,
                  }}
                >
                  4 MB cache
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 380,
                    height: 380,
                    border: `3px solid ${color.amber}`,
                    borderRadius: 8,
                    background: color.surface,
                  }}
                />
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 28,
                    marginTop: 14,
                    color: color.amber,
                  }}
                >
                  4 GB main memory
                </div>
              </div>
            </div>
          </Reveal>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 30,
              paddingBottom: 40,
            }}
          >
            <Reveal t={c.on('limit', 18, 60)}>
              <div style={{ fontSize: 44 }}>
                Cache ≈ <Strong c={color.amber}>1/1000</Strong> of main memory
              </div>
            </Reveal>
            <Reveal t={c.on('working')}>
              <Panel>
                <div
                  style={{ fontSize: 36, color: color.muted, lineHeight: 1.4 }}
                >
                  <Strong>Working set</Strong>: the data a program uses during a
                  period.
                  <br />
                  Fits → <Strong c={color.hit}>the cache works well</Strong>.
                  <br />
                  Doesn't fit →{' '}
                  <Strong c={color.miss}>constant evictions</Strong>.
                </div>
              </Panel>
            </Reveal>
          </div>
        </div>
        <Cite>Drepper (2007), §3 · area to scale</Cite>
      </Layer>
    </>
  );
};
