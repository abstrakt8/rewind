import { Injectable } from "@nestjs/common";

// TODO: DefaultSkin, API Key, ...
interface Config {
  osuDirectory: string;
}

const defaultConfig: Config = {
  osuDirectory: "E:\\osu!",
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
