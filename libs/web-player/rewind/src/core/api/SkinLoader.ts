import { Loader } from "@pixi/loaders";
import { Texture } from "pixi.js";
import axios from "axios";
import { OsuSkinTextures, SkinConfig } from "@rewind/osu/skin";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types/types";
import { Skin, SkinTexturesByKey } from "../../model/Skin";
import { SkinId } from "../../model/SkinId";

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

const urljoin = (...s: string[]) => s.join("/");

@injectable()
export class SkinLoader {
  skins: { [key: string]: Skin };
  skinElementCounter = 0;

  // Maybe generalize it to skinSource or something
  // TODO: Maybe just load into TextureManager
  constructor(@inject(TYPES.API_URL) private readonly apiUrl: string) {
    this.skins = {};
  }

  async loadSkinList() {
    const url = urljoin(this.apiUrl, "api", "skins", "list");
    const res = (await axios.get(url)).data;
    return res as string[];
  }

  // force such like reloading
  async loadSkin(skinId: SkinId, forceReload?: boolean): Promise<Skin> {
    const id = `${skinId.source}/${encodeURIComponent(skinId.name)}`;
    if (this.skins[id] && !forceReload) {
      console.info(`Skin ${id} is already loaded, using the one in cache`);
      return this.skins[id];
    }
    const loader = new Loader();

    const skinInfoUrl = urljoin(this.apiUrl, "api", "skins");

    // We could also put some GET parameters
    const res = await axios
      .get(skinInfoUrl, { params: { animatedIfExists: 1, hdIfExists: 1, name: id } })
      .then((value) => value.data);

    // Yeah ...
    const config = res.config as SkinConfig;
    const files = res.files as SkinTextureLocation[];
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
        const url = urljoin(this.apiUrl, path);
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

    return (this.skins[id] = new Skin(config, textures));
  }
}
