import { BeatmapDifficulty } from "../beatmap/BeatmapDifficulty";
import { HardRockMod } from "./HardRockMod";
import { OsuHitObject } from "../hitobjects/Types";

export type BeatmapDifficultyAdjuster = (d: BeatmapDifficulty) => BeatmapDifficulty;
export type HitObjectsAdjuster = (h: OsuHitObject[]) => OsuHitObject[];

// https://osu.ppy.sh/wiki/en/Game_modifier

export const OsuClassicMods = [
  "EASY",
  "HALF_TIME",
  "NO_FAIL",
  "HARD_ROCK",
  "SUDDEN_DEATH",
  "PERFECT",
  "DOUBLE_TIME",
  "NIGHT_CORE",
  "HIDDEN",
  "FLASH_LIGHT",
  "AUTO_PLAY",
  "AUTO_PILOT",
  "RELAX",
  "SPUN_OUT",
  "SCORE_V2",
] as const;

export type OsuClassicMod = typeof OsuClassicMods[number];

interface ModSetting {
  name: string;
  scoreMultiplier?: number;
  difficultyAdjuster?: BeatmapDifficultyAdjuster;
  hitObjectsAdjuster?: HitObjectsAdjuster;
}

export const ModSettings: Record<OsuClassicMod, ModSetting> = {
  HARD_ROCK: {
    name: "Hard Rock",
    scoreMultiplier: 1.06,
    difficultyAdjuster: HardRockMod.difficultyAdjuster,
    hitObjectsAdjuster: HardRockMod.hitObjectsAdjuster,
  },
  DOUBLE_TIME: {
    name: "Double Time",
  },
  AUTO_PLAY: { name: "Auto Play" },
  AUTO_PILOT: { name: "Auto Pilot" },
  FLASH_LIGHT: { name: "Flash Light" },
  HALF_TIME: { name: "Half Time" },
  HIDDEN: { name: "Hidden" },
  NIGHT_CORE: { name: "Night Core" },
  EASY: {
    name: "Easy",
  },
  NO_FAIL: { name: "No Fail" },
  PERFECT: { name: "Perfect" },
  RELAX: { name: "Relax" },
  SCORE_V2: { name: "Score V2" },
  SPUN_OUT: { name: "Spun Out" },
  SUDDEN_DEATH: { name: "Sudden Death" },
};
