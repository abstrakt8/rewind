import { HitCircle, isHitCircle, isSpinner, OsuHitObject, Slider } from "@osujs/core";
import { OsuDifficultyHitObject } from "../diff";
import { Vec2 } from "@osujs/math";
import { calculateDifficultyValues } from "./strain";

const skillMultiplier = 0.15;
const strainDecayBase = 0.15;
const historyLength = 10; // Look back for 10 notes is added for the sake of flashlight calculations.

const strainDecay = (ms: number) => Math.pow(strainDecayBase, ms / 1000);
const position = (o: HitCircle | Slider) => (isHitCircle(o) ? o.position : o.head.position);
// In Flashlight it's not using StackedEndPosition so we have to adjust
const unstackedEndPosition = (o: HitCircle | Slider) => (isHitCircle(o) ? o.unstackedPosition : o.unstackedEndPosition);

// const blueprintEndPosition = (o: HitCircle | Slider) => (isHitCircle(o) ? o.position : o.endPosition);

function calculateFlashlightStrains(
  hitObjects: OsuHitObject[],
  diffs: OsuDifficultyHitObject[],
): number[] {
  if (hitObjects.length === 0) return [];

  let currentStrain = 0;
  const strains = [currentStrain];

  for (let i = 1; i < diffs.length; i++) {
    const current = hitObjects[i];
    const diffCurrent = diffs[i];

    const strainValueOf = (function() {
      if (isSpinner(current)) return 0;

      const scalingFactor = 52.0 / current.radius;
      let smallDistNerf = 1.0;
      let cumulativeStrainTime = 0.0;
      let result = 0.0;

      const previousCount = Math.min(i - 1, historyLength);
      for (let j = 0; j < previousCount; j++) {
        const previous = hitObjects[i - j - 1];
        const diffPrevious = diffs[i - j - 1];

        if (isSpinner(previous)) continue;

        // #LAZERBUG: Lazer doesn't use StackedEndPosition
        const jumpDistance = Vec2.distance(position(current), unstackedEndPosition(previous));
        cumulativeStrainTime += diffPrevious.strainTime;
        if (j === 0)
          smallDistNerf = Math.min(1.0, jumpDistance / 75.0);
        const stackNerf = Math.min(1.0, (diffPrevious.jumpDistance / scalingFactor) / 25.0);
        result += Math.pow(0.8, j) * stackNerf * scalingFactor * jumpDistance / cumulativeStrainTime;
      }
      return Math.pow(smallDistNerf * result, 2.0);
    })();

    currentStrain *= strainDecay(diffCurrent.deltaTime);
    currentStrain += strainValueOf * skillMultiplier;
    strains.push(currentStrain);
  }

  return strains;
}

export function calculateFlashlight(hitObjects: OsuHitObject[], diffs: OsuDifficultyHitObject[], onlyFinalValue: boolean) {
  const strains = calculateFlashlightStrains(hitObjects, diffs);
  return calculateDifficultyValues(diffs, strains, {
    decayWeight: 1.0, // Overridden
    difficultyMultiplier: 1.06, // Default
    sectionDuration: 400, // Default
    reducedSectionCount: 10, // Default
    strainDecay,
  }, onlyFinalValue);
}
