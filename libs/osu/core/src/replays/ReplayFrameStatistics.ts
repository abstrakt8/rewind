/**
 * Shows the statistics
 */

import { HitObjectJudgementType } from "./ReplayState";
import { HitObjectType, SliderCheckPointType } from "../hitobjects/Types";
import { MainHitObjectVerdict } from "./Verdicts";

interface ReplayFrameStatistics {
  accuracy: number;
  // osu!stable: 300, 100, 50, 0
  // osu!lazer:  300, 100, 50, 25, 10, 0 (or something like that, small ticks are from sliders and count towards acc)
  counts: number[];
  score: number;
}

/** COMBO **/

interface ReplayComboInformation {
  currentCombo: number;
  maxComboSoFar: number;
}

type ReplayJudgementCounts = number[];

function updateComboInfo(combo: ReplayComboInformation, type: HitObjectType | SliderCheckPointType, hit: boolean) {
  let currentCombo = combo.currentCombo;
  switch (type) {
    case "HIT_CIRCLE":
    case "TICK":
    case "REPEAT":
    case "SPINNER":
      currentCombo = hit ? currentCombo + 1 : 0;
      break;

    case "LAST_LEGACY_TICK":
      // Slider ends do not break the combo, but they can increase them
      currentCombo += hit ? 1 : 0;
      break;

    case "SLIDER":
      // For sliders there is no combo update
      break;
  }

  return { currentCombo, maxComboSoFar: Math.max(combo.maxComboSoFar, currentCombo) };
}

/** ACC **/

/**
 * Returns a number between 0 and 1 using osu!stable accuracy logic.
 * Also returns undefined if there is no count
 *
 * @param count counts of 300, 100, 50, 0 (in this order)
 */
export function osuStableAccuracy(count: number[]): number | undefined {
  if (count.length !== 4) {
    return undefined;
  }
  const JudgementScores = [300, 100, 50, 0];

  let perfect = 0,
    actual = 0;
  for (let i = 0; i < count.length; i++) {
    actual += JudgementScores[i] * count[i];
    perfect += JudgementScores[HitObjectJudgementType.Great] * count[i];
  }

  if (perfect === 0) {
    return undefined;
  }

  return actual / perfect;
}

/** SCORE **/

interface EvaluationOption {
  scoringSystem: "ScoreV1" | "ScoreV2";
  // maybe beatmap difficulty -> since they are required for score v1 calc
}

//https://osu.ppy.sh/wiki/en/Score/ScoreV1

const defaultEvaluationOptions = {
  scoringSystem: "ScoreV1",
} as EvaluationOption;

type StableVerdictCount = Record<MainHitObjectVerdict, number>;

/**
 * Calculating: Count, Accuracy, Combo, MaxCombo
 * The one who is calling this has to make sure that slider heads are not considered in case they are using osu!stable calculation.
 */
export class GameplayInfoEvaluator {
  options: EvaluationOption;
  comboInfo: ReplayComboInformation;
  verdictCount: StableVerdictCount;

  constructor(options?: Partial<EvaluationOption>) {
    this.options = { ...defaultEvaluationOptions, ...options };
    this.comboInfo = { maxComboSoFar: 0, currentCombo: 0 };
    this.verdictCount = { MISS: 0, MEH: 0, GREAT: 0, OK: 0 };
    // TODO: Do some initialization for calculating ScoreV2 (like max score)
  }

  evaluateHitObject(hitObjectType: HitObjectType, verdict: MainHitObjectVerdict) {
    this.comboInfo = updateComboInfo(this.comboInfo, hitObjectType, verdict !== "MISS");
    this.verdictCount[verdict] += 1;
  }

  evaluateSliderCheckpoint(hitObjectType: SliderCheckPointType, hit: boolean) {
    this.comboInfo = updateComboInfo(this.comboInfo, hitObjectType, hit);
  }

  get accuracy() {
    return osuStableAccuracy(["GREAT", "OK", "MEH", "MISS"].map((v) => this.verdictCount[v]));
  }
}
