import { injectable } from "inversify";
import { BeatmapBackgroundSettings } from "../settings/BeatmapBackgroundSettings";
import { BehaviorSubject } from "rxjs";

const DEFAULT_SETTINGS: BeatmapBackgroundSettings = {
  dim: 0.8,
  blur: 0.4,
  enabled: true,
};

@injectable()
export class BeatmapBackgroundSettingsStore {
  settings$: BehaviorSubject<BeatmapBackgroundSettings>;

  constructor() {
    this.settings$ = new BehaviorSubject<BeatmapBackgroundSettings>(DEFAULT_SETTINGS);
  }
}
