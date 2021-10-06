export type SkinSource = "rewind" | "osu";

export interface SkinId {
  source: SkinSource;
  name: string;
}

export function skinIdToString({ source, name }: SkinId) {
  return `${source}:${name}`;
}

const isSkinSource = (s: string): s is SkinSource => s === "rewind" || s === "osu";

export function stringToSkinId(str: string): SkinId {
  const [source, name] = str.split(":");
  if (isSkinSource(source)) {
    return { source, name };
  } else {
    throw Error("Skin source wrong");
  }
}

export const DEFAULT_OSU_SKIN_ID: SkinId = { source: "rewind", name: "OsuDefaultSkin" };
export const DEFAULT_REWIND_SKIN_ID: SkinId = { source: "rewind", name: "RewindDefaultSkin" };
