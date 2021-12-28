import { BeatmapDifficulty } from "../beatmap/BeatmapDifficulty";
import { BeatmapDifficultyAdjuster } from "./Mods";
import { Position } from "@osujs/math";
import { isHitCircle, isSlider, OsuHitObject } from "../hitobjects/Types";
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

  static flipVertically = (hitObjects: OsuHitObject[]) => {
    hitObjects.forEach((h) => {
      if (isHitCircle(h)) {
        h.position = flipY(h.position);
      } else if (isSlider(h)) {
        // TODO: Need to set invalid as well or just recreate the checkpoints from control points
        h.head.position = flipY(h.head.position);
        h.path.controlPoints.forEach((p) => {
          p.offset.y *= -1;
        });
        h.path.makeInvalid();
        h.checkPoints.forEach((p) => {
          p.offset.y *= -1;
        });
      }
    });
  };
}
