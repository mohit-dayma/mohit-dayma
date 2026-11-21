import narration from './narration.json';
import timings from './timings.json';

/**
 * Turns the narration script and the measured voiceover timings into frame
 * numbers. Every scene's length comes from its audio, so editing the script
 * and re-running scripts/tts.py re-times the whole video.
 */

export const FPS = 30;

/** Frames of chapter card before a scene's narration starts. */
const CHAPTER_LEAD = 48;
/** Frames of title card before the intro narration starts. */
const INTRO_LEAD = 90;
/** Frames held after the last word of a scene. */
const TAIL = 12;
/** Frames the end card is held after the outro narration. */
const OUTRO_TAIL = 105;

export interface SegmentTiming {
  id: string;
  text: string;
  /** Frames from the scene start. */
  start: number;
  end: number;
}

export interface SceneTiming {
  id: string;
  /** 1-based chapter number, or null for the intro and outro. */
  chapter: number | null;
  title: string | null;
  from: number;
  duration: number;
  /** Frame (scene-relative) at which the narration audio starts. */
  lead: number;
  segments: SegmentTiming[];
}

type TimingFile = {
  scenes: Record<
    string,
    { duration: number; segments: { id: string; start: number; end: number }[] }
  >;
};

const measured = (timings as TimingFile).scenes;

const build = (): SceneTiming[] => {
  let from = 0;
  let chapter = 0;
  return narration.scenes.map((scene) => {
    const audio = measured[scene.id];
    if (!audio) {
      throw new Error(
        `No timings for scene "${scene.id}". Run scripts/tts.py.`,
      );
    }
    const isIntro = scene.id === 'intro';
    const isOutro = scene.id === 'outro';
    const lead = isIntro ? INTRO_LEAD : scene.chapter ? CHAPTER_LEAD : 0;
    const tail = isOutro ? OUTRO_TAIL : TAIL;
    const duration = lead + Math.ceil(audio.duration * FPS) + tail;

    const segments = scene.segments.map((seg) => {
      const t = audio.segments.find((s) => s.id === seg.id);
      if (!t) {
        throw new Error(
          `No timing for ${scene.id}/${seg.id}. Run scripts/tts.py.`,
        );
      }
      return {
        id: seg.id,
        text: seg.text,
        start: lead + Math.round(t.start * FPS),
        end: lead + Math.round(t.end * FPS),
      };
    });

    const result: SceneTiming = {
      id: scene.id,
      chapter: scene.chapter ? ++chapter : null,
      title: scene.chapter,
      from,
      duration,
      lead,
      segments,
    };
    from += duration;
    return result;
  });
};

export const SCENES = build();

export const PART1_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0);

export const sceneById = (id: string) => {
  const scene = SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`Unknown scene ${id}`);
  return scene;
};
