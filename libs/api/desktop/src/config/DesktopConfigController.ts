import { Controller, Get, Param, Post, Res } from "@nestjs/common";
import { DesktopConfigService } from "./DesktopConfigService";
import { Response } from "express";

@Controller("/desktop")
export class DesktopConfigController {
  constructor(private readonly desktopConfigService: DesktopConfigService) {}

  @Post()
  async saveOsuStablePath(@Param("osuStablePath") osuStablePath: string) {
    // TODO: Sanity check
    return this.desktopConfigService.saveOsuStablePath(osuStablePath);
  }

  @Get()
  async readConfig(@Res() res: Response) {
    const data = await this.desktopConfigService.loadConfig();
    res.json(data);
  }
}
