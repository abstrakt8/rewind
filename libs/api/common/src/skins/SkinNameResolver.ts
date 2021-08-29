import { Inject, Injectable } from "@nestjs/common";
import { join } from "path";

interface SkinsFolderConfig {
  prefix: string;
  path: string;
}

export type SkinNameResolverConfig = SkinsFolderConfig[];

export const SKIN_NAME_RESOLVER_CONFIG = "SkinsFolderConfig";

@Injectable()
export class SkinNameResolver {
  constructor(@Inject(SKIN_NAME_RESOLVER_CONFIG) private readonly skinNameResolverConfig: SkinNameResolverConfig) {}

  resolveNameToPath(name: string): string | null {
    const [prefix, ...path] = name.split("/");
    const folderPath = this.skinNameResolverConfig.find((c) => c.prefix === prefix);
    if (folderPath === undefined) {
      return null;
    }
    return join(folderPath.path, ...path);
  }
}
