import { defaultViewSettings } from "../game/ViewSettings";
import { makeAutoObservable } from "mobx";

export class PreferencesService {
  constructor() {
    makeAutoObservable(this);
  }

  preferredViewSettings() {
    return defaultViewSettings();
  }

  skinId = "- Aristia(Edit)+trail";

  changePreferredSkin(skinId: string) {
    this.skinId = skinId;
  }

  // GameSettings
  maxFPS = 0; // unlimited
  antialias = true;

  // HotKeys, ....
}
