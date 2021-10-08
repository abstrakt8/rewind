import { ControlPointInfo } from "../beatmap/ControlPoints/ControlPointInfo";
import { BlueprintInfo } from "./BlueprintInfo";
import { HitObjectSettings } from "./HitObjectSettings";
import { BeatmapDifficulty, DEFAULT_BEATMAP_DIFFICULTY } from "../beatmap/BeatmapDifficulty";

export class Blueprint {
  blueprintInfo: BlueprintInfo = new BlueprintInfo();
  defaultDifficulty: BeatmapDifficulty = { ...DEFAULT_BEATMAP_DIFFICULTY };
  controlPointInfo: ControlPointInfo = new ControlPointInfo();
  hitObjectSettings: HitObjectSettings[] = [];
}
