import { CursorSettings } from "../settings/CursorSettings";
import { AnalysisCursorSetting } from "../settings/AnalysisCursorSetting";

export interface OsuCursorSetting extends CursorSettings {
  showTrail: boolean;
  // Maybe there will be a smooth cursor trail
}

// Can be serialized and maybe stored as default preferences
// Those settings will immediately affect the PIXI app in the next .render().
export interface ViewSettings {
  playfieldBorder: {
    thickness: number;
    enabled: boolean;
  };
  backgroundDim: number;
  modHidden: boolean;

  sliderAnalysis: boolean;

  osuCursor: OsuCursorSetting;
  analysisCursor: AnalysisCursorSetting;
}

export const defaultViewSettings: () => ViewSettings = () => ({
  playfieldBorder: {
    thickness: 2,
    enabled: true,
  },
  backgroundDim: 0.1,
  modHidden: false,
  osuCursor: {
    showTrail: true,
    scale: 0.8,
    enabled: true,
    scaleWithCS: true,
  },
  sliderAnalysis: false,
  analysisCursor: {
    scale: 0.8,
    enabled: false,
    scaleWithCS: true,
    colorBothKeys: 0x333456,
    colorKey1: 0xaffede,
    colorKey2: 0xdeadbe,
  },
});
