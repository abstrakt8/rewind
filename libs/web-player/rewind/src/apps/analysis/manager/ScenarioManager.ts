import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";
import { Beatmap, buildBeatmap, modsToBitmask, parseBlueprint } from "@rewind/osu/core";
import { GameSimulator } from "../../../core/game/GameSimulator";
import { ModSettingsManager } from "./ModSettingsManager";
import { AudioService } from "../../../core/audio/AudioService";
import { BlueprintService } from "../../../core/api/BlueprintService";
import { ReplayService } from "../../../core/api/ReplayService";
import { BeatmapManager } from "./BeatmapManager";
import { ReplayManager } from "./ReplayManager";
import { AnalysisSceneKeys, AnalysisSceneManager } from "./AnalysisSceneManager";
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

  // This is a temporary solution to
  async clearReplay() {
    this.gameClock.clear();
    this.replayManager.setMainReplay(null);
    this.audioEngine.destroy();
    this.beatmapManager.setBeatmap(Beatmap.EMPTY_BEATMAP);
    this.gameSimulator.clear();
    await this.sceneManager.changeToScene(AnalysisSceneKeys.IDLE);
    this.scenario$.next({ status: "INIT" });
  }

  async loadReplay(replayId: string) {
    // TODO: Clean this up
    this.audioEngine.destroy();

    this.scenario$.next({ status: "LOADING" });

    const replay = await this.replayService.retrieveReplay(replayId);
    const blueprintId = replay.beatmapMd5;
    const rawBlueprint = await this.blueprintService.retrieveRawBlueprint(blueprintId);
    const blueprint = parseBlueprint(rawBlueprint);

    await this.blueprintService.retrieveBlueprintResources(blueprintId);

    this.audioEngine.setSong(await this.audioService.loadAudio(blueprintId));
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
