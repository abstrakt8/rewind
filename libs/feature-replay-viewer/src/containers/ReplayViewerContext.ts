import { Skin } from "../skins/Skin";
import { Beatmap, Blueprint, HitObjectJudgement, ReplayStateTimeMachine } from "@rewind/osu/core";
import { OsuReplay } from "../managers/ReplayManager";
import { ViewSettings } from "../ViewSettings";

export interface ReplayViewerContext {
  blueprint: Blueprint;
  beatmap: Beatmap;
  replay?: OsuReplay; // not frames only -> gameVersion might be important for rendering
  replayTimeMachine?: ReplayStateTimeMachine;
  judgements: HitObjectJudgement[];
  skin: Skin;
  view: ViewSettings;
}
