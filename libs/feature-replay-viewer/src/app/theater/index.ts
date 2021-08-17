import { BlueprintService } from "./BlueprintService";
import { Container } from "inversify";
import { TYPES } from "./types";
import { ReplayService } from "./ReplayService";
import { RewindStageCreator } from "./RewindStageCreator";
import { SkinService } from "./SkinService";
import { OsuClassicMod, ReplayFrame } from "@rewind/osu/core";

interface Settings {
  apiUrl: string;
}

// Maybe also with InversifyJS?
export function createRewindTheater(settings: Settings) {
  const { apiUrl } = settings;
  const container = new Container();
  container.bind(TYPES.API_URL).toConstantValue(apiUrl);
  container.bind<BlueprintService>(BlueprintService).toSelf();
  container.bind<ReplayService>(ReplayService).toSelf();
  container.bind<SkinService>(SkinService).toSelf();
  container.bind<RewindStageCreator>(RewindStageCreator).toSelf();

  const rewindStageService = container.get(RewindStageCreator);

  return {
    createStage: rewindStageService.createStage.bind(rewindStageService),
  };
}

export type Theater = ReturnType<typeof createRewindTheater>;
// TODO: Rename this to replay or something
export type OsuReplay = {
  md5hash: string;
  gameVersion: number;
  mods: OsuClassicMod[];
  player: string; // Could be useful to draw
  frames: ReplayFrame[];
};
