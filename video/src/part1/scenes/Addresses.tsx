import { Reveal } from '../../shared/anim';
import {
  offsetBits,
  setBits,
  type CacheConfig,
} from '../../../../src/components/mdx/memory/cache-model';
import { color, mono } from '../../theme';
import { useCues } from '../cues';
import { Cite, Heading, Layer, Panel, Strong } from '../ui';

// A 32 KB, 8-way L1d with 64-byte lines, as in the blog's address widget.
const L1D: CacheConfig = { lineSize: 64, sets: 64, ways: 8 };
const PAGE_BITS = 12; // 4 KB pages
const BITS = 32;

const Arrow = () => <div style={{ fontSize: 60, color: color.faint }}>→</div>;

/** Bits 31..0, with the page offset, set index and line offset marked. */
const VIPTBits = ({ t }: { t: number }) => {
  const o = offsetBits(L1D);
  const s = setBits(L1D);
  const W = 46;
  return (
    <div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: BITS }, (_, i) => {
          const bit = BITS - 1 - i;
          const inPage = bit < PAGE_BITS;
          const c = bit < o ? color.hit : bit < o + s ? color.amber : '#a78bfa';
          return (
            <div
              key={i}
              style={{
                width: W,
                height: 56,
                borderRadius: 6,
                border: `2px solid ${t > 0 ? c : color.lineSubtle}`,
                background:
                  inPage && t > 0
                    ? `color-mix(in srgb, ${color.hit} 12%, ${color.surface})`
                    : color.surface,
                fontFamily: mono,
                fontSize: 18,
                color: color.faint,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {bit}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginTop: 14,
          opacity: t,
          fontFamily: mono,
          fontSize: 24,
        }}
      >
        <div
          style={{
            width: (BITS - PAGE_BITS) * (W + 4) - 4,
            borderTop: `3px solid #a78bfa`,
            paddingTop: 8,
            textAlign: 'center',
            color: '#a78bfa',
          }}
        >
          tag ← physical address (after translation)
        </div>
        <div
          style={{
            width: s * (W + 4) - 4,
            borderTop: `3px solid ${color.amber}`,
            paddingTop: 8,
            textAlign: 'center',
            color: color.amber,
          }}
        >
          set · {s} bits
        </div>
        <div
          style={{
            width: o * (W + 4) - 4,
            borderTop: `3px solid ${color.hit}`,
            paddingTop: 8,
            textAlign: 'center',
            color: color.hit,
          }}
        >
          offset · {o}
        </div>
      </div>
      <div
        style={{
          marginLeft: (BITS - PAGE_BITS) * (W + 4),
          width: PAGE_BITS * (W + 4) - 4,
          marginTop: 16,
          opacity: t,
          border: `2px dashed ${color.hit}`,
          borderRadius: 10,
          padding: '8px 0',
          textAlign: 'center',
          fontFamily: mono,
          fontSize: 22,
          color: color.hit,
        }}
      >
        page offset (4 KB pages): not translated
      </div>
    </div>
  );
};

export const Addresses = () => {
  const c = useCues();

  return (
    <>
      <Layer t={c.phase('two', 'vipt')}>
        <Reveal t={c.on('two')}>
          <Heading>Which address does the cache use?</Heading>
        </Reveal>
        <Reveal t={c.on('two', 18, 30)} style={{ marginTop: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <Panel style={{ padding: '20px 30px' }}>
              <div style={{ fontFamily: mono, fontSize: 34 }}>
                virtual address
              </div>
            </Panel>
            <Arrow />
            <Panel accent={color.amber} style={{ padding: '20px 30px' }}>
              <div
                style={{ fontFamily: mono, fontSize: 34, color: color.amber }}
              >
                translation (takes time)
              </div>
            </Panel>
            <Arrow />
            <Panel style={{ padding: '20px 30px' }}>
              <div style={{ fontFamily: mono, fontSize: 34 }}>
                physical address
              </div>
            </Panel>
          </div>
        </Reveal>
        <Reveal t={c.on('virt')} style={{ marginTop: 34 }}>
          <div style={{ fontSize: 34, color: color.muted }}>
            Virtual addresses are <Strong c={color.miss}>not unique</Strong>:
            same address, different process, different memory.
          </div>
        </Reveal>
        <Reveal t={c.on('paper')} style={{ marginTop: 50 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 26,
              color: color.faint,
              marginBottom: 16,
            }}
          >
            THE PAPER, 2007
          </div>
          <div style={{ display: 'flex', gap: 34 }}>
            <Panel style={{ flex: 1 }}>
              <div style={{ fontSize: 40, fontWeight: 600 }}>L1 · virtual</div>
              <div style={{ fontSize: 30, color: color.muted, marginTop: 8 }}>
                ~3 cycles: no time to translate. Small, cheap to clear.
              </div>
            </Panel>
            <Reveal t={c.on('paper2')} style={{ flex: 1 }}>
              <Panel>
                <div style={{ fontSize: 40, fontWeight: 600 }}>
                  L2 and up · physical
                </div>
                <div style={{ fontSize: 30, color: color.muted, marginTop: 8 }}>
                  Slower, so translation finishes in time.
                </div>
              </Panel>
            </Reveal>
          </div>
        </Reveal>
        <Cite t={c.on('paper')}>Drepper (2007), §3.3.5</Cite>
      </Layer>

      <Layer t={c.phase('vipt')}>
        <Heading>Today: virtually indexed, physically tagged</Heading>
        <div
          style={{
            fontFamily: mono,
            fontSize: 28,
            color: color.muted,
            marginTop: 20,
          }}
        >
          32 KB L1d · 8 ways · 64 sets · 64-byte lines
        </div>
        <div style={{ marginTop: 44 }}>
          <VIPTBits t={c.on('vipt2')} />
        </div>
        <Reveal t={c.on('vipt2', 18, 90)} style={{ marginTop: 30 }}>
          <div style={{ fontSize: 34, color: color.muted }}>
            {setBits(L1D)} + {offsetBits(L1D)} ={' '}
            <Strong c={color.hit}>12 bits</Strong>: the set is known before
            translation finishes.
          </div>
        </Reveal>
        <Reveal t={c.on('advice')} style={{ marginTop: 30 }}>
          <Panel accent={color.line}>
            <div style={{ fontSize: 32, color: color.muted }}>
              Paper's advice: <Strong>use each page completely</Strong>, and{' '}
              <Strong>use larger pages</Strong> where they make sense.
            </div>
          </Panel>
        </Reveal>
      </Layer>
    </>
  );
};
