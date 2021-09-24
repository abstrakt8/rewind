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
import { SliderTextureManager } from "../renderers/managers/SliderTextureManager";
import { CursorPreparer } from "../renderers/components/playfield/CursorPreparer";
import { JudgementPreparer } from "../renderers/components/playfield/JudgementPreparer";

/**
 * This is a Rewind specific constructor of the "Analysis" tool (not to be used outside of Rewind).
 *
 * Reason is that many "Rewind" tools share the same services in order to provide smoother experiences.
 *
 * Example: If I use the "Cutter" tool then I want to use the same preferred skin that is used across Rewind.
 *
 * The analysis tool can be used as a standalone app though.
 */
export function createRewindAnalysisApp(rewindTheaterContainer: Container) {
  const container = new Container({ defaultScope: "Singleton" });
  container.parent = rewindTheaterContainer;
  container.bind(STAGE_TYPES.EVENT_EMITTER).toConstantValue(new EventEmitter2());

  container.bind(ReplayManager).toSelf();
  container.bind(BeatmapManager).toSelf();
  container.bind(ModSettingsManager).toSelf();
  container.bind(GameplayClock).toSelf();
  container.bind(GameSimulator).toSelf();
  container.bind(PixiRendererManager).toSelf();

  // Assets
  container.bind(TextureManager).toSelf();

  // Scenes
  container.bind(AnalysisSceneManager).toSelf();
  container.bind(SceneManager).toSelf();

  // Skin is given by above
  // container.bind(SkinManager).toSelf();

  // AnalysisScene
  container.bind(AnalysisScene).toSelf();

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

      container.bind(CursorPreparer).toSelf();
      container.bind(JudgementPreparer).toSelf();
    }
  }

  container.bind(GameLoop).toSelf();

  container.bind(AnalysisApp).toSelf();
  return container.get(AnalysisApp);
}
