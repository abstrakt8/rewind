import { Inject, Injectable } from "@nestjs/common";
import { writeFile, readFile } from "fs/promises";

/**
 * Contains essential configurations whose absence would prevent the application from working properly.
 */
export interface RewindDesktopConfig {
  osuPath: string;
}

/**
 * Really cool heuristic to detect the osu folder:
 * https://github.com/Piotrekol/CollectionManager/blob/cb870d363d593035c97dc65f316a93f2d882c98b/CollectionManagerDll/Modules/FileIO/OsuPathResolver.cs#L36
 *
 */

const defaultConfig: RewindDesktopConfig = Object.freeze({
  osuPath: "",
});

//
// https://osu.ppy.sh/wiki/en/osu%21_Program_Files
// https://github.com/sindresorhus/ps-list

export const REWIND_CFG_PATH = Symbol("REWIND_CONFIG_PATH");

// TODO: Use something more sophisticated with validation and so on

@Injectable()
export class DesktopConfigService {
  constructor(@Inject(REWIND_CFG_PATH) private readonly userConfigPath: string) {}

  async loadConfig(): Promise<RewindDesktopConfig> {
    try {
      const data = await readFile(this.userConfigPath, "utf-8");
      return JSON.parse(data);
    } catch (err) {
      return defaultConfig;
    }
  }

  async saveOsuStablePath(osuStableFolderPath: string) {
    const data: RewindDesktopConfig = {
      osuPath: osuStableFolderPath,
    };

    return writeFile(this.userConfigPath, JSON.stringify(data));
  }
}
