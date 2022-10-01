import { HitCircle, isHitCircle, isSlider, isSpinner, ModHiddenConstants, OsuHitObject, Slider } from "@osujs/core";
import { OsuDifficultyHitObject } from "../diff";
import { approachRateToApproachDuration, clamp, PREEMPT_MIN, Vec2 } from "@osujs/math";
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
  { hasHiddenMod, approachRate }: { hasHiddenMod: boolean; approachRate: number },
): number[] {
  if (hitObjects.length === 0) return [];

  let currentStrain = 0;
  const strains = [currentStrain];

  for (let k = 1; k < diffs.length; k++) {
    const thisHitObject = hitObjects[k];
    const thisDiff = diffs[k];

    const evaluateDifficultyOf = (function () {
      if (isSpinner(thisHitObject)) return 0;

      const scalingFactor = 52.0 / thisHitObject.radius;
      let smallDistNerf = 1.0;
      let cumulativeStrainTime = 0.0;
      let result = 0.0;

      let angleRepeatCount = 0.0;

      const previousCount = Math.min(k - 1, 10);
      for (let i = 0; i < previousCount; i++) {
        const current = hitObjects[k - i - 1];
        const currentDiff = diffs[k - i - 1];
        const lastDiff = diffs[k - i];

        if (isSpinner(current)) continue;

        const jumpDistance = Vec2.distance(position(thisHitObject), endPosition(current));
        cumulativeStrainTime += lastDiff.strainTime;
        if (i === 0) smallDistNerf = Math.min(1.0, jumpDistance / 75.0);

        const stackNerf = Math.min(1.0, currentDiff.lazyJumpDistance / scalingFactor / 25.0);

        const opacityBonus =
          1.0 +
          max_opacity_bonus *
            (1.0 - opacityAt(thisHitObject, { hidden: hasHiddenMod, approachRate, time: startTime(current) }));

        result += (stackNerf * opacityBonus * scalingFactor * jumpDistance) / cumulativeStrainTime;

        if (currentDiff.angle !== null && thisDiff.angle !== null) {
          if (Math.abs(currentDiff.angle - thisDiff.angle) < 0.02) angleRepeatCount += Math.max(1.0 - 0.1 * i, 0.0);
        }
      }
      result = Math.pow(smallDistNerf * result, 2.0);
      if (hasHiddenMod) result *= 1.0 + hidden_bonus;

      result *= min_angle_multiplier + (1.0 - min_angle_multiplier) / (angleRepeatCount + 1.0);
      if (isSlider(thisHitObject)) {
        const pixelTravelDistance = thisDiff.lazyTravelDistance / scalingFactor;
        let sliderBonus = Math.pow(Math.max(0.0, pixelTravelDistance / thisDiff.travelTime - min_velocity), 0.5);
        sliderBonus *= pixelTravelDistance;
        if (thisHitObject.repeatCount > 0) {
          sliderBonus /= thisHitObject.repeatCount + 1;
        }
        result += sliderBonus * slider_multiplier;
      }
      return result;
    })();

    currentStrain *= strainDecay(thisDiff.deltaTime);
    currentStrain += evaluateDifficultyOf * skillMultiplier;
    strains.push(currentStrain);
  }

  return strains;
}

// TODO: Move up and use it in pixijs
// This is also different for SliderEndCircles
function calcFadeInDuration(approachDuration: number, hidden: boolean) {
  if (hidden) {
    return approachDuration * ModHiddenConstants.FADE_IN_DURATION_MULTIPLIER;
  } else {
    return 400 * Math.min(1, approachDuration / PREEMPT_MIN);
  }
}

function opacityAt(
  hitObject: OsuHitObject,
  { time, approachRate, hidden }: { time: number; approachRate: number; hidden: boolean },
): number {
  if (time > startTime(hitObject)) {
    return 0.0;
  }

  // These numbers are actually different for SliderTick and SliderEndCircle, but the main hit objects (circle, slider, spinner)
  // always have the same timePreempt and timeFadeIn
  const timePreempt = approachRateToApproachDuration(approachRate);
  const timeFadeIn = calcFadeInDuration(timePreempt, hidden);
  const fadeInStartTime = startTime(hitObject) - timePreempt;
  const fadeInDuration = timeFadeIn;

  if (hidden) {
    const fadeOutStartTime = startTime(hitObject) - timePreempt + timeFadeIn;
    const fadeOutDuration = timePreempt + ModHiddenConstants.FADE_OUT_DURATION_MULTIPLIER;
    return Math.min(
      clamp((time - fadeInStartTime) / fadeInDuration, 0.0, 1.0),
      1.0 - clamp((time - fadeOutStartTime) / fadeOutDuration, 0.0, 1.0),
    );
  }

  return clamp((time - fadeInStartTime) / fadeInDuration, 0.0, 1.0);
}

export function calculateFlashlight(
  hitObjects: OsuHitObject[],
  diffs: OsuDifficultyHitObject[],
  options: { hasHiddenMod: boolean; approachRate: number },
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
