// Usually if there is no replay loaded
// Just show a text
// In the future -> show a cool looking logo

import { UserScene } from "../../common/scenes/IScene";
import { Container } from "pixi.js";
import { injectable } from "inversify";

@injectable()
export class IdleScene implements UserScene {
  stage = new Container();

  destroy(): void {
    this.stage.destroy();
  }

  init(data: string): void {}

  async preload(): Promise<void> {
    // Do nothing
  }

  update(): void {
    // Do nothing
  }

  create(): void {
    this.stage = new Container();
    // const text = new Text("Load a beatmap/replay to get started!", {
    //   fontSize: 16,
    //   fill: 0xeeeeee,
    //   fontFamily: "Arial",
    //   align: "left",
    // });
    // // Maybe center it somewhere
    // this.stage.addChild(text);
  }
}
