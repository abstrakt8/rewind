import { BlueprintService } from "../../core/api/BlueprintService";
import { ReplayService } from "../../core/api/ReplayService";
import { GameplayClock } from "../../core/game/GameplayClock";
import { ModSettingsManager } from "./manager/ModSettingsManager";
import { BeatmapManager } from "./manager/BeatmapManager";
import { GameSimulator } from "../../core/game/GameSimulator";
import { injectable } from "inversify";
import { PixiRendererManager } from "../../renderers/PixiRendererManager";
import { AnalysisSceneManager } from "./manager/AnalysisSceneManager";
import { GameLoop } from "../../core/game/GameLoop";
import { ScenarioManager } from "./manager/ScenarioManager";
import { ReplayWatcher } from "../../core/api/ReplayWatcher";
import { ScreenshotTaker } from "./manager/ScreenshotTaker";
import { ClipRecorder } from "./manager/ClipRecorder";

/**
 * Usage:
 *
 * ```js
 * const app = createAnalysisApp({ apiUrl: "http://localhost:7271" });
 * // Tell the app which canvas to use to render
 * app.initializeRenderer(document.getElementById("canvas"));
 * app.loadReplay("exported:chocomint - xi - Blue Zenith [FOUR DIMENSIONS] (2017-04-13) Osu.osr");
 * ```
 *
 * Using the controls we can start/pause the replay:
 *
 * <button onclick="app.start()"/>
 *
 * ```
 *
 * This is a facade that does not contain all the functions, so you have to directly call the underlying objects
 * to make changes happen in case implementation is missing.
 */
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
    private readonly blueprintService: BlueprintService,
    private readonly replayService: ReplayService,
    private readonly gameLoop: GameLoop,
    private readonly beatmapManager: BeatmapManager,
    private readonly sceneManager: AnalysisSceneManager,
    private readonly pixiRenderer: PixiRendererManager,
  ) {}

  stats() {
    return this.gameLoop.stats();
  }

  startWatching() {
    console.log("AnalysisApp: Initialize");
    // Do not @postConstruct or the startWatching happens twice ... (???)
    this.replayWatcher.startWatching();
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
