import { action, makeAutoObservable, makeObservable, observable, runInAction } from "mobx";
import { ReplayStore } from "./ReplayStore";
import { BlueprintStore } from "./BlueprintStore";
import {
  BeatmapBuilder,
  Blueprint,
  BucketedReplayStateTimeMachine,
  NoteLockStyle,
  ReplayStateTimeMachine,
  StaticBeatmap,
} from "@rewind/osu/core";
import { hitWindowsForOD } from "@rewind/osu/math";
import { OsuReplay } from "../managers/ReplayManager";
import { RenderSettings } from "./RenderSettings";
import { GameClock } from "../clocks/GameClock";

/**
 * The scenario determines the input of what should be rendered on the stage.
 */
export class Scenario {
  state: string;
  // showFlashlight: boolean; soon^TM

  blueprint?: Blueprint;
  replay?: OsuReplay;
  beatmap?: StaticBeatmap;
  replayStateTimeMachine?: ReplayStateTimeMachine;

  constructor(
    private readonly blueprintStore: BlueprintStore,
    private readonly replayStore: ReplayStore,
    private readonly renderSettings: RenderSettings,
    private readonly gameClock: GameClock,
  ) {
    // makeAutoObservable(this);
    makeObservable(this, {
      loadScenario: action,
      state: observable,
      replay: observable,
      blueprint: observable,
      beatmap: observable,
      // replayStateTimeMachine intentionally not observable (too many calls)
    });

    this.state = "NONE_LOADED";
  }

  async loadScenario(blueprintId: string, replayId?: string) {
    this.state = "PENDING";
    [this.blueprint, this.replay] = await Promise.all([
      this.blueprintStore.loadBlueprint(blueprintId),
      replayId ? this.replayStore.loadReplay(replayId) : undefined,
    ]);

    runInAction(() => {
      if (!this.blueprint) {
        console.error("Blueprint not loaded properly.");
        this.state = "ERROR";
        return;
      }
      this.state = "LOADED";
      // TODO: depending on replay
      const mods: any[] = [];
      // TODO: Depending on replay we gonna turn on / off by default
      const modHidden = false;
      this.renderSettings.viewSettings.modHidden = modHidden;

      this.gameClock.seekTo(0);
      this.gameClock.pause();

      this.beatmap = new BeatmapBuilder().buildBeatmap(this.blueprint, mods);
      if (this.replay) {
        console.log("Replay frames number: " + this.replay.frames.length);
        this.replayStateTimeMachine = new BucketedReplayStateTimeMachine(
          this.replay.frames,
          this.beatmap.hitObjects,
          {
            hitWindows: hitWindowsForOD(this.beatmap.difficulty.overallDifficulty),
            noteLockStyle: NoteLockStyle.STABLE,
          },
          1000,
        );
      }
      console.log("Loaded blue print", blueprintId, replayId);
    });
  }
}
