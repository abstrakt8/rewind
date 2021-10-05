import { injectable } from "inversify";
import { SkinSettingsStore } from "./SkinSettingsStore";
import { LocalStorageHelper } from "./LocalStorageService";
import { DEFAULT_SKIN_SETTINGS, SkinSettingsSchema } from "../settings/SkinSettings";

@injectable()
export class RewindLocalStorage {
  helper: LocalStorageHelper;

  constructor(private readonly skinSettingsStore: SkinSettingsStore) {
    this.helper = new LocalStorageHelper();
  }

  // Registers all the schemas that should be stored / loaded from LocalStorage.
  initialize() {
    this.helper.register({
      key: "skin-settings",
      schema: SkinSettingsSchema,
      defaultValue: DEFAULT_SKIN_SETTINGS,
      subject: this.skinSettingsStore.settings$,
    });

    this.helper.loadAll();
  }
}
