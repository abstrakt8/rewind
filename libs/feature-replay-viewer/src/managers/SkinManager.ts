import { Skin, SkinTexturesByKey } from "../skins/Skin";
import { Loader, ILoaderResource } from "@pixi/loaders";
import { Texture } from "pixi.js";
import axios from "axios";
import { SkinConfig, SkinTextures } from "@rewind/osu/skin";

// Asks from osu-express
export interface SkinManager {
  loadSkin(skinId: string): Promise<Skin>;
}

export type SkinTextureLocation = { key: SkinTextures; paths: string[] };

async function startLoading(loader: Loader, skinName: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    loader.onStart.once(() => {
      console.log(`Skin loading started for ${skinName}`);
    });

    loader.onComplete.once(() => {
      console.debug(`Skin loading completed for ${skinName}`);
      resolve(true);
    });

    loader.onError.once((loader: Loader, resource: ILoaderResource) => {
      console.error(`Could not load resource ${resource.name}`);
    });
    loader.load();
  });
}

const urljoin = (...s: string[]) => s.join("/");

export class OsuExpressSkinManager implements SkinManager {
  osuExpressUrl: string;
  skins: { [key: string]: Skin };
  skinElementCounter = 0;

  // Maybe generalize it to skinSource or something
  constructor(osuExpressUrl: string) {
    this.osuExpressUrl = osuExpressUrl;
    this.skins = {};
  }

  // force such like reloading
  async loadSkin(folderPath: string, forceReload?: boolean): Promise<Skin> {
    if (this.skins[folderPath] && !forceReload) {
      console.info(`Skin ${folderPath} is already loaded, using the one in cache`);
      return this.skins[folderPath];
    }
    const loader = new Loader();

    const skinInfoUrl = urljoin(this.osuExpressUrl, "api", "skins", folderPath);
    const skinStaticUrl = urljoin(this.osuExpressUrl, "static", "skins", folderPath);

    // We could also put some GET parameters
    const res = await axios.get(skinInfoUrl).then((value) => value.data);

    // Yeah ...
    const config = res.config as SkinConfig;
    const files = res.files as SkinTextureLocation[];
    const textures: SkinTexturesByKey = {};
    const skinName = config.general.name;

    // Every file, even non-animatable files have the index in their name
    // For example "WhiteCat/hitcircle-0" would be one key name

    const queueFiles: { key: SkinTextures; name: string }[] = [];
    files.forEach((stl) => {
      stl.paths.forEach((path, index) => {
        // `Loader` will die if the same `name` gets used twice therefore the unique skinElementCounter
        // Maybe even use a timestamp
        const name = `${this.skinElementCounter++}/${skinName}/${stl.key}-${index}`;
        const url = urljoin(skinStaticUrl, path);
        loader.add(name, url);
        queueFiles.push({ key: stl.key, name });
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

    return new Skin(config, textures);
  }
}
