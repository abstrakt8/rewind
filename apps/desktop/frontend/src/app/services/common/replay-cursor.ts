import { PersistentService } from "../core/service";
import { JSONSchemaType } from "ajv";
import { CursorSettings } from "./cursor";
import { injectable } from "inversify";

export interface ReplayCursorSettings extends CursorSettings {
  showTrail: boolean;
  smoothCursorTrail: boolean;
}

export const DEFAULT_REPLAY_CURSOR_SETTINGS: ReplayCursorSettings = Object.freeze({
  showTrail: true,
  scale: 0.8,
  enabled: true,
  scaleWithCS: true,
  smoothCursorTrail: true,
});
export const ReplayCursorSettingsSchema: JSONSchemaType<ReplayCursorSettings> = {
  type: "object",
  properties: {
    showTrail: { type: "boolean", default: DEFAULT_REPLAY_CURSOR_SETTINGS.showTrail },
    scale: { type: "number", default: DEFAULT_REPLAY_CURSOR_SETTINGS.scale },
    enabled: { type: "boolean", default: DEFAULT_REPLAY_CURSOR_SETTINGS.enabled },
    scaleWithCS: { type: "boolean", default: DEFAULT_REPLAY_CURSOR_SETTINGS.scaleWithCS },
    smoothCursorTrail: { type: "boolean", default: DEFAULT_REPLAY_CURSOR_SETTINGS.smoothCursorTrail },
  },
  required: [],
};

@injectable()
export class ReplayCursorSettingsStore extends PersistentService<ReplayCursorSettings> {
  key = "replay-cursor";
  schema = ReplayCursorSettingsSchema;

  getDefaultValue(): ReplayCursorSettings {
    return DEFAULT_REPLAY_CURSOR_SETTINGS;
  }
}
