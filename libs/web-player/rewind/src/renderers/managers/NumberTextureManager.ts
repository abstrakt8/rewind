// Renders the numbers fast as sprites

import { RenderTexture } from "pixi.js";

class NumberTextureManager {
  constructor() {}

  changeTextures() {
    const width = 30,
      height = 30,
      resolution = 1;
    const renderTexture = RenderTexture.create({ width, height, resolution });
  }

  getTexture(x: number) {
    // return from cached or calculate new
  }
}
