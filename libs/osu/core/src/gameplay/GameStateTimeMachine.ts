import { cloneGameState, defaultGameState, GameState } from "./GameState";
import { ReplayFrame } from "../replays/Replay";
import { Vec2 } from "@osujs/math";
import { Beatmap } from "../beatmap/Beatmap";
import { GameStateEvaluator, GameStateEvaluatorOptions } from "./GameStateEvaluator";

export interface GameStateTimeMachine {
  gameStateAt(time: number): GameState;
}

/**
 * By default O(R sqrt n) memory and O(sqrt n) time, where R is the size of a replay state.
 * Stores replays at the indices [0, sqrt n, 2 *sqrt n, ..., sqrt n * sqrt n] and the others are inferred.
 *
 * TODO: We could do caching like described in method 4 of
 * https://gamedev.stackexchange.com/questions/6080/how-to-design-a-replay-system/8372#8372 TODO: Should we
 * Object.freeze(...) the cached ones in order to prevent accidental mutations?
 */
export class BucketedGameStateTimeMachine implements GameStateTimeMachine {
  // 0 stands for initial state
  // and i means that i frames have been processed

  currentIndex = 0;
  currentGameState: GameState;
  storedGameState: GameState[] = [];
  bucketSize: number;
  frames: ReplayFrame[];
  evaluator: GameStateEvaluator;

  constructor(
    initialKnownFrames: ReplayFrame[],
    private readonly beatmap: Beatmap,
    // private readonly hitObjects: OsuHitObject[],
    private readonly settings: GameStateEvaluatorOptions,
    bucketSize?: number,
  ) {
    // Add a dummy replay frame at the beginning.
    this.frames = [{ time: -727_727, position: new Vec2(0, 0), actions: [] }, ...initialKnownFrames];
    this.bucketSize = bucketSize ?? Math.ceil(Math.sqrt(this.frames.length));
    this.storedGameState[0] = defaultGameState();
    this.currentGameState = cloneGameState(this.storedGameState[0]);
    this.evaluator = new GameStateEvaluator(beatmap, settings);
  }

  private getHighestCachedIndex(time: number): number {
    for (let i = 0; i < this.frames.length; i += this.bucketSize) {
      // The second condition should not happen in our version of implementation where we travel forward.
      if (time < this.frames[i].time || !this.storedGameState[i]) {
        return i - this.bucketSize;
      }
    }
    return 0;
  }

  gameStateAt(time: number): GameState {
    const highestCachedIndex = this.getHighestCachedIndex(time);

    // TODO: Just check if we had normal forward behavior or not, this can drastically improve performance
    // If not, we need to reset something such as the derived data.

    // Either we have to travel back anyways or there is a future index available for that time.
    if (this.currentIndex < highestCachedIndex || time < this.frames[this.currentIndex].time) {
      this.currentIndex = highestCachedIndex;
      this.currentGameState = cloneGameState(this.storedGameState[this.currentIndex]);
    }

    // Check if we need to move forward in time
    while (this.currentIndex + 1 < this.frames.length) {
      const nextFrame = this.frames[this.currentIndex + 1];
      if (time < nextFrame.time) {
        break;
      }

      this.evaluator.evaluate(this.currentGameState, nextFrame);
      this.currentIndex += 1;

      // Caching the state at a multiple of bucketSize
      if (this.currentIndex % this.bucketSize === 0) {
        this.storedGameState[this.currentIndex] = cloneGameState(this.currentGameState);
      }
    }
    return this.currentGameState;
  }
}
