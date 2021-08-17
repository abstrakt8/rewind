import { Container } from "inversify";
import { EventEmitter } from "../events";
import { AudioEngine } from "./core/AudioEngine";
import { GameplayClock } from "./core/GameplayClock";
import { TYPES } from "./types";
import { GameStagePreparer } from "./rewind/components/stage/GameStagePreparer";
import { BackgroundPreparer } from "./rewind/components/background/BackgroundPreparer";
import { Beatmap } from "@rewind/osu/core";
import { OsuReplay } from "../../replays/slice";
import { PixiRendererService } from "./core/PixiRendererService";
import { GameLoop } from "./core/GameLoop";

function createCoreContainer() {
  const container = new Container();
  container.bind<EventEmitter>(EventEmitter).toSelf();
  container.bind<AudioEngine>(AudioEngine).toSelf();
  container.bind<GameplayClock>(GameplayClock).toSelf();
  container.bind<PixiRendererService>(PixiRendererService).toSelf();
  container.bind<GameLoop>(GameLoop).toSelf();
  return container;
}

interface RewindStageSettings {
  beatmap: Beatmap;
  replay: OsuReplay;
}

export function createRewindStage(settings: RewindStageSettings) {
  const container = createCoreContainer();

  const { beatmap, replay } = settings;
  container.bind(TYPES.BEATMAP).toConstantValue(beatmap);
  container.bind(TYPES.REPLAY).toConstantValue(replay);
  container.bind(TYPES.THEATER_STAGE_PREPARER).toService(GameStagePreparer);
  container.bind<BackgroundPreparer>(BackgroundPreparer).toSelf();

  // TODO: Setup listeners?

  // Maybe only return what we want to expose
  const pixiRenderService = container.get<PixiRendererService>(PixiRendererService);
  return {
    clock: container.get<GameplayClock>(GameplayClock),
    eventEmitter: container.get<EventEmitter>(EventEmitter),
    initializeRenderer: pixiRenderService.initializeRenderer.bind(pixiRenderService),
  };
}

export type RewindStage = ReturnType<typeof createRewindStage>;

// In another application that uses another stage preparer ...
// container.bind(TYPES.THEATER_STAGE_PREPARER).toService(BadApplePreparer);
