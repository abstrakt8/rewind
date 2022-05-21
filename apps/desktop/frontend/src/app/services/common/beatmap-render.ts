import { JSONSchemaType } from "ajv";
import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";

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

@injectable()
export class BeatmapRenderSettingsStore {
  settings$: BehaviorSubject<BeatmapRenderSettings>;

  constructor() {
    this.settings$ = new BehaviorSubject<BeatmapRenderSettings>(DEFAULT_BEATMAP_RENDER_SETTINGS);
  }

  get settings() {
    return this.settings$.getValue();
  }

  set settings(s: BeatmapRenderSettings) {
    this.settings$.next(s);
  }

  setSliderDevMode(sliderDevMode: boolean) {
    this.settings = { ...this.settings, sliderDevMode };
  }

  setDrawSliderEnds(drawSliderEnds: boolean) {
    this.settings = { ...this.settings, drawSliderEnds };
  }
}
