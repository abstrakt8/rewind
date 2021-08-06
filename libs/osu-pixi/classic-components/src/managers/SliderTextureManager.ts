import { BasicSliderTextureRenderer } from "../renderers/BasicSliderTextureRenderer";
import { Texture } from "pixi.js";
import { Position, RGB } from "@rewind/osu/math";

// Sliders use sprites and they need the corresponding textures.
// Usually here is where big optimizations can be made by batching the slider renderings and so on.
// Slider textures use insane amount of (GPU) memory, that's why we need to dispose those which are not needed.
// When there was no memory optimization, my GPU ran out of memory (4GB) after only 100 sliders (full screen
// 1920x1080).

type SliderTextureJob = {
  id: string;
  points: Position[];
  radius: number;
  borderColor: RGB;
  resolution: number;
};

export class SliderTextureManager {
  renderer: BasicSliderTextureRenderer;
  textures: Map<string, Texture>;

  constructor(renderer: BasicSliderTextureRenderer) {
    this.renderer = renderer;
  }

  getTexture(settings: SliderTextureJob): Texture {
    const { id, points, radius, borderColor, resolution } = settings;
    if (this.textures.has(id)) {
      return this.textures.get(id);
    }
    const renderTexture = this.renderer.render({
      // The first point of .calculatedPath will be the head and also have the value (0, 0)
      // The other points are relative positions to the head = (0, 0).
      path: points,
      radius,
      resolution,
      borderColor,
    });
    this.textures.set(id, renderTexture);
    return renderTexture;
    // We shift the sprite so that the pivot of this container correspond to the
    // slider head of the texture.
    // const { minX, minY } = getBoundsFromSliderPath(points, radius);
    // sprite.position.set(minX, minY);
  }

  removeFromCache(id: string) {
    if (this.textures.has(id)) {
      this.textures.get(id).destroy();
      this.textures.delete(id);
    }
  }
}
