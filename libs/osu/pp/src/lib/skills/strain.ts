import { clamp, lerp } from "@osujs/math";
import { OsuDifficultyHitObject } from "../diff";
import { sum } from "simple-statistics";

// Not overridden ... yet?
const REDUCED_STRAIN_BASELINE = 0.75;

// sectionDuration

interface StrainSkillParams {
  sectionDuration: number;
  strainDecay: (time: number) => number;
}

interface OsuStrainSkillParams extends StrainSkillParams {
  // 10 for aim and 5 in speed
  reducedSectionCount: number;

  // 0.9 except for 1.0 in FL
  decayWeight: number;

  difficultyMultiplier: number;
}

function calculateDifficultyValues(
  diffs: OsuDifficultyHitObject[], // -> only startTime is used here
  strains: number[],
  { sectionDuration, strainDecay }: StrainSkillParams,
  difficultyValueFromPeaks: (peaks: number[]) => number,
  onlyFinalValue: boolean,
): number[] {
  if (diffs.length === 0) return [];
  // osu!lazer note: sectionBegin = sectionDuration if t is dividable by sectionDuration (bug?)
  const calcSectionBegin = (sectionDuration: number, t: number) => Math.floor(t / sectionDuration) * sectionDuration;

  const peaks: number[] = [];
  const difficultyValues: number[] = [];

  let currentSectionBegin = calcSectionBegin(sectionDuration, diffs[0].startTime);
  let currentSectionPeak = 0;

  if (!onlyFinalValue) {
    // For the first hitobject it is always 0
    difficultyValues.push(0);
  }

  for (let i = 1; i < diffs.length; i++) {
    const prevStartTime = diffs[i - 1].startTime;
    const currStartTime = diffs[i].startTime;

    // Let's see if we can close off the other sections
    while (currentSectionBegin + sectionDuration < currStartTime) {
      peaks.push(currentSectionPeak);
      currentSectionBegin += sectionDuration;
      currentSectionPeak = strains[i - 1] * strainDecay(currentSectionBegin - prevStartTime);
    }

    // Now check if the currentSectionPeak can be improved with the current hit object i
    currentSectionPeak = Math.max(currentSectionPeak, strains[i]);

    if (onlyFinalValue && i + 1 < diffs.length) {
      continue;
    }
    // We do not push the currentSectionPeak to the peaks yet because currentSectionPeak is still in a jelly state and
    // can be improved by the future hit objects in the same section.
    const peaksWithCurrent = [...peaks, currentSectionPeak];
    difficultyValues.push(difficultyValueFromPeaks(peaksWithCurrent));
  }
  return difficultyValues;
}

export function calculateFlashlightDifficultyValues(
  diffs: OsuDifficultyHitObject[],
  strains: number[],
  strainSkillParams: StrainSkillParams,
  onlyFinalValue: boolean,
): number[] {
  // TODO: Dude this is making it n^2 ...
  function difficultyValueFromPeaks(peaks: number[]) {
    return sum(peaks) * 1.06;
  }
  return calculateDifficultyValues(diffs, strains, strainSkillParams, difficultyValueFromPeaks, onlyFinalValue);
}

/**
 * OsuStrainSkill
 * Summary of how the strain skill works:
 * - Strain is a value that decays exponentially over time if there is no hit object present
 * - Let strain at time t be S(t)
 *
 * - First the whole beatmap is partitioned into multiple sections each of duration D (D=400ms in osu!std) e.g. [0,
 * 400], [400, 800], ...
 * - Now we only consider the highest strain of each section aka "section peak" i.e. P(i) = max(S(t)) where i*D <= t <=
 * i*(D+1)
 * Note: This can be easily calculated since we know that the peak can only happen after each hit object or at the
 * beginning of a section
 *
 * - Finally the difficulty value of a strain skill considers the largest K strain peaks (K=10 in osu!std) and
 * nerfs them so that the extremly unique difficulty spikes get nerfed.
 *
 * - Then it uses the weighted sum to calculate the difficultyValue.
 *
 * Performance notes:
 * 1. O(n + D + D * log D) if only calculating the last value
 * 2. If we want to calculate for every value:
 *   This is O(n * D * log D) but can be optimized to O(n) by having a precision breakpoint
 *   -> For example, if we now want to push a peak that'd be the 150th highest value, then best it could get in
 *    is to become the 140th highest value -> its value multiplied with the weight 0.9^140 should be
 *    greater than some precision (let's say 10^-6), otherwise we just don't push it to the peaks. In theory, we should
 *    just be maintaining about ~100-150 peak values depending on the required precision which is O(1) compared to O(D).
 */
export function calculateOsuStrainDifficultyValues(
  diffs: OsuDifficultyHitObject[],
  strains: number[],
  { reducedSectionCount, difficultyMultiplier, decayWeight, ...strainParams }: OsuStrainSkillParams,
  onlyFinalValue: boolean,
): number[] {
  // OsuStrainSkill#DifficultyValue()
  const descending = (a: number, b: number) => b - a;
  function difficultyValueFromPeaks(peaks: number[]) {
    // We do not push the currentSectionPeak to the peaks yet because currentSectionPeak is still in a jelly state and
    // can be improved by the future hit objects in the same section.
    peaks.sort(descending);
    // This is now part of DifficultyValue()
    for (let i = 0; i < Math.min(peaks.length, reducedSectionCount); i++) {
      // Scale might be precalculated since it uses some expensive operation (log10)
      const scale = Math.log10(lerp(1, 10, clamp(i / reducedSectionCount, 0, 1)));
      peaks[i] *= lerp(REDUCED_STRAIN_BASELINE, 1.0, scale);
    }
    let weight = 1;

    peaks = peaks.filter((p) => p > 0);
    // Decreasingly
    peaks.sort(descending);
    let difficultyValue = 0;
    for (const peak of peaks) {
      difficultyValue += peak * weight;
      weight *= decayWeight;
    }
    return difficultyValue * difficultyMultiplier;
  }

  return calculateDifficultyValues(diffs, strains, strainParams, difficultyValueFromPeaks, onlyFinalValue);
}
