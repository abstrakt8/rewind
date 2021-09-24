import * as PIXI from "pixi.js";
import { injectable } from "inversify";

/**
 * Because we will use the canvas that is initialized at a later point of time we need need a "service".
 */
@injectable()
export class PixiRendererManager {
  // RendererPreferenceSettingsService to get preferences
  private renderer?: PIXI.Renderer;
  private canvas?: HTMLCanvasElement;

  initializeRenderer(canvas: HTMLCanvasElement) {
    // Destroy old renderer
    this.renderer = new PIXI.Renderer({ view: canvas, antialias: true });
    this.canvas = canvas;
  }

  resizeRendererToCanvasSize() {
    const canvas = this.canvas;
    if (!canvas || !this.renderer) {
      return;
    }
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // If it's resolution does not match change it
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      this.renderer.resize(canvas.width, canvas.height);
    }
  }

  destroy() {
    this.renderer?.destroy();
    this.renderer = undefined;
  }

  getRenderer(): PIXI.Renderer | undefined {
    return this.renderer;
  }

  // fps, antialias , should be reconsidered
  onRendererSettingsChange() {}
}
