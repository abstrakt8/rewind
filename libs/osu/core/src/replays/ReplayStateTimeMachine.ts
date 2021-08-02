import {
  cloneReplayState,
  defaultReplayState,
  NextFrameEvaluator,
  OsuStdJudgmentSettings,
  ReplayState,
} from "./ReplayState";
import { ReplayFrame } from "./Replay";
import { Vec2 } from "@rewind/osu/math";
import { OsuHitObject } from "../hitobjects";

export interface ReplayStateTimeMachine {
  replayStateAt(time: number): ReplayState;
}

/**
 * By default O(R sqrt n) memory and O(sqrt n) time, where R is the size of a replay state.
 * Stores replays at the indices [0, sqrt n, 2 *sqrt n, ..., sqrt n * sqrt n] and the others are inferred.
 *
 * TODO: We could do caching like described in method 4 of https://gamedev.stackexchange.com/questions/6080/how-to-design-a-replay-system/8372#8372
 * TODO: Should we Object.freeze(...) the cached ones in order to prevent accidental mutations?
 */
export class BucketedReplayStateTimeMachine implements ReplayStateTimeMachine {
  // 0 stands for initial state
  // and i means that i frames have been processed

  currentIndex = 0;
  currentReplayState: ReplayState;
  storedReplayState: ReplayState[] = [];
  bucketSize: number;
  frames: ReplayFrame[];
  evaluator: NextFrameEvaluator;

  constructor(
    // TODO: hm... should be partial replay
    replay: ReplayFrame[],
    private readonly hitObjects: OsuHitObject[],
    private readonly settings: OsuStdJudgmentSettings,
    bucketSize?: number,
  ) {
    // Add a dummy replay frame at the beginning.
    this.frames = [{ time: -727_727, position: new Vec2(0, 0), actions: [] }, ...replay];
    this.bucketSize = bucketSize ?? Math.ceil(Math.sqrt(this.frames.length));
    this.storedReplayState[0] = defaultReplayState();
    this.currentReplayState = cloneReplayState(this.storedReplayState[0]);
    this.evaluator = new NextFrameEvaluator(hitObjects, settings);
  }

  private getHighestCachedIndex(time: number): number {
    for (let i = 0; i < this.frames.length; i += this.bucketSize) {
      // The second condition should not happen in our version of implementation where we travel forward.
      if (time < this.frames[i].time || !this.storedReplayState[i]) {
        return i - this.bucketSize;
      }
    }
    return 0;
  }

  replayStateAt(time: number): ReplayState {
    const highestCachedIndex = this.getHighestCachedIndex(time);

    // TODO: Just check if we had normal forward behavior or not, this can drastically improve performance
    // If not, we need to reset something such as the derived data.

    // Either we have to travel back anyways or there is a future index available for that time.
    if (this.currentIndex < highestCachedIndex || time < this.frames[this.currentIndex].time) {
      this.currentIndex = highestCachedIndex;
      this.currentReplayState = cloneReplayState(this.storedReplayState[this.currentIndex]);
    }

    // Check if we need to move forward in time
    while (this.currentIndex + 1 < this.frames.length) {
      const nextFrame = this.frames[this.currentIndex + 1];
      if (time < nextFrame.time) {
        break;
      }

      this.evaluator.evaluateNextFrameMutated(this.currentReplayState, nextFrame);
      this.currentIndex += 1;

      // Caching the state at a multiple of bucketSize
      if (this.currentIndex % this.bucketSize === 0) {
        this.storedReplayState[this.currentIndex] = cloneReplayState(this.currentReplayState);
      }
    }
    return this.currentReplayState;
  }
}
