import { injectable } from "inversify";
import { SkinLoader } from "../core/api/SkinLoader";
import { SkinSettingsStore } from "./SkinSettingsStore";
import { DEFAULT_SKIN_SETTINGS } from "../settings/SkinSettings";
import { SkinHolder } from "../core/skins/SkinHolder";
import { SkinId, skinIdToString, stringToSkinId } from "@rewind/web-player/rewind";

@injectable()
export class SkinManager {
  constructor(
    private readonly skinLoader: SkinLoader,
    private readonly skinSettingsStore: SkinSettingsStore,
    private readonly skinHolder: SkinHolder,
  ) {}

  async loadSkin(skinId: SkinId) {
    const skin = await this.skinLoader.loadSkin(skinId);
    this.skinSettingsStore.setPreferredSkinId(skinIdToString(skinId));
    this.skinHolder.setSkin(skin);
  }

  async loadPreferredSkin() {
    const { preferredSkinId } = this.skinSettingsStore.settings;
    const skinId = stringToSkinId(preferredSkinId);

    try {
      await this.loadSkin(skinId);
    } catch (e) {
      console.error(`Could not load preferred skin '${preferredSkinId}' so falling back to default`);
      this.skinSettingsStore.setPreferredSkinId(DEFAULT_SKIN_SETTINGS.preferredSkinId);
      await this.loadSkin(stringToSkinId(DEFAULT_SKIN_SETTINGS.preferredSkinId));
    }
  }
}
