import { Injectable, Logger } from "@nestjs/common";
import { SkinFolderReader } from "@rewind/osu-local/skin-reader";
import { SkinNameResolver } from "./SkinNameResolver";

@Injectable()
export class SkinService {
  private logger = new Logger(SkinService.name);

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
    const skinResolver = await SkinFolderReader.getSkinResolver(path);
    const { config } = skinResolver;

    // Load from local config ?
    const { hdIfExists, animatedIfExists } = { hdIfExists: true, animatedIfExists: true };

    const files = await skinResolver.resolveAllTextureFiles({ hdIfExists, animatedIfExists });

    return { config, files };
  }
}
