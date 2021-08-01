import { Skin } from "../skins/Skin";
import { Beatmap, ReplayStateTimeMachine } from "@rewind/osu/core";
import { OsuReplay } from "../managers/ReplayManager";
import { ViewSettings } from "../ViewSettings";

export interface ReplayViewerContext {
  beatmap: Beatmap;
  replay?: OsuReplay; // not frames only -> gameVersion might be important for rendering
  replayTimeMachine?: ReplayStateTimeMachine;
  skin: Skin;
  view: ViewSettings;
}
