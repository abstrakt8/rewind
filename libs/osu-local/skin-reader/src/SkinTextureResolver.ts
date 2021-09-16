import {
  comboDigitFonts,
  DEFAULT_SKIN_TEXTURE_CONFIG,
  defaultDigitFonts,
  hitCircleDigitFonts,
  OsuSkinTextures,
  SkinConfig,
} from "@rewind/osu/skin";
import { promises as fs } from "fs";
import * as Path from "path";

export type GetTextureFileOption = {
  hdIfExists?: boolean;
  animatedIfExists?: boolean;
  tryWithFallback?: boolean;
};

// If F is fallback skin for main skin S
// First check S/circle@2x.png then S/circle.png then F/circle@2x.png then F/circle.png.
export type OsuFileNameOptions = {
  useHD: boolean;
  extension: string;
  animationIndex?: number;
};

export type TextureFileLocation = {
  key: string;
  paths: string[];
};

export interface OsuSkinTextureResolver {
  /**
   * Resolves the paths to the given skin texture. In case the given skin texture is animated, multiple paths
   * will be returned.
   *
   * @param osuSkinTexture
   * @param option
   */
  resolve(osuSkinTexture: OsuSkinTextures, option: GetTextureFileOption): Promise<string[]>;
}

const join = Path.posix.join;

export class OsuLegacySkinTextureResolver implements OsuSkinTextureResolver {
  constructor(readonly folderPath: string, readonly config: SkinConfig) {}

  // Special case for font textures since their `prefix` can be changed.
  // Best example would be WhiteCat 1.0 Skin where for example the combo prefix is `Assets\combo` -> even different
  // folder
  getFontPrefix(skinTexture: OsuSkinTextures): string | undefined {
    const { hitCirclePrefix, comboPrefix, scorePrefix } = this.config.fonts;

    // join will also convert / to \\ if it's in Windows.
    // This will be then Assets/combo/default0 for example
    const combine = (prefix: string, id: number) => `${prefix}-${id}`;
    {
      const hitCircleId = hitCircleDigitFonts.indexOf(skinTexture as any);
      if (hitCircleId !== -1) {
        return combine(hitCirclePrefix, hitCircleId);
      }
    }
    {
      const comboId = comboDigitFonts.indexOf(skinTexture as any);
      if (comboId !== -1) {
        return combine(comboPrefix, comboId);
      }
    }
    {
      const scoreId = defaultDigitFonts.indexOf(skinTexture as any);
      if (scoreId !== -1) {
        return combine(scorePrefix, scoreId);
      }
    }

    // Special cases
    const texConfig = DEFAULT_SKIN_TEXTURE_CONFIG[skinTexture];
    switch (skinTexture) {
      case "SCORE_PERCENT":
      case "SCORE_DOT":
        return texConfig.filePrefix.replace("score", scorePrefix);
      case "SCORE_X":
        return texConfig.filePrefix.replace("score", comboPrefix);
    }

    return undefined;
  }

  getPrefix(skinTexture: OsuSkinTextures) {
    const fontPrefix = this.getFontPrefix(skinTexture);
    if (fontPrefix !== undefined) return fontPrefix;

    const texConfig = DEFAULT_SKIN_TEXTURE_CONFIG[skinTexture];
    if (!texConfig) {
      throw Error("what u doing");
    }
    // Maybe there is something with prefix in config in between (for numbers for example)
    // FilePrefix could be overridden by skin config
    // TODO: ??? join ???
    return join(texConfig.filePrefix);
  }

  // No fallback, just straight up returns the filename
  getFilename(skinTexture: OsuSkinTextures, opt: OsuFileNameOptions) {
    const { useHD, animationIndex, extension } = opt;
    const texConfig = DEFAULT_SKIN_TEXTURE_CONFIG[skinTexture];
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

  async checkForTextureWithFallback(skinTexture: OsuSkinTextures, options: OsuFileNameOptions) {
    const filesToCheck = [this.getFilename(skinTexture, options)];
    if (options.useHD) filesToCheck.push(this.getFilename(skinTexture, { ...options, useHD: false }));
    return this.checkForFirstAppearanceInFolder(filesToCheck);
  }

  // We are not going to return the absolute path, just the relative path in the skin folder.
  async resolve(skinTexture: OsuSkinTextures, option: GetTextureFileOption = {}): Promise<string[]> {
    const { animatedIfExists, hdIfExists } = option;
    const texConfig = DEFAULT_SKIN_TEXTURE_CONFIG[skinTexture];
    if (!texConfig) {
      throw Error(`Skin texture ${skinTexture} not found in config`);
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

    // If here we find nothing, we don't ask for fallbackSkin
    return [];
  }
}
