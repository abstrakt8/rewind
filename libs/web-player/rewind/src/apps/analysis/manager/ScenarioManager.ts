import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";
import { buildBeatmap, determineDefaultPlaybackSpeed } from "@rewind/osu/core";
import { GameSimulator } from "../../../core/game/GameSimulator";
import { ModSettingsManager } from "./ModSettingsManager";
import { AudioService } from "../../../core/audio/AudioService";
import { BlueprintService } from "../../../core/api/BlueprintService";
import { ReplayService } from "../../../core/api/ReplayService";
import { BeatmapManager } from "./BeatmapManager";
import { ReplayManager } from "./ReplayManager";
import { AnalysisSceneManager } from "./AnalysisSceneManager";
import { AudioEngine } from "../../../core/audio/AudioEngine";
import { GameplayClock } from "../../../core/game/GameplayClock";

interface Scenario {
  status: "LOADING" | "ERROR" | "DONE" | "INIT";
}

@injectable()
export class ScenarioManager {
  public scenario$: BehaviorSubject<Scenario>;

  constructor(
    private readonly gameClock: GameplayClock,
    private readonly gameSimulator: GameSimulator,
    private readonly modSettingsManager: ModSettingsManager,
    private readonly audioService: AudioService,
    private readonly blueprintService: BlueprintService,
    private readonly replayService: ReplayService,
    private readonly beatmapManager: BeatmapManager,
    private readonly replayManager: ReplayManager,
    private readonly sceneManager: AnalysisSceneManager,
    private readonly audioEngine: AudioEngine,
  ) {
    this.scenario$ = new BehaviorSubject<Scenario>({ status: "INIT" });
  }

  async loadReplay(replayId: string) {
    this.scenario$.next({ status: "LOADING" });

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
