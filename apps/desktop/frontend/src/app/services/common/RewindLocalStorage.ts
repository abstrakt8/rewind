import { injectable } from "inversify";
import { DEFAULT_SKIN_SETTINGS, SkinSettingsSchema, SkinSettingsStore } from "./skin";
import { LocalStorageHelper } from "./LocalStorageService";
import { AudioSettingsSchema, AudioSettingsStore, DEFAULT_AUDIO_SETTINGS } from "./audio/AudioSettingsStore";
import {
  AnalysisCursorSettingsSchema,
  AnalysisCursorSettingsStore,
  DEFAULT_ANALYSIS_CURSOR_SETTINGS,
} from "../analysis/analysis-cursor";
import {
  BeatmapBackgroundSettingsSchema,
  BeatmapBackgroundSettingsStore,
  DEFAULT_BEATMAP_BACKGROUND_SETTINGS,
} from "./beatmap-background";
import { DEFAULT_REPLAY_CURSOR_SETTINGS, ReplayCursorSettingsSchema, ReplayCursorSettingsStore } from "./replay-cursor";
import { DEFAULT_HIT_ERROR_BAR_SETTINGS, HitErrorBarSettingsSchema, HitErrorBarSettingsStore } from "./hit-error-bar";
import { DEFAULT_PLAY_BAR_SETTINGS, PlaybarSettingsSchema, PlaybarSettingsStore } from "./playbar";
import {
  BeatmapRenderSettingsSchema,
  BeatmapRenderSettingsStore,
  DEFAULT_BEATMAP_RENDER_SETTINGS,
} from "./beatmap-render";

@injectable()
export class RewindLocalStorage {
  helper: LocalStorageHelper;

  constructor(
    private readonly skinSettingsStore: SkinSettingsStore,
    private readonly audioSettingsStore: AudioSettingsStore,
    private readonly analysisCursorSettingsStore: AnalysisCursorSettingsStore,
    private readonly beatmapBackgroundSettingsStore: BeatmapBackgroundSettingsStore,
    private readonly beatmapRenderSettingsStore: BeatmapRenderSettingsStore,
    private readonly replayCursorSettingsStore: ReplayCursorSettingsStore,
    private readonly hitErrorBarSettingsStore: HitErrorBarSettingsStore,
    private readonly playbarSettingsStore: PlaybarSettingsStore,
  ) {
    this.helper = new LocalStorageHelper();
  }

  // Registers all the schemas that should be stored / loaded from LocalStorage.
  initialize() {
    this.helper.register({
      key: "skin-settings",
      schema: SkinSettingsSchema,
      defaultValue: DEFAULT_SKIN_SETTINGS,
      subject: this.skinSettingsStore.settings$,
    });
    this.helper.register({
      key: "audio-settings",
      schema: AudioSettingsSchema,
      defaultValue: DEFAULT_AUDIO_SETTINGS,
      subject: this.audioSettingsStore.settings$,
    });
    this.helper.register({
      key: "analysis-cursor-settings",
      schema: AnalysisCursorSettingsSchema,
      defaultValue: DEFAULT_ANALYSIS_CURSOR_SETTINGS,
      subject: this.analysisCursorSettingsStore.settings$,
    });
    this.helper.register({
      key: "beatmap-background-settings",
      schema: BeatmapBackgroundSettingsSchema,
      defaultValue: DEFAULT_BEATMAP_BACKGROUND_SETTINGS,
      subject: this.beatmapBackgroundSettingsStore.settings$,
    });

    this.helper.register({
      key: "beatmap-render-settings",
      schema: BeatmapRenderSettingsSchema,
      defaultValue: DEFAULT_BEATMAP_RENDER_SETTINGS,
      subject: this.beatmapRenderSettingsStore.settings$,
    });

    this.helper.register({
      key: "replay-cursor-settings",
      schema: ReplayCursorSettingsSchema,
      defaultValue: DEFAULT_REPLAY_CURSOR_SETTINGS,
      subject: this.replayCursorSettingsStore.settings$,
    });

    this.helper.register({
      key: "hit-error-bar-settings",
      schema: HitErrorBarSettingsSchema,
      defaultValue: DEFAULT_HIT_ERROR_BAR_SETTINGS,
      subject: this.hitErrorBarSettingsStore.settings$,
    });

    this.helper.register({
      key: "playbar-settings",
      schema: PlaybarSettingsSchema,
      defaultValue: DEFAULT_PLAY_BAR_SETTINGS,
      subject: this.playbarSettingsStore.settings$,
    });

    this.helper.loadAll();
  }
}
