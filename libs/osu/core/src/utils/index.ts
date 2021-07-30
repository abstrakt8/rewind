import { OsuHitObject } from "../hitobjects";
import { Slider } from "../hitobjects/Slider";

export function normalizeHitObjects(hitObjects: OsuHitObject[]): Record<string, OsuHitObject> {
  const hitObjectById: Record<string, OsuHitObject> = {};
  hitObjects.forEach((h) => {
    hitObjectById[h.id] = h;
    if (h instanceof Slider) {
      hitObjectById[h.head.id] = h.head;
    }
  });
  return hitObjectById;
}
