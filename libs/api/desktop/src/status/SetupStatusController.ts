import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";

@Controller("/status")
export class SetupStatusController {
  @Get()
  getBackendStatus(@Res() res: Response) {
    res.json({ status: "SETUP_MISSING" });
  }
}

@Controller("/status")
export class NormalStatusController {
  // TODO: ...
  @Get()
  getBackendStatus(@Res() res: Response) {
    res.json({ status: "READY" });
  }
}
