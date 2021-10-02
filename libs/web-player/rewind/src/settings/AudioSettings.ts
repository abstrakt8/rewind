export interface AudioSettings {
  muted: boolean;
  volume: {
    master: number;
    music: number;
    effects: number;
  };
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  muted: false,
  volume: {
    // Make it intentionally low, but not muted.
    master: 0.1,
    music: 1.0,
    effects: 0.25,
  },
};
