import { HitCircle, isHitCircle, isSlider, isSpinner, OsuHitObject, Slider } from "@osujs/core";
import { OsuDifficultyHitObject } from "../diff";
import { Vec2 } from "@osujs/math";
import { calculateDifficultyValues } from "./strain";

const skillMultiplier = 0.052;
const strainDecayBase = 0.15;

const max_opacity_bonus = 0.4;
const hidden_bonus = 0.2;
const min_velocity = 0.5;
const slider_multiplier = 1.3;
const min_angle_multiplier = 0.2;

const strainDecay = (ms: number) => Math.pow(strainDecayBase, ms / 1000);
const startTime = (o: OsuHitObject) => (isHitCircle(o) ? o.hitTime : o.startTime);
const position = (o: HitCircle | Slider) => (isHitCircle(o) ? o.position : o.head.position);
const endPosition = (o: HitCircle | Slider) => (isHitCircle(o) ? o.position : o.endPosition);

// const blueprintEndPosition = (o: HitCircle | Slider) => (isHitCircle(o) ? o.position : o.endPosition);

function calculateFlashlightStrains(
  hitObjects: OsuHitObject[],
  diffs: OsuDifficultyHitObject[],
  { hasHiddenMod }: { hasHiddenMod: boolean },
): number[] {
  if (hitObjects.length === 0) return [];

  let currentStrain = 0;
  const strains = [currentStrain];

  for (let i = 1; i < diffs.length; i++) {
    const thisHitObject = hitObjects[i];
    const thisDiff = diffs[i];

    const evaluateDifficultyOf = (function () {
      if (isSpinner(thisHitObject)) return 0;

      const scalingFactor = 52.0 / thisHitObject.radius;
      let smallDistNerf = 1.0;
      let cumulativeStrainTime = 0.0;
      let result = 0.0;

      let angleRepeatCount = 0.0;

      const previousCount = Math.min(i - 1, 10);
      for (let j = 0; j < previousCount; j++) {
        const current = hitObjects[i - j - 1];
        const currentDiff = diffs[i - j - 1];
        const lastDiff = diffs[i - j];

        if (isSpinner(current)) continue;

        const jumpDistance = Vec2.distance(position(thisHitObject), endPosition(current));
        cumulativeStrainTime += lastDiff.strainTime;
        if (j === 0) smallDistNerf = Math.min(1.0, jumpDistance / 75.0);

        const stackNerf = Math.min(1.0, currentDiff.lazyJumpDistance / scalingFactor / 25.0);
        const opacityBonus = 1.0 + max_opacity_bonus * (1.0 - opacityAt(startTime(current), hasHiddenMod));

        // result += (Math.pow(0.8, j) * stackNerf * scalingFactor * jumpDistance) / cumulativeStrainTime;
        result += (stackNerf * opacityBonus * scalingFactor * jumpDistance) / cumulativeStrainTime;

        if (currentDiff.angle !== null && thisDiff.angle !== null) {
          if (Math.abs(currentDiff.angle - thisDiff.angle) < 0.02) angleRepeatCount += Math.max(1.0 - 0.1 * i, 0.0);
        }
      }
      result = Math.pow(smallDistNerf * result, 2.0);
      if (hasHiddenMod) result *= 1.0 + hidden_bonus;

      result *= min_angle_multiplier + (1.0 - min_angle_multiplier) / (angleRepeatCount + 1.0);
      let sliderBonus = 0.0;
      if (isSlider(thisHitObject)) {
        const pixelTravelDistance = thisDiff.lazyJumpDistance / scalingFactor; // TODO: LazyTravelDistance
        sliderBonus = Math.pow(Math.max(0.0, pixelTravelDistance / thisDiff.travelTime - min_velocity), 0.5);
        sliderBonus *= pixelTravelDistance;
        if (thisHitObject.repeatCount > 0) {
          sliderBonus /= thisHitObject.repeatCount + 1;
        }
      }
      result += sliderBonus * slider_multiplier;
      return result;
    })();

    currentStrain *= strainDecay(thisDiff.deltaTime);
    currentStrain += evaluateDifficultyOf * skillMultiplier;
    strains.push(currentStrain);
  }

  return strains;
}

function opacityAt(startTime: number, hidden: boolean): number {
  return 0.0;
}

export function calculateFlashlight(
  hitObjects: OsuHitObject[],
  diffs: OsuDifficultyHitObject[],
  options: { hasHiddenMod: boolean },
  onlyFinalValue: boolean,
) {
  const strains = calculateFlashlightStrains(hitObjects, diffs, options);
  return calculateDifficultyValues(
    diffs,
    strains,
    {
      decayWeight: 1.0, // Overridden
      difficultyMultiplier: 1.06, // Default
      sectionDuration: 400, // Default
      reducedSectionCount: 10, // Default
      strainDecay,
    },
    onlyFinalValue,
  );
}
