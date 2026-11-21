import { Eyebrow, Reveal } from '../../shared/anim';
import { color, mono } from '../../theme';
import { useCues } from '../cues';
import { Body, Cite, Heading, Panel, Strong } from '../ui';

const Transistor = ({
  size = 34,
  c = color.foreground,
}: {
  size?: number;
  c?: string;
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 6,
      border: `3px solid ${c}`,
    }}
  />
);

const SramCell = () => (
  <div
    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 34px)', gap: 12 }}
  >
    {Array.from({ length: 6 }, (_, i) => (
      <Transistor key={i} />
    ))}
  </div>
);

const DramCell = ({ charge }: { charge: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
    <Transistor />
    <div style={{ width: 24, height: 3, background: color.muted }} />
    {/* capacitor */}
    <div
      style={{
        width: 46,
        height: 70,
        borderRadius: 8,
        border: `3px solid ${color.amber}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${charge * 100}%`,
          background: color.amber,
          opacity: 0.7,
        }}
      />
    </div>
  </div>
);

const COSTS = [
  {
    cue: 'leak',
    title: 'Leakage',
    text: 'Refresh every cell, typically every 64 ms.',
  },
  {
    cue: 'destroy',
    title: 'Destructive reads',
    text: 'A read drains the cell; write it back.',
  },
  {
    cue: 'weak',
    title: 'Weak signals',
    text: 'Tens of thousands of electrons. Needs a sense amplifier.',
  },
  {
    cue: 'slow',
    title: 'Slow charging',
    text: 'Wait until the signal is reliable.',
  },
];

export const Ram = () => {
  const c = useCues();
  const costsOn = c.on('costs');
  // Charge leaks during the "leak" cue, then is refreshed.
  const leak = c.span('leak');
  const charge = leak > 0 && leak < 1 ? (leak < 0.7 ? 1 - leak : 1) : 1;
  const verdict = c.on('verdict', 22);

  return (
    <Body>
      <Reveal t={c.on('intro')}>
        <Heading>Two kinds of RAM</Heading>
      </Reveal>
      <div style={{ display: 'flex', gap: 50, marginTop: 36 }}>
        {[
          {
            cue: 'sram',
            name: 'SRAM',
            sub: 'static',
            visual: <SramCell />,
            facts: ['6 transistors per bit', 'Fast', 'Big and power-hungry'],
            role: 'Caches',
            roleColor: color.hit,
          },
          {
            cue: 'dram',
            name: 'DRAM',
            sub: 'dynamic',
            visual: <DramCell charge={charge} />,
            facts: [
              '1 transistor + 1 capacitor',
              'Small and dense',
              'Cheap per bit',
            ],
            role: 'Main memory',
            roleColor: color.amber,
          },
        ].map((kind) => (
          <Reveal key={kind.name} t={c.on(kind.cue)} style={{ flex: 1 }}>
            <Panel
              style={{
                display: 'flex',
                gap: 40,
                alignItems: 'center',
                padding: '22px 34px',
              }}
            >
              <div
                style={{
                  width: 170,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {kind.visual}
              </div>
              <div>
                <div style={{ fontSize: 54, fontWeight: 600 }}>
                  {kind.name}{' '}
                  <span
                    style={{
                      fontSize: 28,
                      color: color.faint,
                      fontFamily: mono,
                    }}
                  >
                    {kind.sub}
                  </span>
                </div>
                {kind.facts.map((fact) => (
                  <div
                    key={fact}
                    style={{ fontSize: 29, color: color.muted, marginTop: 4 }}
                  >
                    {fact}
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 30,
                    fontFamily: mono,
                    color: kind.roleColor,
                    opacity: verdict,
                  }}
                >
                  → {kind.role}
                </div>
              </div>
            </Panel>
          </Reveal>
        ))}
      </div>

      <Reveal t={costsOn} style={{ marginTop: 32 }}>
        <Eyebrow>The price of DRAM's small size</Eyebrow>
      </Reveal>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 18,
          marginTop: 16,
        }}
      >
        {COSTS.map((cost, i) => {
          const active =
            c.reached(cost.cue) &&
            (i === 3 ? !c.reached('verdict') : !c.reached(COSTS[i + 1].cue));
          return (
            <Reveal key={cost.cue} t={c.on(cost.cue)}>
              <Panel
                accent={active ? color.amber : undefined}
                style={{ padding: '16px 28px' }}
              >
                <span
                  style={{ fontFamily: mono, color: color.amber, fontSize: 28 }}
                >
                  {i + 1}{' '}
                </span>
                <Strong>
                  <span style={{ fontSize: 34 }}>{cost.title}</span>
                </Strong>
                <div style={{ fontSize: 28, color: color.muted, marginTop: 6 }}>
                  {cost.text}
                </div>
              </Panel>
            </Reveal>
          );
        })}
      </div>
      <Cite t={c.on('leak')}>Drepper (2007), §2.1</Cite>
    </Body>
  );
};
