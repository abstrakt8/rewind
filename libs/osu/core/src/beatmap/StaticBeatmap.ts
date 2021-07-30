import { BeatmapDifficulty } from "./BeatmapDifficulty";
import { OsuHitObject } from "../hitobjects";

// Unaware of the applied mods, maybe we can maintain a list?
// TODO: Should it even have a BeatmapDifficulty ?
// Should hit objects be unaware of beatmap difficulty?
export class StaticBeatmap {
  constructor(readonly hitObjects: Array<OsuHitObject>, readonly difficulty: BeatmapDifficulty) {}
}
