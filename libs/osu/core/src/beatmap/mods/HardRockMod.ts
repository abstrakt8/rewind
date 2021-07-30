import { BeatmapDifficulty } from "../BeatmapDifficulty";
import { HitCircle } from "../../hitobjects/HitCircle";
import { BeatmapDifficultyAdjuster, HitObjectsAdjuster } from "./Mods";
import produce from "immer";
import { Position } from "@rewind/osu/math";
import { Slider } from "../../hitobjects/Slider";
import { OsuHitObject } from "../../hitobjects";

function flipY(position: Position) {
  const { x, y } = position;
  return { x, y: 368 - y };
}

export class HardRockMod implements BeatmapDifficultyAdjuster, HitObjectsAdjuster {
  difficultyApplier(d: BeatmapDifficulty): BeatmapDifficulty {
    return produce(d, (state) => {
      state.overallDifficulty = Math.min(10, state.overallDifficulty * 1.4);
      state.approachRate = Math.min(10, state.approachRate * 1.4);
      state.drainRate = Math.min(10, state.drainRate * 1.4);
      state.circleSize = Math.min(10, state.circleSize * 1.3);
    });
  }

  adjustHitObjects(h: OsuHitObject[]): OsuHitObject[] {
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
          l.checkPoints.forEach((p) => {
            p.offset.y *= -1;
          });
        }
      });
    });
  }
}
