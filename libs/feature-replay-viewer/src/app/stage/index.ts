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
import { PlayfieldBorderPreparer } from "./rewind/components/border/PlayfieldBorderPreparer";
import { PlayfieldPreparer } from "./rewind/components/playfield/PlayfieldPreparer";
import { TextureManager } from "./rewind/TextureManager";
import { StageViewService } from "./rewind/StageViewService";

// https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md

function createCoreContainer() {
  const container = new Container();
  container.bind<EventEmitter>(EventEmitter).toSelf().inSingletonScope();
  container.bind<AudioEngine>(AudioEngine).toSelf().inSingletonScope();
  container.bind<GameplayClock>(GameplayClock).toSelf().inSingletonScope();
  container.bind<PixiRendererService>(PixiRendererService).toSelf().inSingletonScope();
  container.bind<GameLoop>(GameLoop).toSelf().inSingletonScope();
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

  container.bind(TYPES.THEATER_STAGE_PREPARER).to(GameStagePreparer);

  container.bind<BackgroundPreparer>(BackgroundPreparer).toSelf();
  container.bind<PlayfieldBorderPreparer>(PlayfieldBorderPreparer).toSelf();
  container.bind<PlayfieldPreparer>(PlayfieldPreparer).toSelf();
  container.bind(TextureManager).toSelf();
  container.bind(StageViewService).toSelf();

  // TODO: Setup listeners?

  // Maybe only return what we want to expose
  const pixiRenderService = container.get<PixiRendererService>(PixiRendererService);
  const gameLoop = container.get<GameLoop>(GameLoop);
  const clock = container.get<GameplayClock>(GameplayClock);
  return {
    clock,
    initializeRenderer: pixiRenderService.initializeRenderer.bind(pixiRenderService),
    initializeTicker: gameLoop.initializeTicker.bind(gameLoop),
    performanceMonitor: gameLoop.getPerformanceMonitor(),
  };
}

export type RewindStage = ReturnType<typeof createRewindStage>;

// In another application that uses another stage preparer ...
// container.bind(TYPES.THEATER_STAGE_PREPARER).toService(BadApplePreparer);
