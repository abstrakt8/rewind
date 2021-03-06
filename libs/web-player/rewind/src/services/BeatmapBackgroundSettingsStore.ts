import { injectable } from "inversify";
import { BeatmapBackgroundSettings, DEFAULT_BEATMAP_BACKGROUND_SETTINGS } from "../settings/BeatmapBackgroundSettings";
import { BehaviorSubject } from "rxjs";
import { Texture } from "pixi.js";
import { AbstractSettingsStore } from "./AbstractSettingsStore";

@injectable()
export class BeatmapBackgroundSettingsStore extends AbstractSettingsStore<BeatmapBackgroundSettings> {
  texture$: BehaviorSubject<Texture>;

  constructor() {
    super(DEFAULT_BEATMAP_BACKGROUND_SETTINGS);
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
