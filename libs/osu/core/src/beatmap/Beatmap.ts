import { BeatmapDifficulty, DEFAULT_BEATMAP_DIFFICULTY } from "./BeatmapDifficulty";
import { determineDefaultPlaybackSpeed, normalizeHitObjects } from "../utils";
import { Slider } from "../hitobjects/Slider";
import { HitCircle } from "../hitobjects/HitCircle";
import { OsuClassicMod } from "../mods/Mods";
import { Spinner } from "../hitobjects/Spinner";
import { SliderCheckPoint } from "../hitobjects/SliderCheckPoint";
import { AllHitObjects, isHitCircle, OsuHitObject } from "../hitobjects/Types";
import { TimingControlPoint } from "./ControlPoints/TimingControlPoint";

/**
 * A built beatmap that is not supposed to be modified.
 */
export class Beatmap {
  static EMPTY_BEATMAP = new Beatmap([], DEFAULT_BEATMAP_DIFFICULTY, []);

  private readonly hitObjectDict: Record<string, AllHitObjects>;
  public readonly gameClockRate: number;

  constructor(
    public readonly hitObjects: Array<OsuHitObject>,
    public readonly difficulty: BeatmapDifficulty,
    public readonly appliedMods: OsuClassicMod[],
  ) {
    this.hitObjectDict = normalizeHitObjects(hitObjects);
    this.gameClockRate = determineDefaultPlaybackSpeed(appliedMods);
  }

  getHitObject(id: string): AllHitObjects {
    return this.hitObjectDict[id];
  }

  // TODO: Perform some .type checks otherwise these don't make sense

  getSliderCheckPoint(id: string): SliderCheckPoint {
    return this.hitObjectDict[id] as SliderCheckPoint;
  }

  getSlider(id: string): Slider {
    return this.hitObjectDict[id] as Slider;
  }

  getHitCircle(id: string): HitCircle {
    return this.hitObjectDict[id] as HitCircle;
  }

  getSpinner(id: string): Spinner {
    return this.hitObjectDict[id] as Spinner;
  }
}

// Utility?
const endTime = (o: OsuHitObject) => (isHitCircle(o) ? o.hitTime : o.endTime);

export function mostCommonBeatLength({
                                       hitObjects,
                                       timingPoints,
                                     }: { hitObjects: OsuHitObject[], timingPoints: TimingControlPoint[] }) {
  // The last playable time in the beatmap - the last timing point extends to this time.
  // Note: This is more accurate and may present different results because osu-stable didn't have the ability to
  // calculate slider durations in this context.
  let lastTime = 0;
  if (hitObjects.length > 0)
    lastTime = endTime(hitObjects[hitObjects.length - 1]);
  else if (timingPoints.length > 0)
    lastTime = timingPoints[timingPoints.length - 1].time;


  // 1. Group the beat lengths and aggregate the durations
  const durations: Map<number, number> = new Map<number, number>();

  function add(d: number, x: number) {
    d = Math.round(d * 1000) / 1000;
    const a = durations.get(d);
    if (a === undefined)
      durations.set(d, x);
    else
      durations.set(d, a + x);
  }

  for (let i = 0; i < timingPoints.length; i++) {
    const t = timingPoints[i];
    if (t.time > lastTime) {
      add(t.beatLength, 0);
    } else {
      // osu-stable forced the first control point to start at 0.
      // This is reproduced here to maintain compatibility around osu!mania scroll speed and song select display.
      const currentTime = i === 0 ? 0 : t.time;
      const nextTime = i + 1 === timingPoints.length ? lastTime : timingPoints[i + 1].time;
      add(t.beatLength, nextTime - currentTime);
    }
  }

  // 2. Sort by duration descendingly

  const list: Array<{ beatLength: number, duration: number }> = [];
  for (const beatLength of durations.keys()) {
    list.push({ beatLength: beatLength, duration: durations.get(beatLength) as number });
  }

  list.sort((a, b) => b.duration - a.duration);

  if (list.length === 0) {
    return undefined;
  } else {
    return list[0].beatLength;
  }
}

