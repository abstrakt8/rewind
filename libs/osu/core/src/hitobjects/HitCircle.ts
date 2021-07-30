import { Position } from "osu-math";
import { immerable } from "immer";
import { OsuHitObjectTypes } from "./OsuHitObjectTypes";
import { HasHitTime, HasId, HasPosition, HasSpawnTime } from "./Properties";

export class HitCircle implements HasId, HasPosition, HasHitTime, HasSpawnTime {
  [immerable] = true;
  static OBJECT_RADIUS = 64;

  get type() {
    return OsuHitObjectTypes.HIT_CIRCLE;
  }

  id = "";
  hitTime = 0;
  approachDuration = 0;

  comboSetIndex = 0;
  withinComboSetIndex = 0;

  scale = 1;
  position: Position = { x: 0, y: 0 };

  get radius(): number {
    return HitCircle.OBJECT_RADIUS * this.scale;
  }

  get spawnTime(): number {
    return this.hitTime - this.approachDuration;
  }
}
