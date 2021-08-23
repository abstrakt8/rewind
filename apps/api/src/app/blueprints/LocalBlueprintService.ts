import { Inject, Injectable } from "@nestjs/common";
import { BlueprintInfo } from "./BlueprintInfo";
import { OsuDBDao } from "./OsuDBDao";
import { promises as fsPromises } from "fs";
import { join } from "path";
import { filterFilenamesInDirectory } from "@rewind/osu-local/utils";
import { Blueprint, BlueprintSection, parseBlueprint } from "@rewind/osu/core";
import { OSU_FOLDER } from "../constants";

const { stat, readFile } = fsPromises;

const sectionsToRead: BlueprintSection[] = ["General", "Difficulty", "Events", "Metadata"];

function mapToLocalBlueprint(blueprint: Blueprint, osuFileName: string, folderName: string): BlueprintInfo {
  const { metadata } = blueprint.blueprintInfo;
  const md5Hash = "";
  return {
    creator: "",
    title: metadata.title,
    osuFileName,
    folderName,
    bgFileName: metadata.backgroundFile,
    md5Hash,
    audioFileName: metadata.audioFile,
    artist: metadata.artist,
    lastPlayed: new Date(),
  };
}

@Injectable()
export class LocalBlueprintService {
  blueprints: Record<string, BlueprintInfo> = {};

  constructor(private readonly osuDbDao: OsuDBDao, @Inject(OSU_FOLDER) private readonly osuFolder: string) {}

  get songsFolder() {
    return join(this.osuFolder, "Songs");
  }

  // osu!.db + Songs folder read
  async completeRead() {
    const freshBlueprints = await this.osuDbDao.getAllBlueprints();
    const lastModifiedTime = await this.osuDbDao.getOsuDbLastModifiedTime();

    // TODO: Not supported yet
    if (false) {
      const candidates = await getNewFolderCandidates(this.songsFolder, new Date(lastModifiedTime));
      for (const songFolder of candidates) {
        const osuFiles = await listOsuFiles(songFolder);
        for (const osuFile of osuFiles) {
          // const data = await readFile(osuFile, { encoding: "utf-8" });
          // const blueprint = await parseBlueprint(data, { sectionsToRead });
          // freshBlueprints.push(mapToLocalBlueprint(blueprint, osuFile));
        }
      }
    }

    this.blueprints = {};
    freshBlueprints.forEach(this.addNewBlueprint.bind(this));
    return this.blueprints;
  }

  // Usually for watchers
  addNewBlueprint(blueprint: BlueprintInfo) {
    this.blueprints[blueprint.md5Hash] = blueprint;
  }

  async getAllBlueprints(): Promise<Record<string, BlueprintInfo>> {
    // It's better to rely on the "osu!.db" than the ones we received from watching.
    // But ofc, we if we read from osu!.db again there might still be some folders that have not been properly flushed.
    if (await this.osuDbDao.hasChanged()) {
      await this.completeRead();
    }
    return this.blueprints;
  }

  async getBlueprintByMD5(md5: string): Promise<BlueprintInfo | undefined> {
    const maps = await this.getAllBlueprints();
    return maps[md5];
  }

  // xd
  async blueprintBg(md5: string): Promise<string | undefined> {
    const { osuFileName, folderName } = await this.getBlueprintByMD5(md5);
    const data = await readFile(join(this.songsFolder, folderName, osuFileName), { encoding: "utf-8" });
    const blueprint = parseBlueprint(data, { sectionsToRead: ["Events"] });
    // There is also an offset but let's ignore for now
    return blueprint.blueprintInfo.metadata.backgroundFile;
  }
}

// This might be a very expensive operation and should be done only once at startup. The new ones should be watched
// ~250ms at my Songs folder
export async function getNewFolderCandidates(songsFolder: string, importedLaterThan: Date): Promise<string[]> {
  return filterFilenamesInDirectory(songsFolder, async (fileName) => {
    const s = await stat(join(songsFolder, fileName));
    return s.mtime.getTime() > importedLaterThan.getTime() && s.isDirectory();
  });
}

export async function listOsuFiles(songFolder: string): Promise<string[]> {
  return filterFilenamesInDirectory(songFolder, async (fileName) => fileName.endsWith(".osu"));
}
