import * as PIXI from "pixi.js";
import { autoDetectRenderer, Container, Ticker } from "pixi.js";
import { OsuSceneContainer } from "../pixi/OsuSceneContainer";
import { PerformanceMonitor } from "../utils/PerformanceMonitor";
import { SceneLoader } from "../game/Scene";

export class Theater {
  // TODO: ReplayViewerApp with splitted up renderer
  private canvas?: HTMLCanvasElement;
  private renderer?: PIXI.Renderer;
  private scene?: OsuSceneContainer;
  private performanceMonitor?: PerformanceMonitor; // Create one yourself
  // private ticker: Ticker;

  constructor(private ticker: Ticker, private sceneLoader: SceneLoader) {}

  tickHandler() {
    if (!this.renderer || !this.scene) return;
    this.performanceMonitor?.begin();
    this.resizeCanvasToDisplaySize();
    this.scene.prepare(this.sceneLoader());
    this.renderer.render(this.scene.stage);
    this.performanceMonitor?.end();
  }

  initializeRenderer(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new PIXI.Renderer({ view: canvas });
    this.scene = new OsuSceneContainer(this.renderer);
    this.ticker.add(this.tickHandler, this);
    // this.ticker.start();
  }

  destroy() {
    // TODO: Maybe even needs a recursive destroy ... we got cached slider images
    this.scene?.stage?.destroy();
    this.renderer?.destroy();
    this.ticker.remove(this.tickHandler, this);
  }

  private resizeCanvasToDisplaySize(): boolean {
    const canvas = this.canvas;
    if (!canvas) {
      return false;
    }
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // If it's resolution does not match change it
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      this.renderer?.resize(canvas.width, canvas.height);
      this.scene?.resizeTo(canvas.width, canvas.height);
      return true;
    }

    return false;
  }
}
