import { interpolate } from 'remotion';
import { clamp, Eyebrow, Reveal } from '../../shared/anim';
import { color, mono } from '../../theme';
import { useCues } from '../cues';
import { Body, Cite, Heading, Layer, Panel, Strong } from '../ui';

const ROWS = 8;
const COLS = 16;
const CELL = 40;
const GAP = 6;

interface DramState {
  /** Row being copied into the buffer, with progress 0–1. */
  activating: { row: number; t: number } | null;
  /** Row currently in the row buffer, or null. */
  open: number | null;
  /** Columns highlighted in the row buffer. */
  columns: number[];
  /** Precharge flash 0–1 on the row buffer. */
  precharge: number;
}

/** A DRAM bank: a grid of cells and its row buffer. */
const DramView = ({ state }: { state: DramState }) => {
  const bufferRow = state.open ?? state.activating?.row ?? null;
  const fill = state.open !== null ? 1 : (state.activating?.t ?? 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
      {Array.from({ length: ROWS }, (_, r) => {
        const lit =
          state.activating?.row === r
            ? 1 - Math.abs(state.activating.t * 2 - 1)
            : 0;
        const isOpen = state.open === r;
        return (
          <div
            key={r}
            style={{ display: 'flex', gap: GAP, alignItems: 'center' }}
          >
            <span
              style={{
                width: 80,
                fontFamily: mono,
                fontSize: 20,
                color: isOpen || lit > 0 ? color.amber : color.faint,
              }}
            >
              row {r}
            </span>
            {Array.from({ length: COLS }, (_, col) => (
              <div
                key={col}
                style={{
                  width: CELL,
                  height: CELL * 0.7,
                  borderRadius: 5,
                  background: `color-mix(in srgb, ${color.amber} ${Math.round(lit * 60 + (isOpen ? 14 : 0))}%, ${color.surface})`,
                  border: `1px solid ${isOpen ? color.amber : color.lineSubtle}`,
                }}
              />
            ))}
          </div>
        );
      })}
      <div
        style={{
          display: 'flex',
          gap: GAP,
          alignItems: 'center',
          marginTop: 26,
        }}
      >
        <span
          style={{
            width: 80,
            fontFamily: mono,
            fontSize: 20,
            color: color.muted,
            lineHeight: 1.1,
          }}
        >
          row
          <br />
          buffer
        </span>
        {Array.from({ length: COLS }, (_, col) => {
          const hot = state.columns.includes(col);
          return (
            <div
              key={col}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 6,
                background: hot
                  ? color.hit
                  : `color-mix(in srgb, ${color.amber} ${Math.round(fill * 45)}%, ${color.surface})`,
                border: `2px solid ${state.precharge > 0 ? color.miss : bufferRow !== null ? color.amber : color.line}`,
                opacity: 1 - state.precharge * 0.6,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          marginLeft: 86,
          marginTop: 6,
          fontFamily: mono,
          fontSize: 24,
          color: color.muted,
          height: 30,
        }}
      >
        {state.precharge > 0
          ? 'precharge: closing the open row…'
          : bufferRow === null
            ? 'no row open'
            : state.open === null
              ? `activating row ${bufferRow}…`
              : `row ${bufferRow} open`}
      </div>
    </div>
  );
};

const COST_ROWS = [
  {
    cue: 'rowhit',
    label: 'Same open row',
    formula: 'CL',
    cycles: 2,
    c: color.hit,
  },
  {
    cue: 'empty',
    label: 'No row open',
    formula: 'tRCD + CL',
    cycles: 5,
    c: color.amber,
  },
  {
    cue: 'conflict',
    label: 'Different row',
    formula: 'tRP + tRCD + CL',
    cycles: 7,
    c: color.miss,
  },
];

export const Dram = () => {
  const c = useCues();
  const f = c.frame;
  const local = (id: string) => f - c.at(id);
  const prog = (id: string, len: number, off = 0) =>
    interpolate(local(id) - off, [0, len], [0, 1], clamp);

  let state: DramState = {
    activating: null,
    open: null,
    columns: [],
    precharge: 0,
  };
  if (c.reached('seq')) {
    const sweep = Math.floor(
      interpolate(f, [c.at('seq') + 30, c.end('burst')], [0, COLS], clamp),
    );
    state = {
      activating: null,
      open: 6,
      columns: Array.from({ length: sweep }, (_, i) => i).slice(-4),
      precharge: 0,
    };
  } else if (c.reached('conflict')) {
    const pre = prog('conflict', 30, 20);
    const act = prog('conflict', 40, 60);
    if (pre < 1)
      state = {
        activating: null,
        open: 2,
        columns: [],
        precharge: pre > 0 ? 1 : 0,
      };
    else if (act < 1)
      state = {
        activating: { row: 6, t: act },
        open: null,
        columns: [],
        precharge: 0,
      };
    else
      state = {
        activating: null,
        open: 6,
        columns: local('conflict') > 120 ? [3] : [],
        precharge: 0,
      };
  } else if (c.reached('empty')) {
    const act = prog('empty', 40, 30);
    if (act <= 0)
      state = { activating: null, open: null, columns: [], precharge: 0 };
    else if (act < 1)
      state = {
        activating: { row: 2, t: act },
        open: null,
        columns: [],
        precharge: 0,
      };
    else state = { activating: null, open: 2, columns: [9], precharge: 0 };
  } else if (c.reached('rowhit')) {
    state = {
      activating: null,
      open: 2,
      columns: local('rowhit') > 20 ? [11] : [],
      precharge: 0,
    };
  } else if (c.reached('column')) {
    state = {
      activating: null,
      open: 2,
      columns: local('column') > 15 ? [5] : [],
      precharge: 0,
    };
  } else if (c.reached('activate')) {
    const act = prog('activate', 45, 20);
    state =
      act < 1
        ? {
            activating: { row: 2, t: act },
            open: null,
            columns: [],
            precharge: 0,
          }
        : { activating: null, open: 2, columns: [], precharge: 0 };
  }

  const main = c.phase('grid', 'aside');

  return (
    <>
      <Layer t={main}>
        <Reveal t={c.on('grid')}>
          <Heading>DRAM reads a whole row at a time</Heading>
        </Reveal>
        <div
          style={{
            display: 'flex',
            gap: 80,
            marginTop: 48,
            alignItems: 'flex-start',
          }}
        >
          <Reveal t={c.on('grid', 18, 10)}>
            <DramView state={state} />
            <Reveal t={c.on('seq')} style={{ marginTop: 30, width: 780 }}>
              <div style={{ fontSize: 32, color: color.muted }}>
                Sequential reads stay in the open row. One{' '}
                <Strong c={color.hit}>burst</Strong> fills a whole cache line.
              </div>
            </Reveal>
          </Reveal>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <Reveal t={c.on('activate')}>
              <div style={{ fontSize: 34, color: color.muted }}>
                <Strong c={color.amber}>1. Activate</Strong> — copy the row into
                the row buffer
              </div>
            </Reveal>
            <Reveal t={c.on('column')}>
              <div style={{ fontSize: 34, color: color.muted }}>
                <Strong c={color.hit}>2. Column read</Strong> — return data from
                the open row
              </div>
            </Reveal>
            <div style={{ height: 14 }} />
            <Reveal t={c.on('rowhit')}>
              <Eyebrow style={{ fontSize: 22 }}>
                Cost of one read · module timing 2-3-2
              </Eyebrow>
            </Reveal>
            {COST_ROWS.map((row) => (
              <Reveal key={row.cue} t={c.on(row.cue)}>
                <Panel
                  accent={
                    c.reached(row.cue) && local(row.cue) < 200
                      ? row.c
                      : undefined
                  }
                  style={{
                    padding: '14px 26px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 32 }}>{row.label}</div>
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 24,
                        color: color.faint,
                        marginTop: 4,
                      }}
                    >
                      {row.formula}
                    </div>
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 48, color: row.c }}>
                    {row.cycles}
                    <span style={{ fontSize: 24, color: color.faint }}>
                      {' '}
                      bus cycles
                    </span>
                  </div>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
        <Cite t={c.on('rowhit')}>
          Example module 2-3-2-8-T1 · Drepper (2007), §2.2
        </Cite>
      </Layer>

      <Layer t={c.phase('aside')} style={{ justifyContent: 'center' }}>
        <Reveal t={c.on('aside')}>
          <Eyebrow>Aside · the memory bus is slower too</Eyebrow>
        </Reveal>
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'center',
            marginTop: 40,
          }}
        >
          <Reveal t={c.on('aside', 18, 20)}>
            <Panel style={{ width: 560 }}>
              <div style={{ fontSize: 30, color: color.faint }}>
                Core 2 core clock
              </div>
              <div style={{ fontFamily: mono, fontSize: 64, marginTop: 8 }}>
                2.933 GHz
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('aside', 18, 60)}>
            <div style={{ fontFamily: mono, fontSize: 84, color: color.amber }}>
              11 : 1
            </div>
          </Reveal>
          <Reveal t={c.on('aside', 18, 40)}>
            <Panel style={{ width: 560 }}>
              <div style={{ fontSize: 30, color: color.faint }}>
                Bus clock (sold as “1.066 GHz”)
              </div>
              <div style={{ fontFamily: mono, fontSize: 64, marginTop: 8 }}>
                ~266 MHz
              </div>
            </Panel>
          </Reveal>
        </div>
        <Reveal t={c.on('aside', 18, 100)} style={{ marginTop: 40 }}>
          <div style={{ fontSize: 40, color: color.muted }}>
            One bus cycle of waiting ={' '}
            <Strong c={color.amber}>11 core cycles</Strong>.
          </div>
        </Reveal>
        <Reveal t={c.on('today')} style={{ marginTop: 60 }}>
          <Panel accent={color.line} style={{ width: 1400 }}>
            <span
              style={{ fontFamily: mono, color: color.amber, fontSize: 28 }}
            >
              Since 2007 ·{' '}
            </span>
            <span style={{ fontSize: 34, color: color.muted }}>
              DDR2 → DDR4 → DDR5. Bandwidth:{' '}
              <Strong c={color.hit}>many times higher</Strong>. Latency in ns:{' '}
              <Strong c={color.amber}>much the same</Strong>.
            </span>
          </Panel>
        </Reveal>
        <Cite>Drepper (2007), §2.2.4</Cite>
      </Layer>
    </>
  );
};
