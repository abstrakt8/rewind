import * as PIXI from "pixi.js";
import { GameplayClock } from "./GameplayClock";
import { PixiRendererManager } from "../../renderers/PixiRendererManager";
import { injectable, postConstruct } from "inversify";
import { SceneManager } from "../scenes/SceneManager";
import MrDoobStats from "stats.js";

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
  private readonly performanceMonitor: MrDoobStats;

  constructor(
    private gameClock: GameplayClock, // Maybe also inject?
    private sceneManager: SceneManager,
    private pixiRendererService: PixiRendererManager,
  ) {
    this.ticker = new PIXI.Ticker();
    this.performanceMonitor = defaultMonitor();
  }

  stats() {
    return this.performanceMonitor.dom;
  }

  @postConstruct()
  initializeTicker() {
    this.ticker.add(this.tickHandler.bind(this));
  }

  startTicker() {
    this.ticker.start();
  }

  stopTicker() {
    this.ticker.stop();
  }

  destroy() {
    this.ticker.destroy();
  }

  private update(deltaTimeMs: number) {
    this.sceneManager.update(deltaTimeMs);
  }

  private render() {
    const renderer = this.pixiRendererService.getRenderer();
    if (renderer) {
      this.pixiRendererService.resizeCanvasToDisplaySize();
      renderer.render(this.sceneManager.createStage());
    }
  }

  // deltaTimeMs will be given by PixiTicker
  tickHandler(deltaTimeMs: number) {
    // Maybe we can measure the `.update()` and the `.render()` independently
    // console.debug(`Updating with timeDelta=${deltaTimeMs}ms`);
    this.performanceMonitor.begin();
    this.update(deltaTimeMs);
    this.render();
    this.performanceMonitor.end();
  }
}
