/**
 * Configuring the current user skin
 */
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
