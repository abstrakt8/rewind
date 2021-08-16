import { Container } from "inversify";
import { EventEmitter } from "./events";
import { AudioEngine } from "./scenario/AudioEngine";
import { GameplayClock } from "./scenario/GameplayClock";
import { TYPES } from "./types";
import { GameStagePreparer } from "./scenario/components/stage/GameStagePreparer";
import { BackgroundPreparer } from "./scenario/components/background/BackgroundPreparer";

interface Settings {
  url: string;
  // store: EssentialStore;
}

function createBasicContainer() {
  const container = new Container();
  // container.bind(TYPES.API_URL).toConstantValue(url);
  // container.bind<BlueprintService>(BlueprintService).toService(BlueprintService);
  container.bind<EventEmitter>(EventEmitter).toService(EventEmitter);
  container.bind<AudioEngine>(AudioEngine).toService(AudioEngine);
  container.bind<GameplayClock>(GameplayClock).toService(GameplayClock);
  return container;
}

// This is basically the application entry point
export function createRewindApp(settings: Settings) {
  // Use InversifyJS
  // const { url } = settings;
  const container = createBasicContainer();

  container.bind(TYPES.THEATER_STAGE_PREPARER).toService(GameStagePreparer);
  container.bind<BackgroundPreparer>(BackgroundPreparer).toService(BackgroundPreparer);

  // TODO: Setup listeners?

  return {
    clock: container.get<GameplayClock>(GameplayClock),
    eventEmitter: container.get<EventEmitter>(EventEmitter),
  };
}

// In another application that uses another stage preparer ...
// container.bind(TYPES.THEATER_STAGE_PREPARER).toService(BadApplePreparer);
