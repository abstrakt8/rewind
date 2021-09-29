import { Container, injectable } from "inversify";
import { BlueprintService } from "./core/api/BlueprintService";
import { ReplayService } from "./core/api/ReplayService";
import { SkinLoader } from "./core/api/SkinLoader";
import { AudioService } from "./core/audio/AudioService";
import { TYPES } from "./types/types";
import { createRewindAnalysisApp } from "./creators/createRewindAnalysisApp";
import { SkinId } from "./model/SkinId";
import { SkinManager } from "./core/skins/SkinManager";
import { AudioSettingsService } from "./services/AudioSettingsService";
import { STAGE_TYPES } from "./types/STAGE_TYPES";
import { BeatmapBackgroundSettingsStore } from "./services/BeatmapBackgroundSettingsStore";
import { PlayfieldBorderSettingsStore } from "./services/PlayfieldBorderSettingsStore";

/**
 * Creates the Rewind app that serves multiple useful osu! tools.
 *
 * Common settings are set here so that they can be shared with other tools.
 *
 * Example: Preferred skin can be set at only one place and is shared among all tools.
 */
@injectable()
export class RewindTheater {
  constructor(
    private readonly skinLoader: SkinLoader,
    private readonly skinManager: SkinManager,
    public readonly audioSettingsService: AudioSettingsService,
  ) {}

  // @PostConstruct
  initialize() {
    // TODO: Load default skin
    // TODO: Load preferred skin
    // Load other textures
  }

  // TODO: Expose the settings services (maybe as facades)

  async changeSkin(skinId: SkinId) {
    const skin = await this.skinLoader.loadSkin(skinId);
    this.skinManager.setSkin(skin);
  }
}

interface Settings {
  apiUrl: string;
}

export function createRewindTheater({ apiUrl }: Settings) {
  const container = new Container({ defaultScope: "Singleton" });
  container.bind(TYPES.API_URL).toConstantValue(apiUrl);
  container.bind(STAGE_TYPES.AUDIO_CONTEXT).toConstantValue(new AudioContext());
  container.bind(BlueprintService).toSelf();
  container.bind(ReplayService).toSelf();
  container.bind(SkinLoader).toSelf();
  container.bind(SkinManager).toSelf();
  container.bind(AudioService).toSelf();
  // General settings stores
  container.bind(AudioSettingsService).toSelf();
  container.bind(BeatmapBackgroundSettingsStore).toSelf();
  container.bind(PlayfieldBorderSettingsStore).toSelf();

  // Theater facade
  container.bind(RewindTheater).toSelf();

  return {
    theater: container.get(RewindTheater),
    analyzer: createRewindAnalysisApp(container),
  };
}
