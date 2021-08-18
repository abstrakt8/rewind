import * as PIXI from "pixi.js";
import { PlayfieldBorderPreparer } from "./PlayfieldBorderPreparer";
import { injectable } from "inversify";
import { HitObjectsPreparer } from "./HitObjectsPreparer";
import { CursorPreparer } from "./CursorPreparer";

@injectable()
export class PlayfieldPreparer {
  private readonly container: PIXI.Container;
  private judgementLayer: PIXI.Container;

  constructor(
    private playfieldBorderPreparer: PlayfieldBorderPreparer,
    private hitObjectsPreparer: HitObjectsPreparer,
    private cursorPreparer: CursorPreparer,
  ) {
    this.container = new PIXI.Container();
    this.judgementLayer = new PIXI.Container();
    this.container.addChild(
      playfieldBorderPreparer.getGraphics(),
      this.hitObjectsPreparer.spinnerProxies,
      this.judgementLayer,
      this.hitObjectsPreparer.hitObjectContainer,
      this.hitObjectsPreparer.approachCircleContainer,
      this.cursorPreparer.getContainer(),
    );
  }

  getContainer() {
    return this.container;
  }

  prepare() {
    this.playfieldBorderPreparer.prepare();
    this.hitObjectsPreparer.prepare();
    this.cursorPreparer.prepare();
  }
}
