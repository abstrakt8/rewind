import { BlueprintService } from "../../core/api/BlueprintService";
import { ReplayService } from "../../core/api/ReplayService";
import { buildBeatmap, determineDefaultPlaybackSpeed } from "@rewind/osu/core";
import { GameplayClock } from "../../core/game/GameplayClock";
import { ModSettingsManager } from "./manager/ModSettingsManager";
import { BeatmapManager } from "./manager/BeatmapManager";
import { ReplayManager } from "./manager/ReplayManager";
import { GameSimulator } from "../../core/game/GameSimulator";
import { injectable } from "inversify";
import { PixiRendererManager } from "../../renderers/PixiRendererManager";
import { SceneManager } from "../../core/scenes/SceneManager";
import { AnalysisSceneManager } from "./manager/AnalysisSceneManager";
import { GameLoop } from "../../core/game/GameLoop";

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
 */
@injectable()
export class AnalysisApp {
  constructor(
    private readonly blueprintService: BlueprintService,
    private readonly replayService: ReplayService,
    public readonly gameClock: GameplayClock,
    private readonly gameLoop: GameLoop,
    private readonly modSettingsManager: ModSettingsManager,
    private readonly beatmapManager: BeatmapManager,
    private readonly replayManager: ReplayManager,
    private readonly gameSimulator: GameSimulator,
    private readonly sceneManager: AnalysisSceneManager,
    private readonly pixiRenderer: PixiRendererManager,
  ) {}

  initialize() {
    this.gameLoop.initializeTicker();
    this.gameLoop.startTicker();
  }

  destroy() {
    this.gameLoop.startTicker();
    // console.log(`Going to destroy the stage with replay = ${replay.md5hash}`);
    // gameLoop.destroy();
    // audioEngine.destroy();
  }

  // This is just the NM view of a beatmap
  async loadBeatmap(blueprintId: string) {
    // Set speed to 1.0
    this.gameClock.setSpeed(1.0);
    this.gameClock.seekTo(0);
    this.modSettingsManager.setHidden(false);
    this.replayManager.setMainReplay(null);
  }

  initializeRenderer(canvas: HTMLCanvasElement) {
    this.pixiRenderer.initializeRenderer(canvas);
  }

  destroyRenderer() {
    this.pixiRenderer.destroy();
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
    const replay = await this.replayService.retrieveReplay(replayId);
    const blueprintId = replay.beatmapMd5;
    const blueprint = await this.blueprintService.retrieveBlueprint(blueprintId);

    await this.blueprintService.retrieveBlueprintResources(blueprintId);

    // If the building is too slow or unbearable, we should push the building to a WebWorker, but right now it's ok
    // even on long maps.
    const beatmap = buildBeatmap(blueprint, { addStacking: true, mods: replay.mods });

    const modHidden = replay.mods.includes("HIDDEN");
    const initialSpeed = determineDefaultPlaybackSpeed(replay.mods);

    this.modSettingsManager.setHidden(modHidden);
    this.gameClock.setSpeed(initialSpeed);
    this.gameClock.seekTo(0);
    // TODO: Set duration
    this.beatmapManager.setBeatmap(beatmap);
    this.replayManager.setMainReplay(replay);

    // After this is done -> Get ready for
    await this.gameSimulator.simulateReplay(beatmap, replay);
    await this.sceneManager.startAnalysisScene();
  }

  async addSubReplay() {
    // Only possible if `mainReplay` is loaded
    // Adjust y-flip according to `mainReplay`
  }
}
