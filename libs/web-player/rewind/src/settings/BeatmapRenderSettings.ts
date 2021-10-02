export interface BeatmapRenderSettings {
  sliderDevMode: boolean;
  drawSliderEnds: boolean;
}

export const DEFAULT_BEATMAP_RENDER_SETTINGS: BeatmapRenderSettings = Object.freeze({
  sliderDevMode: false,
  drawSliderEnds: false,
});
