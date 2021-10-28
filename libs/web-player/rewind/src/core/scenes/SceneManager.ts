// Manages the scene
import { Container } from "pixi.js";
import { ManagedScene, UserScene } from "./IScene";
import { injectable } from "inversify";

@injectable()
export class SceneManager {
  managedScene: ManagedScene[] = [];

  add(scene: UserScene, key: string) {
    this.managedScene.push(new ManagedScene(scene, key));
  }

  async start(scene: ManagedScene, data: unknown) {
    console.log(`Starting the scene with the key='${scene.key}'`);
    scene.state = "INITIALIZING";
    scene.init(data);
    await scene.preload();
    scene.create();
    scene.state = "PLAYING";
  }

  stop(scene: ManagedScene) {
    scene.destroy();
    scene.state = "SLEEPING";
  }

  update(deltaTimeMs: number) {
    this.managedScene.forEach((scene) => scene.update(deltaTimeMs));
  }

  sceneByKey(key: string) {
    return this.managedScene.find((s) => s.key === key);
  }

  createStage() {
    const container = new Container();
    this.managedScene.forEach((scene) => {
      if (scene.state === "PLAYING" || scene.state === "PAUSED") {
        container.addChild(scene.stage);
      }
    });
    return container;
  }
}
