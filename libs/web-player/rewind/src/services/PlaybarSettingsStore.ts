import { AbstractSettingsStore } from "./AbstractSettingsStore";
import { DEFAULT_PLAY_BAR_SETTINGS, PlaybarSettings } from "../settings/PlaybarSettings";
import { injectable } from "inversify";

@injectable()
export class PlaybarSettingsStore extends AbstractSettingsStore<PlaybarSettings> {
  constructor() {
    super(DEFAULT_PLAY_BAR_SETTINGS);
  }
}
