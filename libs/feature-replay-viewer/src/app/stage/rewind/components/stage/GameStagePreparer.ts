import * as PIXI from "pixi.js";
import { BackgroundPreparer } from "../background/BackgroundPreparer";
import { injectable } from "inversify";
import { TheaterStagePreparer } from "../../../core/TheaterStagePreparer";

@injectable()
export class GameStagePreparer implements TheaterStagePreparer {
  private readonly stage: PIXI.Container;

  constructor(private backgroundPreparer: BackgroundPreparer) {
    this.stage = new PIXI.Container();
    this.stage.addChild(backgroundPreparer.getSprite());
  }

  prepare() {
    this.backgroundPreparer.prepare();
    return this.stage;
  }

  // Resize ?
}
