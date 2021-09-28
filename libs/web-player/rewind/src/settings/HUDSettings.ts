export interface PlayfieldBorderSettings {
  thickness: number;
  enabled: boolean;
  // style: "RECTANGLE" | "CORNERS" | ...
}

export interface HUDSettings {
  backgroundDim: number;
  playfieldBorder: PlayfieldBorderSettings;
  showFps: boolean;
}
