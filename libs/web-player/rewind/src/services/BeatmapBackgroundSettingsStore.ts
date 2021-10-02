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
  static defaultSettings: BeatmapBackgroundSettings = DEFAULT_SETTINGS;

  settings$: BehaviorSubject<BeatmapBackgroundSettings>;
  texture$: BehaviorSubject<Texture>;

  constructor() {
    this.settings$ = new BehaviorSubject<BeatmapBackgroundSettings>(BeatmapBackgroundSettingsStore.defaultSettings);
    this.texture$ = new BehaviorSubject<Texture>(Texture.EMPTY);
  }

  get settings() {
    return this.settings$.getValue();
  }

  get texture() {
    return this.texture$.getValue();
  }

  setBlur(blur: number) {
    this.settings$.next({ ...this.settings, blur });
  }

  setDim(dim: number) {
    this.settings$.next({ ...this.settings, dim });
  }

  setEnabled(enabled: boolean) {
    this.settings$.next({ ...this.settings, enabled });
  }
}
