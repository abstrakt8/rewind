import { Controller, Get, Logger, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { SkinService } from "./SkinService";

@Controller("skins")
export class SkinController {
  private logger = new Logger(SkinController.name);

  constructor(private skinService: SkinService) {}

  @Get()
  async getSkinInfo(@Res() res: Response, @Query() query: { hd: number; animated: number; name: string }) {
    // We can take these in case user config does not exist
    const { hd, animated, name } = query;
    const hdIfExists = hd === 1;
    const animatedIfExists = animated === 1;
    const decodedName = decodeURIComponent(name);
    this.logger.log(`Skin requested ${decodedName} with hd=${hdIfExists} animated=${animatedIfExists}`);
    // TODO: Inject these parameters ...
    const info = await this.skinService.getSkinInfo(decodedName);
    res.json(info);
  }
}
