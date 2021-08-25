import { Injectable } from "@nestjs/common";
import { DEFAULT_SKIN_ID } from "../../../common/src/constants";

// TODO: API Key, ...
interface Config {
  skinId: string;
  // apiKey: string;
}

const defaultConfig: Config = {
  skinId: DEFAULT_SKIN_ID,
  // apiKey: "",
};

@Injectable()
export class UserConfigService {
  private readonly config: Config;

  constructor() {
    this.config = defaultConfig;
  }

  getConfig() {
    return this.config;
  }
}
