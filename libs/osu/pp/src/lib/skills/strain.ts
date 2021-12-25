import { insertDecreasing } from "../utils";
import { clamp, lerp } from "@rewind/osu/math";
import { isHitCircle, OsuHitObject } from "@rewind/osu/core";

interface StrainDifficultyParams {
  sectionDuration: number;

  // Usually always 400ms except for in osu!catch with 700ms
  sectionCount: number;

  // 0.9 except for 1.0 in FL
  decayWeight: number;

  difficultyMultiplier: number;
  strainDecay: (time: number) => number;
}

const startTime = (o: OsuHitObject) => (isHitCircle(o) ? o.hitTime : o.startTime);

// Not overridden ... yet?
const REDUCED_STRAIN_BASELINE = 0.75;

/**
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
 * calculates the weighted sum of it sum(P_i * W^i) where W=0.9 in osu!std (and a bit adjusted)
 */

// Performance notes: calculates the aim values in O(n) instead of O(n * D) where D is the map duration in seconds
export function calculateDifficultyValues(
  hitObjects: OsuHitObject[],
  strains: number[],
  { sectionDuration, sectionCount, difficultyMultiplier, strainDecay, decayWeight }: StrainDifficultyParams,
) {
  if (hitObjects.length === 0) return [];
  // osu!lazer note: sectionBegin = sectionDuration if t is dividable by sectionDuration (bug?)
  const calcSectionBegin = (sectionDuration: number, t: number) => Math.floor(t / sectionDuration) * sectionDuration;

  const peaks: number[] = [];
  const difficultyValues: number[] = [0];

  let currentSectionBegin = calcSectionBegin(sectionDuration, startTime(hitObjects[0]));
  let currentSectionPeak = 0;

  function closeCurrentSection() {
    insertDecreasing(peaks, currentSectionPeak, sectionCount);
  }

  for (let i = 1; i < hitObjects.length; i++) {
    const prev = hitObjects[i - 1];
    const curr = hitObjects[i];
    const prevStartTime = startTime(prev);
    const currStartTime = startTime(curr);

    // Between i - 1 and i there might be empty sections with a peak strain always on the beginning of the section.
    // We will now consider those and stop when it's not needed (otherwise we get a O(D) performance factor like in
    // Lazer)
    while (currentSectionBegin + 2 * sectionDuration < currStartTime) {
      closeCurrentSection();
      currentSectionBegin += sectionDuration;
      currentSectionPeak = strains[i - 1] * strainDecay(currentSectionBegin - prevStartTime);
      // This checks if the current highest peaks can be improved or not
      if (peaks.length < sectionCount || peaks[peaks.length - 1] > currentSectionPeak) {
        // We basically jump to the last section before the new section for hit object i
        currentSectionBegin = calcSectionBegin(sectionDuration, currStartTime) - sectionDuration;
        currentSectionPeak = -1;
        break;
      }
    }

    // Now the currentSection can only be the one that we are supposed to be in or the one before
    // Recalculate currentSectionBegin and currentSectionPeak if the latter case is true
    if (currentSectionBegin + sectionDuration <= currStartTime) {
      closeCurrentSection();
      currentSectionBegin = calcSectionBegin(sectionDuration, currStartTime);
      currentSectionPeak = strains[i - 1] * strainDecay(currentSectionBegin - prevStartTime);
    }

    // Now check if the currentSectionPeak can be improved with the current hit object i
    currentSectionPeak = Math.max(currentSectionPeak, strains[i]);

    // We do not push the currentSectionPeak to the peaks yet because currentSectionPeak is still in a jelly state and
    // can be improved by the future hit objects in the same section.
    const peaksWithCurrent = [...peaks];
    insertDecreasing(peaksWithCurrent, currentSectionPeak, sectionCount);

    // This is now part of DifficultyValue()
    for (let i = 0; i < peaksWithCurrent.length; i++) {
      // Scale might be precalculated since it uses some expensive operation (log10)
      const scale = Math.log10(lerp(1, 10, clamp(i / sectionCount, 0, 1)));
      peaksWithCurrent[i] *= lerp(REDUCED_STRAIN_BASELINE, 1.0, scale);
    }
    let weight = 1;
    // Decreasingly
    peaksWithCurrent.sort((a, b) => b - a);
    let difficultyValue = 0;
    for (const peak of peaksWithCurrent) {
      difficultyValue += peak * weight;
      weight *= decayWeight;
    }
    difficultyValues.push(difficultyValue * difficultyMultiplier);
  }
  return difficultyValues;
}
