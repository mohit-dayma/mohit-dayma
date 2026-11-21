import { Reveal } from '../../shared/anim';
import { color } from '../../theme';
import { useCues } from '../cues';
import { Body, Heading, RevealList, Strong } from '../ui';

export const Remember = () => {
  const c = useCues();
  const items = [
    {
      cue: 'r1',
      content: (
        <>
          Main memory is <Strong>DRAM</Strong> (cheap). Caches are{' '}
          <Strong>SRAM</Strong> (fast).
        </>
      ),
    },
    {
      cue: 'r2',
      content: (
        <>
          DRAM is fastest within an <Strong>open row</Strong>.
        </>
      ),
    },
    {
      cue: 'r3',
      content: (
        <>
          Caches work through <Strong>locality</Strong>, while the working set
          fits.
        </>
      ),
    },
    {
      cue: 'r4',
      content: (
        <>
          Caches move whole <Strong>lines</Strong>, usually 64 bytes.
        </>
      ),
    },
    {
      cue: 'r5',
      content: (
        <>
          <Strong>Tag · set · offset</Strong>. Addresses sets × line size apart
          share a set.
        </>
      ),
    },
    {
      cue: 'r6',
      content: (
        <>
          Set-associative caches limit{' '}
          <Strong c={color.miss}>conflict misses</Strong>. ~8 ways is plenty for
          one thread.
        </>
      ),
    },
    {
      cue: 'r7',
      content: (
        <>
          Write-back marks lines <Strong c={color.amber}>dirty</Strong> and
          writes them on eviction.
        </>
      ),
    },
  ];
  return (
    <Body>
      <Reveal t={c.on('r1', 14, -10)}>
        <Heading>What to remember</Heading>
      </Reveal>
      <div style={{ marginTop: 44 }}>
        <RevealList
          size={36}
          gap={20}
          items={items.map((item, i) => ({
            t: c.on(item.cue),
            content: item.content,
            mark: String(i + 1),
          }))}
        />
      </div>
    </Body>
  );
};
