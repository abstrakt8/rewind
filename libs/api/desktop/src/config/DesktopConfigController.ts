import { Body, Controller, Get, Logger, Post, Res } from "@nestjs/common";
import { DesktopConfigService } from "./DesktopConfigService";
import { Response } from "express";
import { osuFolderSanityCheck } from "@rewind/api/desktop";

interface UpdateOsuStablePathDto {
  osuStablePath: string;
}

@Controller("/desktop")
export class DesktopConfigController {
  private logger = new Logger("DesktopConfigController");

  constructor(private readonly desktopConfigService: DesktopConfigService) {}

  @Post()
  async saveOsuStablePath(@Res() res: Response, @Body() { osuStablePath }: UpdateOsuStablePathDto) {
    // this.logger.log(`${JSON.stringify(body)}`);
    this.logger.log(`Update OsuStablePath to ${osuStablePath}`);

    const sanityCheckPassed = await osuFolderSanityCheck(osuStablePath);
    if (sanityCheckPassed) {
      await this.desktopConfigService.saveOsuStablePath(osuStablePath);
      res.sendStatus(200);
    } else {
      res.status(400).json({ error: `Given folder '${osuStablePath}' does not seem to be a valid osu!stable folder` });
    }
  }

  @Get()
  async readConfig(@Res() res: Response) {
    const data = await this.desktopConfigService.loadConfig();
    res.json(data);
  }
}
