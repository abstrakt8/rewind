import { Position } from "@rewind/osu/math";
import { immerable } from "immer";
import { HitObjectType } from "./Types";
import { HasHitTime, HasId, HasPosition, HasSpawnTime } from "./Properties";

export class HitCircle implements HasId, HasPosition, HasHitTime, HasSpawnTime {
  [immerable] = true;
  static OBJECT_RADIUS = 64;

  id = "";
  hitTime = 0;
  approachDuration = 0;

  comboSetIndex = 0;
  withinComboSetIndex = 0;

  scale = 1;
  position: Position = { x: 0, y: 0 };

  sliderId?: string;

  get type(): HitObjectType {
    return "HIT_CIRCLE";
  }

  get radius(): number {
    return HitCircle.OBJECT_RADIUS * this.scale;
  }

  get spawnTime(): number {
    return this.hitTime - this.approachDuration;
  }
}
