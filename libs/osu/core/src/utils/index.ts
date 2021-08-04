import { AllHitObjects, OsuHitObject } from "../hitobjects";
import { Slider } from "../hitobjects/Slider";

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
