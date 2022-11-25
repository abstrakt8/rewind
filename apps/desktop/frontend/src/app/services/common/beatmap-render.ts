import { JSONSchemaType } from "ajv";
import { injectable } from "inversify";
import { PersistentService } from "../core/service";

export interface BeatmapRenderSettings {
  sliderDevMode: boolean;
  // By default, osu! will ALWAYS draw slider ends, but most skins have an invisible slider end texture.
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

@injectable()
export class BeatmapRenderService extends PersistentService<BeatmapRenderSettings> {
  key = "beatmap-render";
  schema = BeatmapRenderSettingsSchema;

  getDefaultValue(): BeatmapRenderSettings {
    return DEFAULT_BEATMAP_RENDER_SETTINGS;
  }
  setSliderDevMode(sliderDevMode: boolean) {
    this.changeSettings((draft) => (draft.sliderDevMode = sliderDevMode));
  }

  setDrawSliderEnds(drawSliderEnds: boolean) {
    this.changeSettings((draft) => (draft.drawSliderEnds = drawSliderEnds));
  }
}
