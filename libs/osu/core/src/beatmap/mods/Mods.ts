import { BeatmapDifficulty } from "../BeatmapDifficulty";
import { OsuHitObject } from "../../hitobjects";

export interface BeatmapDifficultyAdjuster {
  difficultyApplier: (d: BeatmapDifficulty) => BeatmapDifficulty;
}

export interface HitObjectsAdjuster {
  adjustHitObjects: (h: OsuHitObject[]) => OsuHitObject[];
}

export enum OsuClassicMods {
  DOUBLE_TIME = "DT",
  EASY = "EZ",
  HARD_ROCK = "HR",
  NO_FAIL = "NF",
}

const ModSettings = {
  [OsuClassicMods.DOUBLE_TIME]: {},
};
