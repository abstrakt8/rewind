import { Controller, Get, Logger, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { LocalReplayService } from "./LocalReplayService";

/**
 * This is technically just a temporary solution because parsing the .osr file on a web browser is a challenge that I
 * want to handle in the future.
 */
@Controller("replays")
export class LocalReplayController {
  private logger = new Logger(LocalReplayController.name);

  constructor(private localReplayService: LocalReplayService) {}

  @Get("/exported/:filename")
  async decodeExportedReplay(@Res() res: Response, @Param("filename") filename: string) {
    const replay = await this.localReplayService.exportedReplay(filename);
    res.json(replay);
  }

  @Get("/local/:filename")
  async decodeInternalReplay(@Res() res: Response, @Param("filename") filename: string) {
    const replay = await this.localReplayService.internalReplay(filename);
    res.json(replay);
  }
}
