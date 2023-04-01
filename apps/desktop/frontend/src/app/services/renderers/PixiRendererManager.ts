import * as PIXI from "pixi.js";
import { injectable } from "inversify";

@injectable()
export class PixiRendererManager {
  // RendererPreferenceSettingsService to get preferences
  private renderer?: PIXI.Renderer;
  private canvas?: HTMLCanvasElement;

  initializeRenderer(canvas: HTMLCanvasElement) {
    // Destroy old renderer
    this.canvas = canvas;
    this.renderer = new PIXI.Renderer({ view: canvas, antialias: true });
    this.resizeCanvasToDisplaySize();
  }

  // https://webgl2fundamentals.org/webgl/lessons/webgl-anti-patterns.html
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
  resizeCanvasToDisplaySize() {
    const canvas = this.canvas;
    if (!canvas || !this.renderer) {
      return false;
    }
    // If it's resolution does not match change it
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      // canvas.width/height will be set by renderer.resize()
      this.renderer.resize(canvas.clientWidth, canvas.clientHeight);
      console.log(`Canvas dimensions have been set to ${canvas.width} x ${canvas.height}`);
      return true;
    }
    return false;
  }

  destroy() {
    this.renderer?.clear();
    this.renderer?.destroy();
    this.renderer = undefined;
  }

  getRenderer(): PIXI.Renderer | undefined {
    return this.renderer;
  }
}
