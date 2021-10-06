// Very simple loading scene that shows the progress of the loading
import { UserScene } from "../../../core/scenes/IScene";
import { Container, Text } from "pixi.js";

export class LoadingScene implements UserScene {
  stage: Container = new Container();

  destroy(): void {}

  init(): void {
    //
  }

  async preload(): Promise<void> {
    //
  }

  update(): void {
    //
  }

  create(): void {
    this.stage = new Container();

    const text = new Text("LoadingScene...", {
      fontSize: 16,
      fill: 0xeeeeee,
      fontFamily: "Arial",
      align: "left",
    });
    // Maybe center it somewhere
    this.stage.addChild(text);
  }
}
