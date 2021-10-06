import { JSONSchemaType } from "ajv";
import { CursorSettings } from "./CursorSettings";

export interface ReplayCursorSettings extends CursorSettings {
  showTrail: boolean;
  // Maybe there will be a smooth cursor trail
}

export const DEFAULT_REPLAY_CURSOR_SETTINGS: ReplayCursorSettings = Object.freeze({
  showTrail: true,
  scale: 0.8,
  enabled: true,
  scaleWithCS: true,
});

export const ReplayCursorSettingsSchema: JSONSchemaType<ReplayCursorSettings> = {
  type: "object",
  properties: {
    showTrail: { type: "boolean", default: DEFAULT_REPLAY_CURSOR_SETTINGS.showTrail },
    scale: { type: "number", default: DEFAULT_REPLAY_CURSOR_SETTINGS.scale },
    enabled: { type: "boolean", default: DEFAULT_REPLAY_CURSOR_SETTINGS.enabled },
    scaleWithCS: { type: "boolean", default: DEFAULT_REPLAY_CURSOR_SETTINGS.scaleWithCS },
  },
  required: [],
};
