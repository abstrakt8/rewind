import { BlueprintService } from "./BlueprintService";

interface Settings {
  url: string;
}

// Maybe also with InversifyJS?
function createTheater(settings: Settings) {
  const { url } = settings;
  const blueprintService = new BlueprintService(url);
}
