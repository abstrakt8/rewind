import { JSONSchemaType } from "ajv";

export interface BeatmapRenderSettings {
  sliderDevMode: boolean;
  drawSliderEnds: boolean;
}

export const DEFAULT_BEATMAP_RENDER_SETTINGS: BeatmapRenderSettings = Object.freeze({
  sliderDevMode: false,
  drawSliderEnds: false,
});

export const BeatmapRenderSettingsSchema: JSONSchemaType<BeatmapRenderSettings> = {
  type: "object",
  properties: {
    sliderDevMode: { type: "boolean", default: DEFAULT_BEATMAP_RENDER_SETTINGS.sliderDevMode },
    drawSliderEnds: { type: "boolean", default: DEFAULT_BEATMAP_RENDER_SETTINGS.drawSliderEnds },
  },
  required: [],
};
