import { rgbToInt } from "osu-math";
import { Texture } from "@pixi/core";
import { getComboFontKeys, getDefaultSkinConfig, HIT_CIRCLE_FONT, SkinTextures } from "osu-skin";
import { SkinConfig } from "osu-skin";

export type SkinTexturesByKey = Partial<Record<SkinTextures, Texture[]>>;

// Read
// https://github.com/pixijs/pixi.js/blob/dev/packages/loaders/src/TextureLoader.ts
export interface ISkin {
  getComboColorForIndex(i: number): number;

  getTexture(key: SkinTextures): Texture;

  getTextures(key: SkinTextures): Texture[];

  getHitCircleNumberTextures(): Texture[];

  getComboNumberTextures(): Texture[];
}

/**
 * A simple skin that can provide the basic information a beatmap needs.
 */
export class Skin implements ISkin {
  static EMPTY = new Skin(getDefaultSkinConfig(false), {});

  constructor(public readonly config: SkinConfig, public readonly textures: SkinTexturesByKey) {}

  getComboColorForIndex(i: number): number {
    const comboColors = this.config.colors.comboColors;
    return rgbToInt(comboColors[i % comboColors.length]);
  }

  getTexture(key: SkinTextures): Texture {
    return this.getTextures(key)[0];
  }

  getTextures(key: SkinTextures): Texture[] {
    if (!(key in this.textures)) {
      return [Texture.EMPTY];
      // throw new Error("Texture key not found");
    }
    const list = this.textures[key] as Texture[];
    if (list.length === 0) {
      return [Texture.EMPTY];
    } else {
      return list;
    }
  }

  getHitCircleNumberTextures(): Texture[] {
    return HIT_CIRCLE_FONT.map((h) => this.getTexture(h));
  }

  // TODO
  getComboNumberTextures(): Texture[] {
    return getComboFontKeys().map((h) => this.getTexture(h));
  }
}
