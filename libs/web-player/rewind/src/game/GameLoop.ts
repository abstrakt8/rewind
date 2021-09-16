import * as PIXI from "pixi.js";
import { GameplayClock } from "./GameplayClock";
import { PixiRendererService } from "../renderers/PixiRendererService";
import type { TheaterStagePreparer } from "../model/TheaterStagePreparer";
import { inject, injectable } from "inversify";
import { STAGE_TYPES } from "../types/STAGE_TYPES";
import * as MrDoobStats from "stats.js";
import { GameSimulator } from "./GameSimulator";

function defaultMonitor() {
  const s = new MrDoobStats();
  s.dom.style.position = "absolute";
  s.dom.style.left = "0px";
  s.dom.style.top = "0px";
  s.dom.style.zIndex = "9000";
  // if (props.initialPanel !== undefined) s.showPanel(props.initialPanel);
  return s;
}

// Game loop does not have to stop if the game clock is paused.
// For example we could still toggle hidden on/off and need to see the changes on the canvas.
// However, it should be paused, if the view is destroyed or if the window was blurred ...
// Default behavior is to stop the game loop in case of window.blur because usually the player does not want to
// I think end game behavior would be to automatically stop the game loop if the user is playing osu!, which we
// could detect through some memory reader.
@injectable()
export class GameLoop {
  private ticker: PIXI.Ticker;
  private performanceMonitor: MrDoobStats;

  constructor(
    private gameClock: GameplayClock, // Maybe also inject?
    private gameSimulator: GameSimulator,
    private pixiRendererService: PixiRendererService,
    @inject(STAGE_TYPES.THEATER_STAGE_PREPARER) private theaterStagePreparer: TheaterStagePreparer,
  ) {
    this.ticker = new PIXI.Ticker();
    this.performanceMonitor = defaultMonitor();
  }

  setupListeners() {
    // If we are going to use those, then use page visibility API
    // window.addEventListener("blur", this.onWindowBlur.bind(this));
    // window.addEventListener("focus", this.onWindowFocus.bind(this));
  }

  initializeTicker() {
    this.ticker.add(this.tickHandler.bind(this));
    this.ticker.start(); // TODO: Remove probably
  }

  getPerformanceMonitor() {
    return this.performanceMonitor;
  }

  startTicker() {
    this.ticker.start();
  }
  stopTicker() {
    this.ticker.stop();
  }

  destroy() {
    // this.ticker.stop();
    this.performanceMonitor.dom.remove();
    this.ticker.destroy();
  }

  tickHandler() {
    this.performanceMonitor.begin();
    this.gameClock.tick();

    const renderer = this.pixiRendererService.getRenderer();
    if (renderer === undefined) {
      return;
    }

    // Maybe this should be in TheaterStagePreparer ?
    this.gameSimulator.simulate(this.gameClock.timeElapsedInMs);

    this.pixiRendererService.resizeRendererToCanvasSize();
    // TODO: Resizing
    // TODO: Audio sample queue
    const stage = this.theaterStagePreparer.prepare();
    renderer.render(stage);
    this.performanceMonitor.end();
  }
}
