interface CursorSetting {
  scale: number;
  enabled: boolean;
  scaleWithCS: boolean;
}

interface OsuCursorSetting extends CursorSetting {
  showTrail: boolean;
  // Maybe there will be a smooth cursor trail
}

interface AnalysisCursorSetting extends CursorSetting {
  colorKey1: number;
  colorKey2: number;
  colorBothKeys: number;
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
  osuCursor: OsuCursorSetting;
  analysisCursor: AnalysisCursorSetting;
  skinId: string;
  // playbackSpeed: number;
}

export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  playfieldBorder: {
    thickness: 2,
    enabled: true,
  },
  backgroundDim: 0.5,
  modHidden: false,
  osuCursor: {
    showTrail: true,
    scale: 0.8,
    enabled: true,
    scaleWithCS: true,
  },
  analysisCursor: {
    scale: 0.8,
    enabled: false,
    scaleWithCS: true,
    colorBothKeys: 0x333456,
    colorKey1: 0xaffede,
    colorKey2: 0xdeadbe,
  },
  skinId: "DefaultSkin",
};
