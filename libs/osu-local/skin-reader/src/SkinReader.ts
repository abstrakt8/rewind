// Chooses the correct texture file for the given one

import * as Path from "path";
import { promises as fs } from "fs";
import { DefaultTextureConfig, getComboFontKeys, SkinConfig, SkinTextures, HIT_CIRCLE_FONT } from "@rewind/osu/skin";

export type GetTextureFileOption = {
  hdIfExists?: boolean;
  animatedIfExists?: boolean;
  tryWithFallback?: boolean;
};

const join = Path.posix.join;

// If F is fallback skin for main skin S
// First check S/circle@2x.png then S/circle.png then F/circle@2x.png then F/circle.png.

export interface SkinReader {
  getTextureFiles(skinTexture: SkinTextures, option: GetTextureFileOption): Promise<string[]>;
}

export type OsuFileNameOptions = {
  useHD: boolean;
  extension: string;
  animationIndex?: number;
};

export type TextureFileLocation = {
  key: string;
  paths: string[];
};

const findHitCircleFontIndex = (skinTexture: SkinTextures): number => {
  return HIT_CIRCLE_FONT.indexOf(skinTexture);
};

const findComboFontIndex = (skinTexture: SkinTextures): number => {
  return getComboFontKeys().indexOf(skinTexture);
};

export class OsuLegacySkinReader implements SkinReader {
  folderPath: string;
  config: SkinConfig;
  fallbackSkin?: SkinReader;

  constructor(folderPath: string, config: SkinConfig, fallbackSkin?: SkinReader) {
    this.folderPath = folderPath;
    this.config = config;
    this.fallbackSkin = fallbackSkin;
  }

  // Special case for font textures since their `prefix` can be changed.
  // Best example would be WhiteCat 1.0 Skin where for example the combo prefix is `Assets\combo` -> even different folder
  getFontPrefix(skinTexture: SkinTextures): string | undefined {
    {
      const hitCircleId = findHitCircleFontIndex(skinTexture);
      if (hitCircleId !== -1) {
        // join will also convert / to \\ if it's in Windows.
        // This will be then Assets/combo/default0 for excample
        return join(`${this.config.fonts.hitCirclePrefix}-${hitCircleId}`);
      }
    }
    {
      const comboId = findComboFontIndex(skinTexture);
      if (comboId !== -1) {
        return join(`${this.config.fonts.comboPrefix}-${comboId}`);
      }
    }
    return undefined;
    // TODO: Score is also different
  }

  getPrefix(skinTexture: SkinTextures) {
    const fontPrefix = this.getFontPrefix(skinTexture);
    if (fontPrefix !== undefined) return fontPrefix;

    const texConfig = DefaultTextureConfig[skinTexture];
    if (!texConfig) {
      throw Error("what u doing");
    }
    // Maybe there is something with prefix in config in between (for numbers for example)
    // FilePrefix could be overridden by skin config
    return join(texConfig.filePrefix);
  }

  // No fallback, just straight up returns the filename
  getFilename(skinTexture: SkinTextures, opt: OsuFileNameOptions) {
    const { useHD, animationIndex, extension } = opt;
    const texConfig = DefaultTextureConfig[skinTexture];
    if (!texConfig) {
      throw Error("Config for given texture not found");
    }
    const { skipHyphen, animationFrameRate } = texConfig;
    let s = this.getPrefix(skinTexture);

    // Notice animationIndex can also be 0, so checking if(animationIndex) won't work.
    if (animationIndex !== undefined) {
      // small sanity check against the config
      if (animationFrameRate === undefined) throw Error("Don't use animationIndex for a non animatable texture");
      if (!skipHyphen) s += "-"; // There are some textures that don't use hyphen for animations such as sliderb0.png
      s += animationIndex;
    }
    if (useHD) {
      s += "@2x";
    }
    s += "." + extension;
    return s;
  }

  async checkForFileExistenceInFolder(fileName: string) {
    try {
      const file = await fs.stat(join(this.folderPath, fileName));
      // Technically we can also do more checks like: is it an image etc.
      return file.isFile();
    } catch (err) {
      return false;
    }
  }

  async checkForFirstAppearanceInFolder(fileNames: string[]) {
    // Goes one by one through the list and returns the first one that exists.
    for (const f of fileNames) {
      const exists = await this.checkForFileExistenceInFolder(f);
      if (exists) {
        return f;
      }
    }
    return null;
  }

  async checkForTextureWithFallback(skinTexture: SkinTextures, options: OsuFileNameOptions) {
    const filesToCheck = [this.getFilename(skinTexture, options)];
    if (options.useHD) filesToCheck.push(this.getFilename(skinTexture, { ...options, useHD: false }));
    return this.checkForFirstAppearanceInFolder(filesToCheck);
  }

  // We are not going to return the absolute path, just the relative path in the skin folder.
  async getTextureFiles(skinTexture: SkinTextures, option: GetTextureFileOption = {}): Promise<string[]> {
    const { animatedIfExists, hdIfExists } = option;
    const texConfig = DefaultTextureConfig[skinTexture];
    if (!texConfig) {
      throw Error("What you doing");
    }
    // TODO: I think only menu-background.jpg uses jpg.
    const extension = "png";

    const tryWithAnimation = animatedIfExists && texConfig.animationFrameRate !== undefined;
    if (tryWithAnimation) {
      // Check for 0, 1, 2, ...
      let animationIndex = 0;
      const files = [];
      // Can't be more than that right?
      while (animationIndex < 727) {
        const file = await this.checkForTextureWithFallback(skinTexture, {
          useHD: hdIfExists ?? false,
          extension: "png",
          animationIndex,
        });
        if (file === null) {
          break;
        }
        animationIndex += 1;
        files.push(file);
      }
      if (files.length > 0) return files;
      // Otherwise we fall back to non animated...
    }
    // Try with non-animated files
    const defaultFile = await this.checkForTextureWithFallback(skinTexture, {
      useHD: hdIfExists ?? false,
      extension,
    });
    if (defaultFile) {
      return [defaultFile];
    }
    // In the special case where we request no animation but there are only animated files (e.g. hit300k-0.png in
    // WhiteCat's skin)
    if (texConfig.animationFrameRate !== undefined) {
      const fallbackFirstAnimationFile = await this.checkForTextureWithFallback(skinTexture, {
        useHD: hdIfExists ?? false,
        extension,
        animationIndex: 0,
      });
      if (fallbackFirstAnimationFile) {
        return [fallbackFirstAnimationFile];
      }
    }

    // If here we find nothing, we go ask for fallback skin
    if (!this.fallbackSkin) {
      return [];
    } else {
      return this.fallbackSkin.getTextureFiles(skinTexture, option);
    }
  }

  async getAllTextureFiles(option: GetTextureFileOption = {}): Promise<TextureFileLocation[]> {
    const values = Object.keys(DefaultTextureConfig);
    return Promise.all(
      values.map(async (key) => ({
        key,
        paths: await this.getTextureFiles(key as SkinTextures, option),
      })),
    );
  }
}

// Later we can do OsuLazerSkin ...
