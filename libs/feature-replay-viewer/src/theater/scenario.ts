import { Scene } from "../game/Scene";
import { GameClock } from "../clocks/GameClock";
import {
  Beatmap,
  BucketedGameStateTimeMachine,
  GameplayInfoEvaluator,
  GameStateTimeMachine,
  HitObjectJudgement,
  isHitObjectJudgement,
  ReplayAnalysisEvent,
  retrieveEvents,
} from "@rewind/osu/core";
import { Skin } from "../skins/Skin";
import { ViewSettings } from "../game/ViewSettings";
import { OsuReplay } from "../replays/slice";
import { Texture } from "pixi.js";

export class Scenario {
  public gameplayTimeMachine?: GameStateTimeMachine;
  public replayEvents: ReplayAnalysisEvent[];
  private judgements: HitObjectJudgement[];
  private gameplayEvaluator: GameplayInfoEvaluator;

  constructor(
    private gameClock: GameClock,
    public readonly beatmap: Beatmap,
    public readonly background: Texture,
    public view: ViewSettings, // -> get from store
    public readonly replay?: OsuReplay,
  ) {
    if (replay) {
      this.gameplayTimeMachine = new BucketedGameStateTimeMachine(replay.frames, beatmap, {
        hitWindowStyle: "OSU_STABLE",
        noteLockStyle: "STABLE",
      });
      const finalState = this.gameplayTimeMachine.gameStateAt(1e9);
      // TODO: Somewhere else ...
      this.replayEvents = retrieveEvents(finalState, beatmap.hitObjects);
      this.judgements = this.replayEvents.filter(isHitObjectJudgement);
    } else {
      this.replayEvents = [];
      this.judgements = [];
    }
    this.gameplayEvaluator = new GameplayInfoEvaluator(beatmap, {});
  }

  getCurrentScene(): Scene {
    const { beatmap, replay, judgements, background, view } = this;
    const time = this.gameClock.getCurrentTime();
    const gameplayState = this.gameplayTimeMachine?.gameStateAt(time);
    const gameplayInfo = gameplayState ? this.gameplayEvaluator.evaluateReplayState(gameplayState) : undefined;
    // TODO: GEt skin from service from skinId
    return {
      time,
      view,
      gameplayState,
      beatmap,
      replay,
      gameplayInfo,
      skin: Skin.EMPTY,
      judgements,
      backgroundUrl: "",
    };
  }
}
