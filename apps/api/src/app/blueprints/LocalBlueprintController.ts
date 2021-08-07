import { Controller, Get, Param, Res } from "@nestjs/common";
import { LocalBlueprintService } from "./LocalBlueprintService";
import { join } from "path";
import { UserConfigService } from "../config/UserConfigService";
import { Response } from "express";

@Controller("blueprints")
export class LocalBlueprintController {
  constructor(
    private readonly blueprintService: LocalBlueprintService,
    private readonly userConfigService: UserConfigService,
  ) {}

  songsFolder(...args: string[]) {
    return join(this.userConfigService.getConfig().osuDirectory, "Songs", ...args);
  }
  @Get(":md5hash")
  async getBlueprintByMD5(@Res() res: Response, @Param("md5hash") md5hash: string) {
    const blueprintMetaData = await this.blueprintService.getBlueprintByMD5(md5hash);
    res.json(blueprintMetaData);
    // const path = this.songsFolder(blueprintMetaData.folderName, blueprintMetaData.osuFileName);
  }
}
