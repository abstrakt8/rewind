// Holds the beatmap
import { Beatmap } from "@osujs/core";
import { injectable } from "inversify";
import { BehaviorSubject } from "rxjs";

@injectable()
export class BeatmapManager {
  beatmap$: BehaviorSubject<Beatmap> = new BehaviorSubject<Beatmap>(Beatmap.EMPTY_BEATMAP);

  setBeatmap(beatmap: Beatmap) {
    this.beatmap$.next(beatmap);
  }

  getBeatmap() {
    return this.beatmap$.value;
  }
}
