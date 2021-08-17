import { BlueprintService } from "./BlueprintService";
import { Container } from "inversify";
import { TYPES } from "./types";
import { ReplayService } from "./ReplayService";
import { RewindStageCreator } from "./RewindStageCreator";
import { SkinService } from "./SkinService";

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
