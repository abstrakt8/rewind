import { injectable } from "inversify";
import { SkinLoader } from "./api/SkinLoader";
import { DEFAULT_SKIN_SETTINGS, SkinSettingsStore } from "./skin";
import { SkinHolder } from "./skins/SkinHolder";
import { SkinId, skinIdToString, stringToSkinId } from "../../model/SkinId";
import { BehaviorSubject } from "rxjs";

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
