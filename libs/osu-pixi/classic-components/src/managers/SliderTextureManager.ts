import { BasicSliderTextureRenderer, getBoundsFromSliderPath } from "../renderers/BasicSliderTextureRenderer";
import { Sprite } from "pixi.js";
import { Position } from "@rewind/osu/math";
import { RGB } from "@rewind/osu/math";

// Sliders use sprites and they need the corresponding textures.
// Usually here is where big optimizations can be made by batching the slider renderings and so on.
// Slider textures use insane amount of (GPU) memory, that's why we need to dispose those which are not needed.
// When there was no memory optimization, my GPU ran out of memory (4GB) after only 100 sliders (full screen
// 1920x1080).

type SliderTextureJob = {
  // Please assign it to this sprite after you are done
  sprite: Sprite;
  points: Position[];
  radius: number;
  borderColor: RGB;
};

export class SliderTextureManager {
  renderer: BasicSliderTextureRenderer;
  jobs: SliderTextureJob[];
  resolution: number;

  constructor(renderer: BasicSliderTextureRenderer, resolution: number) {
    this.renderer = renderer;
    this.resolution = resolution;
    this.jobs = [];
  }

  // Needs to be done every frame otherwise we will assume that the slider does not need the texture anymore.
  registerJob(job: SliderTextureJob): void {
    this.jobs.push(job);
  }

  processJob(job: SliderTextureJob): void {
    const { points, radius, sprite, borderColor } = job;
    if (sprite.texture.valid) {
      sprite.texture.destroy(true);
      console.warn("It's better to destroy the sprite texture that you don't need yourself");
    }
    sprite.texture = this.renderer.render({
      // The first point of .calculatedPath will be the head and also have the value (0, 0)
      // The other points are relative positions to the head = (0, 0).
      path: points,
      radius,
      resolution: this.resolution,
      borderColor,
    });
    // We shift the sprite so that the pivot of this container correspond to the
    // slider head of the texture.
    const { minX, minY } = getBoundsFromSliderPath(points, radius);
    sprite.position.set(minX, minY);
  }

  processJobs(): void {
    this.jobs.forEach((j) => this.processJob(j));
    this.jobs = [];
  }
}
