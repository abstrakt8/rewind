/**
 * Checks if booting with the given osu! folder path would cause major errors.
 * Usually, if osu! stable does not have a problem with that folder then this API won't either.
 **/
import { constants } from "fs";
import { join } from "path";
import { access } from "fs/promises";
import { Logger } from "@nestjs/common";

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
