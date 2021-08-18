import { injectable } from "inversify";
import { Texture } from "pixi.js";

const RewindTextures = ["BACKGROUND"] as const;

export type RewindTextureId = typeof RewindTextures[number];

@injectable()
export class TextureManager {
  dict: Map<RewindTextureId, Texture> = new Map<RewindTextureId, Texture>();

  constructor() {
    // this.dict = new Map<RewindTextureId, Texture>();
  }

  /**
   * @param textureId
   * @returns Texture.EMPTY in case it was not found
   */
  getTexture(textureId: RewindTextureId): Texture {
    const texture = this.dict.get(textureId);
    return texture ?? Texture.EMPTY;
  }

  async loadTexture(textureId: RewindTextureId, url: string) {
    const texture = await Texture.fromURL(url);
    this.dict.set(textureId, texture);
  }
}
