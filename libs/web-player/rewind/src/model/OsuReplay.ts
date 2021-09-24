// TODO: Rename this to replay or something
import { OsuClassicMod, ReplayFrame } from "@rewind/osu/core";

export type OsuReplay = {
  md5hash: string;
  beatmapMd5: string;
  gameVersion: number;
  mods: OsuClassicMod[];
  player: string; // Could be useful to draw
  frames: ReplayFrame[];
};
