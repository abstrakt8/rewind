import { injectable } from "inversify";
import { AbstractSettingsStore } from "./AbstractSettingsStore";
import { DEFAULT_HIT_ERROR_BAR_SETTINGS, HitErrorBarSettings } from "../settings/HitErrorBarSettings";

@injectable()
export class HitErrorBarSettingsStore extends AbstractSettingsStore<HitErrorBarSettings> {
  constructor() {
    super(DEFAULT_HIT_ERROR_BAR_SETTINGS);
  }
}
