import { Container } from "inversify";
import { EventEmitter } from "./events";
import { AudioEngine } from "./tmp/AudioEngine";
import { GameplayClock } from "./tmp/GameplayClock";

interface Settings {
  url: string;
  // store: EssentialStore;
}

export function createRewindApp(settings: Settings) {
  // Use InversifyJS
  const { url } = settings;
  const container = new Container();
  // container.bind(TYPES.API_URL).toConstantValue(url);
  // container.bind<BlueprintService>(BlueprintService).toService(BlueprintService);

  container.bind<EventEmitter>(EventEmitter).toService(EventEmitter);
  container.bind<AudioEngine>(AudioEngine).toService(AudioEngine);
  container.bind<GameplayClock>(GameplayClock).toService(GameplayClock);

  return container;
}
