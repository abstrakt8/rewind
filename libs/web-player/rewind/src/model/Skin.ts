import { rgbToInt } from "@rewind/osu/math";
import { Texture } from "@pixi/core";
import {
  comboDigitFonts,
  defaultDigitFonts,
  generateDefaultSkinConfig,
  hitCircleDigitFonts,
  OsuSkinTextures,
  SkinConfig,
} from "@rewind/osu/skin";

export type SkinTexturesByKey = Partial<Record<OsuSkinTextures, Texture[]>>;

// Read
// https://github.com/pixijs/pixi.js/blob/dev/packages/loaders/src/TextureLoader.ts
export interface ISkin {
  config: SkinConfig;

  getComboColorForIndex(i: number): number;

  getTexture(key: OsuSkinTextures): Texture;

  getTextures(key: OsuSkinTextures): Texture[];

  getHitCircleNumberTextures(): Texture[];

  getComboNumberTextures(): Texture[];
}

export class EmptySkin implements ISkin {
  config = generateDefaultSkinConfig(false);

  getComboColorForIndex(): number {
    return 0;
  }

  getComboNumberTextures(): [] {
    return [];
  }

  getHitCircleNumberTextures(): Texture[] {
    return [];
  }

  getTexture() {
    return Texture.EMPTY;
  }

  getTextures(): Texture[] {
    return [Texture.EMPTY];
  }
}

/**
 * A simple skin that can provide the basic information a beatmap needs.
 */
export class Skin implements ISkin {
  static EMPTY = new Skin(generateDefaultSkinConfig(false), {});

  constructor(public readonly config: SkinConfig, public readonly textures: SkinTexturesByKey) {}

  getComboColorForIndex(i: number): number {
    const comboColors = this.config.colors.comboColors;
    return rgbToInt(comboColors[i % comboColors.length]);
  }

  getTexture(key: OsuSkinTextures): Texture {
    return this.getTextures(key)[0];
  }

  getTextures(key: OsuSkinTextures): Texture[] {
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
    return hitCircleDigitFonts.map((h) => this.getTexture(h));
  }

  getComboNumberTextures(): Texture[] {
    return comboDigitFonts.map((h) => this.getTexture(h));
  }

  // The textures that are used for every other numbers on the interface (except combo)
  getScoreTextures(): Texture[] {
    return defaultDigitFonts.map((h) => this.getTexture(h));
  }
}
