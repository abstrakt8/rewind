import { inject, injectable } from "inversify";
import ElectronStore from "electron-store";
import { access } from "fs/promises";
import { join } from "path";
import { constants } from "fs";
import { BehaviorSubject } from "rxjs";
import { determineSongsFolder } from "@rewind/osu-local/utils";
import { STAGE_TYPES } from "../../../types/STAGE_TYPES";
import username from "username";

const CONFIG = "OsuPath";

const filesToCheck = ["osu!.db", "scores.db", "Skins"];

/**
 * Checks certain files to see if Rewind can be booted without any problems with the given `osuFolderPath`.
 * @param osuFolderPath the folder path to check the files in
 */
export async function osuFolderSanityCheck(osuFolderPath: string) {
  try {
    await Promise.all(filesToCheck.map((f) => access(join(osuFolderPath, f), constants.R_OK)));
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

@injectable()
export class OsuFolderService {
  public readonly osuFolder$: BehaviorSubject<string>;
  public replaysFolder$ = new BehaviorSubject<string>("");
  public songsFolder$ = new BehaviorSubject<string>("");

  constructor(@inject(STAGE_TYPES.ELECTRON_STORE) private readonly store: ElectronStore) {
    this.osuFolder$ = new BehaviorSubject<string>("");
    this.osuFolder$.asObservable().subscribe(async (newSongsFolder) => {
      this.replaysFolder$.next(join(newSongsFolder, "Replays"));
      const userId = await username();
      this.songsFolder$.next((await determineSongsFolder(newSongsFolder, userId as string)) as string);
    });
    const osuFolderInitially = this.getOsuFolder();
    if (osuFolderInitially) this.osuFolder$.next(osuFolderInitially);
  }

  getOsuFolder(): string {
    return this.store.get(CONFIG, "") as string;
  }

  setOsuFolder(path: string) {
    this.store.set(CONFIG, path);
  }

  async isValidOsuFolder(directoryPath: string) {
    return osuFolderSanityCheck(directoryPath);
  }
}
