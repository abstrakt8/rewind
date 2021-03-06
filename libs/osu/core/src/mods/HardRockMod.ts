import { BeatmapDifficulty } from "../beatmap/BeatmapDifficulty";
import { HitCircle } from "../hitobjects/HitCircle";
import { BeatmapDifficultyAdjuster, HitObjectsAdjuster } from "./Mods";
import produce from "immer";
import { Position } from "@rewind/osu/math";
import { Slider } from "../hitobjects/Slider";
import { OsuHitObject } from "../hitobjects/Types";
import { OSU_PLAYFIELD_HEIGHT } from "../playfield";

function flipY(position: Position) {
  const { x, y } = position;
  return { x, y: OSU_PLAYFIELD_HEIGHT - y };
}

export class HardRockMod {
  static difficultyAdjuster: BeatmapDifficultyAdjuster = (base: BeatmapDifficulty): BeatmapDifficulty => ({
    ...base, // SliderDiffs
    overallDifficulty: Math.min(10, base.overallDifficulty * 1.4),
    approachRate: Math.min(10, base.approachRate * 1.4),
    drainRate: Math.min(10, base.drainRate * 1.4),
    circleSize: Math.min(10, base.circleSize * 1.3),
  });

  static hitObjectsAdjuster: HitObjectsAdjuster = (h: OsuHitObject[]): OsuHitObject[] => {
    return produce(h, (list) => {
      list.forEach((l) => {
        if (l instanceof HitCircle) {
          l.position = flipY(l.position);
        } else if (l instanceof Slider) {
          // TODO: Need to set invalid as well or just recreate the checkpoints from control points
          l.head.position = flipY(l.head.position);
          l.path.controlPoints.forEach((p) => {
            p.offset.y *= -1;
          });
          l.path.makeInvalid();
          l.checkPoints.forEach((p) => {
            p.offset.y *= -1;
          });
        }
      });
    });
  };
}
