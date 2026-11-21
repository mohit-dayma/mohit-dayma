import { interpolate } from 'remotion';
import type {
  CacheConfig,
  CacheLine,
  CacheStep,
} from '../../../src/components/mdx/memory/cache-model';
import { color, mono } from '../theme';
import { clamp } from './anim';

export interface CacheGridProps {
  title?: string;
  config: CacheConfig;
  step: CacheStep;
  /** Frames since this step began, for the flash on the touched slot. */
  local: number;
  /** Frames one step lasts. The flash settles over this time. */
  stepFrames: number;
  lineLabel: (line: CacheLine) => string;
  cellW: number;
  cellH: number;
  fontSize?: number;
  showStats?: boolean;
  showWritebacks?: boolean;
}

/** One cache level as a grid of sets × ways, from a cache-model snapshot. */
export const CacheGrid = ({
  title,
  config,
  step,
  local,
  stepFrames,
  lineLabel,
  cellW,
  cellH,
  fontSize = 24,
  showStats = true,
  showWritebacks = false,
}: CacheGridProps) => {
  const flash = interpolate(
    local,
    [0, 4, Math.max(stepFrames, 5)],
    [0, 1, 0.35],
    clamp,
  );
  const accent = step.outcome === 'hit' ? color.hit : color.miss;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
      }}
    >
      {title && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span
            style={{ fontSize: 38, fontWeight: 600, color: color.foreground }}
          >
            {title}
          </span>
          <span style={{ fontFamily: mono, fontSize: 22, color: color.faint }}>
            {config.sets} set{config.sets === 1 ? '' : 's'} × {config.ways} way
            {config.ways === 1 ? '' : 's'}
          </span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {step.lines.map((set, s) => (
          <div
            key={s}
            style={{ display: 'flex', gap: 6, alignItems: 'center' }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: 20,
                color: color.faint,
                width: 70,
              }}
            >
              set {s}
            </span>
            {set.map((line, w) => {
              const touched = step.parts?.set === s && step.way === w;
              return (
                <div
                  key={w}
                  style={{
                    width: cellW,
                    height: cellH,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    fontFamily: mono,
                    fontSize,
                    color: line.valid ? color.foreground : color.faint,
                    background: touched
                      ? `color-mix(in srgb, ${accent} ${Math.round(flash * 28)}%, ${color.surface})`
                      : color.surface,
                    border: `2px solid ${touched ? accent : color.lineSubtle}`,
                  }}
                >
                  {line.valid ? lineLabel(line) : '—'}
                  {line.dirty && (
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 99,
                        background: color.amber,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {showStats && (
        <div
          style={{
            display: 'flex',
            gap: 40,
            fontFamily: mono,
            fontSize: 32,
            marginTop: 6,
          }}
        >
          <span style={{ color: color.hit }}>
            {step.stats.hits} hit{step.stats.hits === 1 ? '' : 's'}
          </span>
          <span style={{ color: color.miss }}>
            {step.stats.misses} miss{step.stats.misses === 1 ? '' : 'es'}
          </span>
          {showWritebacks && (
            <span style={{ color: color.amber }}>
              {step.stats.writebacks} writebacks
            </span>
          )}
        </div>
      )}
    </div>
  );
};
