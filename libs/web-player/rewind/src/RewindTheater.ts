import { Container, injectable } from "inversify";
import { BlueprintService } from "./core/api/BlueprintService";
import { ReplayService } from "./core/api/ReplayService";
import { SkinLoader } from "./core/api/SkinLoader";
import { AudioService } from "./core/audio/AudioService";
import { TYPES } from "./types/types";
import { createRewindAnalysisApp } from "./creators/createRewindAnalysisApp";
import { SkinId } from "./model/SkinId";
import { SkinManager } from "./core/skins/SkinManager";
import { AudioSettingsStore } from "./services/AudioSettingsStore";
import { STAGE_TYPES } from "./types/STAGE_TYPES";
import { BeatmapBackgroundSettingsStore } from "./services/BeatmapBackgroundSettingsStore";
import { PlayfieldBorderSettingsStore } from "./services/PlayfieldBorderSettingsStore";
import { BeatmapRenderSettingsStore } from "./services/BeatmapRenderSettingsStore";
import { AnalysisCursorSettingsStore } from "./services/AnalysisCursorSettingsStore";
import { ReplayCursorSettingsStore } from "./services/ReplayCursorSettingsStore";

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
    public readonly audioSettingsService: AudioSettingsStore,
    public readonly beatmapBackgroundSettingsStore: BeatmapBackgroundSettingsStore,
    public readonly beatmapRenderSettingsStore: BeatmapRenderSettingsStore,
    public readonly analysisCursorSettingsStore: AnalysisCursorSettingsStore,
    public readonly replayCursorSettingsStore: ReplayCursorSettingsStore,
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
  // Regarding `skipBaseClassChecks`: https://github.com/inversify/InversifyJS/issues/522#issuecomment-682246076
  const container = new Container({ defaultScope: "Singleton", skipBaseClassChecks: true });
  container.bind(TYPES.API_URL).toConstantValue(apiUrl);
  container.bind(STAGE_TYPES.AUDIO_CONTEXT).toConstantValue(new AudioContext());
  container.bind(BlueprintService).toSelf();
  container.bind(ReplayService).toSelf();
  container.bind(SkinLoader).toSelf();
  container.bind(SkinManager).toSelf();
  container.bind(AudioService).toSelf();
  // General settings stores
  container.bind(AudioSettingsStore).toSelf();
  container.bind(AnalysisCursorSettingsStore).toSelf();
  container.bind(BeatmapBackgroundSettingsStore).toSelf();
  container.bind(BeatmapRenderSettingsStore).toSelf();
  container.bind(PlayfieldBorderSettingsStore).toSelf();
  container.bind(ReplayCursorSettingsStore).toSelf();

  // Theater facade
  container.bind(RewindTheater).toSelf();

  return {
    theater: container.get(RewindTheater),
    analyzer: createRewindAnalysisApp(container),
  };
}
