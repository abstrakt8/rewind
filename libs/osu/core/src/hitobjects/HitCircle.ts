import { Position } from "@osujs/math";
import { HitObjectType } from "./Types";
import { HasHitTime, HasId, HasPosition, HasSpawnTime } from "./Properties";
import { DEFAULT_HIT_SAMPLE_BANK_INFO, HitSampleBankInfo } from "../audio/HitSampleInfo";

export class HitCircle implements HasId, HasPosition, HasHitTime, HasSpawnTime {
  static OBJECT_RADIUS = 64;

  id = "";
  hitTime = 0;
  approachDuration = 0;

  // Bitmask of the hit sounds to play when this circle (or slider head) is hit. See HitSoundType.
  hitSound = 0;
  sample: HitSampleBankInfo = DEFAULT_HIT_SAMPLE_BANK_INFO;

  comboSetIndex = 0;
  withinComboSetIndex = 0;

  scale = 1;
  position: Position = { x: 0, y: 0 };

  // Only used because there's a bug in the Flashlight difficulty processing
  unstackedPosition: Position = { x: 0, y: 0 };

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
