import { Loader } from "@pixi/loaders";
import { Texture } from "pixi.js";
import { DEFAULT_SKIN_TEXTURE_CONFIG, OsuSkinTextures } from "@rewind/osu/skin";
import { inject, injectable } from "inversify";
import { Skin, SkinTexturesByKey } from "../../../model/Skin";
import { SkinId } from "../../../model/SkinId";
import { OsuFolderService } from "./OsuFolderService";
import { GetTextureFileOption, OsuSkinTextureResolver, SkinFolderReader } from "@rewind/osu-local/skin-reader";
import { join } from "path";
import { STAGE_TYPES } from "../../types";

export type SkinTextureLocation = { key: OsuSkinTextures; paths: string[] };

async function startLoading(loader: Loader, skinName: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    loader.onStart.once(() => {
      console.log(`Skin loading started for ${skinName}`);
    });

    loader.onComplete.once(() => {
      console.debug(`Skin loading completed for ${skinName}`);
      resolve(true);
    });

    loader.onError.once((resource) => {
      console.error(`Could not load resource ${resource.name}`);
    });
    loader.load();
  });
}

const OSU_DEFAULT_SKIN_ID: SkinId = { source: "rewind", name: "OsuDefaultSkin" };

@injectable()
export class SkinLoader {
  skins: { [key: string]: Skin };
  skinElementCounter = 0;

  // Maybe generalize it to skinSource or something
  // TODO: Maybe just load into TextureManager
  constructor(
    private osuFolderService: OsuFolderService,
    @inject(STAGE_TYPES.REWIND_SKINS_FOLDER) private rewindSkinsFolder: string,
  ) {
    this.skins = {};
  }

  // TODO: AppResourcesPath and get the included Rewind Skins

  async loadSkinList() {
    return SkinFolderReader.listSkinsInFolder(join(this.osuFolderService.osuFolder$.getValue(), "Skins"), {
      skinIniRequired: false,
    });
  }

  sourcePath(source: string) {
    switch (source) {
      case "rewind":
        return this.rewindSkinsFolder;
      case "osu":
        return join(this.osuFolderService.getOsuFolder(), "Skins");
    }
    return "";
  }

  resolveToPath({ source, name }: SkinId) {
    return join(this.sourcePath(source), name);
  }

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
    console.debug(`No skin has the skin texture ${osuSkinTexture}`);
    return [];
  }

  // force such like reloading
  async loadSkin(skinId: SkinId, forceReload?: boolean): Promise<Skin> {
    const id = `${skinId.source}/${skinId.name}`;
    if (this.skins[id] && !forceReload) {
      console.info(`Skin ${id} is already loaded, using the one in cache`);
      return this.skins[id];
    }
    console.log(`Loading skin with name: ${skinId.name} with source ${skinId.source}`);
    const loader = new Loader();

    const osuDefaultSkinResolver = await SkinFolderReader.getSkinResolver(this.resolveToPath(OSU_DEFAULT_SKIN_ID));
    const skinResolver = await SkinFolderReader.getSkinResolver(this.resolveToPath(skinId));

    const { config } = skinResolver;

    const skinTextureKeys = Object.keys(DEFAULT_SKIN_TEXTURE_CONFIG);
    const files = await Promise.all(
      skinTextureKeys.map(async (key) => ({
        key,
        paths: await this.resolve(key as OsuSkinTextures, { animatedIfExists: true, hdIfExists: true }, [
          // In the future beatmap stuff can be listed here as well
          {
            prefix: join("file://", this.resolveToPath(skinId)),
            resolver: skinResolver,
          },
          {
            prefix: join("file://", this.resolveToPath(OSU_DEFAULT_SKIN_ID)),
            resolver: osuDefaultSkinResolver,
          },
        ]),
      })),
    );

    const textures: SkinTexturesByKey = {};
    const skinName = config.general.name;

    // Every file, even non-animatable files have the index in their name
    // For example "WhiteCat/hitcircle-0" would be one key name

    const queueFiles: { key: OsuSkinTextures; name: string }[] = [];
    files.forEach((stl) => {
      stl.paths.forEach((path, index) => {
        // `Loader` will die if the same `name` gets used twice therefore the unique skinElementCounter
        // Maybe even use a timestamp
        const name = `${this.skinElementCounter++}/${skinName}/${stl.key}-${index}`;
        loader.add(name, path);
        queueFiles.push({ key: stl.key as OsuSkinTextures, name });
      });
    });

    const loaded = await startLoading(loader, skinName);

    if (!loaded) {
      throw new Error(`${skinName} not loaded correctly`);
    }

    queueFiles.forEach((file) => {
      if (!(file.key in textures)) textures[file.key] = [];
      textures[file.key]?.push(loader.resources[file.name].texture as Texture);
    });

    return (this.skins[id] = new Skin(config, textures));
  }
}
