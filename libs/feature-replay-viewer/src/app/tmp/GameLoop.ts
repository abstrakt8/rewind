import * as PIXI from "pixi.js";
import { GameplayClock } from "./GameplayClock";
import { PixiRendererService } from "./PixiRendererService";
import { TheaterStagePreparer } from "./TheaterStagePreparer";
import { injectable } from "inversify";

// Game loop does not have to stop if the game clock is paused
// For example we could still toggle hidden on/off and it needs to apply the changes.
// However, it should be paused, if the view is destroyed, browser was not focused and so on...
// Default behavior is to stop the game loop in case of window.blur because usually the player does not want to
@injectable()
export class GameLoop {
  constructor(
    private ticker: PIXI.Ticker,
    private gameClock: GameplayClock,
    private pixiRendererService: PixiRendererService,
    private theaterStagePreparer: TheaterStagePreparer,
  ) {}

  setupListeners() {
    // window.addEventListener("blur", this.onWindowBlur.bind(this));
    // window.addEventListener("focus", this.onWindowFocus.bind(this));
  }

  tickHandler() {
    this.gameClock.tick();

    const renderer = this.pixiRendererService.getRenderer();
    if (renderer === undefined) {
      return;
    }

    const stage = this.theaterStagePreparer.prepare();
    renderer.render(stage);
  }

  onWindowBlur() {
    // this.gameClock.stop();
    this.ticker.stop();
  }

  onWindowFocus() {
    this.ticker.start();
  }
}
