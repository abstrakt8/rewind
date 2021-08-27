/**
 * Checks if booting with the given osu! folder path would cause major errors.
 * Usually, if osu! stable does not have a problem with that folder then this API won't either.
 **/
import { constants } from "fs";
import { access } from "fs/promises";
import { join } from "path";
import { Logger } from "@nestjs/common";

const filesToCheck = ["osu!.db", "scores.db", "Replays", "Skins", "Songs"];

export async function osuFolderSanityCheck(osuFolderPath: string) {
  // Check if osu!.db exists
  // Check if Songs, Replays, Skins exists
  try {
    await Promise.all(filesToCheck.map((f) => access(join(osuFolderPath, f), constants.R_OK)));
  } catch (err) {
    Logger.log(err);
    return false;
  }
  return true;
}
