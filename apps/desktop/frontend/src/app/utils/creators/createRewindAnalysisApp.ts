import { Container } from "inversify";
import { AnalysisApp } from "../../services/analysis/AnalysisApp";
import { PixiRendererManager } from "../../services/renderers/PixiRendererManager";
import { GameplayClock } from "../../services/common/game/GameplayClock";
import { STAGE_TYPES } from "../../services/types/STAGE_TYPES";
import { EventEmitter2 } from "eventemitter2";
import { BeatmapManager } from "../../services/manager/BeatmapManager";
import { ReplayManager } from "../../services/manager/ReplayManager";
import { GameSimulator } from "../../services/common/game/GameSimulator";
import { AnalysisSceneManager } from "../../services/manager/AnalysisSceneManager";
import { SceneManager } from "../../services/common/scenes/SceneManager";
import { GameLoop } from "../../services/common/game/GameLoop";
import { AnalysisScene } from "../../services/analysis/scenes/AnalysisScene";
import { BeatmapBackgroundFactory } from "../../services/renderers/components/background/BeatmapBackground";
import { TextureManager } from "../../services/textures/TextureManager";
import { AnalysisStage } from "../../services/renderers/components/stage/AnalysisStage";
import { ForegroundHUDPreparer } from "../../services/renderers/components/hud/ForegroundHUDPreparer";
import { PlayfieldFactory } from "../../services/renderers/components/playfield/PlayfieldFactory";
import { PlayfieldBorderFactory } from "../../services/renderers/components/playfield/PlayfieldBorderFactory";
import { HitObjectsContainerFactory } from "../../services/renderers/components/playfield/HitObjectsContainerFactory";
import { HitCircleFactory } from "../../services/renderers/components/playfield/HitCircleFactory";
import { SliderFactory } from "../../services/renderers/components/playfield/SliderFactory";
import { SpinnerFactory } from "../../services/renderers/components/playfield/SpinnerFactory";
import { SliderTextureManager } from "../../services/renderers/managers/SliderTextureManager";
import { CursorPreparer } from "../../services/renderers/components/playfield/CursorPreparer";
import { JudgementPreparer } from "../../services/renderers/components/playfield/JudgementPreparer";
import { AudioEngine } from "../../services/common/audio/AudioEngine";
import { ScenarioManager } from "../../services/manager/ScenarioManager";
import { ScreenshotTaker } from "../../services/manager/ScreenshotTaker";
import { ReplayWatcher } from "../../services/common/api/ReplayWatcher";
import { ClipRecorder } from "../../services/manager/ClipRecorder";
import { IdleScene } from "../../services/analysis/scenes/IdleScene";
import { KeyPressWithNoteSheetPreparer } from "../../services/renderers/components/keypresses/KeyPressOverlay";
import { ModSettingsService } from "../../services/analysis/mod-settings";

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
  container.bind(ReplayWatcher).toSelf(); // Listens to WebSocket

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
