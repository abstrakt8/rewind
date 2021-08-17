import * as PIXI from "pixi.js";
import { PlayfieldBorderPreparer } from "../border/PlayfieldBorderPreparer";
import { injectable } from "inversify";

@injectable()
export class PlayfieldPreparer {
  private readonly container: PIXI.Container;

  constructor(private playfieldBorderPreparer: PlayfieldBorderPreparer) {
    this.container = new PIXI.Container();
    this.container.addChild(playfieldBorderPreparer.getGraphics());
  }

  getContainer() {
    return this.container;
  }

  prepare() {
    this.playfieldBorderPreparer.prepare();
  }
}
