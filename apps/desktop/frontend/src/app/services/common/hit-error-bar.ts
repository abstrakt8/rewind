import { injectable } from "inversify";
import { AbstractSettingsStore } from "./AbstractSettingsStore";
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
export class HitErrorBarSettingsStore extends AbstractSettingsStore<HitErrorBarSettings> {
  constructor() {
    super(DEFAULT_HIT_ERROR_BAR_SETTINGS);
  }
}
