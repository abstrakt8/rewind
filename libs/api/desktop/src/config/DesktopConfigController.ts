import { Controller, Get, Logger, Param, Post, Res } from "@nestjs/common";
import { DesktopConfigService } from "./DesktopConfigService";
import { Response } from "express";

@Controller("/desktop")
export class DesktopConfigController {
  private logger = new Logger("DesktopConfigController");

  constructor(private readonly desktopConfigService: DesktopConfigService) {}

  @Post()
  async saveOsuStablePath(@Param("osuStablePath") osuStablePath: string) {
    this.logger.log(`Update OsuStablePath to ${osuStablePath}`);
    // TODO: Sanity check
    return this.desktopConfigService.saveOsuStablePath(osuStablePath);
  }

  @Get()
  async readConfig(@Res() res: Response) {
    const data = await this.desktopConfigService.loadConfig();
    res.json(data);
  }
}
