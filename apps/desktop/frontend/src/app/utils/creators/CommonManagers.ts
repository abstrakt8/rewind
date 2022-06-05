import { Container, injectable } from "inversify";
import { ReplayService } from "../../services/common/local/ReplayService";
import { SkinLoader } from "../../services/common/local/SkinLoader";
import { AudioService } from "../../services/common/audio/AudioService";
import { createRewindAnalysisApp } from "./createRewindAnalysisApp";
import { AudioSettingsStore } from "../../services/common/audio/AudioSettingsStore";
import { BeatmapBackgroundSettingsStore } from "../../services/common/beatmap-background";
import { PlayfieldBorderSettingsStore } from "../../services/common/playfield-border";
import { AnalysisCursorSettingsStore } from "../../services/analysis/analysis-cursor";
import { ReplayCursorSettingsStore } from "../../services/common/replay-cursor";
import { RewindLocalStorage } from "../../services/common/RewindLocalStorage";
import { SkinHolder, SkinManager, SkinSettingsStore } from "../../services/common/skin";
import { HitErrorBarSettingsStore } from "../../services/common/hit-error-bar";
import { PlaybarSettingsStore } from "../../services/common/playbar";
import { OsuFolderService } from "../../services/common/local/OsuFolderService";
import { OsuDBDao } from "../../services/common/local/OsuDBDao";
import { BlueprintLocatorService } from "../../services/common/local/BlueprintLocatorService";
import ElectronStore from "electron-store";
import { BeatmapRenderSettingsStore } from "../../services/common/beatmap-render";
import { STAGE_TYPES } from "../../services/types";

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
  // apiUrl: string;
  rewindSkinsFolder: string;
}

export function createRewindTheater({ rewindSkinsFolder }: Settings) {
  // Regarding `skipBaseClassChecks`: https://github.com/inversify/InversifyJS/issues/522#issuecomment-682246076
  const container = new Container({ defaultScope: "Singleton", skipBaseClassChecks: true });
  container.bind(STAGE_TYPES.ELECTRON_STORE).toConstantValue(new ElectronStore());
  container.bind(STAGE_TYPES.AUDIO_CONTEXT).toConstantValue(new AudioContext());
  container.bind(STAGE_TYPES.REWIND_SKINS_FOLDER).toConstantValue(rewindSkinsFolder);
  container.bind(OsuFolderService).toSelf();
  container.bind(OsuDBDao).toSelf();
  container.bind(BlueprintLocatorService).toSelf();
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
