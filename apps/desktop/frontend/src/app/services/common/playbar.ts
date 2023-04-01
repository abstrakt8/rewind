import { PersistentService } from "../core/service";
import { injectable } from "inversify";
import { JSONSchemaType } from "ajv";

export interface PlaybarSettings {
  difficultyGraphEnabled: boolean;
}

export const DEFAULT_PLAY_BAR_SETTINGS: PlaybarSettings = Object.freeze({
  difficultyGraphEnabled: true,
});

export const PlaybarSettingsSchema: JSONSchemaType<PlaybarSettings> = {
  type: "object",
  properties: {
    difficultyGraphEnabled: { type: "boolean", default: DEFAULT_PLAY_BAR_SETTINGS.difficultyGraphEnabled },
  },
  required: [],
};

@injectable()
export class PlaybarSettingsStore extends PersistentService<PlaybarSettings> {
  key = "playbar";
  schema = PlaybarSettingsSchema;

  getDefaultValue(): PlaybarSettings {
    return DEFAULT_PLAY_BAR_SETTINGS;
  }
}
