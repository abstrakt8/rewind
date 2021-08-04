import { HitCircle } from "../hitobjects/HitCircle";
import { Position, Vec2 } from "@rewind/osu/math";
import { Slider } from "../hitobjects/Slider";
import { OsuHitObject } from "../hitobjects";
import produce from "immer";
import { Spinner } from "../hitobjects/Spinner";

function stackOffset(stackHeight: number, scale: number): Position {
  const value = stackHeight * scale * -6.4;
  return { x: value, y: value };
}

function stackedPosition(initialPosition: Position, stackHeight: number, scale: number): Position {
  const offset = stackOffset(stackHeight, scale);
  return Vec2.add(initialPosition, offset);
}

const STACK_DISTANCE = 3;

function endTimeOf(hitObject: HitCircle | Slider) {
  if (hitObject instanceof Slider) {
    return hitObject.endTime;
  } else {
    return hitObject.hitTime;
  }
}

function endPosition(hitObject: HitCircle | Slider) {
  if (hitObject instanceof Slider) {
    return hitObject.endPosition;
  } else {
    return hitObject.position;
  }
}

type StackableHitObjects = Spinner | HitCircle;

function getHitCircle(o: OsuHitObject): HitCircle | undefined {
  if (o instanceof HitCircle) return o;
  if (o instanceof Slider) return o.head;
  return undefined;
}

function newStackingHeights(hitObjects: OsuHitObject[], stackLeniency: number): Map<string, number> {
  const startIndex = 0,
    endIndex = hitObjects.length - 1;
  let extendedEndIndex = endIndex;
  const stackingHeights = new Map<string, number>();

  // They all have 0 as stack heights
  for (const ho of hitObjects) {
    const hc = getHitCircle(ho);
    if (hc) stackingHeights.set(hc.id, 0);
  }

  function setH(o: HitCircle, val: number) {
    stackingHeights.set(o.id, val);
  }

  function H(o: HitCircle) {
    return stackingHeights.get(o.id) ?? 0;
  }

  if (endIndex < hitObjects.length - 1) {
    // Extend the end index to include objects they are stacked on
    for (let i = endIndex; i >= startIndex; i--) {
      let stackBaseIndex = i;

      for (let n = stackBaseIndex + 1; n < hitObjects.length; n++) {
        const stackBaseObject = hitObjects[stackBaseIndex];
        const stackBaseHitCircle = getHitCircle(hitObjects[stackBaseIndex]);
        if (!stackBaseHitCircle) break;

        const objectN = getHitCircle(hitObjects[n]);
        if (!objectN) break;

        // TODO: Check if this is correct for sliders
        const endTime = endTimeOf(stackBaseHitCircle);
        const stackThreshold = objectN.approachDuration * stackLeniency;

        if (objectN.hitTime - endTime > stackThreshold)
          // no longer within stacking range of the next object
          break;

        if (
          Vec2.distance(stackBaseHitCircle.position, objectN.position) < STACK_DISTANCE ||
          (stackBaseObject.type === "SLIDER" &&
            Vec2.distance(endPosition(stackBaseHitCircle), objectN.position) < STACK_DISTANCE)
        ) {
          stackBaseIndex = n;
          // HitObjects after the specified update range haven't been reset yet
          stackingHeights.set(objectN.id, 0);
        }
      }

      if (stackBaseIndex > extendedEndIndex) {
        extendedEndIndex = stackBaseIndex;
        if (extendedEndIndex === hitObjects.length - 1) break;
      }
    }
  }

  // Reverse pass for stack calculation
  let extendedStartIndex = startIndex;

  for (let i = extendedEndIndex; i > startIndex; i--) {
    let n = i;

    let objectI = getHitCircle(hitObjects[i]);
    if (!objectI || stackingHeights.get(objectI.id) !== 0) continue;

    const stackThreshold = objectI.approachDuration * stackLeniency;

    if (objectI.type === "HIT_CIRCLE") {
      while (--n >= 0) {
        const objectN = getHitCircle(hitObjects[n]);
        if (!objectN) break;

        const endTime = endTimeOf(objectN);

        if (objectI.hitTime - endTime > stackThreshold) break;
        if (n < extendedStartIndex) {
          stackingHeights.set(objectN.id, 0);
          extendedStartIndex = n;
        }

        if (objectN.type === "SLIDER" && Vec2.distance(endPosition(objectN), objectI.position) < STACK_DISTANCE) {
          const offset = H(objectI) - H(objectN) + 1;
          for (let j = n + 1; j <= i; j++) {
            const objectJ = getHitCircle(hitObjects[j]);
            if (!objectJ) continue; // TODO: Inserted, but not sure
            if (Vec2.distance(endPosition(objectN), objectJ.position) < STACK_DISTANCE) {
              setH(objectJ, H(objectJ) - offset);
            }
          }
          break;
        }
        if (Vec2.distance(objectN.position, objectI.position) < STACK_DISTANCE) {
          setH(objectN, H(objectI) + 1);
          objectI = objectN;
        }
      }
    } else if (objectI.type === "SLIDER") {
      while (--n >= startIndex) {
        const objectN = getHitCircle(hitObjects[n]);
        if (!objectN) continue;
        if (objectI.hitTime - objectN.hitTime > stackThreshold) break;

        if (Vec2.distance(endPosition(objectN), objectI.position) < STACK_DISTANCE) {
          setH(objectN, H(objectI) + 1);
          objectI = objectN;
        }
      }
    }
  }
  return stackingHeights;
}

export function modifyStackingPosition(
  beatmapVersion: number,
  hitObjects: OsuHitObject[],
  stackLeniency: number,
): OsuHitObject[] {
  const heights = (() => {
    if (beatmapVersion >= 6) {
      return newStackingHeights(hitObjects, stackLeniency);
    } else {
      throw Error("No old stacking algorithm implemented");
    }
  })();
  return produce(hitObjects, (list) => {
    list.forEach((hitObject) => {
      const hitCircle = getHitCircle(hitObject as OsuHitObject);
      if (hitCircle) {
        hitCircle.position = stackedPosition(hitCircle.position, heights.get(hitCircle.id) ?? 0, hitCircle.scale);
      }
    });
  });
}
