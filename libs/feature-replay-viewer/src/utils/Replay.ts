import { OsuAction, ReplayFrame } from "@rewind/osu/core";
import { Position, Vec2 } from "@rewind/osu/math";

// Finds the index of the highest time that is not greater the given one.
// Returns -1 if not found
export function findIndexInReplayAtTime(replay: ReplayFrame[], time: number): number {
  let lo = 0;
  let hi = replay.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (replay[mid].time <= time) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  // return replay.findIndex((frame) => time < frame.time);
  return lo - 1;
}

/**
 * Interpolates the position between two frames (since technically speaking there is no information between those times)
 */
export function interpolateReplayPosition(fA: ReplayFrame, fB: ReplayFrame, time: number): Position {
  if (fB.time === fA.time) {
    return fA.position;
  } else {
    const p = (time - fA.time) / (fB.time - fA.time);
    return Vec2.interpolate(fA.position, fB.position, p);
  }
}

// ? needed ?
export const getPressesBooleanArray = (actions: OsuAction[]): [boolean, boolean] => {
  return [OsuAction.leftButton, OsuAction.rightButton].map((b) => actions.includes(b)) as [boolean, boolean];
};
