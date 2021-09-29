import * as PIXI from "pixi.js";
import { PlayfieldBorderFactory } from "./PlayfieldBorderFactory";
import { injectable } from "inversify";
import { HitObjectsContainer, HitObjectsContainerFactory } from "./HitObjectsContainerFactory";
import { CursorPreparer } from "./CursorPreparer";
import { JudgementPreparer } from "./JudgementPreparer";
import { PlayfieldBorder } from "@rewind/osu-pixi/classic-components";

export class Playfield {
  public readonly container: PIXI.Container;

  constructor(
    private readonly playfieldBorder: PlayfieldBorder,
    private readonly hitObjectsContainer: HitObjectsContainer,
    private cursorPreparer: CursorPreparer,
    private judgementPreparer: JudgementPreparer,
  ) {
    this.container = new PIXI.Container();
    this.container.addChild(
      this.playfieldBorder.graphics,
      this.hitObjectsContainer.spinnerProxies,
      this.judgementPreparer.getContainer(),
      this.hitObjectsContainer.hitObjectContainer,
      this.hitObjectsContainer.approachCircleContainer,
      this.cursorPreparer.getContainer(),
    );
  }

  update() {
    // playfieldBorder is push-based, therefore no .update()
    this.hitObjectsContainer.update();
    this.cursorPreparer.update();
    this.judgementPreparer.update();
  }
}

@injectable()
export class PlayfieldFactory {
  constructor(
    private playfieldBorderFactory: PlayfieldBorderFactory,
    private hitObjectsContainerFactory: HitObjectsContainerFactory,
    private cursorPreparer: CursorPreparer,
    private judgementPreparer: JudgementPreparer,
  ) {}

  createPlayfield() {
    return new Playfield(
      this.playfieldBorderFactory.createPlayfieldBorder(),
      this.hitObjectsContainerFactory.createHitObjectsContainer(),
      this.cursorPreparer,
      this.judgementPreparer,
    );
  }
}
