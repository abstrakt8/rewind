import * as PIXI from "pixi.js";

// Only one renderer whole application?
// Texture slider manager should use this service to render its textures
export class PixiRendererService {
  // RendererPreferenceSettingsService to get preferences
  private renderer?: PIXI.Renderer;

  constructor() {}

  initializeRenderer(view: HTMLCanvasElement) {
    // Destroy old renderer
    this.renderer = new PIXI.Renderer({ view, antialias: true });

    return () => this.renderer?.destroy();
  }

  getRenderer(): PIXI.Renderer | undefined {
    return this.renderer;
  }

  // fps, antialias , should be reconsidered
  onRendererSettingsChange() {}
}
