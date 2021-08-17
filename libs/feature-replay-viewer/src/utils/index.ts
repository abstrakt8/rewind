import { OsuClassicMod } from "@rewind/osu/core";

export function determineDefaultPlaybackSpeed(mods: OsuClassicMod[]) {
  for (let i = 0; i < mods.length; i++) {
    if (mods[i] === "DOUBLE_TIME" || mods[i] === "HALF_TIME") return 1.5;
    if (mods[i] === "HALF_TIME") return 0.75;
  }
  return 1.0;
}
