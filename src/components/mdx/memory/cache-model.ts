/**
 * A small, deterministic model of one set-associative cache level.
 *
 * It is shared by every widget in the "What every programmer should know
 * about memory" series. It takes a cache configuration and a list of memory
 * accesses, and returns one snapshot per access so a stepper can replay them.
 *
 * Policies: LRU replacement, write-back, write-allocate. Real CPUs use
 * pseudo-LRU and other variations, so results are a model, not a measurement.
 */

export type AccessKind = 'read' | 'write';

export interface CacheConfig {
  /** Bytes per cache line. Must be a power of two. */
  lineSize: number;
  /** Number of sets. Must be a power of two. */
  sets: number;
  /** Lines per set (associativity). */
  ways: number;
}

export interface MemoryAccess {
  address: number;
  kind: AccessKind;
  /** Optional source-level label, such as `b[2]`. */
  label?: string;
}

export interface AddressParts {
  tag: number;
  set: number;
  offset: number;
  /** Address of the first byte of the line that holds this address. */
  lineAddress: number;
}

export interface CacheLine {
  valid: boolean;
  dirty: boolean;
  tag: number;
  lineAddress: number;
  /** Step number of the most recent use, for LRU. */
  lastUsed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  writebacks: number;
}

export interface CacheStep {
  /** `null` for the initial, empty state. */
  access: MemoryAccess | null;
  parts: AddressParts | null;
  outcome: 'hit' | 'miss' | null;
  /** Way that served or received the line. */
  way: number | null;
  evicted: CacheLine | null;
  lines: CacheLine[][];
  stats: CacheStats;
  explanation: string;
}

const log2 = (value: number) => Math.log2(value);

export const isPowerOfTwo = (value: number) =>
  Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0;

export const cacheSize = (config: CacheConfig) =>
  config.lineSize * config.sets * config.ways;

export const offsetBits = (config: CacheConfig) => log2(config.lineSize);

export const setBits = (config: CacheConfig) => log2(config.sets);

/** Splits an address into tag, set index, and offset. */
export const splitAddress = (
  address: number,
  config: CacheConfig,
): AddressParts => {
  // Use arithmetic, not bit operators, so 32-bit addresses stay unsigned.
  const offset = address % config.lineSize;
  const lineNumber = Math.floor(address / config.lineSize);
  const set = lineNumber % config.sets;
  const tag = Math.floor(lineNumber / config.sets);

  return { tag, set, offset, lineAddress: lineNumber * config.lineSize };
};

export const formatHex = (value: number, digits = 3) =>
  `0x${value.toString(16).toUpperCase().padStart(digits, '0')}`;

const emptyLine = (): CacheLine => ({
  valid: false,
  dirty: false,
  tag: 0,
  lineAddress: 0,
  lastUsed: -1,
});

const lineRange = (line: CacheLine, config: CacheConfig) =>
  `${formatHex(line.lineAddress)}–${formatHex(
    line.lineAddress + config.lineSize - 1,
  )}`;

const cloneLines = (lines: CacheLine[][]) =>
  lines.map((set) => set.map((line) => ({ ...line })));

const describe = (
  access: MemoryAccess,
  parts: AddressParts,
  outcome: 'hit' | 'miss',
  way: number,
  evicted: CacheLine | null,
  config: CacheConfig,
) => {
  const verb = access.kind === 'read' ? 'Read' : 'Write';
  const target = access.label
    ? `${access.label} (${formatHex(access.address)})`
    : formatHex(access.address);
  const where =
    config.sets === 1 ? `tag ${formatHex(parts.tag, 2)}` : `set ${parts.set}`;
  const head = `${verb} ${target} → ${where}.`;
  const range = `${formatHex(parts.lineAddress)}–${formatHex(
    parts.lineAddress + config.lineSize - 1,
  )}`;
  const dirtyNote =
    access.kind === 'write'
      ? ' The write marks the line dirty. Memory is not updated yet.'
      : '';

  if (outcome === 'hit') {
    return `${head} Hit in way ${way}: the line is already cached.${dirtyNote}`;
  }

  if (!evicted) {
    return `${head} Miss. A free way exists, so line ${range} loads into way ${way}.${dirtyNote}`;
  }

  const writeback = evicted.dirty
    ? ' It is dirty, so it is written back to memory first.'
    : ' It is clean, so it is dropped.';

  return `${head} Miss, and the set is full. The least recently used line (${lineRange(
    evicted,
    config,
  )}) is evicted.${writeback} Line ${range} takes way ${way}.${dirtyNote}`;
};

/** Replays `accesses` through an initially empty cache. */
export const simulate = (
  config: CacheConfig,
  accesses: MemoryAccess[],
): CacheStep[] => {
  const lines: CacheLine[][] = Array.from({ length: config.sets }, () =>
    Array.from({ length: config.ways }, emptyLine),
  );
  const stats: CacheStats = { hits: 0, misses: 0, writebacks: 0 };

  const steps: CacheStep[] = [
    {
      access: null,
      parts: null,
      outcome: null,
      way: null,
      evicted: null,
      lines: cloneLines(lines),
      stats: { ...stats },
      explanation: `The cache starts empty: ${config.sets} set${
        config.sets === 1 ? '' : 's'
      } × ${config.ways} way${config.ways === 1 ? '' : 's'} × ${
        config.lineSize
      } B lines = ${cacheSize(config)} B.`,
    },
  ];

  accesses.forEach((access, index) => {
    const time = index + 1;
    const parts = splitAddress(access.address, config);
    const set = lines[parts.set];
    let way = set.findIndex((line) => line.valid && line.tag === parts.tag);
    let outcome: 'hit' | 'miss' = 'hit';
    let evicted: CacheLine | null = null;

    if (way === -1) {
      outcome = 'miss';
      way = set.findIndex((line) => !line.valid);

      if (way === -1) {
        way = set.reduce(
          (oldest, line, candidate) =>
            line.lastUsed < set[oldest].lastUsed ? candidate : oldest,
          0,
        );
        evicted = { ...set[way] };
        if (evicted.dirty) {
          stats.writebacks += 1;
        }
      }

      set[way] = {
        valid: true,
        dirty: false,
        tag: parts.tag,
        lineAddress: parts.lineAddress,
        lastUsed: time,
      };
      stats.misses += 1;
    } else {
      stats.hits += 1;
    }

    set[way].lastUsed = time;
    if (access.kind === 'write') {
      set[way].dirty = true;
    }

    steps.push({
      access,
      parts,
      outcome,
      way,
      evicted,
      lines: cloneLines(lines),
      stats: { ...stats },
      explanation: describe(access, parts, outcome, way, evicted, config),
    });
  });

  return steps;
};
