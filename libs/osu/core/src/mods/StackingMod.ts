import { HitCircle } from "../hitobjects/HitCircle";
import { float32_mul, Position, Vec2 } from "@osujs/math";
import { Slider } from "../hitobjects/Slider";
import { isHitCircle, isSlider, isSpinner, OsuHitObject } from "../hitobjects/Types";

function stackOffset(stackHeight: number, scale: number): Position {
  const value = float32_mul(stackHeight, float32_mul(scale, -6.4));
  return { x: value, y: value };
}

function stackedPosition(initialPosition: Position, stackHeight: number, scale: number): Position {
  const offset = stackOffset(stackHeight, scale);
  return Vec2.add(initialPosition, offset);
}

type StackableHitObject = Slider | HitCircle;
const STACK_DISTANCE = 3;

// I refuse to put an endPosition and endTime into HitCircle just because it's then easier to code it here
// How does it even make sense that an HitCircle has an "endPosition" or "endTime".
// Or how does it make sense that a Spinner has a stacking position, when it even doesn't have a position?

const hitCircle = (o: StackableHitObject) => (isSlider(o) ? o.head : o);
const approachDuration = (o: StackableHitObject) => hitCircle(o).approachDuration;
const hitTime = (o: StackableHitObject) => hitCircle(o).hitTime;
const position = (o: StackableHitObject) => hitCircle(o).position;
const endPosition = (o: StackableHitObject) => (isSlider(o) ? o.endPosition : o.position);
const endTime = (o: StackableHitObject) => (isSlider(o) ? o.endTime : o.hitTime);

function createStackingHeights(hitObjects: OsuHitObject[]) {
  const stackingHeights = new Map<string, number>();

  function setH(o: StackableHitObject, val: number) {
    stackingHeights.set(hitCircle(o).id, val);
  }

  function H(o: StackableHitObject) {
    return stackingHeights.get(hitCircle(o).id) ?? 0;
  }

  // They all have 0 as stack heights
  for (const ho of hitObjects) {
    if (!isSpinner(ho)) {
      setH(ho, 0);
    }
  }
  return { stackingHeights, setH, H };
}

function newStackingHeights(hitObjects: OsuHitObject[], stackLeniency: number): Map<string, number> {
  const startIndex = 0;
  const endIndex = hitObjects.length - 1;
  const extendedEndIndex = endIndex;
  const { stackingHeights, setH, H } = createStackingHeights(hitObjects);

  // Reverse pass for stack calculation
  let extendedStartIndex = startIndex;

  for (let i = extendedEndIndex; i > startIndex; i--) {
    let n = i;

    let objectI = hitObjects[i];
    if (isSpinner(objectI) || H(objectI) !== 0) continue;

    const stackThreshold = approachDuration(objectI) * stackLeniency;

    if (isHitCircle(objectI)) {
      while (--n >= 0) {
        const objectN = hitObjects[n];
        if (isSpinner(objectN)) break;

        if (hitTime(objectI) - endTime(objectN) > stackThreshold) break;
        if (n < extendedStartIndex) {
          setH(objectN, 0);
          extendedStartIndex = n;
        }

        if (isSlider(objectN) && Vec2.distance(endPosition(objectN), position(objectI)) < STACK_DISTANCE) {
          const offset = H(objectI) - H(objectN) + 1;
          for (let j = n + 1; j <= i; j++) {
            const objectJ = hitObjects[j];
            if (isSpinner(objectJ)) continue; // TODO: Inserted, but not sure
            if (Vec2.distance(endPosition(objectN), position(objectJ)) < STACK_DISTANCE) {
              setH(objectJ, H(objectJ) - offset);
            }
          }
          break;
        }
        if (Vec2.distance(position(objectN), position(objectI)) < STACK_DISTANCE) {
          setH(objectN, H(objectI) + 1);
          objectI = objectN;
        }
      }
    } else {
      while (--n >= startIndex) {
        const objectN = hitObjects[n];
        if (isSpinner(objectN)) continue;
        if (hitTime(objectI) - hitTime(objectN) > stackThreshold) break;

        if (Vec2.distance(endPosition(objectN), position(objectI)) < STACK_DISTANCE) {
          setH(objectN, H(objectI) + 1);
          objectI = objectN;
        }
      }
    }
  }
  return stackingHeights;
}

function oldStackingHeights(hitObjects: OsuHitObject[], stackLeniency: number) {
  const { stackingHeights, H, setH } = createStackingHeights(hitObjects);
  for (let i = 0; i < hitObjects.length; i++) {
    const currHitObject = hitObjects[i];
    if (isSpinner(currHitObject)) continue;
    if (H(currHitObject) !== 0 && !isSlider(currHitObject)) {
      continue;
    }

    let startTime = endTime(currHitObject);
    let sliderStack = 0;

    for (let j = i + 1; j < hitObjects.length; j++) {
      const stackThreshold = approachDuration(currHitObject) * stackLeniency;
      const nextHitObject = hitObjects[j];

      if (isSpinner(nextHitObject)) continue;
      if (hitTime(nextHitObject) - stackThreshold > startTime) {
        break;
      }

      const position2 = isSlider(currHitObject) ? currHitObject.endPosition : currHitObject.position;
      if (Vec2.withinDistance(position(nextHitObject), position(currHitObject), STACK_DISTANCE)) {
        setH(currHitObject, H(currHitObject) + 1);
        startTime = endTime(nextHitObject);
      } else if (Vec2.withinDistance(position(nextHitObject), position2, STACK_DISTANCE)) {
        sliderStack++;
        setH(nextHitObject, H(nextHitObject) - sliderStack);
        startTime = endTime(nextHitObject);
      }
    }
  }
  return stackingHeights;
}

// Modifies the hitObjects according to the stacking algorithm.
export function modifyStackingPosition(hitObjects: OsuHitObject[], stackLeniency: number, beatmapVersion: number) {
  const heights = (() => {
    if (beatmapVersion >= 6) {
      return newStackingHeights(hitObjects, stackLeniency);
    } else {
      return oldStackingHeights(hitObjects, stackLeniency);
    }
  })();
  hitObjects.forEach((hitObject) => {
    if (isSpinner(hitObject as OsuHitObject)) return;
    const h = hitCircle(hitObject as StackableHitObject);
    const height = heights.get(h.id);
    if (height === undefined) {
      throw Error("Stack height can't be undefined");
    }
    h.position = stackedPosition(h.position, height, h.scale);
  });
}
