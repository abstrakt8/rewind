import { injectable } from "inversify";
import { AbstractSettingsStore } from "../AbstractSettingsStore";
import { JSONSchemaType } from "ajv";

export interface AudioSettings {
  muted: boolean;
  volume: {
    master: number;
    music: number;
    effects: number;
  };
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = Object.freeze({
  muted: false,
  volume: {
    // Make it intentionally low, but not muted.
    master: 0.1,
    music: 1.0,
    effects: 0.25,
  },
});
export const AudioSettingsSchema: JSONSchemaType<AudioSettings> = {
  type: "object",
  properties: {
    muted: { type: "boolean", default: DEFAULT_AUDIO_SETTINGS.muted },
    volume: {
      type: "object",
      properties: {
        master: { type: "number", default: DEFAULT_AUDIO_SETTINGS.volume.master },
        music: { type: "number", default: DEFAULT_AUDIO_SETTINGS.volume.music },
        effects: { type: "number", default: DEFAULT_AUDIO_SETTINGS.volume.effects },
      },
      required: [],
    },
  },
  required: [],
};

@injectable()
export class AudioSettingsStore extends AbstractSettingsStore<AudioSettings> {
  constructor() {
    super(DEFAULT_AUDIO_SETTINGS);
  }

  toggleMuted() {
    this.changeSettings((d) => (d.muted = !d.muted));
  }

  setMasterVolume(volume: number) {
    this.changeSettings((d) => (d.volume.master = volume));
  }

  setMusicVolume(volume: number) {
    this.changeSettings((d) => (d.volume.music = volume));
  }

  setEffectsVolume(volume: number) {
    this.changeSettings((d) => (d.volume.effects = volume));
  }

  setMuted(muted: boolean) {
    this.changeSettings((d) => (d.muted = muted));
  }
}
