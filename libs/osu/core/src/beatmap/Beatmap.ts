import { BeatmapDifficulty, DEFAULT_BEATMAP_DIFFICULTY } from "./BeatmapDifficulty";
import { OsuHitObject } from "../hitobjects";
import { normalizeHitObjects } from "../utils";
import { Slider } from "../hitobjects/Slider";
import { HitCircle } from "../hitobjects/HitCircle";
import { OsuClassicMods } from "../mods/Mods";
import { Spinner } from "../hitobjects/Spinner";

/**
 * A built beatmap that is not supposed to be modified.
 */
export class Beatmap {
  static EMPTY_BEATMAP = new Beatmap([], DEFAULT_BEATMAP_DIFFICULTY, []);
  hitObjectIndex: Record<string, OsuHitObject>;

  constructor(
    public readonly hitObjects: Array<OsuHitObject>,
    public readonly difficulty: BeatmapDifficulty,
    public readonly appliedMods: OsuClassicMods[],
  ) {
    this.hitObjectIndex = normalizeHitObjects(hitObjects);
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
