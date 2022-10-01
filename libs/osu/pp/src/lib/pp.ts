import { OsuClassicMod, osuStableAccuracy } from "@osujs/core";
import { clamp } from "@osujs/math";
import { DifficultyAttributes, PERFORMANCE_BASE_MULTIPLIER } from "./diff";

interface OsuPerformanceAttributes {
  // The "PP" value that is then displayed and used for calculations
  total: number;

  aim: number;
  speed: number;
  accuracy: number;
  flashlight: number;
  effectiveMissCount: number;
}

// parameters extracted from ScoreInfo
export interface ScoreParams {
  mods: OsuClassicMod[];
  maxCombo: number;
  countGreat: number;
  countOk: number;
  countMeh: number;
  countMiss: number;
}

export function calculatePerformanceAttributes(
  beatmapParams: DifficultyAttributes,
  scoreParams: ScoreParams,
): OsuPerformanceAttributes {
  const {
    hitCircleCount,
    sliderCount,
    spinnerCount,
    aimDifficulty,
    speedDifficulty,
    flashlightDifficulty,
    approachRate,
    drainRate,
    overallDifficulty,
    sliderFactor,
    speedNoteCount,
    maxCombo: beatmapMaxCombo,
  } = beatmapParams;
  const { mods, countMeh, countGreat, countMiss, countOk, maxCombo: scoreMaxCombo } = scoreParams;
  const accuracy = osuStableAccuracy([countGreat, countOk, countMeh, countMiss]) ?? 0;
  const totalHits = countGreat + countOk + countMeh + countMiss;

  let effectiveMissCount = (function calculateEffectiveMissCount() {
    // Guess the number of misses + slider breaks from combo
    let comboBasedMissCount = 0.0;

    if (sliderCount > 0) {
      const fullComboThreshold = beatmapMaxCombo - 0.1 * sliderCount;
      if (scoreMaxCombo < fullComboThreshold) comboBasedMissCount = fullComboThreshold / Math.max(1.0, scoreMaxCombo);
    }
    // Clamp misscount since it's derived from combo and can be higher than total hits and that breaks some calculations
    comboBasedMissCount = Math.min(comboBasedMissCount, countOk + countMiss + countMiss);
    return Math.max(countMiss, comboBasedMissCount);
  })();

  let multiplier = PERFORMANCE_BASE_MULTIPLIER;
  if (mods.includes("NO_FAIL")) multiplier *= Math.max(0.9, 1 - 0.02 * effectiveMissCount);
  if (mods.includes("SPUN_OUT")) multiplier *= 1.0 - Math.pow(spinnerCount / totalHits, 0.85);
  if (mods.includes("RELAX")) {
    const okMultiplier = Math.max(0.0, overallDifficulty > 0 ? 1 - Math.pow(overallDifficulty / 13.33, 1.8) : 1.0);
    const mehMultiplier = Math.max(0.0, overallDifficulty > 0 ? 1 - Math.pow(overallDifficulty / 13.33, 5.0) : 1.0);
    effectiveMissCount = Math.min(effectiveMissCount + countOk * okMultiplier + countMeh * mehMultiplier, totalHits);
  }

  const comboScalingFactor =
    beatmapMaxCombo <= 0 ? 1.0 : Math.min(Math.pow(scoreMaxCombo, 0.8) / Math.pow(beatmapMaxCombo, 0.8), 1.0);

  const aimValue = (function computeAimValue() {
    let aimValue = Math.pow(5.0 * Math.max(1.0, aimDifficulty / 0.0675) - 4.0, 3.0) / 100000.0;

    const lengthBonus =
      0.95 + 0.4 * Math.min(1.0, totalHits / 2000.0) + (totalHits > 2000 ? Math.log10(totalHits / 2000.0) * 0.5 : 0.0);
    aimValue *= lengthBonus;
    if (effectiveMissCount > 0)
      aimValue *= 0.97 * Math.pow(1 - Math.pow(effectiveMissCount / totalHits, 0.775), effectiveMissCount);
    aimValue *= comboScalingFactor;

    let approachRateFactor = 0.0;
    if (approachRate > 10.33) approachRateFactor = 0.3 * (approachRate - 10.33);
    else if (approachRate < 8) approachRateFactor = 0.05 * (8.0 - approachRate);

    if (mods.includes("RELAX")) approachRateFactor = 0.0;

    aimValue *= 1.0 + approachRateFactor * lengthBonus; // Buff for long maps with high AR

    if (mods.includes("BLINDS" as OsuClassicMod)) {
      aimValue *=
        1.3 +
        totalHits *
          (0.0016 / (1 + 2 * effectiveMissCount)) *
          Math.pow(accuracy, 16) *
          (1 - 0.003 * drainRate * drainRate);
    } else if (mods.includes("HIDDEN")) {
      // Rewarding low AR when there is HD -> this nerfs high AR and buffs low AR
      aimValue *= 1.0 + 0.04 * (12.0 - approachRate);
    }

    // We assume 15% of sliders in a map are difficult since there's no way to tell from the performance calculator.
    const estimateDifficultSliders = sliderCount * 0.15;
    if (sliderCount > 0) {
      const estimateSliderEndsDropped = clamp(
        Math.min(countOk + countMeh + countMiss, beatmapMaxCombo - scoreMaxCombo),
        0,
        estimateDifficultSliders,
      );
      const sliderNerfFactor =
        (1 - sliderFactor) * Math.pow(1 - estimateSliderEndsDropped / estimateDifficultSliders, 3) + sliderFactor;
      aimValue *= sliderNerfFactor;
    }
    aimValue *= accuracy;
    aimValue *= 0.98 + Math.pow(overallDifficulty, 2) / 2500;

    return aimValue;
  })();
  const speedValue = (function computeSpeedValue() {
    if (mods.includes("RELAX")) {
      return 0.0;
    }
    let speedValue = Math.pow(5.0 * Math.max(1.0, speedDifficulty / 0.0675) - 4.0, 3.0) / 100000.0;
    const lengthBonus =
      0.95 + 0.4 * Math.min(1.0, totalHits / 2000.0) + (totalHits > 2000 ? Math.log10(totalHits / 2000.0) * 0.5 : 0.0);
    speedValue *= lengthBonus;

    // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of
    // misses.
    if (effectiveMissCount > 0)
      speedValue *=
        0.97 * Math.pow(1 - Math.pow(effectiveMissCount / totalHits, 0.775), Math.pow(effectiveMissCount, 0.875));

    speedValue *= comboScalingFactor;

    let approachRateFactor = 0.0;
    if (approachRate > 10.33) approachRateFactor = 0.3 * (approachRate - 10.33);

    speedValue *= 1.0 + approachRateFactor * lengthBonus; // Buff for longer maps with high AR.

    if (mods.includes("BLINDS" as OsuClassicMod)) {
      // Increasing the speed value by object count for Blinds isn't ideal, so the minimum buff is given.
      speedValue *= 1.12;
    } else if (mods.includes("HIDDEN")) {
      // We want to give more reward for lower AR when it comes to aim and HD. This nerfs high AR and buffs lower AR.
      speedValue *= 1.0 + 0.04 * (12.0 - approachRate);
    }

    // Calculate accuracy assuming the worst case scenario
    const relevantTotalDiff = totalHits - speedNoteCount;
    const relevantCountGreat = Math.max(0, countGreat - relevantTotalDiff);
    const relevantCountOk = Math.max(0, countOk - Math.max(0, relevantTotalDiff - countGreat));
    const relevantCountMeh = Math.max(0, countMeh - Math.max(0, relevantTotalDiff - countGreat - countOk));
    const relevantAccuracy =
      speedNoteCount == 0
        ? 0
        : (relevantCountGreat * 6.0 + relevantCountOk * 2.0 + relevantCountMeh) / (speedNoteCount * 6.0);

    // Scale the speed value with accuracy and OD.
    speedValue *=
      (0.95 + Math.pow(overallDifficulty, 2) / 750) *
      Math.pow((accuracy + relevantAccuracy) / 2, (14.5 - Math.max(overallDifficulty, 8)) / 2);

    // Scale the speed value with # of 50s to punish double-tapping.
    speedValue *= Math.pow(0.99, countMeh < totalHits / 500.0 ? 0 : countMeh - totalHits / 500.0);

    return speedValue;
  })();
  const accuracyValue = (function computeAccuracyValue() {
    if (mods.includes("RELAX")) return 0.0;

    // This percentage only considers HitCircles of any value - in this part of the calculation we focus on hitting the
    // timing hit window.
    let betterAccuracyPercentage;
    const amountHitObjectsWithAccuracy = hitCircleCount;

    if (amountHitObjectsWithAccuracy > 0)
      betterAccuracyPercentage =
        ((countGreat - (totalHits - amountHitObjectsWithAccuracy)) * 6 + countOk * 2 + countMeh) /
        (amountHitObjectsWithAccuracy * 6.0);
    else betterAccuracyPercentage = 0;

    // It is possible to reach a negative accuracy with this formula. Cap it at zero - zero points.
    if (betterAccuracyPercentage < 0) betterAccuracyPercentage = 0;

    // Lots of arbitrary values from testing.
    // Considering to use derivation from perfect accuracy in a probabilistic manner - assume normal distribution.
    let accuracyValue = Math.pow(1.52163, overallDifficulty) * Math.pow(betterAccuracyPercentage, 24) * 2.83;

    // Bonus for many hitcircles - it's harder to keep good accuracy up for longer.
    accuracyValue *= Math.min(1.15, Math.pow(amountHitObjectsWithAccuracy / 1000.0, 0.3));

    // Increasing the accuracy value by object count for Blinds isn't ideal, so the minimum buff is given.
    if (mods.includes("BLINDS" as OsuClassicMod)) accuracyValue *= 1.14;
    else if (mods.includes("HIDDEN")) accuracyValue *= 1.08;

    if (mods.includes("FLASH_LIGHT")) accuracyValue *= 1.02;

    return accuracyValue;
  })();

  const flashlightValue = (function computeFlashLightValue() {
    if (!mods.includes("FLASH_LIGHT")) return 0.0;

    let flashlightValue = Math.pow(flashlightDifficulty, 2.0) * 25.0;

    // Penalize misses by assessing # of misses relative to the total # of objects. Default a 3% reduction for any # of
    // misses.
    if (effectiveMissCount > 0)
      flashlightValue *=
        0.97 * Math.pow(1 - Math.pow(effectiveMissCount / totalHits, 0.775), Math.pow(effectiveMissCount, 0.875));

    flashlightValue *= comboScalingFactor;

    // Account for shorter maps having a higher ratio of 0 combo/100 combo flashlight radius.
    flashlightValue *=
      0.7 +
      0.1 * Math.min(1.0, totalHits / 200.0) +
      (totalHits > 200 ? 0.2 * Math.min(1.0, (totalHits - 200) / 200.0) : 0.0);

    // Scale the flashlight value with accuracy _slightly_.
    flashlightValue *= 0.5 + accuracy / 2.0;
    // It is important to also consider accuracy difficulty when doing that.
    flashlightValue *= 0.98 + Math.pow(overallDifficulty, 2) / 2500;

    return flashlightValue;
  })();

  const totalValue =
    Math.pow(
      Math.pow(aimValue, 1.1) +
        Math.pow(speedValue, 1.1) +
        Math.pow(accuracyValue, 1.1) +
        Math.pow(flashlightValue, 1.1),
      1.0 / 1.1,
    ) * multiplier;

  return {
    aim: aimValue,
    speed: speedValue,
    accuracy: accuracyValue,
    flashlight: flashlightValue,
    effectiveMissCount,
    total: totalValue,
  };
}
