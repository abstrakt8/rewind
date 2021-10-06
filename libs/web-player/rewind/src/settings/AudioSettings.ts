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
