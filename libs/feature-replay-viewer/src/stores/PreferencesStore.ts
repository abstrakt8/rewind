import { defaultViewSettings } from "../game/ViewSettings";
import { makeAutoObservable } from "mobx";

export class PreferencesStore {
  constructor() {
    makeAutoObservable(this);
  }

  preferredViewSettings() {
    return defaultViewSettings();
  }

  skinId = "boopz";

  // GameSettings
  maxFPS = 0; // unlimited
  antialias = true;

  // HotKeys, ....
}
