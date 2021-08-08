import { Skin } from "../skins/Skin";
import { Beatmap, GameplayInfo, HitObjectJudgement, ReplayState } from "@rewind/osu/core";
import { OsuReplay } from "../api/ReplayManager";
import { ViewSettings } from "./ViewSettings";

export interface Scene {
  time: number;
  skin: Skin;
  beatmap: Beatmap;
  replay?: OsuReplay;
  gameplayState?: ReplayState;
  gameplayInfo?: GameplayInfo;
  judgements: HitObjectJudgement[];
  view: ViewSettings;
  backgroundUrl: string;
}

export type SceneLoader = () => Scene;
