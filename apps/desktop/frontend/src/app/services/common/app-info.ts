import { inject, injectable } from "inversify";
import { STAGE_TYPES } from "../types";

@injectable()
export class AppInfoService {
  constructor(
    @inject(STAGE_TYPES.APP_PLATFORM) public readonly platform: string,
    @inject(STAGE_TYPES.APP_VERSION) public readonly version: string,
  ) {
  }
}
