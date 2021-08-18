import {
  Beatmap,
  BucketedGameStateTimeMachine,
  defaultGameplayInfo,
  GameplayInfo,
  GameplayInfoEvaluator,
  GameState,
} from "@rewind/osu/core";
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { OsuReplay } from "../../theater";

@injectable()
export class GameSimulator {
  private gameplayTimeMachine: BucketedGameStateTimeMachine;
  private gameplayEvaluator: GameplayInfoEvaluator;
  private currentState: GameState;
  private currentInfo: GameplayInfo;

  constructor(
    @inject(TYPES.BEATMAP) private readonly beatmap: Beatmap,
    @inject(TYPES.REPLAY) private readonly replay: OsuReplay,
  ) {
    this.gameplayTimeMachine = new BucketedGameStateTimeMachine(replay.frames, beatmap, {
      hitWindowStyle: "OSU_STABLE",
      noteLockStyle: "STABLE",
    });
    this.gameplayEvaluator = new GameplayInfoEvaluator(beatmap, {});
    // TODO: Move this to async ...
    this.currentState = this.gameplayTimeMachine.gameStateAt(1e9);
    this.currentInfo = defaultGameplayInfo;
  }

  // Simulates the game to be at the given time
  // If a whole game simulation has happened, then this should be really fast
  simulate(gameTimeInMs: number) {
    this.currentState = this.gameplayTimeMachine.gameStateAt(gameTimeInMs);
    this.currentInfo = this.gameplayEvaluator.evaluateReplayState(this.currentState);
  }

  getCurrentState() {
    return this.currentState;
  }

  getCurrentInfo() {
    return this.currentInfo;
  }

  // Very likely to be a request from the UI since it wants to render the playbar events
  async calculateEvents() {
    // In case it takes unbearably long -> we might need a web worker
  }
}
