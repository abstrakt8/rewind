import { inject, injectable } from "inversify";
import { EventEmitter } from "../../events";
import { STAGE_TYPES } from "../STAGE_TYPES";

// A bit similar to how YouTube stores their data in local storage
// This is only used for RewindAnalysisStage

export interface AudioSettings {
  muted: boolean;
  volume: {
    master: number;
    music: number;
    effects: number;
  };
}

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

export const AUDIO_SETTINGS_CHANGED = "AudioSettingsChanged";

@injectable()
export class AudioSettingsService {
  settings: AudioSettings;

  constructor(@inject(STAGE_TYPES.EVENT_EMITTER) private readonly eventEmitter: EventEmitter) {
    const itemString = storage.getItem(AUDIO_SETTINGS_KEY);
    if (itemString !== null) {
      this.settings = JSON.parse(itemString);
    } else {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  persist() {
    storage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(this.settings));
  }

  applyNewSettings(settings: AudioSettings) {
    this.settings = settings;
    this.persist();
    this.eventEmitter.emit(AUDIO_SETTINGS_CHANGED, this.settings);
  }

  getSettings() {
    return this.settings;
  }
}
