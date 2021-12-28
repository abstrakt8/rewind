// Strain
import {
  determineDefaultPlaybackSpeed,
  HitCircle,
  isHitCircle,
  isSlider,
  isSpinner,
  OsuClassicMod,
  OsuHitObject,
  Slider,
} from "@osujs/core";
import { hitWindowsForOD, Position, Vec2 } from "@osujs/math";
import { calculateAim } from "./skills/aim";
import { calculateSpeed } from "./skills/speed";

const decayWeight = 0.9;

// It's the clock rate adjusted duration (so 400ms in real time)
const sectionDurationInMs = 400;

//
function difficultyValue() {}

export interface OsuDifficultyHitObject {
  // Game clock adjusted
  deltaTime: number;
  startTime: number;
  endTime: number;

  strainTime: number;
  jumpDistance: number;
  movementDistance: number;
  movementTime: number;
  travelDistance: number;
  travelTime: number;
  angle: number | null;
}

// TODO: Utilitiy functions?
const startTime = (o: OsuHitObject) => (isHitCircle(o) ? o.hitTime : o.startTime);
const endTime = (o: OsuHitObject) => (isHitCircle(o) ? o.hitTime : o.endTime);
const position = (o: HitCircle | Slider) => (isHitCircle(o) ? o.position : o.head.position);

const normalised_radius = 50.0;
const maximum_slider_radius = normalised_radius * 2.4;
const assumed_slider_radius = normalised_radius * 1.8;

function computeSliderCursorPosition(slider: Slider) {
  const lazyTravelTime = slider.checkPoints[slider.checkPoints.length - 1].hitTime - slider.startTime;
  let lazyTravelDistance = 0;

  let endTimeMin = lazyTravelTime / slider.spanDuration;
  // TODO: Control this code again
  if (endTimeMin % 2 >= 1) endTimeMin = 1 - (endTimeMin % 1);
  else endTimeMin %= 1;
  // temporary lazy end position until a real result can be derived.
  let lazyEndPosition = Vec2.add(slider.startPosition, slider.path.positionAt(endTimeMin)) as Position;
  let currCursorPosition = slider.startPosition;
  const scalingFactor = normalised_radius / slider.radius; // lazySliderDistance is coded to be sensitive to scaling,
  // this makes the maths easier with the thresholds being
  // used.

  const numCheckPoints = slider.checkPoints.length;
  // We start from 0 because the head is NOT a slider checkpoint here
  for (let i = 0; i < numCheckPoints; i++) {
    const currMovementObj = slider.checkPoints[i];

    let currMovement = Vec2.sub(currMovementObj.position, currCursorPosition);
    let currMovementLength = scalingFactor * currMovement.length();

    // Amount of movement required so that the cursor position needs to be updated.
    let requiredMovement = assumed_slider_radius;

    if (i == slider.checkPoints.length - 1) {
      // The end of a slider has special aim rules due to the relaxed time constraint on position.
      // There is both a lazy end position as well as the actual end slider position. We assume the player takes the
      // simpler movement. For sliders that are circular, the lazy end position may actually be farther away than the
      // sliders true end. This code is designed to prevent buffing situations where lazy end is actually a less
      // efficient movement.
      const lazyMovement = Vec2.sub(lazyEndPosition, currCursorPosition);

      if (lazyMovement.length() < currMovement.length()) currMovement = lazyMovement;

      currMovementLength = scalingFactor * currMovement.length();
    } else if (currMovementObj.type === "REPEAT") {
      // For a slider repeat, assume a tighter movement threshold to better assess repeat sliders.
      requiredMovement = normalised_radius;
    }

    if (currMovementLength > requiredMovement) {
      // this finds the positional delta from the required radius and the current position, and updates the
      // currCursorPosition accordingly, as well as rewarding distance.
      currCursorPosition = Vec2.add(
        currCursorPosition,
        Vec2.scale(currMovement, (currMovementLength - requiredMovement) / currMovementLength),
      );
      currMovementLength *= (currMovementLength - requiredMovement) / currMovementLength;
      lazyTravelDistance += currMovementLength;
    }

    if (i == numCheckPoints - 1) lazyEndPosition = currCursorPosition;
  }

  lazyTravelDistance *= Math.pow(1 + slider.repeatCount / 2.5, 1.0 / 2.5); // Bonus for repeat sliders until a better
  // per nested object strain system can be
  // achieved.

  return { lazyTravelTime, lazyTravelDistance, lazyEndPosition };
}

const defaultOsuDifficultyHitObject = (): OsuDifficultyHitObject => ({
  deltaTime: 0,
  travelTime: 0,
  travelDistance: 0,
  jumpDistance: 0,
  movementDistance: 0,
  movementTime: 0,
  strainTime: 0,
  endTime: 0,
  startTime: 0,
  angle: null,
});

/**
 * Returns n OsuDifficultyHitObjects where the first one is a dummy value
 */
function preprocessDifficultyHitObject(hitObjects: OsuHitObject[], clockRate: number): OsuDifficultyHitObject[] {
  const difficultyHitObjects: OsuDifficultyHitObject[] = [defaultOsuDifficultyHitObject()];
  const min_delta_time = 25;

  const clockAdjusted = (x: number) => x / clockRate;

  // Caching for the sliders
  const sliderCursorPosition: Record<string, ReturnType<typeof computeSliderCursorPosition>> = {};

  function computeSliderCursorPositionIfNeeded(s: Slider): ReturnType<typeof computeSliderCursorPosition> {
    if (sliderCursorPosition[s.id] === undefined) {
      sliderCursorPosition[s.id] = computeSliderCursorPosition(s);
    }
    return sliderCursorPosition[s.id];
  }

  for (let i = 1; i < hitObjects.length; i++) {
    const lastLast: OsuHitObject | undefined = hitObjects[i - 2];
    const last = hitObjects[i - 1];
    const current = hitObjects[i];

    const difficultyHitObject = (function calculateDifficultyHitObject() {
      const result = defaultOsuDifficultyHitObject();
      result.startTime = clockAdjusted(startTime(current));
      result.endTime = clockAdjusted(endTime(current));
      result.deltaTime = clockAdjusted(startTime(current) - startTime(last));

      const strainTime = Math.max(result.deltaTime, min_delta_time);
      result.strainTime = strainTime;

      if (isSpinner(current) || isSpinner(last)) return result;

      let scalingFactor = normalised_radius / current.radius;
      // Now current is either HitCircle or Slider

      if (current.radius < 30) {
        const smallCircleBonus = Math.min(30 - current.radius, 5) / 50;
        scalingFactor *= 1 + smallCircleBonus;
      }

      function getEndCursorPosition(o: HitCircle | Slider) {
        if (isHitCircle(o)) return o.position;
        const { lazyEndPosition } = computeSliderCursorPositionIfNeeded(o);
        return lazyEndPosition ?? o.startPosition; // TODO: How can it be nullable?
      }

      const lastCursorPosition = getEndCursorPosition(last);
      // sqrt((x1*c-x2*c)^2+(y1*c-y2*c)^2) = sqrt(c^2 (x1-x2)^2 + c^2 (y1-y2)^2) = c * dist((x1,y1),(x2,y2))
      result.jumpDistance = scalingFactor * Vec2.distance(position(current), lastCursorPosition);

      if (isSlider(last)) {
        // No need to store into the Slider object!
        const { lazyTravelTime: lastSliderLazyTravelTime, lazyTravelDistance: lastSliderLazyTravelDistance } =
          computeSliderCursorPositionIfNeeded(last);
        result.travelDistance = lastSliderLazyTravelDistance;
        result.travelTime = Math.max(lastSliderLazyTravelTime / clockRate, min_delta_time);
        result.movementTime = Math.max(strainTime - result.travelTime, min_delta_time);

        const tailJumpDistance = Vec2.distance(last.endPosition, position(current)) * scalingFactor;
        result.movementDistance = Math.max(
          0,
          Math.min(
            result.jumpDistance - (maximum_slider_radius - assumed_slider_radius),
            tailJumpDistance - maximum_slider_radius,
          ),
        );
      } else {
        result.movementTime = strainTime;
        result.movementDistance = result.jumpDistance;
      }

      if (lastLast !== undefined && !isSpinner(lastLast)) {
        const lastLastCursorPosition = getEndCursorPosition(lastLast);
        const v1 = Vec2.sub(lastLastCursorPosition, position(last));
        const v2 = Vec2.sub(position(current), lastCursorPosition);
        const dot = Vec2.dot(v1, v2);
        const det = v1.x * v2.y - v1.y * v2.x;
        result.angle = Math.abs(Math.atan2(det, dot));
      }

      return result;
    })();

    difficultyHitObjects.push(difficultyHitObject);
  }
  return difficultyHitObjects;
}

interface DifficultyAttributes {
  aimDifficulty: number;
  speedDifficulty: number;
  flashlightDifficulty: number;
  sliderFactor: number;
  starRating: number;
}

// Calculates the different star ratings after every hit object i
export function calculateDifficultyAttributes(
  hitObjects: OsuHitObject[],
  mods: OsuClassicMod[],
  overallDifficulty: number,
) {
  const DIFFICULTY_MULTIPLIER = 0.0675;

  const clockRate = determineDefaultPlaybackSpeed(mods);
  const diffs = preprocessDifficultyHitObject(hitObjects, clockRate);

  const hitWindowGreat = hitWindowsForOD(overallDifficulty, true)[0] / clockRate;

  const aimValues = calculateAim(hitObjects, diffs, true);
  const aimValuesNoSliders = calculateAim(hitObjects, diffs, false);
  const speedValues = calculateSpeed(hitObjects, diffs, hitWindowGreat);

  const attributes: DifficultyAttributes[] = [];
  for (let i = 0; i < hitObjects.length; i++) {
    const aimRating = Math.sqrt(aimValues[i]) * DIFFICULTY_MULTIPLIER;
    const aimRatingNoSliders = Math.sqrt(aimValuesNoSliders[i]) * DIFFICULTY_MULTIPLIER;
    let speedRating = Math.sqrt(speedValues[i]) * DIFFICULTY_MULTIPLIER;
    const flashlightRating = 0; // TODO

    const sliderFactor = aimRating > 0 ? aimRatingNoSliders / aimRating : 1;
    if (mods.includes("RELAX")) {
      speedRating = 0;
    }
    const baseAimPerformance = Math.pow(5 * Math.max(1, aimRating / 0.0675) - 4, 3) / 100000;
    const baseSpeedPerformance = Math.pow(5 * Math.max(1, speedRating / 0.0675) - 4, 3) / 100000;
    let baseFlashlightPerformance = 0.0;

    if (mods.includes("FLASH_LIGHT")) baseFlashlightPerformance = Math.pow(flashlightRating, 2.0) * 25.0;

    const basePerformance = Math.pow(
      Math.pow(baseAimPerformance, 1.1) +
        Math.pow(baseSpeedPerformance, 1.1) +
        Math.pow(baseFlashlightPerformance, 1.1),
      1.0 / 1.1,
    );

    const starRating =
      basePerformance > 0.00001
        ? Math.cbrt(1.12) * 0.027 * (Math.cbrt((100000 / Math.pow(2, 1 / 1.1)) * basePerformance) + 4)
        : 0;
    attributes.push({
      aimDifficulty: aimRating,
      speedDifficulty: speedRating,
      flashlightDifficulty: flashlightRating,
      sliderFactor,
      starRating,
    });
  }
  return attributes;
}
