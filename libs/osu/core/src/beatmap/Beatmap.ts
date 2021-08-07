import { BeatmapDifficulty, DEFAULT_BEATMAP_DIFFICULTY } from "./BeatmapDifficulty";
import { normalizeHitObjects } from "../utils";
import { Slider } from "../hitobjects/Slider";
import { HitCircle } from "../hitobjects/HitCircle";
import { OsuClassicMod } from "../mods/Mods";
import { Spinner } from "../hitobjects/Spinner";
import { SliderCheckPoint } from "../hitobjects/SliderCheckPoint";
import { AllHitObjects, OsuHitObject } from "../hitobjects/Types";

/**
 * A built beatmap that is not supposed to be modified.
 */
export class Beatmap {
  static EMPTY_BEATMAP = new Beatmap([], DEFAULT_BEATMAP_DIFFICULTY, []);
  hitObjectIndex: Record<string, AllHitObjects>;

  constructor(
    public readonly hitObjects: Array<OsuHitObject>,
    public readonly difficulty: BeatmapDifficulty,
    public readonly appliedMods: OsuClassicMod[],
  ) {
    this.hitObjectIndex = normalizeHitObjects(hitObjects);
  }

  getHitObject(id: string): AllHitObjects {
    return this.hitObjectIndex[id];
  }

  // TODO: Perform some .type checks otherwise these don't make sense

  getSliderCheckPoint(id: string): SliderCheckPoint {
    return this.hitObjectIndex[id] as SliderCheckPoint;
  }

  getSlider(id: string): Slider {
    return this.hitObjectIndex[id] as Slider;
  }

  getHitCircle(id: string): HitCircle {
    return this.hitObjectIndex[id] as HitCircle;
  }

  getSpinner(id: string): Spinner {
    return this.hitObjectIndex[id] as Spinner;
  }
}
