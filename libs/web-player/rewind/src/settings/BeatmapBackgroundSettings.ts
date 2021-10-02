export interface BeatmapBackgroundSettings {
  // Whether it should be rendered or not. Temporarily disabling with this flag gives a better UX than setting the dim
  // to 100% since the user can retain the old value.
  enabled: boolean;
  // A number between 0 and 1. The resulting blur strength equals `blur * MAX_BLUR_STRENGTH`.
  blur: number;
  // dim = 1 - alpha
  dim: number;
}

export const DEFAULT_BEATMAP_BACKGROUND_SETTINGS: BeatmapBackgroundSettings = Object.freeze({
  dim: 0.8,
  blur: 0.4,
  enabled: true,
});
