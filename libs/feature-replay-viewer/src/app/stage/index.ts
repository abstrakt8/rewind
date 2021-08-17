import { Container } from "inversify";
import { EventEmitter } from "../events";
import { AudioEngine } from "./core/AudioEngine";
import { GameplayClock } from "./core/GameplayClock";
import { TYPES } from "./types";
import { GameStagePreparer } from "./rewind/components/stage/GameStagePreparer";
import { BackgroundPreparer } from "./rewind/components/background/BackgroundPreparer";
import { Beatmap } from "@rewind/osu/core";
import { PixiRendererService } from "./core/PixiRendererService";
import { GameLoop } from "./core/GameLoop";
import { PlayfieldBorderPreparer } from "./rewind/components/playfield/PlayfieldBorderPreparer";
import { PlayfieldPreparer } from "./rewind/components/playfield/PlayfieldPreparer";
import { TextureManager } from "./rewind/TextureManager";
import { StageViewService } from "./rewind/StageViewService";
import { HitObjectsPreparer } from "./rewind/components/playfield/HitObjectsPreparer";
import { StageSkinService } from "./StageSkinService";
import { Skin } from "./rewind/Skin";
import { OsuReplay } from "../theater";

// https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md

function createCoreContainer() {
  const container = new Container();
  container.bind<AudioEngine>(AudioEngine).toSelf().inSingletonScope();
  container.bind<GameplayClock>(GameplayClock).toSelf().inSingletonScope();
  container.bind<PixiRendererService>(PixiRendererService).toSelf().inSingletonScope();
  container.bind<GameLoop>(GameLoop).toSelf().inSingletonScope();
  container.bind(TYPES.EVENT_EMITTER).toConstantValue(new EventEmitter());
  container.bind(TYPES.AUDIO_CONTEXT).toConstantValue(new AudioContext());
  return container;
}

interface RewindStageSettings {
  beatmap: Beatmap;
  replay: OsuReplay;
  skin: Skin;
  songUrl: string;
}

export function createRewindStage(settings: RewindStageSettings) {
  const container = createCoreContainer();

  const { beatmap, replay, skin, songUrl } = settings;
  container.bind(TYPES.BEATMAP).toConstantValue(beatmap);
  container.bind(TYPES.REPLAY).toConstantValue(replay);
  container.bind(TYPES.SONG_URL).toConstantValue(songUrl);
  container.bind(TYPES.THEATER_STAGE_PREPARER).to(GameStagePreparer);

  container.bind(BackgroundPreparer).toSelf();
  container.bind(PlayfieldBorderPreparer).toSelf();
  container.bind(PlayfieldPreparer).toSelf();
  container.bind(TextureManager).toSelf();

  container.bind(StageViewService).toSelf().inSingletonScope();
  container.bind(StageSkinService).toSelf().inSingletonScope();

  container.bind(HitObjectsPreparer).toSelf();

  // TODO: Setup listeners?
  // Maybe only return what we want to expose
  const eventEmitter = container.get<EventEmitter>(TYPES.EVENT_EMITTER);

  const audioEngine = container.get<AudioEngine>(AudioEngine);
  audioEngine.setupListeners(eventEmitter);

  const pixiRenderService = container.get<PixiRendererService>(PixiRendererService);
  const gameLoop = container.get<GameLoop>(GameLoop);
  const clock = container.get<GameplayClock>(GameplayClock);

  // Config
  const stageSkinService = container.get(StageSkinService);
  stageSkinService.setSkin(skin);

  const stageViewService = container.get(StageViewService);
  // stageViewService.changeView(...)

  return {
    clock,
    initializeRenderer: pixiRenderService.initializeRenderer.bind(pixiRenderService),
    initializeTicker: gameLoop.initializeTicker.bind(gameLoop),
    performanceMonitor: gameLoop.getPerformanceMonitor(),
    stageViewService,
  };
}

export type RewindStage = ReturnType<typeof createRewindStage>;

// In another application that uses another stage preparer ...
// container.bind(TYPES.THEATER_STAGE_PREPARER).toService(BadApplePreparer);
