export type SkinSource = "rewind" | "osu";

export interface SkinId {
  source: SkinSource;
  name: string;
}

export const DEFAULT_OSU_SKIN_ID: SkinId = { source: "rewind", name: "OsuDefaultSkin" };
export const DEFAULT_REWIND_SKIN_ID: SkinId = { source: "rewind", name: "RewindDefaultSkin" };
