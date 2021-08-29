import { Injectable } from "@nestjs/common";

interface Config {
  skinId: string;
  // apiKey: string;
}

const NO_SKIN_ID = "";

const defaultConfig: Config = {
  skinId: NO_SKIN_ID,
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
