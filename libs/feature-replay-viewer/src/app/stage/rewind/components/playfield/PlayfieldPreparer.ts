import * as PIXI from "pixi.js";
import { PlayfieldBorderPreparer } from "./PlayfieldBorderPreparer";
import { injectable } from "inversify";
import { HitObjectsPreparer } from "./HitObjectsPreparer";

@injectable()
export class PlayfieldPreparer {
  private readonly container: PIXI.Container;
  private judgementLayer: PIXI.Container;

  constructor(
    private playfieldBorderPreparer: PlayfieldBorderPreparer,
    private hitObjectsPreparer: HitObjectsPreparer,
  ) {
    this.container = new PIXI.Container();
    this.judgementLayer = new PIXI.Container();
    this.container.addChild(
      playfieldBorderPreparer.getGraphics(),
      this.hitObjectsPreparer.spinnerProxies,
      this.judgementLayer,
      this.hitObjectsPreparer.hitObjectContainer,
      this.hitObjectsPreparer.approachCircleContainer,
      /// cursorContainer
    );
  }

  getContainer() {
    return this.container;
  }

  prepare() {
    this.playfieldBorderPreparer.prepare();
    this.hitObjectsPreparer.prepare();
  }
}
