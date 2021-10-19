import { Container, injectable } from "inversify";
import { BlueprintService } from "./core/api/BlueprintService";
import { ReplayService } from "./core/api/ReplayService";
import { SkinLoader } from "./core/api/SkinLoader";
import { AudioService } from "./core/audio/AudioService";
import { TYPES } from "./types/types";
import { createRewindAnalysisApp } from "./creators/createRewindAnalysisApp";
import { SkinHolder } from "./core/skins/SkinHolder";
import { AudioSettingsStore } from "./services/AudioSettingsStore";
import { STAGE_TYPES } from "./types/STAGE_TYPES";
import { BeatmapBackgroundSettingsStore } from "./services/BeatmapBackgroundSettingsStore";
import { PlayfieldBorderSettingsStore } from "./services/PlayfieldBorderSettingsStore";
import { BeatmapRenderSettingsStore } from "./services/BeatmapRenderSettingsStore";
import { AnalysisCursorSettingsStore } from "./services/AnalysisCursorSettingsStore";
import { ReplayCursorSettingsStore } from "./services/ReplayCursorSettingsStore";
import { RewindLocalStorage } from "./services/RewindLocalStorage";
import { SkinManager } from "./services/SkinManager";
import { SkinSettingsStore } from "./services/SkinSettingsStore";
import { HitErrorBarSettingsStore } from "./services/HitErrorBarSettingsStore";
import { PlaybarSettingsStore } from "./services/PlaybarSettingsStore";

/**
 * Creates the Rewind app that serves multiple useful osu! tools.
 *
 * Common settings are set here so that they can be shared with other tools.
 *
 * Example: Preferred skin can be set at only one place and is shared among all tools.
 */
@injectable()
export class CommonManagers {
  constructor(
    public readonly skinManager: SkinManager,
    public readonly skinSettingsStore: SkinSettingsStore,
    public readonly audioSettingsService: AudioSettingsStore,
    public readonly beatmapBackgroundSettingsStore: BeatmapBackgroundSettingsStore,
    public readonly beatmapRenderSettingsStore: BeatmapRenderSettingsStore,
    public readonly hitErrorBarSettingsStore: HitErrorBarSettingsStore,
    public readonly analysisCursorSettingsStore: AnalysisCursorSettingsStore,
    public readonly replayCursorSettingsStore: ReplayCursorSettingsStore,
    public readonly playbarSettingsStore: PlaybarSettingsStore,
    private readonly rewindLocalStorage: RewindLocalStorage,
  ) {}

  // This should only be called after there is a connection to the backend.
  async initialize() {
    this.rewindLocalStorage.initialize();
    await this.skinManager.loadPreferredSkin();
  }
}

interface Settings {
  apiUrl: string;
}

export function createRewindTheater({ apiUrl }: Settings) {
  // Regarding `skipBaseClassChecks`: https://github.com/inversify/InversifyJS/issues/522#issuecomment-682246076
  const container = new Container({ defaultScope: "Singleton", skipBaseClassChecks: true });
  container.bind(TYPES.API_URL).toConstantValue(apiUrl);
  container.bind(TYPES.WS_URL).toConstantValue(apiUrl); // Might change in the future
  container.bind(STAGE_TYPES.AUDIO_CONTEXT).toConstantValue(new AudioContext());
  container.bind(BlueprintService).toSelf();
  container.bind(ReplayService).toSelf();
  container.bind(SkinLoader).toSelf();
  container.bind(SkinHolder).toSelf();
  container.bind(AudioService).toSelf();
  container.bind(SkinManager).toSelf();
  // General settings stores
  container.bind(AudioSettingsStore).toSelf();
  container.bind(AnalysisCursorSettingsStore).toSelf();
  container.bind(BeatmapBackgroundSettingsStore).toSelf();
  container.bind(BeatmapRenderSettingsStore).toSelf();
  container.bind(HitErrorBarSettingsStore).toSelf();
  container.bind(PlayfieldBorderSettingsStore).toSelf();
  container.bind(ReplayCursorSettingsStore).toSelf();
  container.bind(SkinSettingsStore).toSelf();
  container.bind(PlaybarSettingsStore).toSelf();

  container.bind(RewindLocalStorage).toSelf();

  // Theater facade
  container.bind(CommonManagers).toSelf();

  return {
    common: container.get(CommonManagers),
    analyzer: createRewindAnalysisApp(container),
  };
}

export type RewindTheater = ReturnType<typeof createRewindTheater>;
