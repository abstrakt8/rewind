import * as PIXI from "pixi.js";
import { autoDetectRenderer, Container, Ticker } from "pixi.js";
import { OsuSceneContainer } from "../pixi/OsuSceneContainer";
import { PerformanceMonitor } from "../utils/PerformanceMonitor";
import { SceneLoader } from "../game/Scene";
import { Scenario } from "./scenario";

export class Theater {
  // TODO: ReplayViewerApp with splitted up renderer
  private canvas?: HTMLCanvasElement;
  private renderer?: PIXI.Renderer;
  private scene?: OsuSceneContainer;
  private performanceMonitor?: PerformanceMonitor; // Create one yourself
  // private ticker: Ticker;
  private scenario?: Scenario;

  constructor(private ticker: Ticker) {}

  sceneLoader() {
    return this.scenario?.getCurrentScene();
  }

  tickHandler() {
    if (!this.renderer || !this.scene) return;
    this.performanceMonitor?.begin();
    this.resizeCanvasToDisplaySize();
    const scene = this.sceneLoader();
    if (scene) this.scene.prepare(scene);
    this.renderer.render(this.scene.stage);
    this.performanceMonitor?.end();
  }

  changeScenario(scenario: Scenario) {
    this.scenario = scenario;
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
