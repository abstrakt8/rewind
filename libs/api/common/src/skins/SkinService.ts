import { Injectable, Logger } from "@nestjs/common";
import { SkinFolderReader } from "@rewind/osu-local/skin-reader";
import { SkinNameResolver } from "./SkinNameResolver";

@Injectable()
export class SkinService {
  private logger = new Logger("SkinService");

  constructor(private readonly skinNameResolver: SkinNameResolver) {}

  /**
   * @param skinName will be resolved through the given skin name resolver.
   */
  async getSkinInfo(skinName: string) {
    const path = this.skinNameResolver.resolveNameToPath(skinName);
    if (path === null) {
      this.logger.error(`Skin ${skinName} could not be resolved to a path.`);
      throw new Error("Skin not found");
    }
    const skinReader = await SkinFolderReader.getSkinReader(path);
    const { config } = skinReader;

    // Load from local config ?
    const { hdIfExists, animatedIfExists } = { hdIfExists: true, animatedIfExists: true };

    const files = await skinReader.getAllTextureFiles({ hdIfExists, animatedIfExists });

    return { config, files };
  }
}
