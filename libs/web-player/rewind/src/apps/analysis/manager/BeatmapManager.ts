// Holds the beatmap
import { Beatmap } from "@rewind/osu/core";
import { injectable } from "inversify";

@injectable()
export class BeatmapManager {
  beatmap: Beatmap = Beatmap.EMPTY_BEATMAP;

  setBeatmap(beatmap: Beatmap) {
    this.beatmap = beatmap;
  }

  getBeatmap() {
    return this.beatmap;
  }
}
