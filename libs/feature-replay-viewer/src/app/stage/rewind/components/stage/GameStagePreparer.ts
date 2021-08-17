import * as PIXI from "pixi.js";
import { BackgroundPreparer } from "../background/BackgroundPreparer";
import { injectable } from "inversify";
import { TheaterStagePreparer } from "../../../core/TheaterStagePreparer";
import { PlayfieldPreparer } from "../playfield/PlayfieldPreparer";

@injectable()
export class GameStagePreparer implements TheaterStagePreparer {
  private readonly stage: PIXI.Container;

  constructor(private backgroundPreparer: BackgroundPreparer, private playfieldPreparer: PlayfieldPreparer) {
    this.stage = new PIXI.Container();
    this.stage.addChild(backgroundPreparer.getSprite(), playfieldPreparer.getContainer());
  }

  prepare() {
    this.backgroundPreparer.prepare();
    this.playfieldPreparer.prepare();
    return this.stage;
  }
  // Resize ?
}
