import { Container } from "inversify";
import { EventEmitter } from "./events";
import { AudioEngine } from "./audio/AudioEngine";
import { GameplayClock } from "./game/GameplayClock";
import { STAGE_TYPES } from "./types/STAGE_TYPES";
import { GameStagePreparer } from "./renderers/components/stage/GameStagePreparer";
import { BackgroundPreparer } from "./renderers/components/background/BackgroundPreparer";
import { Beatmap } from "@rewind/osu/core";
import { PixiRendererService } from "./renderers/PixiRendererService";
import { GameLoop } from "./game/GameLoop";
import { PlayfieldBorderPreparer } from "./renderers/components/playfield/PlayfieldBorderPreparer";
import { PlayfieldPreparer } from "./renderers/components/playfield/PlayfieldPreparer";
import { RewindTextureId } from "./TextureManager";
import { StageViewSettingsService } from "./settings/StageViewSettingsService";
import { HitObjectsPreparer } from "./renderers/components/playfield/HitObjectsPreparer";
import { StageSkinService } from "./StageSkinService";
import { Skin } from "./model/Skin";
import { HitCirclePreparer } from "./renderers/components/playfield/HitCirclePreparer";
import { SliderTextureService } from "./renderers/managers/SliderTextureService";
import { SliderPreparer } from "./renderers/components/playfield/SliderPreparer";
import { ForegroundHUDPreparer } from "./renderers/components/hud/ForegroundHUDPreparer";
import { GameSimulator } from "./game/GameSimulator";
import { CursorPreparer } from "./renderers/components/playfield/CursorPreparer";
import { JudgementPreparer } from "./renderers/components/playfield/JudgementPreparer";
import { Texture } from "pixi.js";
import { SpinnerPreparer } from "./renderers/components/playfield/SpinnerPreparer";
import { ViewSettings } from "./model/ViewSettings";
import { OsuReplay } from "./model/OsuReplay";
import { AudioSettingsService } from "./settings/AudioSettingsService";

// https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md

/**
 * This is the main application / entrypoint to the RewindStage.
 * The theater is just a "helper" to create various other stage types.
 */

interface RewindStageSettings {
  beatmap: Beatmap;
  replay: OsuReplay;
  skin: Skin;
  songUrl: string;
  textureMap: Map<RewindTextureId, Texture>;
  initialView: ViewSettings;
  initialSpeed: number;
}

export function createRewindStage(settings: RewindStageSettings) {
  const { beatmap, replay, skin, songUrl, textureMap, initialView, initialSpeed } = settings;

  const container = new Container();

  container.bind(STAGE_TYPES.EVENT_EMITTER).toConstantValue(new EventEmitter());
  container.bind(STAGE_TYPES.BEATMAP).toConstantValue(beatmap);
  container.bind(STAGE_TYPES.REPLAY).toConstantValue(replay);
  container.bind(STAGE_TYPES.SONG_URL).toConstantValue(songUrl);
  container.bind(STAGE_TYPES.TEXTURE_MAP).toConstantValue(textureMap);
  container.bind(STAGE_TYPES.INITIAL_VIEW_SETTINGS).toConstantValue(initialView);

  // Maybe pass this down since there should only be one?
  container.bind(STAGE_TYPES.AUDIO_CONTEXT).toConstantValue(new AudioContext());

  container.bind(STAGE_TYPES.THEATER_STAGE_PREPARER).to(GameStagePreparer);

  container.bind(AudioSettingsService).toSelf().inSingletonScope();
  container.bind(StageViewSettingsService).toSelf().inSingletonScope();
  container.bind(StageSkinService).toSelf().inSingletonScope();

  container.bind(AudioEngine).toSelf().inSingletonScope();
  container.bind(GameplayClock).toSelf().inSingletonScope();
  container.bind(PixiRendererService).toSelf().inSingletonScope();
  container.bind(GameLoop).toSelf().inSingletonScope();
  container.bind(GameSimulator).toSelf().inSingletonScope();

  container.bind(BackgroundPreparer).toSelf();
  container.bind(PlayfieldBorderPreparer).toSelf();
  container.bind(ForegroundHUDPreparer).toSelf();
  container.bind(PlayfieldPreparer).toSelf();

  container.bind(HitObjectsPreparer).toSelf();
  container.bind(HitCirclePreparer).toSelf();
  container.bind(SliderPreparer).toSelf();
  container.bind(SpinnerPreparer).toSelf();
  container.bind(SliderTextureService).toSelf();
  container.bind(CursorPreparer).toSelf();
  container.bind(JudgementPreparer).toSelf();

  const audioEngine = container.get<AudioEngine>(AudioEngine);
  // audioEngine.setupListeners(eventEmitter);

  const pixiRenderService = container.get<PixiRendererService>(PixiRendererService);
  const gameLoop = container.get<GameLoop>(GameLoop);

  // TODO: Maybe set the speed after loading the song
  audioEngine.loadSong(songUrl);

  // Clock config
  const clock = container.get<GameplayClock>(GameplayClock);
  clock.setSpeed(initialSpeed);

  // // If for some reason the meta data got loaded really fast then set it here
  // if (!isNaN(audioEngine.song?.mediaElement.duration ?? NaN)) {
  //   clock.setDuration(audioEngine.song.mediaElement.duration * 1000);
  // }
  audioEngine.song?.mediaElement.addEventListener("loadedmetadata", () => {
    clock.setDuration((audioEngine.song?.mediaElement.duration ?? 0) * 1000);
  });

  // Config
  const stageSkinService = container.get(StageSkinService);
  stageSkinService.setSkin(skin);

  const stageViewService = container.get(StageViewSettingsService);
  const gameSimulator = container.get(GameSimulator);
  const audioSettingsService = container.get(AudioSettingsService);

  // stageViewService.changeView(...)

  function destroy() {
    console.log(`Going to destroy the stage with replay = ${replay.md5hash}`);
    gameLoop.destroy();
    audioEngine.destroy();
  }

  return {
    audioSettingsService,
    destroy,
    clock,
    initializeRenderer: pixiRenderService.initializeRenderer.bind(pixiRenderService),

    initializeTicker: gameLoop.initializeTicker.bind(gameLoop),
    startTicker: gameLoop.startTicker.bind(gameLoop),
    stopTicker: gameLoop.stopTicker.bind(gameLoop),

    performanceMonitor: gameLoop.getPerformanceMonitor(),
    gameSimulator,
    stageViewService,
  };
}

export type RewindStage = ReturnType<typeof createRewindStage>;

// In another application that uses another stage preparer ...
// container.bind(TYPES.THEATER_STAGE_PREPARER).toService(BadApplePreparer);
