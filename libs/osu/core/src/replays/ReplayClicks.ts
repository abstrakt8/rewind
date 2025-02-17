import { ReplayFrame } from "./Replay";

export type TimeInterval = [number, number];
export type TimeIntervals = TimeInterval[];

export function calculateReplayClicks(frames: ReplayFrame[]) {
  const clicks: [TimeIntervals, TimeIntervals] = [[], []];
  const startTime: (number | null)[] = [null, null];
  for (const frame of frames) {
    for (let i = 0; i < 2; i++) {
      // Enums are so bad in terms of type safety
      const isPressing = frame.actions.includes(i);
      if (!isPressing && startTime[i] !== null) {
        clicks[i].push([startTime[i] as number, frame.time]);
        startTime[i] = null;
      } else if (isPressing && startTime[i] === null) {
        startTime[i] = frame.time;
      }
    }
  }
  for (let i = 0; i < 2; i++) {
    if (startTime[i] !== null) {
      clicks[i].push([startTime[i] as number, 1e9]);
    }
  }
  return clicks;
}
