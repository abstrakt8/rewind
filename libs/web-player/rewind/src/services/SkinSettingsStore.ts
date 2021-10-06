import { AbstractSettingsStore } from "./AbstractSettingsStore";
import { DEFAULT_SKIN_SETTINGS, SkinSettings } from "../settings/SkinSettings";
import { injectable } from "inversify";

@injectable()
export class SkinSettingsStore extends AbstractSettingsStore<SkinSettings> {
  constructor() {
    super(DEFAULT_SKIN_SETTINGS);
  }

  get skinSettings() {
    return this.settings$.getValue();
  }

  setPreferredSkinId(preferredSkinId: string) {
    this.changeSettings((s) => (s.preferredSkinId = preferredSkinId));
  }
}
