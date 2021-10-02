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
import { AnalysisSceneManager } from "./manager/AnalysisSceneManager";
import { GameLoop } from "../../core/game/GameLoop";
import { AudioEngine } from "../../core/audio/AudioEngine";
import { AudioService } from "../../core/audio/AudioService";
import { AnalysisScene } from "./scenes/AnalysisScene";

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
    public readonly modSettingsManager: ModSettingsManager,
    private readonly audioService: AudioService,
    private readonly blueprintService: BlueprintService,
    private readonly replayService: ReplayService,
    private readonly gameLoop: GameLoop,
    private readonly beatmapManager: BeatmapManager,
    private readonly replayManager: ReplayManager,
    private readonly sceneManager: AnalysisSceneManager,
    private readonly pixiRenderer: PixiRendererManager,
    private readonly audioEngine: AudioEngine,
    private readonly analysisScene: AnalysisScene,
  ) {}

  stats() {
    return this.gameLoop.stats();
  }

  initialize() {
    this.gameLoop.initializeTicker();
    this.gameLoop.startTicker();
  }

  destroy() {
    this.gameLoop.stopTicker();
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

  takeScreenshot() {
    const renderer = this.pixiRenderer.getRenderer();
    if (!renderer) return;

    const canvas: HTMLCanvasElement = renderer.plugins.extract.canvas(this.analysisScene.stage);
    canvas.toBlob(
      (blob) => {
        const a = document.createElement("a");
        a.download = `Rewind Screenshot ${new Date().toISOString()}.jpg`;
        a.href = URL.createObjectURL(blob);
        a.click();
        a.remove();
      },
      "image/jpeg",
      0.9,
    );
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

    this.audioEngine.setSong(await this.audioService.loadAudio(blueprintId));
    this.audioEngine.song?.mediaElement.addEventListener("loadedmetadata", () => {
      this.gameClock.setDuration((this.audioEngine.song?.mediaElement.duration ?? 0) * 1000);
    });

    // If the building is too slow or unbearable, we should push the building to a WebWorker, but right now it's ok
    // even on long maps.
    const beatmap = buildBeatmap(blueprint, { addStacking: true, mods: replay.mods });

    const modHidden = replay.mods.includes("HIDDEN");
    const initialSpeed = determineDefaultPlaybackSpeed(replay.mods);

    this.modSettingsManager.setHidden(modHidden);
    // Not supported yet
    this.modSettingsManager.setFlashlight(false);

    this.gameClock.setSpeed(initialSpeed);
    this.gameClock.seekTo(0);
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
