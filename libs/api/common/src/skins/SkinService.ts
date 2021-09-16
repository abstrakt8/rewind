import { Injectable, Logger } from "@nestjs/common";
import { GetTextureFileOption, OsuSkinTextureResolver, SkinFolderReader } from "@rewind/osu-local/skin-reader";
import { SkinNameResolver } from "./SkinNameResolver";
import { DEFAULT_SKIN_TEXTURE_CONFIG, OsuSkinTextures } from "@rewind/osu/skin";

const OSU_DEFAULT_SKIN_ID = "rewind/OsuDefaultSkin";

@Injectable()
export class SkinService {
  private logger = new Logger(SkinService.name);

  constructor(private readonly skinNameResolver: SkinNameResolver) {}

  /**
   * In the future we also want to get the skin info with the beatmap as the parameters in order to retrieve
   * beatmap related skin files as well.
   */

  async resolve(
    osuSkinTexture: OsuSkinTextures,
    options: GetTextureFileOption,
    list: { prefix: string; resolver: OsuSkinTextureResolver }[],
  ) {
    for (const { prefix, resolver } of list) {
      const filePaths = await resolver.resolve(osuSkinTexture, options);
      if (filePaths.length === 0) {
        continue;
      }
      return filePaths.map((path) => `${prefix}/${path}`);
    }
    this.logger.warn(`No skin has the skin texture ${osuSkinTexture}`);
    return [];
  }

  /**
   * @param skinName will be resolved through the given skin name resolver.
   */
  async getSkinInfo(skinName: string) {
    this.logger.log(`Getting skin info for name=${skinName}`);

    const resolved = this.skinNameResolver.resolveNameToPath(skinName);
    if (resolved === null) {
      // Maybe error will be logged through middleware?
      throw new Error(`Skin ${skinName} could not be found in the folders`);
    }
    const { name, path, source } = resolved;

    const osuDefaultSkinResolver = await SkinFolderReader.getSkinResolver(
      this.skinNameResolver.resolveNameToPath(OSU_DEFAULT_SKIN_ID)?.path,
    );
    const skinResolver = await SkinFolderReader.getSkinResolver(path);
    // TODO: Include default osu! skin
    // const defaultSkinResolver = await SkinFolderReader.getSkinResolver("");
    const { config } = skinResolver;

    // TODO: Give through params
    const option = { hdIfExists: true, animatedIfExists: true };

    // const files = await skinResolver.resolveAllTextureFiles({ hdIfExists, animatedIfExists });
    const skinTextureKeys = Object.keys(DEFAULT_SKIN_TEXTURE_CONFIG);
    const files = await Promise.all(
      skinTextureKeys.map(async (key) => ({
        key,
        paths: await this.resolve(key as OsuSkinTextures, option, [
          // In the future beatmap stuff can be listed here as well
          {
            prefix: ["static", "skins", source, name].map(encodeURIComponent).join("/"),
            resolver: skinResolver,
          },
          {
            prefix: ["static", "skins", "rewind", "OsuDefaultSkin"].map(encodeURIComponent).join("/"),
            resolver: osuDefaultSkinResolver,
          },
          // {
          //   prefix: `/static/skins/${encodeURIComponent(skinName)}`,
          //   resolver: defaultSkinResolver,
          // },
        ]),
      })),
    );

    return { config, files };
  }
}
