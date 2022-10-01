import { isSlider, isSpinner, OsuHitObject } from "@osujs/core";
import { OsuDifficultyHitObject } from "../diff";
import { clamp } from "@osujs/math";
import { calculateDifficultyValues } from "./strain";

const single_spacing_threshold = 125;
const rhythm_multiplier = 0.75;
const history_time_max = 5000; // 5 seconds of calculatingRhythmBonus max.
const min_speed_bonus = 75; // ~200BPM
const speed_balancing_factor = 40;

const skillMultiplier = 1375;
const strainDecayBase = 0.3;

const strainDecay = (ms: number) => Math.pow(strainDecayBase, ms / 1000);

/**
 * @param hitObjects
 * @param diffs
 * @returns `strains[i]` = speed strain value after the `i`th hitObject
 */
export function calculateSpeedStrains(hitObjects: OsuHitObject[], diffs: OsuDifficultyHitObject[]): number[] {
  let currentStrain = 0;
  const strains = [0];

  for (let i = 1; i < hitObjects.length; i++) {
    const current = hitObjects[i];

    const diffCurrent = diffs[i];
    const diffPrev = diffs[i - 1];
    const diffNext: OsuDifficultyHitObject | undefined = diffs[i + 1];

    // Helper function so that we don't have to use the ReversedQueue `Previous`
    const previous = (j: number) => diffs[i - 1 - j];
    const previousHitObject = (j: number) => hitObjects[i - 1 - j];

    const speedEvaluateDifficultyOf = (function () {
      if (isSpinner(current)) return 0;

      // derive strainTime for calculation
      let strainTime = diffCurrent.strainTime;
      let doubletapness = 1;

      // Nerf doubletappable doubles
      if (diffNext !== undefined) {
        const currDeltaTime = Math.max(1, diffCurrent.deltaTime);
        const nextDeltaTime = Math.max(1, diffNext.deltaTime);
        const deltaDifference = Math.abs(nextDeltaTime - currDeltaTime);
        const speedRatio = currDeltaTime / Math.max(currDeltaTime, deltaDifference);
        const windowRatio = Math.pow(Math.min(1, currDeltaTime / diffCurrent.hitWindowGreat), 2);
        doubletapness = Math.pow(speedRatio, 1 - windowRatio);
      }

      // Cap deltatime to the OD 300 hitwindow.
      // 0.93 is derived from making sure 260bpm OD8 streams aren't nerfed harshly, whilst 0.92 limits the effect of
      // the cap.
      strainTime /= clamp(strainTime / diffCurrent.hitWindowGreat / 0.93, 0.92, 1);

      // derive speedBonus for calculation
      let speedBonus = 1.0;

      if (strainTime < min_speed_bonus)
        speedBonus = 1 + 0.75 * Math.pow((min_speed_bonus - strainTime) / speed_balancing_factor, 2);

      const travelDistance = diffPrev.travelDistance;
      const distance = Math.min(single_spacing_threshold, travelDistance + diffCurrent.minimumJumpDistance);

      return (
        ((speedBonus + speedBonus * Math.pow(distance / single_spacing_threshold, 3.5)) * doubletapness) / strainTime
      );
    })();

    const currentRhythm = (function () {
      if (isSpinner(current)) return 0;

      let previousIslandSize = 0;

      let rhythmComplexitySum = 0;
      let islandSize = 1;
      let startRatio = 0; // store the ratio of the current start of an island to buff for tighter rhythms

      let firstDeltaSwitch = false;

      // TODO: i - 1 or i
      const historicalNoteCount = Math.min(i - 1, 32);
      let rhythmStart = 0;

      // Optimization from a "future" commit
      // https://github.com/ppy/osu/commit/c87ff82c1cde3af45c173fcb264de999340b743c#diff-4ed7064eeb60b6f0a19dc16729cd6fc3c3ba9794962a7bcfc830bddbea781000
      while (
        rhythmStart < historicalNoteCount - 2 &&
        diffCurrent.startTime - previous(rhythmStart).startTime < history_time_max
      )
        rhythmStart++;

      for (let j = rhythmStart; j > 0; j--) {
        const currObj = previous(j - 1);
        const prevObj = previous(j);
        const lastObj = previous(j + 1);

        let currHistoricalDecay = (history_time_max - (diffCurrent.startTime - currObj.startTime)) / history_time_max;
        currHistoricalDecay = Math.min((historicalNoteCount - j) / historicalNoteCount, currHistoricalDecay);

        const currDelta = currObj.strainTime;
        const prevDelta = prevObj.strainTime;
        const lastDelta = lastObj.strainTime;
        const currRatio =
          1.0 +
          6.0 *
            Math.min(
              0.5,
              Math.pow(Math.sin(Math.PI / (Math.min(prevDelta, currDelta) / Math.max(prevDelta, currDelta))), 2),
            ); // fancy function to calculate rhythmbonuses.

        let windowPenalty = Math.min(
          1,
          Math.max(0, Math.abs(prevDelta - currDelta) - diffCurrent.hitWindowGreat * 0.3) /
            (diffCurrent.hitWindowGreat * 0.3),
        );

        windowPenalty = Math.min(1, windowPenalty);

        let effectiveRatio = windowPenalty * currRatio;

        if (firstDeltaSwitch) {
          if (!(prevDelta > 1.25 * currDelta || prevDelta * 1.25 < currDelta)) {
            if (islandSize < 7) islandSize++; // island is still progressing, count size.
          } else {
            if (isSlider(previousHitObject(j - 1)))
              // bpm change is into slider, this is easy acc window
              effectiveRatio *= 0.125;

            if (isSlider(previousHitObject(j)))
              // bpm change was from a slider, this is easier typically than circle -> circle
              effectiveRatio *= 0.25;

            if (previousIslandSize == islandSize)
              // repeated island size (ex: triplet -> triplet)
              effectiveRatio *= 0.25;

            if (previousIslandSize % 2 == islandSize % 2)
              // repeated island polartiy (2 -> 4, 3 -> 5)
              effectiveRatio *= 0.5;

            if (lastDelta > prevDelta + 10 && prevDelta > currDelta + 10)
              // previous increase happened a note ago, 1/1->1/2-1/4, dont want to buff this.
              effectiveRatio *= 0.125;

            rhythmComplexitySum +=
              (((Math.sqrt(effectiveRatio * startRatio) * currHistoricalDecay * Math.sqrt(4 + islandSize)) / 2) *
                Math.sqrt(4 + previousIslandSize)) /
              2;

            startRatio = effectiveRatio;

            previousIslandSize = islandSize; // log the last island size.

            if (prevDelta * 1.25 < currDelta)
              // we're slowing down, stop counting
              firstDeltaSwitch = false; // if we're speeding up, this stays true and  we keep counting island size.

            islandSize = 1;
          }
        } else if (prevDelta > 1.25 * currDelta) {
          // we want to be speeding up.
          // Begin counting island until we change speed again.
          firstDeltaSwitch = true;
          startRatio = effectiveRatio;
          islandSize = 1;
        }
      }

      return Math.sqrt(4 + rhythmComplexitySum * rhythm_multiplier) / 2; //produces multiplier that can be applied to
      // strain. range [1, infinity) (not really
      // though)
    })();

    currentStrain *= strainDecay(diffCurrent.strainTime);
    currentStrain += speedEvaluateDifficultyOf * skillMultiplier;

    const totalStrain = currentStrain * currentRhythm;
    strains.push(totalStrain);
  }
  return strains;
}

export function calculateSpeed(hitObjects: OsuHitObject[], diffs: OsuDifficultyHitObject[], onlyFinalValue: boolean) {
  const strains = calculateSpeedStrains(hitObjects, diffs);
  return calculateDifficultyValues(
    diffs,
    strains,
    {
      decayWeight: 0.9,
      difficultyMultiplier: 1.04,
      sectionDuration: 400,
      reducedSectionCount: 5,
      strainDecay,
    },
    onlyFinalValue,
  );
}
