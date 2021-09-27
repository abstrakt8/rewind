import { Container } from "inversify";
import { BlueprintService } from "./core/api/BlueprintService";
import { ReplayService } from "./core/api/ReplayService";
import { SkinLoader } from "./core/api/SkinLoader";
import { AudioService } from "./core/audio/AudioService";
import { TYPES } from "./types/types";
import { createRewindAnalysisApp } from "./creators/createRewindAnalysisApp";
import { SkinId } from "./model/SkinId";
import { SkinManager } from "./core/skins/SkinManager";
import { AudioSettingsService } from "./settings/AudioSettingsService";
import { STAGE_TYPES } from "./types/STAGE_TYPES";

/**
 * Creates the Rewind app that serves multiple tools.
 *
 * Common settings such as preferred skin are set here.
 */

export class RewindTheater {
  private readonly container: Container;

  constructor(private apiUrl: string) {
    this.container = new Container({ defaultScope: "Singleton" });
    this.container.bind(TYPES.API_URL).toConstantValue(apiUrl);
    this.container.bind(STAGE_TYPES.AUDIO_CONTEXT).toConstantValue(new AudioContext());
    this.container.bind(BlueprintService).toSelf();
    this.container.bind(ReplayService).toSelf();
    this.container.bind(SkinLoader).toSelf();
    this.container.bind(SkinManager).toSelf();
    this.container.bind(AudioService).toSelf();
    this.container.bind(AudioSettingsService).toSelf();
  }

  createAnalysisApp() {
    return createRewindAnalysisApp(this.container);
  }

  // @PostConstruct
  initialize() {
    // TODO: Load default skin
    // TODO: Load preferred skin
    // Load other textures
  }

  async loadPreferredSkin() {
    // From
  }

  get audioSettingsService() {
    return this.container.get(AudioSettingsService);
  }

  async changeSkin(skinId: SkinId) {
    const skinLoader = this.container.get(SkinLoader);
    const skin = await skinLoader.loadSkin(skinId);

    const skinManager = this.container.get(SkinManager);
    skinManager.setSkin(skin);
  }
}

interface Settings {
  apiUrl: string;
}

export function createRewindTheater({ apiUrl }: Settings) {
  return new RewindTheater(apiUrl);
}
