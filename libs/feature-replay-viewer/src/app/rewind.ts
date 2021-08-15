import { Container } from "inversify";
import { BlueprintService } from "./BlueprintService";
import { TYPES } from "./types";

interface Settings {
  url: string;
  // store: EssentialStore;
}

export function createRewindApp(settings: Settings) {
  // Use InversifyJS
  const { url } = settings;
  const container = new Container();
  // container.bind(TYPES.REDUX_STORE).toConstantValue(store);
  container.bind(TYPES.API_URL).toConstantValue(url);
  container.bind<BlueprintService>(BlueprintService).toService(BlueprintService);
  return container;
}
