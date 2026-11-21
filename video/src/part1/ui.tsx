import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { clamp, Eyebrow, ramp, Reveal } from '../shared/anim';
import { color, mono, sans } from '../theme';
import { useScene } from './cues';

/** Main content area. Leaves room for the chapter tag and the captions. */
export const Body = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <AbsoluteFill
    style={{
      padding: '120px 130px 234px',
      fontFamily: sans,
      color: color.foreground,
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** A layer of a scene that is only visible during one phase. */
export const Layer = ({
  t,
  children,
  style,
}: {
  t: number;
  children: ReactNode;
  style?: CSSProperties;
}) =>
  t <= 0 ? null : (
    <AbsoluteFill
      style={{
        padding: '120px 130px 234px',
        fontFamily: sans,
        color: color.foreground,
        opacity: t,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );

export const Heading = ({
  children,
  size = 64,
  style,
}: {
  children: ReactNode;
  size?: number;
  style?: CSSProperties;
}) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 600,
      lineHeight: 1.15,
      color: color.foreground,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Panel = ({
  children,
  style,
  accent,
}: {
  children: ReactNode;
  style?: CSSProperties;
  accent?: string;
}) => (
  <div
    style={{
      background: color.surface,
      border: `2px solid ${accent ?? color.lineSubtle}`,
      borderRadius: 18,
      padding: '28px 34px',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Mono = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => <span style={{ fontFamily: mono, ...style }}>{children}</span>;

/** Source line for numbers quoted from the paper. */
export const Cite = ({
  children,
  t = 1,
}: {
  children: ReactNode;
  t?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      right: 130,
      bottom: 196,
      fontFamily: mono,
      fontSize: 22,
      color: color.faint,
      opacity: t,
    }}
  >
    {children}
  </div>
);

/** A list where each item appears at its own reveal value. */
export const RevealList = ({
  items,
  size = 40,
  gap = 26,
}: {
  items: { t: number; content: ReactNode; mark?: string }[];
  size?: number;
  gap?: number;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    {items.map((item, i) => (
      <Reveal key={i} t={item.t}>
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'baseline',
            fontSize: size,
            lineHeight: 1.3,
            color: color.muted,
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: size * 0.7,
              color: item.mark ? color.amber : color.faint,
              minWidth: size * 1.1,
            }}
          >
            {item.mark ?? '—'}
          </span>
          <span>{item.content}</span>
        </div>
      </Reveal>
    ))}
  </div>
);

export const Strong = ({
  children,
  c = color.foreground,
}: {
  children: ReactNode;
  c?: string;
}) => <span style={{ color: c, fontWeight: 600 }}>{children}</span>;

/* ------------------------------------------------------------- Chrome */

const pad = (n: number) => String(n).padStart(2, '0');

/** Full-screen chapter title, shown before the scene's narration starts. */
export const ChapterCard = () => {
  const frame = useCurrentFrame();
  const scene = useScene();
  if (scene.chapter === null || frame > scene.lead + 10) return null;
  const out = interpolate(
    frame,
    [scene.lead - 8, scene.lead + 6],
    [1, 0],
    clamp,
  );
  const line = ramp(frame, 8, 26);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        padding: '0 200px',
        fontFamily: sans,
        opacity: out,
        background: color.background,
      }}
    >
      <Reveal t={ramp(frame, 2)}>
        <Eyebrow>Chapter {pad(scene.chapter)}</Eyebrow>
      </Reveal>
      <Reveal t={ramp(frame, 8)}>
        <div
          style={{
            marginTop: 22,
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.08,
            color: color.foreground,
            maxWidth: 1500,
          }}
        >
          {scene.title}
        </div>
      </Reveal>
      <div
        style={{
          marginTop: 40,
          height: 4,
          width: 220 * line,
          background: color.amber,
          borderRadius: 4,
        }}
      />
    </AbsoluteFill>
  );
};

/** Small chapter label in the top-left corner while a scene runs. */
export const ChapterTag = () => {
  const frame = useCurrentFrame();
  const scene = useScene();
  if (scene.chapter === null) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 52,
        left: 130,
        right: 130,
        display: 'flex',
        justifyContent: 'space-between',
        opacity: ramp(frame, scene.lead, 20),
      }}
    >
      <Eyebrow style={{ fontSize: 22, letterSpacing: 3 }}>
        <span style={{ color: color.amber }}>{pad(scene.chapter)}</span>
        {'  '}
        {scene.title}
      </Eyebrow>
      <Eyebrow style={{ fontSize: 22, letterSpacing: 3 }}>
        How CPU Caches Work
      </Eyebrow>
    </div>
  );
};

/** On-screen captions: the narration segment being spoken. */
export const Captions = () => {
  const frame = useCurrentFrame();
  const scene = useScene();
  const segs = scene.segments;
  let index = -1;
  for (let i = 0; i < segs.length; i++) {
    if (frame >= segs[i].start - 3) index = i;
  }
  if (index === -1) return null;
  const seg = segs[index];
  const isLast = index === segs.length - 1;
  const opacity = interpolate(
    frame,
    [
      seg.start - 3,
      seg.start + 3,
      isLast ? seg.end + 6 : 1e9,
      isLast ? seg.end + 14 : 1e9 + 1,
    ],
    [0, 1, 1, 0],
    clamp,
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 30,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: 1660,
          padding: '12px 30px',
          borderRadius: 14,
          background: 'rgba(10,10,10,0.92)',
          border: `1px solid ${color.lineSubtle}`,
          fontFamily: sans,
          fontSize: 32,
          lineHeight: 1.3,
          color: color.foreground,
          textAlign: 'center',
        }}
      >
        {seg.text}
      </div>
    </div>
  );
};
