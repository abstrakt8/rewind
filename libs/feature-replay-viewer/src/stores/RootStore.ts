import { BlueprintService } from "./BlueprintService";
import { PreferencesService } from "./PreferencesService";
import { ReplayService } from "./ReplayService";
import { ScenarioService } from "./ScenarioService";
import { SkinService } from "./SkinService";
import { AudioService } from "./AudioService";

// TODO: TBH Something like InversifyJS would be better
export class RootStore {
  public replayService: ReplayService;
  public skinService: SkinService;
  public blueprintService: BlueprintService;
  public preferencesService: PreferencesService;

  public scenarioService: ScenarioService;
  private audioService: AudioService;

  constructor(options: { url: string }) {
    const { url } = options;
    this.replayService = new ReplayService(url);
    this.skinService = new SkinService(url);
    this.blueprintService = new BlueprintService(url);
    this.preferencesService = new PreferencesService();
    this.audioService = new AudioService();
    this.scenarioService = new ScenarioService(
      this.blueprintService,
      this.replayService,
      this.skinService,
      this.preferencesService,
      this.audioService,
    );
  }
}
