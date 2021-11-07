import { Controller, Get, Logger, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { LocalReplayService } from "./LocalReplayService";

/**
 * This is technically just a temporary solution because parsing the .osr file on a web browser is a challenge that I
 * want to handle in the future.
 *
 *
 * A replay name has the following syntax:
 * [NAMESPACE]:[NAME]
 *
 * Each namespace has a different resolver that can resolve the replay.
 */
@Controller("replays")
export class LocalReplayController {
  private logger = new Logger(LocalReplayController.name);

  constructor(private localReplayService: LocalReplayService) {}

  @Get(":name")
  async decodeReplay(@Res() res: Response, @Param("name") encodedName: string) {
    const name = decodeURIComponent(encodedName);
    this.logger.log(`Received request to decode replay '${name}'`);

    const replay = await this.localReplayService.decodeReplay(name);
    res.json(replay);
  }
}
