import { BeatmapDifficulty, BeatmapDifficultyAdjuster } from "../";

const ratio = 0.5;

export class EasyMod {
  static difficultyAdjuster: BeatmapDifficultyAdjuster = (base: BeatmapDifficulty): BeatmapDifficulty => ({
    ...base, // SliderDiffs
    overallDifficulty: base.overallDifficulty * ratio,
    approachRate: base.approachRate * ratio,
    drainRate: base.drainRate * ratio,
    circleSize: base.circleSize * ratio,
  });
}
