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
    return this.blueprintService.getBlueprintByMD5(md5);
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
    return this.redirectToFolder(res, md5hash, bgFileName);
  }

  @Get(":md5hash/folder/:file")
  async redirectToFolder(@Res() res: Response, @Param("md5hash") md5hash: string, @Param("file") file: string) {
    const blueprintMetaData = await this.blueprint(md5hash);
    const { folderName } = blueprintMetaData;
    const url = `/static/songs/${encodeURIComponent(folderName)}/${encodeURIComponent(file)}`;
    res.redirect(url);
  }
}
