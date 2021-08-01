import { Skin } from "../skins/Skin";
import { OsuHitObject, ReplayStateTimeMachine } from "@rewind/osu/core";
import { OsuReplay } from "../managers/ReplayManager";
import { ViewSettings } from "../ViewSettings";

export interface ReplayViewerContext {
  hitObjects: Array<OsuHitObject>; // from beatmap
  hitObjectsById: Record<string, OsuHitObject>; // from hitObjects normalized
  replay?: OsuReplay; // not frames only -> gameVersion might be important for rendering
  replayTimeMachine?: ReplayStateTimeMachine;
  skin: Skin;
  view: ViewSettings;
}
