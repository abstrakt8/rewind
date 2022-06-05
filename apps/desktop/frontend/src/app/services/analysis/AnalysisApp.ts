import { ReplayService } from "../common/api/ReplayService";
import { GameplayClock } from "../common/game/GameplayClock";
import { ModSettingsManager } from "../manager/ModSettingsManager";
import { BeatmapManager } from "../manager/BeatmapManager";
import { GameSimulator } from "../common/game/GameSimulator";
import { injectable } from "inversify";
import { PixiRendererManager } from "../renderers/PixiRendererManager";
import { AnalysisSceneManager } from "../manager/AnalysisSceneManager";
import { GameLoop } from "../common/game/GameLoop";
import { ScenarioManager } from "../manager/ScenarioManager";
import { ReplayWatcher } from "../common/api/ReplayWatcher";
import { ScreenshotTaker } from "../manager/ScreenshotTaker";
import { ClipRecorder } from "../manager/ClipRecorder";
import { OsuFolderService } from "../common/api/OsuFolderService";

@injectable()
export class AnalysisApp {
  constructor(
    public readonly gameClock: GameplayClock,
    public readonly gameSimulator: GameSimulator,
    public readonly scenarioManager: ScenarioManager,
    public readonly modSettingsManager: ModSettingsManager,
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
    // Do not @postConstruct or the startWatching happens twice ... (???)
    this.replayWatcher.startWatching();
    this.scenarioManager.initialize();
  }

  onEnter(canvas: HTMLCanvasElement) {
    this.pixiRenderer.initializeRenderer(canvas);
    // this.gameLoop.startTicker();
  }

  onHide() {
    this.gameClock.pause();
    this.pixiRenderer.destroy();
    // this.gameLoop.stopTicker();
  }

  // If no replay is loaded, then an empty "perfect" replay is used as simulation

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
