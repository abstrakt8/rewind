import { Inject, Injectable, Logger } from "@nestjs/common";
import { SkinFolderReader } from "@rewind/osu-local/skin-reader";
import { join } from "path";
import { Skin } from "./skin.model";
import { OSU_FOLDER } from "../constants";

@Injectable()
export class SkinService {
  private logger = new Logger("SkinService");

  constructor(@Inject(OSU_FOLDER) private osuDirectory: string) {}

  skinsFolder(path?: string) {
    return join(this.osuDirectory, "Skins", path);
  }

  async getSkinInfo(folder: string) {
    const skinReader = await SkinFolderReader.getSkinReader(this.skinsFolder(folder));
    const { config } = skinReader;

    // Load from local config ?
    const { hdIfExists, animatedIfExists } = { hdIfExists: true, animatedIfExists: true };

    const files = await skinReader.getAllTextureFiles({ hdIfExists, animatedIfExists });

    return { config, files };
  }

  async allSkinsInFolder(): Promise<Skin[]> {
    const skinIds = await SkinFolderReader.listSkinsInFolder(this.skinsFolder(), { skinIniRequired: true });
    return skinIds.map((id) => {
      const skin = new Skin();
      skin.id = id;
      // skin.files = []; // ?
      return skin;
    });
  }
}
