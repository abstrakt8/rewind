import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";
import { Beatmap, buildBeatmap, modsToBitmask, parseBlueprint } from "@osujs/core";
import { GameSimulator } from "../common/game/GameSimulator";
import { ModSettingsManager } from "./ModSettingsManager";
import { AudioService } from "../common/audio/AudioService";
import { ReplayService } from "../common/api/ReplayService";
import { BeatmapManager } from "./BeatmapManager";
import { ReplayManager } from "./ReplayManager";
import { AnalysisSceneKeys, AnalysisSceneManager } from "./AnalysisSceneManager";
import { AudioEngine } from "../common/audio/AudioEngine";
import { GameplayClock } from "../common/game/GameplayClock";
import { GameLoop } from "../common/game/GameLoop";
import { PixiRendererManager } from "../renderers/PixiRendererManager";
import { join } from "path";
import { readFile } from "fs/promises";
import { BlueprintLocatorService } from "../common/api/BlueprintLocatorService";
import { OsuFolderService } from "../common/api/OsuFolderService";
import { BeatmapBackgroundSettingsStore } from "../common/beatmap-background";
import { TextureManager } from "../textures/TextureManager";
import { ReplayWatcher } from "../common/api/ReplayWatcher";

interface Scenario {
  status: "LOADING" | "ERROR" | "DONE" | "INIT";
}

function localFile(path: string) {
  return `file://${path}`;
}

@injectable()
export class ScenarioManager {
  public scenario$: BehaviorSubject<Scenario>;

  constructor(
    private readonly gameClock: GameplayClock,
    private readonly renderer: PixiRendererManager,
    private readonly gameLoop: GameLoop,
    private readonly gameSimulator: GameSimulator,
    private readonly modSettingsManager: ModSettingsManager,
    private readonly blueprintLocatorService: BlueprintLocatorService,
    private readonly osuFolderService: OsuFolderService,
    private readonly audioService: AudioService,
    private readonly textureManager: TextureManager,
    private readonly replayService: ReplayService,
    private readonly beatmapBackgroundSettingsStore: BeatmapBackgroundSettingsStore,
    private readonly beatmapManager: BeatmapManager,
    private readonly replayManager: ReplayManager,
    private readonly sceneManager: AnalysisSceneManager,
    private readonly replayWatcher: ReplayWatcher,
    private readonly audioEngine: AudioEngine,
  ) {
    this.scenario$ = new BehaviorSubject<Scenario>({ status: "INIT" });
  }

  public initialize() {
    this.replayWatcher.newReplays$.subscribe((replayId) => {
      void this.loadReplay(replayId);
    });
  }

  // This is a temporary solution to
  async clearReplay() {
    this.gameClock.clear();
    this.replayManager.setMainReplay(null);
    this.audioEngine.destroy();
    this.renderer.getRenderer()?.clear();
    this.beatmapManager.setBeatmap(Beatmap.EMPTY_BEATMAP);
    this.gameSimulator.clear();
    this.gameLoop.stopTicker();
    // await this.sceneManager.changeToScene(AnalysisSceneKeys.IDLE);
    this.scenario$.next({ status: "INIT" });
  }

  async loadReplay(replayId: string) {
    // TODO: Clean this up
    this.audioEngine.destroy();

    this.scenario$.next({ status: "LOADING" });

    const replay = await this.replayService.retrieveReplay(replayId);
    const blueprintInfo = await this.blueprintLocatorService.getBlueprintByMD5(replay.beatmapMd5);
    if (!blueprintInfo) throw Error(`Could not find the blueprint with MD5=${replay.beatmapMd5}`);

    const absoluteFolderPath = join(this.osuFolderService.songsFolder$.getValue(), blueprintInfo.folderName);

    const rawBlueprint = await readFile(join(absoluteFolderPath, blueprintInfo.osuFileName), "utf-8");
    const blueprint = parseBlueprint(rawBlueprint);

    const { metadata } = blueprint.blueprintInfo;

    // Load background
    this.beatmapBackgroundSettingsStore.texture$.next(
      await this.textureManager.loadTexture(localFile(join(absoluteFolderPath, metadata.backgroundFile))),
    );

    // Load audio
    this.audioEngine.setSong(
      await this.audioService.loadAudio(localFile(join(absoluteFolderPath, metadata.audioFile))),
    );
    this.audioEngine.song?.mediaElement.addEventListener("loadedmetadata", () => {
      const duration = (this.audioEngine.song?.mediaElement.duration ?? 0) * 1000;
      this.gameClock.setDuration(duration);
      this.gameSimulator.calculateDifficulties(rawBlueprint, duration, modsToBitmask(replay.mods));
    });

    // If the building is too slow or unbearable, we should push the building to a WebWorker, but right now it's ok
    // even on long maps.
    const beatmap = buildBeatmap(blueprint, { addStacking: true, mods: replay.mods });

    console.log(`Beatmap built with ${beatmap.hitObjects.length} hitobjects`);
    console.log(`Replay loaded with ${replay.frames.length} frames`);
    const modHidden = replay.mods.includes("HIDDEN");
    const initialSpeed = beatmap.gameClockRate;

    this.modSettingsManager.setHidden(modHidden);
    // Not supported yet
    this.modSettingsManager.setFlashlight(false);

    this.gameClock.pause();
    this.gameClock.setSpeed(initialSpeed);
    this.gameClock.seekTo(0);
    this.beatmapManager.setBeatmap(beatmap);
    this.replayManager.setMainReplay(replay);

    await this.gameSimulator.simulateReplay(beatmap, replay);
    await this.sceneManager.changeToScene(AnalysisSceneKeys.ANALYSIS);

    this.gameLoop.startTicker();
    this.scenario$.next({ status: "DONE" });
  }

  // This is just the NM view of a beatmap
  async loadBeatmap(blueprintId: string) {
    // Set speed to 1.0
    this.gameClock.setSpeed(1.0);
    this.gameClock.seekTo(0);
    this.modSettingsManager.setHidden(false);
    this.replayManager.setMainReplay(null);
  }

  async addSubReplay() {
    // Only possible if `mainReplay` is loaded
    // Adjust y-flip according to `mainReplay`
  }
}
