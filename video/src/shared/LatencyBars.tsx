import { color, mono } from '../theme';

export interface LatencyLevel {
  name: string;
  cycles: number;
  /** Optional text for the value column, such as "~40–70". */
  label?: string;
}

// Pentium M figures as quoted in Drepper (2007), section 3.2.
export const PAPER_LEVELS: LatencyLevel[] = [
  { name: 'Register', cycles: 1 },
  { name: 'L1d', cycles: 3 },
  { name: 'L2', cycles: 14 },
  { name: 'Main memory', cycles: 240 },
];

// Same rough figures as the blog widget's "Typical today" view.
export const TODAY_LEVELS: LatencyLevel[] = [
  { name: 'Register', cycles: 1, label: '≤1' },
  { name: 'L1d', cycles: 5, label: '~4–5' },
  { name: 'L2', cycles: 15, label: '~14–18' },
  { name: 'L3', cycles: 50, label: '~40–70' },
  { name: 'Main memory', cycles: 350, label: '~300–450' },
];

/**
 * Horizontal bars, one per level. `grow[i]` (0–1) drives each bar, so the
 * caller decides the timing. The last level is highlighted in amber.
 */
export const LatencyBars = ({
  levels,
  grow,
  max = levels[levels.length - 1].cycles,
  gap = 40,
  barHeight = 30,
}: {
  levels: LatencyLevel[];
  grow: number[];
  max?: number;
  gap?: number;
  barHeight?: number;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {levels.map((level, i) => {
      const isMemory = i === levels.length - 1;
      const g = grow[i] ?? 0;
      const width = Math.max((level.cycles / max) * 100, 0.7) * g;
      const shown = level.label ?? `~${Math.round(level.cycles * g)}`;

      return (
        <div
          key={level.name}
          style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr 300px',
            alignItems: 'center',
            gap: 36,
            opacity: Math.min(1, g * 4),
          }}
        >
          <span
            style={{
              fontSize: 40,
              color: isMemory ? color.foreground : color.muted,
            }}
          >
            {level.name}
          </span>
          <div
            style={{
              height: barHeight,
              borderRadius: 999,
              background: color.surface,
              border: `1px solid ${color.lineSubtle}`,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${width}%`,
                height: '100%',
                borderRadius: 999,
                background: isMemory ? color.amber : color.foreground,
              }}
            />
          </div>
          <span
            style={{
              fontFamily: mono,
              fontSize: 40,
              textAlign: 'right',
              color: isMemory ? color.amber : color.foreground,
            }}
          >
            {shown}
            <span style={{ color: color.faint, fontSize: 28 }}> cyc</span>
          </span>
        </div>
      );
    })}
  </div>
);
