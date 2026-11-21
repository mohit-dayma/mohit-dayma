import { createContext, useContext } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { clamp, ease } from '../shared/anim';
import type { SceneTiming } from './timeline';

/**
 * Scenes are timed by narration cues, not by hard-coded frame numbers.
 * A cue is a segment id from narration.json.
 */

export const SceneContext = createContext<SceneTiming | null>(null);

export const useScene = () => {
  const scene = useContext(SceneContext);
  if (!scene) throw new Error('useScene must be used inside a scene');
  return scene;
};

export interface Cues {
  frame: number;
  scene: SceneTiming;
  /** Start frame of a cue. */
  at: (id: string) => number;
  /** End frame of a cue. */
  end: (id: string) => number;
  /** 0 → 1 eased ramp that starts when the cue starts. */
  on: (id: string, length?: number, offset?: number) => number;
  /** Linear 0 → 1 progress from the start of `from` to the end of `to`. */
  span: (from: string, to?: string, endFraction?: number) => number;
  /** Has the cue started? */
  reached: (id: string) => boolean;
  /**
   * Visibility of a phase that starts at cue `from` and ends where cue
   * `until` starts. Crossfades over a few frames at both edges.
   */
  phase: (from: string | null, until?: string | null) => number;
}

export const useCues = (): Cues => {
  const frame = useCurrentFrame();
  const scene = useScene();

  const find = (id: string) => {
    const seg = scene.segments.find((s) => s.id === id);
    if (!seg) throw new Error(`Unknown cue ${scene.id}/${id}`);
    return seg;
  };
  const at = (id: string) => find(id).start;
  const end = (id: string) => find(id).end;

  return {
    frame,
    scene,
    at,
    end,
    on: (id, length = 18, offset = 0) =>
      interpolate(frame - at(id) - offset, [0, length], [0, 1], {
        ...clamp,
        easing: ease,
      }),
    span: (from, to = from, endFraction = 1) => {
      const a = at(from);
      const b = at(to) + (end(to) - at(to)) * endFraction;
      return interpolate(frame, [a, Math.max(b, a + 1)], [0, 1], clamp);
    },
    reached: (id) => frame >= at(id),
    phase: (from, until) => {
      const a = from === null ? -100 : at(from) - 6;
      const b = until ? at(until) - 6 : scene.duration + 100;
      return interpolate(frame, [a, a + 12, b, b + 12], [0, 1, 1, 0], clamp);
    },
  };
};

/** Index into `count` evenly spaced steps for a progress value 0–1. */
export const stepAt = (progress: number, count: number) =>
  Math.min(count, Math.floor(progress * count + 1e-6));
