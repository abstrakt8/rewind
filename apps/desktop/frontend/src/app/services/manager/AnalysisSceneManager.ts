import { SceneManager } from "../common/scenes/SceneManager";
import { injectable } from "inversify";
import { AnalysisScene } from "../analysis/scenes/AnalysisScene";
import { IdleScene } from "../analysis/scenes/IdleScene";
import { ManagedScene } from "../common/scenes/IScene";

export enum AnalysisSceneKeys {
  IDLE = "idle",
  LOADING = "loading",
  ANALYSIS = "analysis",
}

@injectable()
export class AnalysisSceneManager {
  currentScene?: ManagedScene;

  constructor(
    private readonly sceneManager: SceneManager,
    private readonly analysisScene: AnalysisScene,
    private readonly idleScene: IdleScene,
  ) {
    sceneManager.add(analysisScene, AnalysisSceneKeys.ANALYSIS);
    sceneManager.add(idleScene, AnalysisSceneKeys.IDLE);
  }

  async changeToScene(sceneKey: AnalysisSceneKeys, data?: any) {
    if (this.currentScene) {
      this.sceneManager.stop(this.currentScene);
    }
    const scene = this.sceneManager.sceneByKey(sceneKey);
    if (scene) {
      this.currentScene = scene;
      return this.sceneManager.start(scene, data);
    }
  }
}
