import { promises } from "fs";
import { BlueprintInfo } from "./BlueprintInfo";
import { fileLastModifiedTime, ticksToDate } from "@rewind/osu-local/utils";
import { Beatmap as DBBeatmap, OsuDBReader } from "@rewind/osu-local/db-reader";
import { Inject } from "@nestjs/common";
import { OSU_FOLDER } from "../constants";
import { join } from "path";

const { readFile } = promises;

const mapToBlueprint = (b: DBBeatmap): BlueprintInfo => {
  return {
    md5Hash: b.md5Hash,
    audioFileName: b.audioFileName,
    folderName: b.folderName,
    lastPlayed: ticksToDate(b.lastPlayed)[0],
    osuFileName: b.fileName,
    artist: b.artist, // unicode?
    title: b.title,
    creator: b.creator,
  };
};

export class OsuDBDao {
  private lastMtime = -1;
  private blueprints: BlueprintInfo[] = [];

  constructor(@Inject(OSU_FOLDER) private readonly osuFolder: string) {}

  private get osuDbPath() {
    return join(this.osuFolder, "osu!.db");
  }

  private async createReader() {
    const buffer = await readFile(this.osuDbPath);
    return new OsuDBReader(buffer);
  }

  async getOsuDbLastModifiedTime() {
    return await fileLastModifiedTime(this.osuDbPath);
  }

  async hasChanged(): Promise<boolean> {
    return this.cachedTime !== (await this.getOsuDbLastModifiedTime());
  }

  get cachedTime() {
    return this.lastMtime;
  }

  async getAllBlueprints(): Promise<BlueprintInfo[]> {
    const lastModified = await this.getOsuDbLastModifiedTime();
    if (lastModified === this.lastMtime) {
      return this.blueprints;
    }

    this.lastMtime = lastModified;
    const reader = await this.createReader();
    const osuDB = await reader.readOsuDB();
    return (this.blueprints = osuDB.beatmaps.map(mapToBlueprint));
  }

  async getBlueprintByMD5(md5: string): Promise<BlueprintInfo | undefined> {
    const maps = await this.getAllBlueprints();
    return maps.find((m) => m.md5Hash === md5);
  }
}
