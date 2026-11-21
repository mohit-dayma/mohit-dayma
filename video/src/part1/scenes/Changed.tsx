import { Reveal } from '../../shared/anim';
import { color, mono } from '../../theme';
import { useCues } from '../cues';
import { Body, Heading } from '../ui';

const ROWS = [
  {
    cue: 'mc',
    then: 'Memory controller in the Northbridge',
    now: 'Memory controller on the CPU',
  },
  {
    cue: 'ddr',
    then: 'DDR2',
    now: 'DDR5: far more bandwidth, similar latency in ns',
  },
  {
    cue: 'l2',
    then: 'L2 often shared between cores',
    now: 'Private L2 per core, large shared L3',
  },
  {
    cue: 'lines',
    then: '64-byte lines',
    now: '64 B on x86; 128 B on some ARM designs (Apple)',
  },
  { cue: 'lru', then: 'LRU replacement', now: 'Approximations of LRU' },
];

export const Changed = () => {
  const c = useCues();
  return (
    <Body>
      <Reveal t={c.on('intro')}>
        <Heading>Concepts hold. Details changed.</Heading>
      </Reveal>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 60px 1.25fr',
          rowGap: 26,
          marginTop: 50,
          alignItems: 'center',
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 24, color: color.faint }}>
          2007
        </div>
        <div />
        <div style={{ fontFamily: mono, fontSize: 24, color: color.amber }}>
          TODAY
        </div>
        {ROWS.map((row) => {
          const t = c.on(row.cue);
          const style = {
            opacity: t,
            transform: `translateY(${(1 - t) * 20}px)`,
          };
          return [
            <div
              key={`${row.cue}-a`}
              style={{ ...style, fontSize: 34, color: color.faint }}
            >
              {row.then}
            </div>,
            <div
              key={`${row.cue}-b`}
              style={{ ...style, fontSize: 34, color: color.faint }}
            >
              →
            </div>,
            <div
              key={`${row.cue}-c`}
              style={{ ...style, fontSize: 36, color: color.foreground }}
            >
              {row.now}
            </div>,
          ];
        })}
      </div>
    </Body>
  );
};
