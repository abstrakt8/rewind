import { PersistentService } from "../core/service";
import { injectable } from "inversify";
import { JSONSchemaType } from "ajv";
import { CursorSettings } from "../common/cursor";

export interface AnalysisCursorSettings extends CursorSettings {
  colorKey1: number;
  colorKey2: number;
  colorNoKeys: number;
  colorBothKeys: number;
}

export const DEFAULT_ANALYSIS_CURSOR_SETTINGS: AnalysisCursorSettings = Object.freeze({
  scale: 0.8,
  enabled: true,
  scaleWithCS: true,
  colorNoKeys: 0x5d6463, // gray
  colorKey1: 0xffa500, // orange)
  colorKey2: 0x00ff00, // green)
  colorBothKeys: 0x3cbdc1, // cyan)
});

export const AnalysisCursorSettingsSchema: JSONSchemaType<AnalysisCursorSettings> = {
  type: "object",
  properties: {
    scale: { type: "number", default: DEFAULT_ANALYSIS_CURSOR_SETTINGS.scale },
    enabled: { type: "boolean", default: DEFAULT_ANALYSIS_CURSOR_SETTINGS.enabled },
    scaleWithCS: { type: "boolean", default: DEFAULT_ANALYSIS_CURSOR_SETTINGS.scaleWithCS },
    colorNoKeys: { type: "number", default: DEFAULT_ANALYSIS_CURSOR_SETTINGS.colorNoKeys },
    colorKey1: { type: "number", default: DEFAULT_ANALYSIS_CURSOR_SETTINGS.colorKey1 },
    colorKey2: { type: "number", default: DEFAULT_ANALYSIS_CURSOR_SETTINGS.colorKey2 },
    colorBothKeys: { type: "number", default: DEFAULT_ANALYSIS_CURSOR_SETTINGS.colorBothKeys },
  },
  required: [],
};

@injectable()
export class AnalysisCursorSettingsStore extends PersistentService<AnalysisCursorSettings> {
  key = "analysis-cursor";
  schema: JSONSchemaType<AnalysisCursorSettings> = AnalysisCursorSettingsSchema;
  defaultValue: AnalysisCursorSettings = DEFAULT_ANALYSIS_CURSOR_SETTINGS;

  setEnabled(enabled: boolean) {
    this.changeSettings((s) => (s.enabled = enabled));
  }
}
