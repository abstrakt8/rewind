import { ReplayService } from "../common/local/ReplayService";
import { GameplayClock } from "../common/game/GameplayClock";
import { BeatmapManager } from "../manager/BeatmapManager";
import { GameSimulator } from "../common/game/GameSimulator";
import { injectable } from "inversify";
import { PixiRendererManager } from "../renderers/PixiRendererManager";
import { AnalysisSceneManager } from "../manager/AnalysisSceneManager";
import { GameLoop } from "../common/game/GameLoop";
import { ScenarioManager } from "../manager/ScenarioManager";
import { ReplayWatcher } from "../common/local/ReplayWatcher";
import { OsuFolderService } from "../common/local/OsuFolderService";
import { ClipRecorder } from "../manager/ClipRecorder";
import { ModSettingsService } from "./mod-settings";
import { ScreenshotTaker } from "./screenshot";

@injectable()
export class AnalysisApp {
  constructor(
    public readonly gameClock: GameplayClock,
    public readonly gameSimulator: GameSimulator,
    public readonly scenarioManager: ScenarioManager,
    public readonly modSettingsService: ModSettingsService,
    public readonly replayWatcher: ReplayWatcher,
    public readonly screenshotTaker: ScreenshotTaker,
    public readonly clipRecorder: ClipRecorder,
    public readonly osuFolderService: OsuFolderService,
    private readonly replayService: ReplayService,
    private readonly gameLoop: GameLoop,
    private readonly beatmapManager: BeatmapManager,
    private readonly sceneManager: AnalysisSceneManager,
    private readonly pixiRenderer: PixiRendererManager,
  ) {}

  stats() {
    return this.gameLoop.stats();
  }

  initialize() {
    console.log("AnalysisApp: Initialize");
    this.replayWatcher.startWatching();
    this.scenarioManager.initialize();
  }

  close() {}

  onEnter(canvas: HTMLCanvasElement) {
    this.pixiRenderer.initializeRenderer(canvas);
    // this.gameLoop.startTicker();
  }

  onHide() {
    this.gameClock.pause();
    this.pixiRenderer.destroy();
    // this.gameLoop.stopTicker();
  }

  /**
   * Loads the replay and the corresponding beatmap and makes the application ready to visualize the replay.
   *
   * Note: This procedure can be optimized in the future, but for now it's ok.
   *
   * @param replayId the id of the replay to load
   */
  async loadReplay(replayId: string) {
    return this.scenarioManager.loadReplay(replayId);
  }
}
