import { CursorSettings } from "./CursorSettings";

export interface AnalysisCursorSettings extends CursorSettings {
  colorKey1: number;
  colorKey2: number;
  colorNoKeys: number;
  colorBothKeys: number;
}

export const DEFAULT_ANALYSIS_CURSOR_SETTINGS: AnalysisCursorSettings = {
  scale: 0.8,
  enabled: false,
  scaleWithCS: true,
  colorNoKeys: 0x5d6463, // gray
  colorKey1: 0xffa500, // orange)
  colorKey2: 0x00ff00, // green)
  colorBothKeys: 0x3cbdc1, // cyan)
};
