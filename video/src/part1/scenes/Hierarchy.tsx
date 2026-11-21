import type { ReactNode } from 'react';
import { interpolate } from 'remotion';
import { clamp, Reveal } from '../../shared/anim';
import { color, mono } from '../../theme';
import { useCues } from '../cues';
import { Body, Cite, Heading, Panel, Strong } from '../ui';

const Box = ({
  children,
  w,
  h = 74,
  c = color.lineSubtle,
  glow = 0,
  t = 1,
}: {
  children: ReactNode;
  w: number;
  h?: number;
  c?: string;
  glow?: number;
  t?: number;
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 12,
      border: `2px solid ${glow > 0 ? color.amber : c}`,
      background: `color-mix(in srgb, ${color.amber} ${Math.round(glow * 22)}%, ${color.surface})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: mono,
      fontSize: 28,
      color: color.foreground,
      opacity: t,
      transform: `translateY(${(1 - t) * 16}px)`,
    }}
  >
    {children}
  </div>
);

const CORE_W = 420;
const GAP = 40;

export const Hierarchy = () => {
  const c = useCues();
  const today = c.on('today', 30);
  const share =
    c.reached('sharing') && !c.reached('inclusive') ? c.on('sharing') : 0;
  const pulse = (k: number) =>
    share * (0.5 + 0.5 * Math.sin((c.frame - c.at('sharing')) / 7 + k));
  const total = CORE_W * 2 + GAP;
  const l2Split = interpolate(today, [0, 1], [0, 1], clamp);

  return (
    <Body>
      <Reveal t={c.on('levels')}>
        <Heading>Levels: each larger and slower</Heading>
      </Reveal>
      <div style={{ display: 'flex', gap: 80, marginTop: 50 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            width: total,
          }}
        >
          <div style={{ display: 'flex', gap: GAP }}>
            {[0, 1].map((core) => (
              <div
                key={core}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  width: CORE_W,
                }}
              >
                <Box
                  w={CORE_W}
                  h={110}
                  c={color.line}
                  t={c.on('levels', 18, 10)}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'inherit', fontSize: 30 }}>
                      Core {core}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        marginTop: 8,
                        justifyContent: 'center',
                      }}
                    >
                      {[0, 1].map((th) => (
                        <span
                          key={th}
                          style={{
                            fontSize: 20,
                            padding: '2px 10px',
                            borderRadius: 6,
                            border: `1px solid ${share > 0 ? color.amber : color.lineSubtle}`,
                            color: color.muted,
                          }}
                        >
                          thread {th}
                        </span>
                      ))}
                    </div>
                  </div>
                </Box>
                <div style={{ display: 'flex', gap: 14 }}>
                  <Box w={(CORE_W - 14) / 2} t={c.on('l1')} glow={pulse(core)}>
                    L1d
                  </Box>
                  <Box
                    w={(CORE_W - 14) / 2}
                    t={c.on('l1', 18, 8)}
                    glow={pulse(core)}
                  >
                    L1i
                  </Box>
                </div>
              </div>
            ))}
          </div>
          {/* L2: shared in 2007, private per core today. */}
          <div style={{ position: 'relative', height: 84 }}>
            {l2Split < 1 && (
              <div
                style={{ position: 'absolute', inset: 0, opacity: 1 - l2Split }}
              >
                <Box w={total} h={84} t={c.on('l2')} glow={pulse(2) * 0.6}>
                  L2 · shared (common in 2007)
                </Box>
              </div>
            )}
            {l2Split > 0 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  gap: GAP,
                  opacity: l2Split,
                }}
              >
                <Box w={CORE_W} h={84} c={color.hit}>
                  L2 · private
                </Box>
                <Box w={CORE_W} h={84} c={color.hit}>
                  L2 · private
                </Box>
              </div>
            )}
          </div>
          <Box w={total} h={84} t={c.on('l3')} glow={pulse(3) * 0.6}>
            L3 · shared by all cores
          </Box>
          <Box w={total} h={84} c={color.amber} t={c.on('levels', 18, 30)}>
            <span style={{ color: color.amber }}>Main memory (DRAM)</span>
          </Box>
        </div>

        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 22 }}
        >
          <Reveal t={c.on('l1')}>
            <div style={{ fontSize: 32, color: color.muted }}>
              <Strong>L1d</Strong> data · <Strong>L1i</Strong> instructions
            </div>
          </Reveal>
          <Reveal t={c.on('sharing')}>
            <Panel style={{ padding: '20px 26px' }}>
              <div
                style={{ fontSize: 28, color: color.muted, lineHeight: 1.5 }}
              >
                Threads on a core share its L1.
                <br />
                Cores share higher levels.
                <br />
                Separate processors share nothing.
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('inclusive')}>
            <Panel style={{ padding: '20px 26px' }}>
              <div
                style={{ fontSize: 28, color: color.muted, lineHeight: 1.5 }}
              >
                <Strong>Inclusive</Strong>: L1d lines also in L2 (Intel, 2007)
                <br />
                <Strong>Exclusive</Strong>: a line in one level only (AMD, 2007)
              </div>
            </Panel>
          </Reveal>
          <Reveal t={today}>
            <Panel accent={color.line} style={{ padding: '20px 26px' }}>
              <span
                style={{ fontFamily: mono, color: color.amber, fontSize: 24 }}
              >
                Since 2007 ·{' '}
              </span>
              <span style={{ fontSize: 28, color: color.muted }}>
                private L2 per core, large shared L3
              </span>
            </Panel>
          </Reveal>
        </div>
      </div>
      <Cite t={c.on('inclusive')}>Drepper (2007), §3.1–3.2</Cite>
    </Body>
  );
};
