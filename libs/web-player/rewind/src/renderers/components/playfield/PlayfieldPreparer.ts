import * as PIXI from "pixi.js";
import { PlayfieldBorderPreparer } from "./PlayfieldBorderPreparer";
import { injectable } from "inversify";
import { HitObjectsPreparer } from "./HitObjectsPreparer";
import { CursorPreparer } from "./CursorPreparer";
import { JudgementPreparer } from "./JudgementPreparer";

@injectable()
export class PlayfieldPreparer {
  private readonly container: PIXI.Container;

  constructor(
    private playfieldBorderPreparer: PlayfieldBorderPreparer,
    private hitObjectsPreparer: HitObjectsPreparer,
    private cursorPreparer: CursorPreparer,
    private judgementPreparer: JudgementPreparer,
  ) {
    this.container = new PIXI.Container();
    this.container.addChild(
      this.playfieldBorderPreparer.getGraphics(),
      this.hitObjectsPreparer.spinnerProxies,
      this.judgementPreparer.getContainer(),
      this.hitObjectsPreparer.hitObjectContainer,
      this.hitObjectsPreparer.approachCircleContainer,
      this.cursorPreparer.getContainer(),
    );
  }

  getContainer() {
    return this.container;
  }

  update() {
    this.playfieldBorderPreparer.update();
    this.hitObjectsPreparer.update();
    this.cursorPreparer.update();
    this.judgementPreparer.update();
  }
}
