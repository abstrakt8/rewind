import * as PIXI from "pixi.js";
import { SceneLoader } from "../game/Scene";
import { OsuSceneContainer } from "./OsuSceneContainer";

interface ReplayViewerOptions {
  antialias: boolean;
  maxFPS: number;
}

const UNLIMITED_FPS = 0;
const defaultOptions: ReplayViewerOptions = {
  antialias: false,
  maxFPS: UNLIMITED_FPS,
};

/**
 * The scene loader
 */
export class ReplayViewerApp {
  public app: PIXI.Application;

  // private performanceMonitor: PerformanceMonitor; // Create one yourself
  private scene: OsuSceneContainer;

  constructor(
    private readonly view: HTMLCanvasElement,
    private readonly sceneLoader: SceneLoader,
    options?: Partial<{ antialias: boolean; maxFPS: number }>,
  ) {
    const { antialias, maxFPS } = { ...defaultOptions, ...options };
    this.app = new PIXI.Application({ view, antialias });

    // I think it would be better to just replace stage with this.scene at this point
    this.scene = new OsuSceneContainer(this.app.renderer as PIXI.Renderer);
    this.app.stage.addChild(this.scene.stage);

    // TODO: Needed?
    this.app.stage.interactive = false;
    this.app.stage.interactiveChildren = false;

    // Ticker
    this.app.ticker.maxFPS = maxFPS;

    const tickHandler = () => {
      // this.performanceMonitor?.begin();
      this.resizeCanvasToDisplaySize();
      this.scene.prepare(sceneLoader());
      this.app.renderer.render(this.app.stage);
      // this.performanceMonitor?.end();
    };
    this.app.ticker.add(tickHandler);
    this.app.ticker.start();
  }

  public destroy() {
    console.log("Gonna destroy the app");
    this.app.ticker.stop();
    this.app.destroy();
  }

  private resizeCanvasToDisplaySize(): boolean {
    const canvas = this.view;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // If it's resolution does not match change it
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      this.app.renderer.resize(canvas.width, canvas.height);
      this.scene.resizeTo(canvas.width, canvas.height);
      return true;
    }

    return false;
  }
}

// As a small optimization to prevent the "mouseover" events from being fired.
// https://github.com/pixijs/pixijs/issues/5625#issuecomment-487946766
// const interactionDOMElement = this.app.renderer.plugins.interaction.interactionDOMElement;
// this.app.renderer.plugins.interaction.removeEvents();
// this.app.renderer.plugins.interaction.supportsPointerEvents = false;
// this.app.renderer.plugins.interaction.setTargetElement(interactionDOMElement);
