import { injectable } from "inversify";
import { BeatmapBackgroundSettings, DEFAULT_BEATMAP_BACKGROUND_SETTINGS } from "../settings/BeatmapBackgroundSettings";
import { BehaviorSubject } from "rxjs";
import { Texture } from "pixi.js";

@injectable()
export class BeatmapBackgroundSettingsStore {
  settings$: BehaviorSubject<BeatmapBackgroundSettings>;
  texture$: BehaviorSubject<Texture>;

  constructor() {
    this.settings$ = new BehaviorSubject<BeatmapBackgroundSettings>(DEFAULT_BEATMAP_BACKGROUND_SETTINGS);
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
