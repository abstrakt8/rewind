import { Injectable } from "@nestjs/common";
import { DEFAULT_SKIN_ID } from "../constants";

// TODO: DefaultSkin, API Key, ...
interface Config {
  skinId: string;
  // apiKey: string;
  // osuDirectory: string;
}

const defaultConfig: Config = {
  skinId: DEFAULT_SKIN_ID,
  // apiKey: "",
  // osuDirectory: "E:\\osu!",
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
