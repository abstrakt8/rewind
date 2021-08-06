import { makeAutoObservable } from "mobx";
import { Scenario } from "./ScenarioService";
import { ReplayAnalysisEvent } from "@rewind/osu/core";
import { defaultViewSettings, ViewSettings } from "../game/ViewSettings";

export class ScenarioUI {
  view: ViewSettings;

  constructor() {
    makeAutoObservable(this);
    this.view = defaultViewSettings();
  }

  applyScenario(scenario: Scenario) {
    const { gameplayTimeMachine } = scenario;
    if (scenario) {
    }
    // this.replayAnalysisEvents = scenario.gameplayTimeMachine?.replayStateAt(1e9)
  }
}
