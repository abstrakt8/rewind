import { Texture } from "pixi.js";
import { injectable } from "inversify";

const RewindTextures = ["BACKGROUND"] as const;

export type RewindTextureId = typeof RewindTextures[number];

@injectable()
export class TextureManager {
  /**
   * @param textureId
   * @returns Texture.EMPTY in case it was not found
   */
  getTexture(textureId: RewindTextureId): Texture {
    return Texture.EMPTY;
  }
}
