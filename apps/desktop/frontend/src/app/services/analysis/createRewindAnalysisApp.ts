import { Container } from "inversify";
import { AnalysisApp } from "./AnalysisApp";
import { PixiRendererManager } from "../renderers/PixiRendererManager";
import { GameplayClock } from "../common/game/GameplayClock";
import { EventEmitter2 } from "eventemitter2";
import { BeatmapManager } from "../manager/BeatmapManager";
import { ReplayManager } from "../manager/ReplayManager";
import { GameSimulator } from "../common/game/GameSimulator";
import { AnalysisSceneManager } from "../manager/AnalysisSceneManager";
import { SceneManager } from "../common/scenes/SceneManager";
import { GameLoop } from "../common/game/GameLoop";
import { AnalysisScene } from "./scenes/AnalysisScene";
import { BeatmapBackgroundFactory } from "../renderers/components/background/BeatmapBackground";
import { TextureManager } from "../textures/TextureManager";
import { AnalysisStage } from "../renderers/components/stage/AnalysisStage";
import { ForegroundHUDPreparer } from "../renderers/components/hud/ForegroundHUDPreparer";
import { PlayfieldFactory } from "../renderers/components/playfield/PlayfieldFactory";
import { PlayfieldBorderFactory } from "../renderers/components/playfield/PlayfieldBorderFactory";
import { HitObjectsContainerFactory } from "../renderers/components/playfield/HitObjectsContainerFactory";
import { HitCircleFactory } from "../renderers/components/playfield/HitCircleFactory";
import { SliderFactory } from "../renderers/components/playfield/SliderFactory";
import { SpinnerFactory } from "../renderers/components/playfield/SpinnerFactory";
import { SliderTextureManager } from "../renderers/components/sliders/SliderTextureManager";
import { CursorPreparer } from "../renderers/components/playfield/CursorPreparer";
import { JudgementPreparer } from "../renderers/components/playfield/JudgementPreparer";
import { AudioEngine } from "../common/audio/AudioEngine";
import { ScenarioManager } from "../manager/ScenarioManager";
import { ReplayWatcher } from "../common/local/ReplayWatcher";
import { ClipRecorder } from "../manager/ClipRecorder";
import { IdleScene } from "./scenes/IdleScene";
import { KeyPressWithNoteSheetPreparer } from "../renderers/components/keypresses/KeyPressOverlay";
import { ModSettingsService } from "./mod-settings";
import { ScreenshotTaker } from "./screenshot";
import { STAGE_TYPES } from "../types";

/**
 * This is a Rewind specific constructor of the "Analysis" tool (not to be used outside of Rewind).
 *
 * Reason is that many "Rewind" tools share the same services in order to provide smoother experiences.
 *
 * Example: If I use the "Cutter" tool then I want to use the same preferred skin that is used across Rewind.
 *
 * The analysis tool can be used as a standalone app though.
 */
export function createRewindAnalysisApp(commonContainer: Container) {
  const container = new Container({ defaultScope: "Singleton" });
  container.parent = commonContainer;
  container.bind(STAGE_TYPES.EVENT_EMITTER).toConstantValue(new EventEmitter2());

  container.bind(ReplayManager).toSelf();
  container.bind(BeatmapManager).toSelf();
  container.bind(GameplayClock).toSelf();
  container.bind(ScenarioManager).toSelf();
  container.bind(ModSettingsService).toSelf();
  container.bind(GameSimulator).toSelf();
  container.bind(PixiRendererManager).toSelf();

  // Plugins ?
  container.bind(ScreenshotTaker).toSelf();
  container.bind(ClipRecorder).toSelf();
  container.bind(ReplayWatcher).toSelf();

  // Assets
  container.bind(TextureManager).toSelf();
  container.bind(AudioEngine).toSelf();

  // Scenes
  container.bind(AnalysisSceneManager).toSelf();
  container.bind(SceneManager).toSelf();

  // Skin is given by above
  // container.bind(SkinManager).toSelf();

  // AnalysisScenes
  container.bind(AnalysisScene).toSelf();
  container.bind(IdleScene).toSelf();

  // Sliders
  container.bind(SliderTextureManager).toSelf();

  container.bind(AnalysisStage).toSelf();
  {
    container.bind(BeatmapBackgroundFactory).toSelf();
    container.bind(ForegroundHUDPreparer).toSelf();
    container.bind(KeyPressWithNoteSheetPreparer).toSelf();
    container.bind(PlayfieldFactory).toSelf();
    {
      container.bind(PlayfieldBorderFactory).toSelf();
      container.bind(HitObjectsContainerFactory).toSelf();
      container.bind(HitCircleFactory).toSelf();
      container.bind(SliderFactory).toSelf();
      container.bind(SpinnerFactory).toSelf();

      container.bind(CursorPreparer).toSelf();
      container.bind(JudgementPreparer).toSelf();
    }
  }

  container.bind(GameLoop).toSelf();

  container.bind(AnalysisApp).toSelf();
  return container.get(AnalysisApp);
}
