import { Slider } from "../hitobjects/Slider";
import { AllHitObjects, OsuHitObject } from "../hitobjects/Types";
import { OsuClassicMod } from "../mods/Mods";

export function normalizeHitObjects(hitObjects: OsuHitObject[]): Record<string, AllHitObjects> {
  const hitObjectById: Record<string, AllHitObjects> = {};
  hitObjects.forEach((h) => {
    hitObjectById[h.id] = h;
    if (h instanceof Slider) {
      hitObjectById[h.head.id] = h.head;
      for (const c of h.checkPoints) {
        hitObjectById[c.id] = c;
      }
    }
  });
  return hitObjectById;
}

export function determineDefaultPlaybackSpeed(mods: OsuClassicMod[]) {
  for (let i = 0; i < mods.length; i++) {
    if (mods[i] === "DOUBLE_TIME" || mods[i] === "NIGHT_CORE") return 1.5;
    if (mods[i] === "HALF_TIME") return 0.75;
  }
  return 1.0;
}
