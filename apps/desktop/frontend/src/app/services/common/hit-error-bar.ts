import { injectable } from "inversify";
import { PersistentService } from "../core/service";
import { JSONSchemaType } from "ajv";

export interface HitErrorBarSettings {
  enabled: boolean;
  scale: number;
}

export const DEFAULT_HIT_ERROR_BAR_SETTINGS: HitErrorBarSettings = Object.freeze({
  enabled: true,
  scale: 2.0,
});

export const HitErrorBarSettingsSchema: JSONSchemaType<HitErrorBarSettings> = {
  type: "object",
  properties: {
    enabled: { type: "boolean", default: DEFAULT_HIT_ERROR_BAR_SETTINGS.enabled },
    scale: { type: "number", default: DEFAULT_HIT_ERROR_BAR_SETTINGS.scale },
  },
  required: [],
};

@injectable()
export class HitErrorBarSettingsStore extends PersistentService<HitErrorBarSettings> {
  key = "hit-error";
  schema = HitErrorBarSettingsSchema;

  getDefaultValue() {
    return DEFAULT_HIT_ERROR_BAR_SETTINGS;
  }
}
