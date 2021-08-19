import { posix } from "path";
import { promises as fs } from "fs";
import { OsuLegacySkinReader } from "./SkinReader";
import { SkinConfigParser } from "@rewind/osu/skin";

const join = posix.join;

const SKIN_CONFIG_FILENAME = "skin.ini";

interface ListSkinsInFolderOptions {
  skinIniRequired: boolean;
}

const defaultListingOptions: ListSkinsInFolderOptions = {
  skinIniRequired: true,
};

/**
 * Provides functions to read local skins.
 */
export class SkinFolderReader {
  /**
   * Lists the directory names that should resemble the skin folders in the given Skins folder.
   * @param skinsFolderPath  the path to check the skins
   * @param options
   */
  static async listSkinsInFolder(
    skinsFolderPath: string,
    options?: Partial<ListSkinsInFolderOptions>,
  ): Promise<string[]> {
    const { skinIniRequired } = { ...defaultListingOptions, ...options };

    const files = await fs.readdir(skinsFolderPath, { withFileTypes: true });
    // This could be optimized by doing async calls in parallel
    const results = await Promise.all(
      files.map(async (f) => {
        if (!f.isDirectory()) return null;

        // Instant return if we don't need to check for a skin.ini file
        if (!skinIniRequired) return f.name;

        const skinConfigFile = join(skinsFolderPath, f.name, SKIN_CONFIG_FILENAME);
        // This is recommended over .exists() which is deprecated
        try {
          const file = await fs.stat(skinConfigFile);
          return file.isFile() ? f.name : null;
        } catch (err) {
          return null;
        }
      }),
    );
    return results.filter((f) => f !== null) as string[];
  }

  /**
   * Reads the config file in the given skin folder and prepares a skin reader based on the given config.
   * @param skinFolderPath path to the folder
   */
  static async getSkinReader(skinFolderPath: string): Promise<OsuLegacySkinReader> {
    const data = await fs.readFile(join(skinFolderPath, SKIN_CONFIG_FILENAME), { encoding: "utf-8" });
    const parser = new SkinConfigParser(data);
    const config = parser.parse();
    return new OsuLegacySkinReader(skinFolderPath, config);
  }
}
