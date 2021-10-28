import { CursorSettings } from "./CursorSettings";
import { JSONSchemaType } from "ajv";

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
