'use client';

import { useState } from 'react';
import {
  formatHex,
  offsetBits,
  setBits,
  splitAddress,
  type CacheConfig,
} from './cache-model';
import { Segmented, WidgetFrame } from './widget-frame';

const ADDRESS_BITS = 32;
const MAX_ADDRESS = 2 ** ADDRESS_BITS;

interface Preset {
  id: string;
  label: string;
  note: string;
  config: CacheConfig;
}

const PRESETS: Preset[] = [
  {
    id: 'l1',
    label: '32 KB L1d, 8-way',
    note: 'A common L1 data cache size for many years.',
    config: { lineSize: 64, sets: 64, ways: 8 },
  },
  {
    id: 'l2',
    label: '4 MB L2, 8-way',
    note: "The paper's running example: 8,192 sets, so 13 set bits.",
    config: { lineSize: 64, sets: 8192, ways: 8 },
  },
  {
    id: 'direct',
    label: '4 MB direct-mapped',
    note: 'One line per set: 65,536 sets, selected by bits 6 to 21.',
    config: { lineSize: 64, sets: 65536, ways: 1 },
  },
  {
    id: 'full',
    label: '4 MB fully associative',
    note: 'One set holds every line, so there are no set bits. A lookup must compare 65,536 tags.',
    config: { lineSize: 64, sets: 1, ways: 65536 },
  },
];

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${bytes / (1024 * 1024)} MB`;
  if (bytes >= 1024) return `${bytes / 1024} KB`;
  return `${bytes} B`;
};

const parseHex = (text: string) => {
  const cleaned = text.trim().replace(/^0x/i, '');
  if (!/^[0-9a-f]{1,8}$/i.test(cleaned)) return null;
  return Number.parseInt(cleaned, 16);
};

const FIELD_STYLES = {
  tag: {
    text: 'text-sky-400',
    bg: 'bg-sky-400/15',
    border: 'border-sky-400/40',
  },
  set: {
    text: 'text-amber-400',
    bg: 'bg-amber-400/15',
    border: 'border-amber-400/40',
  },
  offset: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/15',
    border: 'border-emerald-400/40',
  },
};

export const AddressSplitter = () => {
  const [presetId, setPresetId] = useState('l1');
  const [address, setAddress] = useState(0x7ffe1234);
  const [draft, setDraft] = useState(formatHex(0x7ffe1234, 8));

  const preset = PRESETS.find((entry) => entry.id === presetId) ?? PRESETS[0];
  const { config } = preset;
  const o = offsetBits(config);
  const s = setBits(config);
  const t = ADDRESS_BITS - s - o;
  const parts = splitAddress(address, config);
  const setStride = config.sets * config.lineSize;

  const update = (next: number) => {
    const wrapped = ((next % MAX_ADDRESS) + MAX_ADDRESS) % MAX_ADDRESS;
    setAddress(wrapped);
    setDraft(formatHex(wrapped, 8));
  };

  const bits = address.toString(2).padStart(ADDRESS_BITS, '0').split('');
  const fieldOf = (bitIndex: number) => {
    const position = ADDRESS_BITS - 1 - bitIndex;
    if (position < o) return 'offset' as const;
    if (position < o + s) return 'set' as const;
    return 'tag' as const;
  };

  const fields = [
    { key: 'tag' as const, name: 'Tag', width: t, value: parts.tag },
    { key: 'set' as const, name: 'Set index', width: s, value: parts.set },
    { key: 'offset' as const, name: 'Offset', width: o, value: parts.offset },
  ];

  return (
    <WidgetFrame
      eyebrow="Interactive address decoder"
      title="Tag, set, offset"
      description="Pick a cache and an address. The cache reads the set index from the middle bits, then compares the tag against every line in that set."
    >
      <div className="space-y-5 p-4 md:p-5">
        <Segmented
          label="Cache"
          value={presetId}
          onChange={setPresetId}
          options={PRESETS.map((entry) => ({
            value: entry.id,
            label: entry.label,
          }))}
        />

        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-muted">
            <span className="block">Address (hex, 32-bit)</span>
            <input
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                const parsed = parseHex(event.target.value);
                if (parsed !== null) setAddress(parsed);
              }}
              onBlur={() => setDraft(formatHex(address, 8))}
              spellCheck={false}
              className="mt-1 w-36 rounded-md border border-line bg-surface px-2 py-1.5 font-mono text-sm text-foreground"
            />
          </label>
          <button
            type="button"
            onClick={() => update(address + 4)}
            className="rounded-md border border-line px-2.5 py-1.5 text-xs font-medium"
          >
            +4 B (next int)
          </button>
          <button
            type="button"
            onClick={() => update(address + config.lineSize)}
            className="rounded-md border border-line px-2.5 py-1.5 text-xs font-medium"
          >
            +{config.lineSize} B (next line)
          </button>
          {config.sets > 1 && (
            <button
              type="button"
              onClick={() => update(address + setStride)}
              className="rounded-md border border-line px-2.5 py-1.5 text-xs font-medium"
            >
              +{formatBytes(setStride)} (same set)
            </button>
          )}
        </div>

        <div>
          <div className="flex font-mono text-[9px] md:text-xs" aria-hidden>
            {bits.map((bit, index) => {
              const style = FIELD_STYLES[fieldOf(index)];
              return (
                <span
                  key={index}
                  className={`flex-1 border-y py-1 text-center first:rounded-l last:rounded-r ${style.bg} ${style.border} ${style.text}`}
                >
                  {bit}
                </span>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-faint">
            <span>bit 31</span>
            <span>bit 0</span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {fields.map((field) => (
            <div
              key={field.key}
              className={`rounded-md border p-3 ${FIELD_STYLES[field.key].border}`}
            >
              <p
                className={`text-xs font-medium ${FIELD_STYLES[field.key].text}`}
              >
                {field.name} · {field.width} bit{field.width === 1 ? '' : 's'}
              </p>
              <p className="mt-1 font-mono text-sm">
                {field.width === 0 ? '—' : formatHex(field.value, 1)}
                {field.width > 0 && (
                  <span className="text-faint"> = {field.value}</span>
                )}
              </p>
            </div>
          ))}
        </div>

        <p className="rounded-md border border-line-subtle bg-surface px-3 py-2 text-xs leading-relaxed text-muted md:text-sm">
          {preset.note} {config.sets.toLocaleString('en-US')} set
          {config.sets === 1 ? '' : 's'} × {config.ways.toLocaleString('en-US')}{' '}
          way
          {config.ways === 1 ? '' : 's'} × {config.lineSize} B ={' '}
          {formatBytes(config.sets * config.ways * config.lineSize)}.{' '}
          {config.sets > 1
            ? `Addresses ${formatBytes(setStride)} apart land in the same set, and only ${config.ways} of them fit there at once.`
            : 'Any line can go anywhere, so no two addresses compete for a set.'}
        </p>
      </div>
    </WidgetFrame>
  );
};
