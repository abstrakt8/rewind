type SkinSource = "rewind" | "osu";

export interface SkinId {
  source: SkinSource;
  name: string;
}

export const defaultSkinId: SkinId = { source: "rewind", name: "RewindDefaultSkin" };
// export const defaultSkinId: SkinId = { source: "osu", name: "-         《CK》 WhiteCat 2.1 _ old -lite" };
