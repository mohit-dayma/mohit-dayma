import { interpolate } from 'remotion';
import { clamp, Eyebrow, Reveal } from '../../shared/anim';
import {
  cacheSize,
  formatHex,
  offsetBits,
  setBits,
  splitAddress,
  type CacheConfig,
} from '../../../../src/components/mdx/memory/cache-model';
import { color, mono } from '../../theme';
import { useCues } from '../cues';
import { Cite, Heading, Layer, Panel, Strong } from '../ui';

// The paper's running example: 4 MB, 8-way, 64-byte lines.
const L2: CacheConfig = { lineSize: 64, sets: 8192, ways: 8 };
const ADDRESS = 0x7f3a5c94;
const BITS = 32;

/** 64 bytes of memory: one byte is requested, the whole line comes along. */
const LineStrip = ({ fill, wanted }: { fill: number; wanted: number }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {Array.from({ length: 64 }, (_, i) => {
      const loaded = i / 64 < fill;
      return (
        <div
          key={i}
          style={{
            width: 22,
            height: 60,
            borderRadius: 3,
            background:
              i === wanted
                ? color.amber
                : loaded
                  ? `color-mix(in srgb, ${color.hit} 45%, ${color.surface})`
                  : color.surface,
            border: `1px solid ${i === wanted ? color.amber : loaded ? color.hit : color.lineSubtle}`,
          }}
        />
      );
    })}
  </div>
);

const FIELD_COLORS = { tag: '#a78bfa', set: color.amber, offset: color.hit };

/** A 32-bit address with its tag, set and offset fields. */
const AddressBits = ({
  show,
}: {
  show: { tag: number; set: number; offset: number };
}) => {
  const o = offsetBits(L2);
  const s = setBits(L2);
  const bin = ADDRESS.toString(2).padStart(BITS, '0');
  const fieldOf = (bit: number) =>
    bit < o ? 'offset' : bit < o + s ? 'set' : 'tag';
  const parts = splitAddress(ADDRESS, L2);
  const fields = [
    { key: 'tag' as const, bits: BITS - o - s, value: formatHex(parts.tag, 3) },
    {
      key: 'set' as const,
      bits: s,
      value: `${parts.set.toLocaleString('en-US')}`,
    },
    { key: 'offset' as const, bits: o, value: `${parts.offset}` },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 4 }}>
        {bin.split('').map((b, i) => {
          const bit = BITS - 1 - i;
          const field = fieldOf(bit);
          const t = show[field];
          return (
            <div
              key={i}
              style={{
                width: 44,
                height: 64,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: mono,
                fontSize: 30,
                color: t > 0 ? FIELD_COLORS[field] : color.muted,
                border: `2px solid ${t > 0 ? FIELD_COLORS[field] : color.lineSubtle}`,
                background: color.surface,
              }}
            >
              {b}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {fields.map((field) => (
          <div
            key={field.key}
            style={{
              width: field.bits * 48 - 4,
              opacity: show[field.key],
              borderTop: `3px solid ${FIELD_COLORS[field.key]}`,
              paddingTop: 10,
              textAlign: 'center',
              fontFamily: mono,
              fontSize: 26,
              color: FIELD_COLORS[field.key],
            }}
          >
            {field.key} · {field.bits} bits
            <div style={{ color: color.muted, fontSize: 24, marginTop: 4 }}>
              = {field.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Lines = () => {
  const c = useCues();
  const fill = interpolate(
    c.frame,
    [c.at('whole') + 20, c.at('whole') + 70],
    [0, 1],
    clamp,
  );

  return (
    <>
      <Layer t={c.phase('lines', 'split')}>
        <Reveal t={c.on('lines')}>
          <Heading>Caches store lines, not bytes</Heading>
        </Reveal>
        <Reveal t={c.on('lines', 18, 30)} style={{ marginTop: 50 }}>
          <Eyebrow>One cache line · 64 bytes</Eyebrow>
          <div style={{ marginTop: 20 }}>
            <LineStrip
              fill={c.reached('whole') ? fill : 0}
              wanted={c.reached('whole') ? 21 : -1}
            />
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 26,
              color: color.muted,
              marginTop: 14,
              height: 34,
            }}
          >
            {c.reached('whole') && (
              <>
                need <span style={{ color: color.amber }}>1 byte</span> → load{' '}
                <span style={{ color: color.hit }}>all 64</span>
              </>
            )}
          </div>
        </Reveal>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            marginTop: 40,
          }}
        >
          {[
            {
              cue: 'tag',
              text: 'Every entry needs a tag. A tag per word would cost as much as the data.',
            },
            {
              cue: 'reasons',
              text: 'Neighbouring bytes are likely to be used soon anyway.',
            },
            {
              cue: 'reasons',
              text: 'DRAM delivers a burst of consecutive words cheaply.',
              off: 50,
            },
          ].map((r, i) => (
            <Reveal key={i} t={c.on(r.cue, 18, r.off ?? 0)}>
              <div style={{ fontSize: 36, color: color.muted }}>
                <span style={{ fontFamily: mono, color: color.amber }}>
                  {i + 1}
                </span>{' '}
                {r.text}
              </div>
            </Reveal>
          ))}
        </div>
      </Layer>

      <Layer t={c.phase('split')}>
        <Reveal t={c.on('split')}>
          <Heading>Finding a line: split the address</Heading>
        </Reveal>
        <Reveal t={c.on('split', 18, 20)} style={{ marginTop: 26 }}>
          <div style={{ fontFamily: mono, fontSize: 30, color: color.muted }}>
            address{' '}
            <span style={{ color: color.foreground }}>
              {formatHex(ADDRESS, 8)}
            </span>{' '}
            in a {cacheSize(L2) / 2 ** 20} MB, {L2.ways}-way cache with{' '}
            {L2.lineSize}-byte lines
          </div>
        </Reveal>
        <div style={{ marginTop: 40 }}>
          <AddressBits
            show={{
              offset: c.on('offset'),
              set: c.on('set'),
              tag: c.on('tagbits'),
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 40 }}>
          <Reveal t={c.on('l2')} style={{ flex: 1 }}>
            <Panel>
              <div style={{ fontSize: 34, color: color.muted }}>
                <Strong c={color.amber}>
                  {L2.sets.toLocaleString('en-US')} sets
                </Strong>{' '}
                = 2<sup>{setBits(L2)}</sup> → {setBits(L2)} set bits. The set
                bits are not stored.
              </div>
            </Panel>
          </Reveal>
          <Reveal t={c.on('formula')} style={{ flex: 1 }}>
            <Panel accent={color.line}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 30,
                  color: color.foreground,
                }}
              >
                size = line × ways × sets
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 26,
                  color: color.muted,
                  marginTop: 8,
                }}
              >
                4 MB = 64 B × 8 × 8,192
              </div>
            </Panel>
          </Reveal>
        </div>
        <Cite t={c.on('l2')}>Example cache from Drepper (2007), §3.3.1</Cite>
      </Layer>
    </>
  );
};
