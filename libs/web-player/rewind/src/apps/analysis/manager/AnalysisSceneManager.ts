import { SceneManager } from "../../../core/scenes/SceneManager";
import { injectable } from "inversify";
import { AnalysisScene } from "../scenes/AnalysisScene";

enum Scenes {
  IDLE = "idle",
  LOADING = "loading",
  ANALYSIS = "analysis",
}

@injectable()
export class AnalysisSceneManager {
  constructor(private readonly sceneManager: SceneManager, private readonly analysisScene: AnalysisScene) {
    sceneManager.add(analysisScene, Scenes.ANALYSIS);
  }

  async startAnalysisScene() {
    const scene = this.sceneManager.sceneByKey(Scenes.ANALYSIS);
    if (!scene) return;
    return this.sceneManager.start(scene, undefined);
  }

  changeToLoadingScene() {
    // this.sceneManager.changeTo(Scenes.LOADING);
  }
}
