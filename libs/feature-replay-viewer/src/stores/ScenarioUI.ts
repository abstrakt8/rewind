import { makeAutoObservable } from "mobx";
import { Scenario } from "./ScenarioService";
import { ReplayAnalysisEvent } from "@rewind/osu/core";

export class ScenarioUI {
  currentTime = 0;
  maxTime = 100;
  isPlaying = false;
  playbackSpeed = 1.0;
  replayAnalysisEvents: ReplayAnalysisEvent[];

  constructor() {
    makeAutoObservable(this);
    this.replayAnalysisEvents = [];
  }

  setPlaybackSpeed(playbackSpeed: number) {
    this.playbackSpeed = playbackSpeed;
  }

  setIsPlaying(playing: boolean) {
    this.isPlaying = true;
  }

  applyScenario(scenario: Scenario) {
    const { gameplayTimeMachine } = scenario;
    if (scenario) {
    }

    // TODO: Also clear
    setInterval(() => {
      this.currentTime = scenario.gameClock.getCurrentTime();
    }, 128);

    // this.replayAnalysisEvents = scenario.gameplayTimeMachine?.replayStateAt(1e9)
  }
}
