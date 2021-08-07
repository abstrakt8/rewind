import { Injectable, Logger } from "@nestjs/common";
import { OsuLegacySkinReader, SkinFolderReader } from "@rewind/osu-local/skin-reader";
import { join } from "path";
import { UserConfigService } from "../config/UserConfigService";
import { Skin } from "./skin.model";

@Injectable()
export class SkinService {
  private logger = new Logger("SkinService");

  constructor(private userConfigService: UserConfigService) {}

  skinsFolder(path?: string) {
    return join(this.userConfigService.getConfig().osuDirectory, "Skins", path);
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
