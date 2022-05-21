import { AbstractSettingsStore } from "./AbstractSettingsStore";
import { injectable } from "inversify";
import { JSONSchemaType } from "ajv";

export interface SkinSettings {
  // fallbackSkinId is rewind:OsuDefaultSkin
  preferredSkinId: string;
}

export const DEFAULT_SKIN_SETTINGS: SkinSettings = Object.freeze({
  preferredSkinId: "rewind:RewindDefaultSkin",
});
export const SkinSettingsSchema: JSONSchemaType<SkinSettings> = {
  type: "object",
  properties: {
    preferredSkinId: { type: "string", default: DEFAULT_SKIN_SETTINGS.preferredSkinId },
  },
  required: ["preferredSkinId"],
};

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
