import { OsuClassicMod } from "@osujs/core";

const modsThatAffectSR = (flashlightIncluded: boolean): OsuClassicMod[] => {
  const defaultMods: OsuClassicMod[] = [
    // TOUCH_DEVICE
    "DOUBLE_TIME", // "NIGHT_CORE",
    "HALF_TIME",
    "EASY",
    "HARD_ROCK",
    "FLASH_LIGHT",
    "RELAX",
  ];
  if (flashlightIncluded) {
    defaultMods.push("HIDDEN");
  }
  return defaultMods;
};

/**
 * Normalizes the list of given mods to standardised ones that actually affect the star rating.
 * Also sorts them accordingly so that they can be used as a cache key.
 *
 * Intended as a performance optimization so that the user can cache the star rating for certain mod combinations.
 *
 * Since the newest SR changes, HD also affects star rating combined with FL.
 *
 * @example ["HD", "HR", "NF"] -> ["HR"]
 * @example ["NC"] -> ["DT"]
 * @example ["HD", "FL"] -> ["HD", "FL"]
 */
export function normalizeModsForSR(mods: OsuClassicMod[]): OsuClassicMod[] {
  const includesFL = mods.includes("FLASH_LIGHT");
  const modsFilter = modsThatAffectSR(includesFL);
  return mods.filter((m) => modsFilter.includes(m)).sort();
}
