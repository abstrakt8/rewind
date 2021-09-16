type SkinSource = "rewind" | "osu";

export interface SkinId {
  source: SkinSource;
  name: string;
}

export const defaultSkinId: SkinId = { source: "rewind", name: "RewindDefaultSkin" };
// export const defaultSkinId: SkinId = { source: "osu", name: "-         《CK》 WhiteCat 2.1 _ old -lite" };
// export const defaultSkinId: SkinId = { source: "osu", name: "idke+1.2" };
// export const defaultSkinId: SkinId = { source: "osu", name: "Millhiore Lite" };
// export const defaultSkinId: SkinId = { source: "osu", name: "Toy 2018-09-07" };
// export const defaultSkinId: SkinId = { source: "osu", name: "- # BTMC   ⌞Freedom Dive  ↓⌝" };
