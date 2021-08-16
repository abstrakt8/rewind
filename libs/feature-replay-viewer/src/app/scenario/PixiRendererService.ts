import * as PIXI from "pixi.js";

/**
 * Because we will use the canvas that is initialized at a later point of time we need need a "service".
 */
export class PixiRendererService {
  // RendererPreferenceSettingsService to get preferences
  private renderer?: PIXI.Renderer;
  private canvas?: HTMLCanvasElement;

  constructor() {}

  initializeRenderer(canvas: HTMLCanvasElement) {
    // Destroy old renderer
    this.renderer = new PIXI.Renderer({ view: canvas, antialias: true });
    this.canvas = canvas;

    return () => this.renderer?.destroy();
  }

  getRenderer(): PIXI.Renderer | undefined {
    return this.renderer;
  }

  // fps, antialias , should be reconsidered
  onRendererSettingsChange() {}
}
