import { clamp, lerp } from "@rewind/osu/math";
import { isHitCircle, OsuHitObject } from "@rewind/osu/core";

interface StrainDifficultyParams {
  // Usually always 400ms except for in osu!catch with 700ms
  sectionDuration: number;

  // 10 for aim and 5 in speed
  reducedSectionCount: number;

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
 * nerfs them so that the extremly unique difficulty spikes get nerfed.
 *
 * - Then it uses the weighted sum to calculate the difficultyValue.
 *
 * This is O(n * D * log D) but can be optimized to O(n) by having a breakpoint (when the precision gets very low)
 */
export function calculateDifficultyValues(
  hitObjects: OsuHitObject[],
  strains: number[],
  { sectionDuration, reducedSectionCount, difficultyMultiplier, strainDecay, decayWeight }: StrainDifficultyParams,
) {
  if (hitObjects.length === 0) return [];
  // osu!lazer note: sectionBegin = sectionDuration if t is dividable by sectionDuration (bug?)
  const calcSectionBegin = (sectionDuration: number, t: number) => Math.floor(t / sectionDuration) * sectionDuration;

  const peaks: number[] = [];
  const difficultyValues: number[] = [0];

  let currentSectionBegin = calcSectionBegin(sectionDuration, startTime(hitObjects[0]));
  let currentSectionPeak = 0;

  for (let i = 1; i < hitObjects.length; i++) {
    const prev = hitObjects[i - 1];
    const curr = hitObjects[i];
    const prevStartTime = startTime(prev);
    const currStartTime = startTime(curr);

    // Let's see if we can close off the other sections
    while (currentSectionBegin + sectionDuration < currStartTime) {
      peaks.push(currentSectionPeak);
      currentSectionBegin += sectionDuration;
      currentSectionPeak = strains[i - 1] * strainDecay(currentSectionBegin - prevStartTime);
    }

    // Now check if the currentSectionPeak can be improved with the current hit object i
    currentSectionPeak = Math.max(currentSectionPeak, strains[i]);

    // We do not push the currentSectionPeak to the peaks yet because currentSectionPeak is still in a jelly state and
    // can be improved by the future hit objects in the same section.
    const peaksWithCurrent = [...peaks, currentSectionPeak];
    const descending = (a: number, b: number) => b - a;

    peaksWithCurrent.sort(descending);
    // This is now part of DifficultyValue()
    for (let i = 0; i < Math.min(peaksWithCurrent.length, reducedSectionCount); i++) {
      // Scale might be precalculated since it uses some expensive operation (log10)
      const scale = Math.log10(lerp(1, 10, clamp(i / reducedSectionCount, 0, 1)));
      peaksWithCurrent[i] *= lerp(REDUCED_STRAIN_BASELINE, 1.0, scale);
    }
    let weight = 1;
    // Decreasingly
    peaksWithCurrent.sort(descending);
    let difficultyValue = 0;
    for (const peak of peaksWithCurrent) {
      difficultyValue += peak * weight;
      weight *= decayWeight;
    }
    difficultyValues.push(difficultyValue * difficultyMultiplier);
  }
  return difficultyValues;
}
