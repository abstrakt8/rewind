import { injectable } from "inversify";
import { AnalysisScene } from "../analysis/scenes/AnalysisScene";
import { PixiRendererManager } from "../renderers/PixiRendererManager";

@injectable()
export class ScreenshotTaker {
  constructor(private readonly analysisScene: AnalysisScene, private readonly pixiRenderer: PixiRendererManager) {}

  takeScreenshot() {
    const renderer = this.pixiRenderer.getRenderer();
    if (!renderer) return;

    const canvas: HTMLCanvasElement = renderer.plugins.extract.canvas(this.analysisScene.stage);
    canvas.toBlob(
      (blob) => {
        const a = document.createElement("a");
        a.download = `Rewind Screenshot ${new Date().toISOString()}.jpg`;
        a.href = URL.createObjectURL(blob);
        a.click();
        a.remove();
      },
      "image/jpeg",
      0.9,
    );
  }
}
