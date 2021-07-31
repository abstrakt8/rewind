import { BlueprintStore } from "./BlueprintStore";
import { RenderSettings } from "./RenderSettings";
import { ReplayStore } from "./ReplayStore";
import { Scenario } from "./Scenario";
import { SkinStore } from "./SkinStore";
import { PerformanceGameClock } from "../clocks/PerformanceGameClock";

export class RootStore {
  public readonly renderSettings: RenderSettings;
  public readonly skinStore: SkinStore;
  public readonly blueprintStore: BlueprintStore;
  public readonly replayStore: ReplayStore;
  public readonly scenario: Scenario;
  public readonly gameClock: PerformanceGameClock;

  constructor() {
    this.skinStore = new SkinStore();
    this.renderSettings = new RenderSettings(this.skinStore);
    this.blueprintStore = new BlueprintStore();
    this.replayStore = new ReplayStore();
    this.gameClock = new PerformanceGameClock();
    this.scenario = new Scenario(this.blueprintStore, this.replayStore, this.renderSettings, this.gameClock);
  }
}
