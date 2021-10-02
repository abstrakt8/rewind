import { BehaviorSubject } from "rxjs";
import { BeatmapRenderSettings, DEFAULT_BEATMAP_RENDER_SETTINGS } from "../settings/BeatmapRenderSettings";
import { injectable } from "inversify";

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
