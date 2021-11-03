/**
 * Checks if booting with the given osu! folder path would cause major errors.
 * Usually, if osu! stable does not have a problem with that folder then this API won't either.
 **/
import { constants } from "fs";
import { join, resolve } from "path";
import { access, mkdir, readFile } from "fs/promises";
import { Logger } from "@nestjs/common";
import { osuUserConfigParse } from "../osuUserConfig";

const filesToCheck = ["osu!.db", "scores.db", "Replays", "Skins"];

/**
 * Checks certain files to see if Rewind can be booted without any problems with the given `osuFolderPath`.
 * @param osuFolderPath the folder path to check the files in
 */
export async function osuFolderSanityCheck(osuFolderPath: string) {
  try {
    await Promise.all(filesToCheck.map((f) => access(join(osuFolderPath, f), constants.R_OK)));
  } catch (err) {
    Logger.log(err);
    return false;
  }
  return true;
}

// Just keeping it here just in case
async function createFolderIfNotExisting(folderPath: string) {
  try {
    await access(folderPath, constants.R_OK);
  } catch (err) {
    Logger.log(`Could not access the replays folder '${folderPath}'. Creating a new one`);
    // TODO: Access rights?
    return mkdir(folderPath);
  }
}

// TODO: Need to test with really strange user names
function osuUserConfigFileName(userName: string) {
  return `osu!.${userName}.cfg`;
}

export async function determineSongsFolder(osuFolderPath: string, userName: string) {
  // First read the username specific config file that has important information such as the
  const userConfigPath = join(osuFolderPath, osuUserConfigFileName(userName));

  try {
    const data = await readFile(userConfigPath, "utf-8");
    const records = osuUserConfigParse(data);
    const beatmapDirectory = records["BeatmapDirectory"];
    return resolve(osuFolderPath, beatmapDirectory);
  } catch (err) {
    return undefined;
  }
}
