import { BlueprintService } from "./BlueprintService";
import { Container } from "inversify";
import { TYPES } from "./types";
import { ReplayService } from "./ReplayService";
import { RewindStageService } from "./RewindStageService";

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
  container.bind<RewindStageService>(RewindStageService).toSelf();

  const rewindStageService = container.get(RewindStageService);

  return {
    createStage: rewindStageService.createStage.bind(rewindStageService),
  };
}

export type Theater = ReturnType<typeof createRewindTheater>;
