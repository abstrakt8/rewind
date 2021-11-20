import { ControlPointInfo } from "../beatmap/ControlPoints/ControlPointInfo";
import { HitObjectSettings } from "./HitObjectSettings";
import { BeatmapDifficulty, DEFAULT_BEATMAP_DIFFICULTY } from "../beatmap/BeatmapDifficulty";

/**
 * Beatmaps are instances of blueprints with additional modifications:
 * - Game mods, e.g. HardRock flips the map vertically
 * - Hit object stacking
 *
 * The reason that we use have to explicitly distinguish between beatmaps and blueprint is due to clarity:
 * * Players don't play on blueprints, they play on beatmaps.
 * * Difficulty calculation is also not done on blueprints, but on beatmaps.
 * * ...
 */

export class Blueprint {
  blueprintInfo: BlueprintInfo = new BlueprintInfo();
  defaultDifficulty: BeatmapDifficulty = { ...DEFAULT_BEATMAP_DIFFICULTY };
  controlPointInfo: ControlPointInfo = new ControlPointInfo();
  hitObjectSettings: HitObjectSettings[] = [];
}

class BlueprintInfo {
  beatmapVersion = 0;
  onlineBeatmapId?: number;
  metadata: BlueprintMetadata = new BlueprintMetadata();
  audioLeadIn = 0;
  stackLeniency = 0.7;
}

class BlueprintMetadata {
  artist = "";
  title = "";
  titleUnicode = "";
  artistUnicode = "";
  source = "";
  tags = "";
  previewTime = 0;
  audioFile = "";
  backgroundFile = "";
  backgroundOffset = { x: 0, y: 0 };
}
