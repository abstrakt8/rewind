import { Container } from "inversify";
import { AnalysisApp } from "../apps/analysis/AnalysisApp";
import { PixiRendererManager } from "../renderers/PixiRendererManager";
import { GameplayClock } from "../core/game/GameplayClock";
import { STAGE_TYPES } from "../types/STAGE_TYPES";
import { EventEmitter2 } from "eventemitter2";
import { ModSettingsManager } from "../apps/analysis/manager/ModSettingsManager";
import { BeatmapManager } from "../apps/analysis/manager/BeatmapManager";
import { ReplayManager } from "../apps/analysis/manager/ReplayManager";
import { GameSimulator } from "../core/game/GameSimulator";
import { AnalysisSceneManager } from "../apps/analysis/manager/AnalysisSceneManager";
import { SceneManager } from "../core/scenes/SceneManager";
import { GameLoop } from "../core/game/GameLoop";
import { AnalysisScene } from "../apps/analysis/scenes/AnalysisScene";
import { BeatmapBackground } from "../renderers/components/background/BeatmapBackground";
import { TextureManager } from "../textures/TextureManager";
import { AnalysisStagePreparer } from "../renderers/components/stage/AnalysisStagePreparer";
import { ForegroundHUDPreparer } from "../renderers/components/hud/ForegroundHUDPreparer";
import { PlayfieldPreparer } from "../renderers/components/playfield/PlayfieldPreparer";
import { PlayfieldBorderPreparer } from "../renderers/components/playfield/PlayfieldBorderPreparer";
import { StageViewSettingsService } from "../apps/analysis/StageViewSettingsService";
import { HitObjectsPreparer } from "../renderers/components/playfield/HitObjectsPreparer";
import { HitCirclePreparer } from "../renderers/components/playfield/HitCirclePreparer";
import { SliderPreparer } from "../renderers/components/playfield/SliderPreparer";
import { SpinnerPreparer } from "../renderers/components/playfield/SpinnerPreparer";
import { SkinManager } from "../core/skins/SkinManager";
import { SliderTextureManager } from "../renderers/managers/SliderTextureManager";

/**
 * This is a Rewind specific creation of the "Analysis" app.
 */

// This is a Rewind specific creator of the analysis stage (not to be used outside of Rewind)
export function createAnalysisApp(rewindTheaterContainer: Container) {
  const container = new Container({ defaultScope: "Singleton" });
  container.parent = rewindTheaterContainer;
  container.bind(STAGE_TYPES.EVENT_EMITTER).toConstantValue(new EventEmitter2());

  container.bind(ReplayManager).toSelf().inSingletonScope();
  container.bind(BeatmapManager).toSelf().inSingletonScope();
  container.bind(ModSettingsManager).toSelf().inSingletonScope();
  container.bind(GameplayClock).toSelf().inSingletonScope();
  container.bind(GameSimulator).toSelf().inSingletonScope();
  container.bind(PixiRendererManager).toSelf().inSingletonScope();

  // Assets
  container.bind(TextureManager).toSelf().inSingletonScope();

  // Scenes
  container.bind(AnalysisSceneManager).toSelf().inSingletonScope();
  container.bind(SceneManager).toSelf().inSingletonScope();

  // Skin is given by above
  // container.bind(SkinManager).toSelf();

  // AnalysisScene
  container.bind(AnalysisScene).toSelf().inSingletonScope();

  // Sliders
  container.bind(SliderTextureManager).toSelf();

  container.bind(StageViewSettingsService).toSelf();
  container.bind(AnalysisStagePreparer).toSelf();
  {
    container.bind(BeatmapBackground).toSelf();
    container.bind(ForegroundHUDPreparer).toSelf();
    container.bind(PlayfieldPreparer).toSelf();
    {
      container.bind(PlayfieldBorderPreparer).toSelf();
      container.bind(HitObjectsPreparer).toSelf();
      container.bind(HitCirclePreparer).toSelf();
      container.bind(SliderPreparer).toSelf();
      container.bind(SpinnerPreparer).toSelf();
    }
  }

  // AnalysisScene

  container.bind(GameLoop).toSelf();
  container.bind(AnalysisApp).toSelf();

  return container.get(AnalysisApp);
}
