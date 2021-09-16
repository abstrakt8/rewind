import { BlueprintService } from "./api/BlueprintService";
import { Container } from "inversify";
import { TYPES } from "./types/types";
import { ReplayService } from "./api/ReplayService";
import { RewindStageCreator } from "./RewindStageCreator";
import { SkinLoader } from "./api/SkinLoader";
import { AudioService } from "./audio/AudioService";
import { TextureManager } from "./TextureManager";

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
  container.bind<SkinLoader>(SkinLoader).toSelf();
  container.bind<AudioService>(AudioService).toSelf();
  container.bind<RewindStageCreator>(RewindStageCreator).toSelf();
  container.bind<TextureManager>(TextureManager).toSelf().inSingletonScope();

  const rewindStageService = container.get(RewindStageCreator);

  return {
    createStage: rewindStageService.createStage.bind(rewindStageService),
  };
}

export type Theater = ReturnType<typeof createRewindTheater>;
