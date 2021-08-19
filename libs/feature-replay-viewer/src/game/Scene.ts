import { Skin } from "../app/stage/rewind/Skin";
import { Beatmap, GameplayInfo, HitObjectJudgement, GameState } from "@rewind/osu/core";
import { ViewSettings } from "./ViewSettings";
import { OsuReplay } from "../app/theater";

export interface Scene {
  time: number;
  skin: Skin;
  beatmap: Beatmap;
  replay?: OsuReplay;
  gameplayState?: GameState;
  gameplayInfo?: GameplayInfo;
  judgements: HitObjectJudgement[];
  view: ViewSettings;
  backgroundUrl: string;
}

export type SceneLoader = () => Scene;
