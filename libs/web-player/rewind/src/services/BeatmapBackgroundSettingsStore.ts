import { injectable } from "inversify";
import { BeatmapBackgroundSettings } from "../settings/BeatmapBackgroundSettings";
import { BehaviorSubject } from "rxjs";
import { Texture } from "pixi.js";

const DEFAULT_SETTINGS: BeatmapBackgroundSettings = {
  dim: 0.8,
  blur: 0.4,
  enabled: true,
};

@injectable()
export class BeatmapBackgroundSettingsStore {
  settings$: BehaviorSubject<BeatmapBackgroundSettings>;
  texture$: BehaviorSubject<Texture>;

  constructor() {
    this.settings$ = new BehaviorSubject<BeatmapBackgroundSettings>(DEFAULT_SETTINGS);
    this.texture$ = new BehaviorSubject<Texture>(Texture.EMPTY);
  }

  get settings() {
    return this.settings$.getValue();
  }

  get texture() {
    return this.texture$.getValue();
  }
}
