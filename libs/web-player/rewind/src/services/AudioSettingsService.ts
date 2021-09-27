import { injectable, postConstruct } from "inversify";
import { AudioSettings } from "../settings/AudioSettings";
import { BehaviorSubject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import produce from "immer";
import { WritableDraft } from "immer/dist/types/types-external";

// A bit similar to how YouTube stores their data in local storage
// This is only used for RewindAnalysisStage

const AUDIO_SETTINGS_KEY = "rewind-audio-settings";
const storage = window.localStorage;

const DEFAULT_SETTINGS: AudioSettings = {
  muted: false,
  volume: {
    // Make it intentionally low, but not muted.
    master: 0.1,
    music: 1.0,
    effects: 0.25,
  },
};

function retrieveLocalStorageWithFallback<T>(key: string, fallback: T) {
  const itemString = storage.getItem(key);
  if (itemString === null) {
    return fallback;
  }
  return JSON.parse(itemString);
}

@injectable()
export class AudioSettingsService {
  settings$: BehaviorSubject<AudioSettings>;

  constructor() {
    this.settings$ = new BehaviorSubject<AudioSettings>(DEFAULT_SETTINGS);
  }

  @postConstruct()
  setup() {
    this.settings$ = new BehaviorSubject<AudioSettings>(
      retrieveLocalStorageWithFallback(AUDIO_SETTINGS_KEY, DEFAULT_SETTINGS),
    );

    // We debounce so that we don't persist too often to the LocalStorage
    this.settings$.pipe(debounceTime(500)).subscribe((value) => {
      storage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(value));
    });
  }

  private applyNewSettings(settings: AudioSettings) {
    this.settings$.next(settings);
  }

  private changeSettings(fn: (draft: WritableDraft<AudioSettings>) => void) {
    this.applyNewSettings(produce(this.settings$.getValue(), fn));
  }

  toggleMuted() {
    this.changeSettings((d) => {
      d.muted = !d.muted;
    });
  }

  setMasterVolume(volume: number) {
    this.changeSettings((d) => {
      d.volume.master = volume;
    });
  }

  setMusicVolume(volume: number) {
    this.changeSettings((d) => {
      d.volume.music = volume;
    });
  }

  setEffectsVolume(volume: number) {
    this.changeSettings((d) => {
      d.volume.effects = volume;
    });
  }

  getSettings() {
    return this.settings$.getValue();
  }
}
