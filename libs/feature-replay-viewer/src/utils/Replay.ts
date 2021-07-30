import { OsuAction, ReplayFrame } from "osu-lib";
import { Position, Vec2 } from "osu-math";

export function findIndexInReplayAtTime(replay: ReplayFrame[], time: number): number {
  // TODO: Optimize with binary search
  return replay.findIndex((frame) => time < frame.time);
}

/**
 * This is a smoother version that does linear interpolation as a prediction for times where we don't have replay frames on.
 *
 * For example let's say we have a replay frame at t=10ms and t=30ms, now this function will say that at t=20ms the
 * position is in the center between those two positions.
 */
export const findPositionInReplayAtTime = (replay: ReplayFrame[], time: number): Position | null => {
  // TODO: Optimize with binary search
  const idx = replay.findIndex((frame) => time < frame.time);
  // If not found then this means that we have reached the end of the replay
  // If idx = 0 then this means that there is no information yet
  if (idx === -1 || idx === 0) {
    return null;
  }
  let position;
  const fA = replay[idx - 1];
  const fB = replay[idx];
  if (fB.time === fA.time) {
    position = fA.position;
  } else {
    const p = (time - fA.time) / (fB.time - fA.time);
    position = Vec2.interpolate(fA.position, fB.position, p);
  }
  return position;
};

// ? needed ?
export const getPressesBooleanArray = (actions: OsuAction[]): [boolean, boolean] => {
  return [OsuAction.leftButton, OsuAction.rightButton].map((b) => actions.includes(b)) as [boolean, boolean];
};
