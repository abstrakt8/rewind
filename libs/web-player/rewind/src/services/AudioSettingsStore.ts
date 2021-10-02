import { injectable, postConstruct } from "inversify";
import { AudioSettings, DEFAULT_AUDIO_SETTINGS } from "../settings/AudioSettings";
import { BehaviorSubject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import produce from "immer";
import { WritableDraft } from "immer/dist/types/types-external";

// A bit similar to how YouTube stores their data in local storage
// This is only used for RewindAnalysisStage

const AUDIO_SETTINGS_KEY = "rewind-audio-settings";
const storage = window.localStorage;

function retrieveLocalStorageWithFallback<T>(key: string, fallback: T) {
  const itemString = storage.getItem(key);
  if (itemString === null) {
    return fallback;
  }
  return JSON.parse(itemString);
}

@injectable()
export class AudioSettingsStore {
  settings$: BehaviorSubject<AudioSettings>;

  constructor() {
    this.settings$ = new BehaviorSubject<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  }

  @postConstruct()
  setup() {
    // TODO: Settings read should be injected
    this.settings$ = new BehaviorSubject<AudioSettings>(
      retrieveLocalStorageWithFallback(AUDIO_SETTINGS_KEY, DEFAULT_AUDIO_SETTINGS),
    );

    // TODO: Move this up
    // We debounce so that we don't persist too often to the LocalStorage
    this.settings$.pipe(debounceTime(500)).subscribe((value) => {
      storage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(value));
    });
  }

  private applyNewSettings(settings: AudioSettings) {
    this.settings$.next(settings);
  }

  private changeSettings(fn: (draft: WritableDraft<AudioSettings>) => unknown) {
    this.applyNewSettings(
      produce(this.settings$.getValue(), (draft) => {
        fn(draft);
        // no return done means we can just return something
      }),
    );
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
