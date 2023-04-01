import { PersistentService } from "../core/service";
import { injectable } from "inversify";
import { JSONSchemaType } from "ajv";
import { BehaviorSubject } from "rxjs";
import { SkinLoader } from "./local/SkinLoader";
import { SkinId, skinIdToString, stringToSkinId } from "../../model/SkinId";
import { Skin } from "../../model/Skin";

export interface SkinSettings {
  // fallbackSkinId is rewind:OsuDefaultSkin
  preferredSkinId: string;
}

export const DEFAULT_SKIN_SETTINGS: SkinSettings = Object.freeze({
  preferredSkinId: "rewind:RewindDefaultSkin",
});
export const SkinSettingsSchema: JSONSchemaType<SkinSettings> = {
  type: "object",
  properties: {
    preferredSkinId: { type: "string", default: DEFAULT_SKIN_SETTINGS.preferredSkinId },
  },
  required: ["preferredSkinId"],
};

@injectable()
export class SkinSettingsStore extends PersistentService<SkinSettings> {
  key = "Skin";
  schema = SkinSettingsSchema;

  getDefaultValue(): SkinSettings {
    return DEFAULT_SKIN_SETTINGS;
  }

  setPreferredSkinId(preferredSkinId: string) {
    this.changeSettings((s) => (s.preferredSkinId = preferredSkinId));
  }
}

@injectable()
export class SkinHolder {
  private skin: Skin;

  constructor() {
    this.skin = Skin.EMPTY;
  }

  getSkin(): Skin {
    return this.skin;
  }

  setSkin(skin: Skin) {
    this.skin = skin;
  }
}

@injectable()
export class SkinManager {
  skinList$: BehaviorSubject<string[]>;

  constructor(
    private readonly skinLoader: SkinLoader,
    private readonly skinSettingsStore: SkinSettingsStore,
    private readonly skinHolder: SkinHolder,
  ) {
    this.skinList$ = new BehaviorSubject<string[]>([]);
  }

  async loadSkin(skinId: SkinId) {
    const skin = await this.skinLoader.loadSkin(skinId);
    this.skinSettingsStore.setPreferredSkinId(skinIdToString(skinId));
    this.skinHolder.setSkin(skin);
  }

  async loadPreferredSkin() {
    const { preferredSkinId } = this.skinSettingsStore.settings;

    try {
      console.log(`Loading preferred skin from preferences: ${preferredSkinId}`);
      const skinId = stringToSkinId(preferredSkinId);
      await this.loadSkin(skinId);
    } catch (e) {
      console.error(`Could not load preferred skin '${preferredSkinId}' so falling back to default`);
      this.skinSettingsStore.setPreferredSkinId(DEFAULT_SKIN_SETTINGS.preferredSkinId);
      await this.loadSkin(stringToSkinId(DEFAULT_SKIN_SETTINGS.preferredSkinId));
    }
  }

  async loadSkinList() {
    this.skinList$.next(await this.skinLoader.loadSkinList());
  }
}
