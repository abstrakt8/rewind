import { Scene } from "../game/Scene";
import { GameClock } from "../clocks/GameClock";
import {
  Beatmap,
  BucketedReplayStateTimeMachine,
  buildBeatmap,
  GameplayInfoEvaluator,
  NoteLockStyle,
  OsuClassicMods,
  ReplayAnalysisEvent,
  ReplayStateTimeMachine,
} from "@rewind/osu/core";
import { OsuReplay } from "../managers/ReplayManager";
import { hitWindowsForOD } from "@rewind/osu/math";
import { Skin } from "../skins/Skin";
import { ViewSettings } from "../game/ViewSettings";
import { ReplayService } from "./ReplayService";
import { BlueprintService } from "./BlueprintService";
import { PerformanceGameClock } from "../clocks/PerformanceGameClock";
import { PreferencesStore } from "./PreferencesStore";
import { SkinService } from "./SkinService";

// A scene defines what should be drawn on the screen.
// The scene manager is almost equivalent to the store in Redux and PixiJS is just the underlying rendering platform.
export class Scenario {
  public gameplayTimeMachine?: ReplayStateTimeMachine;

  constructor(
    public readonly gameClock: GameClock,
    public readonly beatmap: Beatmap,
    public skin: Skin,
    public view: ViewSettings,
    public readonly replay?: OsuReplay,
  ) {
    if (replay) {
      this.gameplayTimeMachine = new BucketedReplayStateTimeMachine(replay.frames, beatmap, {
        hitWindows: hitWindowsForOD(beatmap.difficulty.overallDifficulty),
        noteLockStyle: NoteLockStyle.STABLE,
      });
    }
  }

  // TODO:

  getCurrentScene(): Scene {
    const { skin, beatmap, replay, view } = this;
    const time = this.gameClock.getCurrentTime();
    const gameplayState = this.gameplayTimeMachine?.replayStateAt(time);
    const gameplayInfo = gameplayState
      ? new GameplayInfoEvaluator(this.beatmap, {}).evaluateReplayState(gameplayState)
      : undefined;

    return {
      time,
      gameplayState,
      beatmap,
      replay,
      gameplayInfo,
      skin,
      view,
    };
  }
}

export class ScenarioService {
  constructor(
    private readonly blueprintService: BlueprintService,
    private readonly replayService: ReplayService,
    private readonly skinService: SkinService,
    private readonly preferencesStore: PreferencesStore,
  ) {}

  async loadScenario(blueprintId: string, replayId?: string) {
    // An error will be thrown, if one of them fails to be loaded
    const [blueprint, replay, skin] = await Promise.all([
      this.blueprintService.loadBlueprint(blueprintId),
      replayId ? this.replayService.loadReplay(replayId) : undefined,
      this.skinService.loadSkin(this.preferencesStore.skinId),
    ]);

    const gameClock = new PerformanceGameClock();
    const view = this.preferencesStore.preferredViewSettings();

    const mods: OsuClassicMods[] = [];
    // TODO: Depending on replayMods
    const modHidden = false;
    const playbackSpeed = 1.0;

    view.modHidden = modHidden;
    gameClock.setSpeed(playbackSpeed);

    const beatmap = buildBeatmap(blueprint, { addStacking: true, mods });

    // if (replay) {
    //   // This implicitly also calculates all states for each bucket
    //   // Don't know if this is expensive and should be calculated with a web worker
    //   const finalState = gameStateTimeMachine.replayStateAt(1e9);
    //   const replayEvents = retrieveEvents(finalState, beatmap.hitObjects);
    // }
    // console.log("Loaded blue print", blueprintId, replayId);

    return new Scenario(gameClock, beatmap, skin, view, replay);
  }
}
