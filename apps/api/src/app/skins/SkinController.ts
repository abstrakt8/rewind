import { Controller, Get, Res, Logger, Param, Query } from "@nestjs/common";
import { Response } from "express";
import { SkinService } from "./SkinService";

@Controller("skins")
export class SkinController {
  private logger = new Logger("SkinController");

  constructor(private skinService: SkinService) {}

  @Get(":folderName")
  async getSkinInfo(
    @Res() res: Response,
    @Param("folderName") folderName: string,
    @Query() query: { hd: number; animated: number },
  ) {
    // We can take these in case user config does not exist
    const { hd, animated } = query;
    const hdIfExists = hd === 1;
    const animatedIfExists = animated === 1;
    this.logger.log(`Skin requested ${folderName} with hd=${hdIfExists} animated=${animatedIfExists}`);
    // TODO: Inject these parameters ...
    const info = await this.skinService.getSkinInfo(folderName);
    res.json(info);
  }
}
