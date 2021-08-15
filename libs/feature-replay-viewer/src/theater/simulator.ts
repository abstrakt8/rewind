import { Beatmap, BucketedGameStateTimeMachine, GameStateTimeMachine } from "@rewind/osu/core";
import { OsuReplay } from "../replays/slice";

export class GameplaySimulator {
  public gameplayTimeMachine?: GameStateTimeMachine;

  constructor(public beatmap: Beatmap, public replay?: OsuReplay) {
    if (replay) {
      this.gameplayTimeMachine = new BucketedGameStateTimeMachine(replay.frames, beatmap, {
        hitWindowStyle: "OSU_STABLE",
        noteLockStyle: "STABLE",
      });
    }
  }
}
