import { Controller, Get, Param, Res } from "@nestjs/common";
import { LocalBlueprintService } from "./LocalBlueprintService";
import { Response } from "express";

/**
 * The md5hash can be considered as the identifier the blueprint.
 */
@Controller("blueprints")
export class LocalBlueprintController {
  constructor(private readonly blueprintService: LocalBlueprintService) {}

  async blueprint(md5: string) {
    const b = await this.blueprintService.getBlueprintByMD5(md5);
    if (b === undefined) {
      throw Error(`Blueprint with md5=${md5} not found`);
    }
    return b;
  }

  @Get(":md5hash")
  async getBlueprintByMD5(@Res() res: Response, @Param("md5hash") md5hash: string) {
    const blueprintMetaData = await this.blueprintService.getBlueprintByMD5(md5hash);
    res.json(blueprintMetaData);
    // const path = this.songsFolder(blueprintMetaData.folderName, blueprintMetaData.osuFileName);
  }

  @Get(":md5hash/osu")
  async getBlueprintOsu(@Res() res: Response, @Param("md5hash") md5hash: string) {
    const blueprintMetaData = await this.blueprint(md5hash);
    return this.redirectToFolder(res, md5hash, blueprintMetaData.osuFileName);
  }

  @Get(":md5hash/audio")
  async getBlueprintAudio(@Res() res: Response, @Param("md5hash") md5hash: string) {
    const { audioFileName } = await this.blueprint(md5hash);
    return this.redirectToFolder(res, md5hash, audioFileName);
  }

  @Get(":md5hash/bg")
  async getBlueprintBackground(@Res() res: Response, @Param("md5hash") md5hash: string) {
    const bgFileName = await this.blueprintService.blueprintBg(md5hash);
    if (!bgFileName) throw Error("No background found");
    return this.redirectToFolder(res, md5hash, bgFileName);
  }

  @Get(":md5hash/folder/:file")
  async redirectToFolder(@Res() res: Response, @Param("md5hash") md5hash: string, @Param("file") file: string) {
    const blueprintMetaData = await this.blueprint(md5hash);
    const { folderName } = blueprintMetaData;
    // We need to encode the URI components for cases such as:
    // "E:\osu!\Songs\1192060 Camellia - #1f1e33\Camellia - #1f1e33 (Realazy) [Amethyst Storm].osu"
    // The two `#` characters need to be encoded to `%23` in both cases.
    const url = `/static/songs/${encodeURIComponent(folderName)}/${encodeURIComponent(file)}`;
    res.redirect(url);
  }
}
