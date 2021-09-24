// Holds the beatmap
import { Beatmap } from "@rewind/osu/core";
import { injectable } from "inversify";

@injectable()
export class BeatmapManager {
  setBeatmap(beatmap: Beatmap) {}
}
