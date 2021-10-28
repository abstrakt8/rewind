import { BeatmapDifficulty, DEFAULT_BEATMAP_DIFFICULTY } from "./BeatmapDifficulty";
import { determineDefaultPlaybackSpeed, normalizeHitObjects } from "../utils";
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
