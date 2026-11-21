import { interpolate } from 'remotion';
import { clamp, Eyebrow, Reveal } from '../../shared/anim';
import {
  LatencyBars,
  PAPER_LEVELS,
  TODAY_LEVELS,
} from '../../shared/LatencyBars';
import { color, mono } from '../../theme';
import { useCues } from '../cues';
import { Cite, Heading, Layer, Panel, Strong } from '../ui';

/** Illustrative only: two curves that start together and drift apart. */
const GapChart = ({ t }: { t: number }) => {
  const W = 1300;
  const H = 420;
  const n = 60;
  const pts = (fn: (x: number) => number) =>
    Array.from({ length: Math.max(2, Math.round(n * t)) }, (_, i) => {
      const x = i / n;
      return `${x * W},${H - fn(x) * H}`;
    }).join(' ');
  const cpu = (x: number) =>
    x < 0.35 ? 0.1 + x * 0.3 : 0.205 + Math.pow((x - 0.35) / 0.65, 1.6) * 0.75;
  const mem = (x: number) => 0.1 + x * 0.22;

  return (
    <svg width={W + 220} height={H + 70} style={{ overflow: 'visible' }}>
      <line x1={0} y1={H} x2={W} y2={H} stroke={color.line} strokeWidth={2} />
      <polyline
        points={pts(cpu)}
        fill="none"
        stroke={color.foreground}
        strokeWidth={6}
      />
      <polyline
        points={pts(mem)}
        fill="none"
        stroke={color.amber}
        strokeWidth={6}
      />
      <text
        x={W + 20}
        y={H - cpu(1) * H + 12}
        fill={color.foreground}
        fontSize={34}
        opacity={t > 0.95 ? 1 : 0}
      >
        CPU
      </text>
      <text
        x={W + 20}
        y={H - mem(1) * H + 12}
        fill={color.amber}
        fontSize={34}
        opacity={t > 0.95 ? 1 : 0}
      >
        Memory
      </text>
      <text
        x={0.35 * W}
        y={H + 50}
        fill={color.faint}
        fontSize={28}
        textAnchor="middle"
        fontFamily={mono}
      >
        early 1990s
      </text>
      <line
        x1={0.35 * W}
        y1={H}
        x2={0.35 * W}
        y2={H + 14}
        stroke={color.faint}
        strokeWidth={2}
      />
    </svg>
  );
};

export const Latency = () => {
  const c = useCues();
  const levelCues = ['ladder', 'l1', 'l2', 'mem'];
  const paperGrow = levelCues.map((id, i) => c.on(id, i === 3 ? 60 : 22, 10));
  const today = c.on('today', 30);
  const todayGrow = TODAY_LEVELS.map((_, i) => c.on('today', 26, 8 + i * 6));

  return (
    <>
      <Layer t={c.phase('history', 'ladder')}>
        <Reveal t={c.on('history')}>
          <Heading>CPU speed and memory speed split apart</Heading>
        </Reveal>
        <div style={{ marginTop: 60 }}>
          <GapChart
            t={interpolate(
              c.frame,
              [c.at('history'), c.end('split')],
              [0, 1],
              clamp,
            )}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 130,
            bottom: 200,
            fontFamily: mono,
            fontSize: 22,
            color: color.faint,
          }}
        >
          Illustrative shape, not measured data
        </div>
        <Reveal
          t={c.on('cost')}
          style={{ position: 'absolute', right: 130, top: 300, width: 520 }}
        >
          <Panel accent={color.line}>
            <div style={{ fontSize: 36, lineHeight: 1.35, color: color.muted }}>
              Memory as fast as a core can be built.
              <br />
              It costs <Strong c={color.amber}>orders of magnitude</Strong>{' '}
              more.
            </div>
          </Panel>
        </Reveal>
      </Layer>

      <Layer t={c.phase('ladder', 'hide')}>
        <Eyebrow>Cost of one load, in CPU cycles</Eyebrow>
        <Heading style={{ marginTop: 16 }}>How far away is your data?</Heading>
        <div style={{ marginTop: 56, position: 'relative' }}>
          <div style={{ opacity: 1 - today }}>
            <LatencyBars levels={PAPER_LEVELS} grow={paperGrow} />
          </div>
          {today > 0 && (
            <div style={{ position: 'absolute', inset: 0, opacity: today }}>
              <LatencyBars levels={TODAY_LEVELS} grow={todayGrow} gap={24} />
            </div>
          )}
        </div>
        <Reveal t={c.on('ratio') * (1 - today)} style={{ marginTop: 50 }}>
          <div style={{ fontSize: 46, color: color.muted }}>
            One trip to main memory ≈{' '}
            <Strong c={color.amber}>80 loads from L1d</Strong>.
          </div>
        </Reveal>
        <Cite>
          {today > 0.5
            ? 'Typical current desktop core, approximate · varies by CPU'
            : 'Pentium M · Drepper (2007), §3.2'}
        </Cite>
      </Layer>

      <Layer t={c.phase('hide')}>
        <Heading>Not every wait is paid in full</Heading>
        <div
          style={{
            marginTop: 70,
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
          }}
        >
          {[
            {
              label: 'load issued early',
              w: 260,
              x: 0,
              col: color.amber,
              cue: 'hide',
              off: 20,
            },
            {
              label: 'other work continues',
              w: 760,
              x: 120,
              col: color.foreground,
              cue: 'hide',
              off: 50,
            },
            {
              label: 'data arrives',
              w: 180,
              x: 900,
              col: color.hit,
              cue: 'hide',
              off: 90,
            },
          ].map((row) => {
            const t = c.on(row.cue, 24, row.off);
            return (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 30,
                  opacity: t,
                }}
              >
                <div style={{ width: 1120, height: 54, position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: row.x,
                      width: row.w * t,
                      height: 54,
                      borderRadius: 10,
                      background: row.col,
                      opacity: 0.85,
                    }}
                  />
                </div>
                <span style={{ fontSize: 36, color: color.muted }}>
                  {row.label}
                </span>
              </div>
            );
          })}
        </div>
        <Reveal t={c.on('hide2')} style={{ marginTop: 70 }}>
          <Panel accent={color.miss} style={{ width: 1300 }}>
            <div style={{ fontSize: 38, color: color.muted, lineHeight: 1.35 }}>
              Often hides an <Strong>L1d</Strong> access completely. Fails when
              the address is only known late — for example,{' '}
              <Strong c={color.miss}>computed by another instruction</Strong>.
            </div>
          </Panel>
        </Reveal>
      </Layer>
    </>
  );
};
